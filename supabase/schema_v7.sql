-- SCHEMA V7: CONSOLIDATED WORKFLOW & BRANDING PREP
-- Includes: Designer Role, Workflow Tables, and Core Seed Data

-- 1. ROLES & CONSTRAINTS
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('Sales', 'Manager', 'SEO', 'Developer', 'HR', 'Admin', 'Designer'));

-- 2. PROJECT TEAM EXTENSION
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='project_team' AND column_name='designer_id') THEN
    ALTER TABLE project_team ADD COLUMN designer_id UUID REFERENCES profiles(id);
  END IF;
END $$;

-- 3. WORKFLOW TABLES
CREATE TABLE IF NOT EXISTS workflow_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status_key TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  acting_role TEXT NOT NULL,
  next_status_key TEXT,
  is_initial BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS workflow_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id UUID REFERENCES workflow_stages(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'number', 'select', 'checkbox', 'date')),
  options JSONB DEFAULT '[]'::jsonb,
  is_required BOOLEAN DEFAULT FALSE,
  placeholder TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS project_stage_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES workflow_stages(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}'::jsonb NOT NULL,
  submitted_by UUID REFERENCES profiles(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(project_id, stage_id)
);

-- 4. RLS POLICIES (Idempotent)
ALTER TABLE workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_stage_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read workflow config" ON workflow_stages;
CREATE POLICY "Authenticated users can read workflow config" ON workflow_stages FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage workflow config" ON workflow_stages;
CREATE POLICY "Admins can manage workflow config" ON workflow_stages FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'));

DROP POLICY IF EXISTS "Authenticated users can read workflow fields" ON workflow_fields;
CREATE POLICY "Authenticated users can read workflow fields" ON workflow_fields FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage workflow fields" ON workflow_fields;
CREATE POLICY "Admins can manage workflow fields" ON workflow_fields FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'));

DROP POLICY IF EXISTS "Authenticated users can read project stage data" ON project_stage_data;
CREATE POLICY "Authenticated users can read project stage data" ON project_stage_data FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert project stage data" ON project_stage_data;
CREATE POLICY "Users can insert project stage data" ON project_stage_data FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. SEED DATA (CORE STAGES)
INSERT INTO workflow_stages (status_key, display_name, acting_role, next_status_key, is_initial) VALUES
('NEW_LEAD', 'Lead Discovery', 'Sales', 'TEAM_ASSIGNED', true),
('TEAM_ASSIGNED', 'Design Phase', 'Designer', 'DESIGN_COMPLETED', false),
('DESIGN_COMPLETED', 'Search Strategy (SEO)', 'SEO', 'SEO_COMPLETED', false),
('SEO_COMPLETED', 'Implementation (DEV)', 'Developer', 'DEV_PREVIEW_READY', false),
('DEV_PREVIEW_READY', 'Internal Review (OPS)', 'Manager', 'MANAGER_APPROVED', false),
('MANAGER_APPROVED', 'Delivery (CLIENT)', 'Admin', 'CLIENT_APPROVED', false)
ON CONFLICT (status_key) DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  acting_role = EXCLUDED.acting_role,
  next_status_key = EXCLUDED.next_status_key,
  is_initial = EXCLUDED.is_initial;

-- 6. ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE workflow_stages, workflow_fields, project_stage_data;
-- Ignore error if tables are already in publication
