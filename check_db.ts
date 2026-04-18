import { createClient } from './src/utils/supabase/server'

async function check() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('dev_config')
    .select('*')
  
  if (error) {
    console.error('Error fetching dev_config:', error)
    return
  }

  console.log('--- Dev Config Table Contents ---')
  console.log(JSON.stringify(data, null, 2))
}

check()
