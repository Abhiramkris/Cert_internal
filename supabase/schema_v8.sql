-- SCHEMA V8: MULTIPLE WORKFLOW TEMPLATES
-- Supports: Template grouping, Project-to-Template mapping, and refined Finalization

-- 1. WORKFLOW TEMPLATES
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. UPDATE STAGES FOR TEMPLATES
ALTER TABLE workflow_stages ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE;
ALTER TABLE workflow_stages ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 3. UPDATE PROJECTS FOR TEMPLATES
ALTER TABLE projects ADD COLUMN IF NOT EXISTS workflow_template_id UUID REFERENCES workflow_templates(id);

-- 4. SEED INITIAL TEMPLATE
INSERT INTO workflow_templates (name, description) 
VALUES ('Standard Digital Pipeline', 'The default sequence for SEO and Web Development projects')
ON CONFLICT (name) DO NOTHING;

-- Update existing stages to the new template
DO $$
DECLARE
    v_template_id UUID;
BEGIN
    SELECT id INTO v_template_id FROM workflow_templates WHERE name = 'Standard Digital Pipeline';
    UPDATE workflow_stages SET template_id = v_template_id WHERE template_id IS NULL;
END $$;

-- 5. RLS FOR TEMPLATES
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can read templates" ON workflow_templates;
CREATE POLICY "Authenticated users can read templates" ON workflow_templates FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admins can manage templates" ON workflow_templates;
CREATE POLICY "Admins can manage templates" ON workflow_templates FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'));

-- 6. REFINED SEED DATA (Fixing role for delivery)
UPDATE workflow_stages 
SET acting_role = 'Manager' 
WHERE status_key = 'MANAGER_APPROVED'; -- This is already Manager

-- Ensure the client delivery stage is also managed by Manager, not Admin
UPDATE workflow_stages 
SET acting_role = 'Manager' 
WHERE status_key = 'CLIENT_APPROVED';

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE workflow_templates;
