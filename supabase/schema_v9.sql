  -- SCHEMA V9: AUDIT LOGGING & FETCH FIXES
  -- 1. AUDIT LOGS TABLE
  CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
  );

  -- 2. RLS FOR AUDIT LOGS
  ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Admins can read all logs" ON audit_logs;
  CREATE POLICY "Admins can read all logs" ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
  );

  -- 3. RLS FIX FOR WORKFLOW TEMPLATES
  -- Allowing all authenticated users to read templates to fixed the fetch issue
  DROP POLICY IF EXISTS "Authenticated users can read templates" ON workflow_templates;
  CREATE POLICY "Authenticated users can read templates" ON workflow_templates FOR SELECT USING (auth.role() = 'authenticated');

  -- 4. LOGGING TRIGGER (OPTIONAL - but for safety we will do it in code for now)

  -- 5. SEED INITIAL LOG
  INSERT INTO audit_logs (action, details, ip_address) 
  VALUES ('SYSTEM_INIT', '{"message": "Audit logging enabled via Schema V9"}', '0.0.0.0');
