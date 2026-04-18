import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function checkJobs() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials.')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('--- 🔍 Checking Deployment Jobs ---')
  
  const { data: jobs, error } = await supabase
    .from('deployment_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching jobs:', error.message)
    if (error.message.includes('not found')) {
      console.log('CRITICAL: The deployment_jobs table does not exist. Please run the SQL migration.')
    }
  } else {
    console.table(jobs)
  }
}

checkJobs()
