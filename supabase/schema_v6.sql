-- 1. ADD DESIGNER ROLE
-- Note: We need to drop the existing check constraint first
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('Sales', 'Manager', 'SEO', 'Developer', 'HR', 'Admin', 'Designer'));

-- 1.5 ADD DESIGNER TO PROJECT TEAM
ALTER TABLE project_team ADD COLUMN designer_id UUID REFERENCES profiles(id);

-- 2. WORKFLOW STAGES
CREATE TABLE workflow_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status_key TEXT UNIQUE NOT NULL, -- e.g. 'NEW_LEAD', 'SEO_PHASE', 'DESIGN_PHASE'
  display_name TEXT NOT NULL,
  acting_role TEXT NOT NULL, -- e.g. 'Sales', 'SEO', 'Designer'
  next_status_key TEXT, -- Self-reference key
  is_initial BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. WORKFLOW FIELDS
CREATE TABLE workflow_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id UUID REFERENCES workflow_stages(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  name TEXT NOT NULL, -- field key
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'number', 'select', 'checkbox', 'date')),
  options JSONB DEFAULT '[]'::jsonb, -- For select fields
  is_required BOOLEAN DEFAULT FALSE,
  placeholder TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. PROJECT STAGE DATA (STORES SUBMISSIONS)
CREATE TABLE project_stage_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES workflow_stages(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}'::jsonb NOT NULL,
  submitted_by UUID REFERENCES profiles(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(project_id, stage_id)
);

-- Enable RLS
ALTER TABLE workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_stage_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read workflow config" ON workflow_stages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage workflow config" ON workflow_stages FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'));

CREATE POLICY "Authenticated users can read workflow fields" ON workflow_fields FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage workflow fields" ON workflow_fields FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'));

CREATE POLICY "Authenticated users can read project stage data" ON project_stage_data FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert project stage data" ON project_stage_data FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own project stage data" ON project_stage_data FOR UPDATE USING (auth.uid() = submitted_by);

-- INITIAL SEED (Legacy Migration)
INSERT INTO workflow_stages (status_key, display_name, acting_role, next_status_key, is_initial) VALUES
('NEW_LEAD', 'Lead Discovery', 'Sales', 'TEAM_ASSIGNED', true),
('TEAM_ASSIGNED', 'Search Strategy (SEO)', 'SEO', 'SEO_COMPLETED', false),
('SEO_COMPLETED', 'Implementation (DEV)', 'Developer', 'DEV_PREVIEW_READY', false),
('DEV_PREVIEW_READY', 'Internal Review (OPS)', 'Manager', 'MANAGER_APPROVED', false),
('MANAGER_APPROVED', 'Delivery (CLIENT)', 'Admin', 'CLIENT_APPROVED', false);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE workflow_stages, workflow_fields, project_stage_data;
