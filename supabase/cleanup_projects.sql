-- CLEANUP SCRIPT: REMOVE ALL PROJECT DATA FOR FRESH START
-- WARNING: This will delete all existing projects, team assignments, phase configs, payments, and comments.

BEGIN;

-- 1. Truncate child tables first (or just use CASCADE if your DB role allows)
TRUNCATE TABLE project_stage_data RESTART IDENTITY CASCADE;
TRUNCATE TABLE seo_config RESTART IDENTITY CASCADE;
TRUNCATE TABLE dev_config RESTART IDENTITY CASCADE;
TRUNCATE TABLE payments RESTART IDENTITY CASCADE;
TRUNCATE TABLE comments RESTART IDENTITY CASCADE;
TRUNCATE TABLE notifications RESTART IDENTITY CASCADE;
TRUNCATE TABLE project_team RESTART IDENTITY CASCADE;

-- 2. Truncate main projects table
TRUNCATE TABLE projects RESTART IDENTITY CASCADE;

COMMIT;

-- NOTE: After running this, the system will be empty and ready for new project creation 
-- using the dynamic workflow engine configured in the Admin Panel.
