-- SCHEMA V11: STAGE DATA UPSERT FIX
-- 1. ADD UPDATE POLICY FOR project_stage_data
-- Since 'upsert' requires both INSERT and UPDATE permissions in Supabase,
-- we must ensure authenticated users can update the data they are submitting.

DROP POLICY IF EXISTS "Users can update project stage data" ON project_stage_data;
CREATE POLICY "Users can update project stage data" ON project_stage_data 
FOR UPDATE USING (auth.role() = 'authenticated');

-- 2. VERIFY AUDIT LOGS
-- Ensure audit logs can also be updated if needed (unlikely but safe for stability)
DROP POLICY IF EXISTS "Anyone can update audit logs" ON audit_logs;
CREATE POLICY "Anyone can update audit logs" ON audit_logs 
FOR UPDATE WITH CHECK (auth.role() = 'authenticated');

-- 3. ENSURE STAGE DATA SELECT IS GLOBAL FOR TEAM
-- (Already in v7, but double-checking)
DROP POLICY IF EXISTS "Authenticated users can read project stage data" ON project_stage_data;
CREATE POLICY "Authenticated users can read project stage data" ON project_stage_data 
FOR SELECT USING (auth.role() = 'authenticated');
