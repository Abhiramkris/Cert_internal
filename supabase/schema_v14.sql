-- SCHEMA V14: WORKFLOW RE-ALIGNMENT & SALES METRICS
-- 1. RE-SEED WORKFLOW STAGES TO MATCH USER'S REQUESTED LOOP
-- Sales -> Manager (Team) -> Deadline Management -> SEO -> Developer -> Review -> Checking -> Submission -> Closing

-- First, clear existing core stages or update them
-- We'll use a transaction style UPSERT

INSERT INTO workflow_stages (status_key, display_name, acting_role, next_status_key, is_initial) VALUES
('NEW_LEAD', 'Sales Lead', 'Sales', 'TEAM_ASSIGNMENT', true),
('TEAM_ASSIGNMENT', 'Manager (Team Assignment)', 'Manager', 'DEADLINE_MGMT', false),
('DEADLINE_MGMT', 'Deadline Management', 'Manager', 'SEO_STRATEGY', false),
('SEO_STRATEGY', 'SEO Strategy', 'SEO', 'DEVELOPMENT', false),
('DEVELOPMENT', 'Implementation (Developer)', 'Developer', 'INTERNAL_REVIEW', false),
('INTERNAL_REVIEW', 'Manager Review', 'Manager', 'QUALITY_CHECKING', false),
('QUALITY_CHECKING', 'Quality Checking', 'Manager', 'SUBMISSION', false),
('SUBMISSION', 'Client Submission', 'Admin', 'CLIENT_APPROVED', false),
('CLIENT_APPROVED', 'Project Closing', 'Manager', null, false)
ON CONFLICT (status_key) DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  acting_role = EXCLUDED.acting_role,
  next_status_key = EXCLUDED.next_status_key,
  is_initial = EXCLUDED.is_initial;

-- 2. ADD FIELDS FOR NEW STAGES TO ENSURE THEY ARE ACTIONABLE
-- Team Assignment Fields
INSERT INTO workflow_fields (stage_id, label, name, field_type, is_required, order_index)
SELECT id, 'Account Manager', 'manager_id', 'select', true, 1 FROM workflow_stages WHERE status_key = 'TEAM_ASSIGNMENT'
UNION ALL
SELECT id, 'SEO Specialist', 'seo_id', 'select', true, 2 FROM workflow_stages WHERE status_key = 'TEAM_ASSIGNMENT'
UNION ALL
SELECT id, 'Lead Developer', 'developer_id', 'select', true, 3 FROM workflow_stages WHERE status_key = 'TEAM_ASSIGNMENT';

-- Deadline Management Fields
INSERT INTO workflow_fields (stage_id, label, name, field_type, is_required, order_index)
SELECT id, 'Final Delivery Deadline', 'deadline', 'date', true, 1 FROM workflow_stages WHERE status_key = 'DEADLINE_MGMT'
UNION ALL
SELECT id, 'SEO Phase Completion', 'seo_deadline', 'date', false, 2 FROM workflow_stages WHERE status_key = 'DEADLINE_MGMT'
UNION ALL
SELECT id, 'Dev Preview Deadline', 'dev_deadline', 'date', false, 3 FROM workflow_stages WHERE status_key = 'DEADLINE_MGMT';

-- 3. ENSURE RLS FOR NEW STAGES
-- (Already covered by "Authenticated users can read workflow config")
