import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

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
    
    // 1. Prepare Workspace
    await fs.mkdir(path.join(process.cwd(), 'tmp/sync'), { recursive: true })
    
    // 2. Clone or Pull
    try {
      await fs.access(syncDir)
      log(`Found existing workspace. Pulling latest changes...`)
      const { stdout, stderr } = await execAsync('git pull', { cwd: syncDir })
      if (stderr && !stderr.includes('Updating')) log(`Git Pulled: ${stderr}`)
    } catch {
      log(`Workspace not found. Cloning repository ${repoLink}...`)
      await execAsync(`git clone ${repoLink} ${syncDir}`)
    }

    // 3. Install Dependencies
    log(`Installing dependencies (npm install)...`)
    await execAsync('npm install', { cwd: syncDir })

    // 4. Production Build
    log(`Running production build (npm run build)...`)
    // Note: We expect 'output: export' in next.config.js
    await execAsync('env NEXT_TELEMETRY_DISABLED=1 npm run build', { cwd: syncDir })

    // 5. Deploy to Subdomain Volume
    log(`Deploying static assets to ${finalDestDir}...`)
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
