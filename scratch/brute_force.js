const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const statuses = ['PRESENT', 'present', 'Present', 'PENDING', 'ACTIVE', 'active', 'Active'];
  for (const status of statuses) {
    const { error } = await supabase.from('attendance').insert({
      user_id: '00000000-0000-0000-0000-000000000000', // invalid uuid, will fail foreign key constraint
      date: '2026-05-21',
      status: status
    });
    console.log(`Status: ${status} -> Error: ${error ? error.message : 'Success'}`);
  }
}
test();
