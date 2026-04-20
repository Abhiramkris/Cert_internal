import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { performProductionBuild } from '../utils/builder/build-service'

// Manual .env.local parser (No dotenv dependency needed)
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const parts = line.split('=')
      if (parts.length === 2) {
        process.env[parts[0].trim()] = parts[1].trim()
      }
    })
  }
}

loadEnv()

async function runWorker() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials. Ensure .env.local is present.')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('--- 🤖 Build Worker Service Online ---')
  
  // Ensure Git identity is set even if .gitconfig mount is missing
  try {
    const { execSync } = require('child_process')
    execSync('git config --global user.name "Studio Architect Bot"')
    execSync('git config --global user.email "bot@studio-architect.com"')
    console.log('[Worker] Git identity configured successfully.')
  } catch (gitErr) {
    console.warn('[Worker] Warning: Could not set global git config. Pushes might fail.')
  }

  console.log('Listening for recruitment... (Polling deployment_jobs table)')

  // Main Loop
  while (true) {
    try {
      // 1. Fetch next PENDING job
      const { data: job, error } = await supabase
        .from('deployment_jobs')
        .select('*, projects(client_name, dev_config(*))')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (error) throw error

      if (job) {
        console.log(`[Worker] Picking up job ${job.id} for Project ${job.projects?.client_name}`)

        // 2. Mark as RUNNING
        await supabase
          .from('deployment_jobs')
          .update({ 
            status: 'RUNNING',
            started_at: new Date().toISOString()
          })
          .eq('id', job.id)

        const devConfig = Array.isArray(job.projects?.dev_config) ? job.projects.dev_config[0] : job.projects?.dev_config
        const repoLink = devConfig?.repo_link

        if (!repoLink) {
          console.error(`[Worker] Error: No repository link for project ${job.project_id}`)
          await supabase
            .from('deployment_jobs')
            .update({ 
              status: 'FAILED',
              logs: 'Error: No repository link found for this project.',
              finished_at: new Date().toISOString()
            })
            .eq('id', job.id)
          continue
        }

        // 3. Execute Build
        const result = await performProductionBuild(
          job.project_id,
          repoLink,
          job.projects.client_name
        )

        // 4. Update Job Status
        await supabase
          .from('deployment_jobs')
          .update({ 
            status: result.success ? 'COMPLETED' : 'FAILED',
            logs: result.logs,
            finished_at: new Date().toISOString()
          })
          .eq('id', job.id)

        console.log(`[Worker] Job ${job.id} finished with status: ${result.success ? 'COMPLETED' : 'FAILED'}`)
      }

    } catch (err: any) {
      console.error('[Worker Error]:', err.message)
    }

    // Wait 5 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 5000))
  }
}

runWorker()
