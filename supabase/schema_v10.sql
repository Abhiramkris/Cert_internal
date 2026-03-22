-- SCHEMA V10: PROJECT TEAM RLS & SUBMISSION STABILITY
-- 1. PROJECT TEAM RLS
ALTER TABLE project_team ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read project team" ON project_team;
CREATE POLICY "Authenticated users can read project team" ON project_team 
FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Managers and Admins can manage team" ON project_team;
CREATE POLICY "Managers and Admins can manage team" ON project_team 
FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'Manager')));

DROP POLICY IF EXISTS "Sales can insert initial team" ON project_team;
CREATE POLICY "Sales can insert initial team" ON project_team 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2. ENSURE ALL CONFIG TABLES HAVE SELECT ACCESS
ALTER TABLE seo_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read seo_config" ON seo_config;
CREATE POLICY "Authenticated read seo_config" ON seo_config FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE dev_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read dev_config" ON dev_config;
CREATE POLICY "Authenticated read dev_config" ON dev_config FOR SELECT USING (auth.role() = 'authenticated');

-- 3. ENSURE AUDIT LOGS CAN BE WRITTEN BY ALL AUTHENTICATED USERS
DROP POLICY IF EXISTS "Anyone can write audit logs" ON audit_logs;
CREATE POLICY "Anyone can write audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
