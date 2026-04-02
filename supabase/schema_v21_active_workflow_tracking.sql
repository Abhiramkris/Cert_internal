-- SCHEMA V21: PROJECT DEACTIVATION & EXPLICIT WORKFLOW TRACKING
-- Adds columns to track active state and explicit workflow stages within the projects table.

-- 1. Add Columns to Projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS current_stage_id UUID REFERENCES workflow_stages(id),
ADD COLUMN IF NOT EXISTS next_stage_id UUID REFERENCES workflow_stages(id);

-- 2. Backfill Existing Data
-- This function attempts to set the current and next stage IDs based on the existing status_key.
DO $$ 
DECLARE
    p_record RECORD;
    v_current_id UUID;
    v_next_id UUID;
    v_next_key TEXT;
BEGIN
    FOR p_record IN SELECT id, status FROM projects LOOP
        -- Get current stage ID
        SELECT id, next_status_key INTO v_current_id, v_next_key 
        FROM workflow_stages 
        WHERE status_key = p_record.status 
        LIMIT 1;

        -- Get next stage ID if available
        IF v_next_key IS NOT NULL THEN
            SELECT id INTO v_next_id 
            FROM workflow_stages 
            WHERE status_key = v_next_key 
            LIMIT 1;
        ELSE
            v_next_id := NULL;
        END IF;

        -- Update project
        UPDATE projects 
        SET current_stage_id = v_current_id, 
            next_stage_id = v_next_id 
        WHERE id = p_record.id;
    END LOOP;
END $$;

-- 3. Update Realtime
-- Re-add projects to realtime to pick up new columns
ALTER PUBLICATION supabase_realtime DROP TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
