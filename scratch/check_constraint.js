const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.rpc('exec_sql', { sql: "SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'attendance_status_check';" });
  console.log('RPC result:', data, error);
  
  if (error) {
    // If no RPC, let's just insert a test record with a weird status and see the error? No, we already have the error.
    // Let's get the constraint definition via REST by querying the constraint table? No, we can't query pg_catalog directly via REST usually.
  }
}
test();
