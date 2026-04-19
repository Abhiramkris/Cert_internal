import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { assembleProjectFiles } from './project-assembly'

const execAsync = promisify(exec)

/**
 * Clean Build Service
 * Ported from builder-actions.ts to be standalone.
 */
export async function performProductionBuild(projectId: string, repoLink: string, clientName: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const slug = clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const syncDir = path.join(process.cwd(), 'tmp/sync', projectId)
  const buildOutDir = path.join(syncDir, 'out')
  const finalDestDir = path.join(process.cwd(), 'builds', slug)

  let logs = ''
  const log = (msg: string) => {
    const time = new Date().toLocaleTimeString()
    console.log(`[Build ${slug}] ${msg}`)
    logs += `[${time}] ${msg}\n`
  }

  try {
    log(`Initializing build process for ${slug}...`)
    
    // 1. Fetch Latest Config from DB
    log(`Syncing latest Designer changes for ${clientName}...`)
    const { data: projectRecord, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !projectRecord) throw new Error(`Project ${projectId} not found in DB.`)
    const config = projectRecord.config?.builder
    if (!config) throw new Error(`Builder configuration not found for ${projectId}.`)

    // 2. Prepare Workspace
    await fs.mkdir(path.join(process.cwd(), 'tmp/sync'), { recursive: true })
    
    // 3. Clone or Pull (Resilient)
    let isRepo = false
    try {
      await fs.access(path.join(syncDir, '.git'))
      isRepo = true
    } catch {
      isRepo = false
    }

    if (isRepo) {
      try {
        log(`Found existing repository. Pulling latest changes...`)
        const { stderr } = await execAsync('git pull', { cwd: syncDir })
        if (stderr && !stderr.includes('Updating')) log(`Git Pulled: ${stderr}`)
      } catch (pullErr: any) {
        log(`Git Pull failed (${pullErr.message}). Fallback to clean clone...`)
        await fs.rm(syncDir, { recursive: true, force: true })
        isRepo = false
      }
    }

    if (!isRepo) {
      log(`Preparing fresh workspace. Cloning repository ${repoLink}...`)
      // Ensure parent exists then clone
      await fs.rm(syncDir, { recursive: true, force: true })
      await execAsync(`git clone ${repoLink} ${syncDir}`)
    }

    // 4. Fresh Code Generation (The Sync)
    log(`Injecting latest Designer files into workspace...`)
    const files = assembleProjectFiles(projectRecord, config, { isProduction: true })
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = path.join(syncDir, filePath)
      await fs.mkdir(path.dirname(fullPath), { recursive: true })
      await fs.writeFile(fullPath, content)
    }

    // 5. Git Synchronization (Push back to GitHub)
    try {
      log(`Pushing updates to GitHub...`)
      await execAsync('git add .', { cwd: syncDir })
      // Check if there are changes to commit
      const { stdout: status } = await execAsync('git status --porcelain', { cwd: syncDir })
      if (status) {
        await execAsync('git commit -m "chore: sync project structure from Studio Architect Designer [bot]"', { cwd: syncDir })
        await execAsync('git push', { cwd: syncDir })
        log(`Git Pushed: Updated project structure successfully.`)
      } else {
        log(`Git: No changes to push. Workspace already in sync.`)
      }
    } catch (gitErr: any) {
      log(`Git Warning: Could not push to remote. Continuing build... (${gitErr.message})`)
    }

    // 6. Install Dependencies
    log(`Installing dependencies (npm install)...`)
    await execAsync('npm install', { cwd: syncDir })

    // 7. Production Build
    log(`Running production build (npm run build)...`)
    
    // Attempt build with isolation hints
    const { stdout: buildOut, stderr: buildErr } = await execAsync('env NEXT_TELEMETRY_DISABLED=1 npm run build', { 
      cwd: syncDir,
      env: { ...process.env, NODE_ENV: 'production' }
    })
    
    if (buildOut) log(`Build Output: ${buildOut.slice(-500)}`)
    if (buildErr) log(`Build Warnings: ${buildErr.slice(-500)}`)

    // 8. Deploy to Subdomain Volume
    log(`Deployment Phase: Moving assets to ${finalDestDir}...`)
    await fs.mkdir(finalDestDir, { recursive: true })
    
    const finalOut = path.join(finalDestDir, 'out')
    await fs.rm(finalOut, { recursive: true, force: true })
    
    // Verify build output
    try {
      await fs.access(buildOutDir)
      await execAsync(`cp -r ${buildOutDir} ${finalOut}`)
    } catch (e) {
      throw new Error("Build completed but 'out' directory not found. Ensure next.config.js has output: 'export'.")
    }

    const liveUrl = `http://${slug}.tool.cloud-ip.cc/`
    log(`Deployment successful! URL: ${liveUrl}`)
    
    // Update dev_config
    await supabase.from('dev_config').upsert({
      project_id: projectId,
      live_preview_url: liveUrl,
      sync_status: 'SUCCESS',
      sync_error: null
    })

    return { 
      success: true, 
      url: liveUrl,
      logs 
    }

  } catch (err: any) {
    const errorMsg = err.stderr || err.message
    log(`ERROR: ${errorMsg}`)
    
    // Update Status: FAILED
    await supabase.from('dev_config').upsert({
      project_id: projectId,
      sync_status: 'FAILED',
      sync_error: errorMsg
    })
    
    return { 
      success: false, 
      error: errorMsg,
      logs 
    }
  }
}
