-- SCHEMA V12: PROJECT ADVANCEMENT RLS FIX
-- 1. ADD UPDATE POLICY FOR projects
-- Allows authenticated users to update project status and current_assignee_id
DROP POLICY IF EXISTS "Users can update project status" ON projects;
CREATE POLICY "Users can update project status" ON projects 
FOR UPDATE USING (auth.role() = 'authenticated');

-- 2. ADD UPDATE POLICY FOR project_team
-- Allows authenticated users to update team assignments during transition
DROP POLICY IF EXISTS "Users can update project team" ON project_team;
CREATE POLICY "Users can update project team" ON project_team 
FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. ENSURE SELECT POLICIES ARE IN PLACE FOR ALL RELEVANT TABLES
-- (Redundant but safe for industrial stability)
DROP POLICY IF EXISTS "Authenticated users can see all teams" ON project_team;
CREATE POLICY "Authenticated users can see all teams" ON project_team 
FOR SELECT USING (auth.role() = 'authenticated');
