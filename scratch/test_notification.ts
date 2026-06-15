import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('notifications').insert({
    user_id: 'test-user',
    project_id: 'test-project',
    type: 'HANDOFF_RECEIVED',
    message: 'Test message'
  })
  console.log('Insert Error:', error)
  
  const { data: cols, error: err } = await supabase.rpc('get_columns_for_table', { table_name: 'notifications' })
  console.log('Columns:', cols)
}
test()
