const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('workflow_templates').select('*').limit(1);
  console.log(JSON.stringify(data, null, 2));
  
  const { data: fData, error: fError } = await supabase.from('workflow_fields').select('*').limit(1);
  console.log(JSON.stringify(fData, null, 2));
}
test();
