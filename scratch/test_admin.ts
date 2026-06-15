import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function run() {
  const { data, error } = await supabase.from('notifications').insert({
    user_id: '123',
    project_id: null,
    type: 'TEST',
    message: 'Test admin insert'
  })
  console.log('Error:', error)
}
run()
