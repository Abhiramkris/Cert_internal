
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manual .env.local parser
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

async function fix() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials.')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // 1. Find project ID for Test11
  const { data: projects, error: pError } = await supabase
    .from('projects')
    .select('id, client_name')
    .ilike('client_name', '%Test11%')

  if (pError || !projects || projects.length === 0) {
    console.error('Could not find project Test11:', pError)
    return
  }

  const project = projects[0]
  console.log(`Found project: ${project.client_name} (ID: ${project.id})`)

  // 2. Reset dev_config status
  console.log('Resetting sync_status in dev_config...')
  const { error: dError } = await supabase
    .from('dev_config')
    .update({ 
      sync_status: 'FAILED',
      sync_error: 'Sync manually reset due to timeout or stall.'
    })
    .eq('project_id', project.id)

  if (dError) {
    console.error('Error resetting dev_config:', dError)
  } else {
    console.log('Successfully reset dev_config status.')
  }

  // 3. Mark any PENDING or RUNNING jobs as FAILED in deployment_jobs
  console.log('Cleaning up deployment_jobs...')
  const { error: jError } = await supabase
    .from('deployment_jobs')
    .update({ 
      status: 'FAILED',
      logs: 'Job aborted: Sync manually reset in dashboard.',
      finished_at: new Date().toISOString()
    })
    .eq('project_id', project.id)
    .in('status', ['PENDING', 'RUNNING'])

  if (jError) {
    console.error('Error cleaning up deployment_jobs:', jError)
  } else {
    console.log('Successfully cleaned up stuck deployment jobs.')
  }

  console.log('--- RESET COMPLETE ---')
}

fix()
