-- 1. Initialize the Admin Profile for the provided UUID
-- Replace the email if different, but this ensures the profile exists with Admin role
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('e16b9fd9-7788-4e18-b7d1-a7aaafbd66ae', 'admin@agency.com', 'System Administrator', 'Admin')
ON CONFLICT (id) DO UPDATE 
SET role = 'Admin', full_name = 'System Administrator';

-- 2. Create a Dummy Project
INSERT INTO public.projects (id, client_name, client_email, client_phone, budget, status, description)
VALUES (
  'd4734892-74cc-42b7-a36c-2f95eb6d2d4c', 
  'Hyperion Tech', 
  'contact@hyperion.com', 
  '+1 555-010-999', 
  12500, 
  'NEW_LEAD', 
  'A high-performance landing page for a new SaaS product with dark mode aesthetics and glassmorphism elements.'
) ON CONFLICT (id) DO NOTHING;

-- 3. Assign the Team (Manager/Sales)
-- We assign the provided UUID to multiple roles for testing purposes
INSERT INTO public.project_team (project_id, sales_id, manager_id)
VALUES (
  'd4734892-74cc-42b7-a36c-2f95eb6d2d4c', 
  'e16b9fd9-7788-4e18-b7d1-a7aaafbd66ae', 
  'e16b9fd9-7788-4e18-b7d1-a7aaafbd66ae'
) ON CONFLICT (project_id) DO NOTHING;
