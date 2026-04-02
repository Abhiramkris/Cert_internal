-- SCHEMA V19: FINAL CONSOLIDATION & SINGLE SOURCE OF TRUTH
-- Unifies projects, seo_config, website_builder_config, and project_stage_data

-- 1. Add Consolidated JSONB Columns to Projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS stage_data JSONB DEFAULT '{}'::jsonb;

-- 2. Migrate Data from Legacy Tables (Idempotent)
DO $$ 
BEGIN
  -- a. Migrate SEO Config
  UPDATE projects p
  SET config = jsonb_set(
    p.config, 
    '{seo}', 
    jsonb_strip_nulls(jsonb_build_object(
      'website_title', s.website_title,
      'meta_description', s.meta_description,
      'target_keywords', s.target_keywords
    ))
  )
  FROM seo_config s
  WHERE p.id = s.project_id;

  -- b. Migrate Website Builder Config
  UPDATE projects p
  SET config = jsonb_set(
    p.config, 
    '{builder}', 
    jsonb_strip_nulls(jsonb_build_object(
      'global_styles', w.global_styles,
      'selected_components', w.selected_components,
      'content_overrides', w.content_overrides,
      'component_settings', w.component_settings
    ))
  )
  FROM website_builder_config w
  WHERE p.id = w.project_id;

  -- c. Migrate Project Stage Data (Historical Progression)
  -- Note: We store this as an object keyed by stage_id to maintain history
  UPDATE projects p
  SET stage_data = (
    SELECT jsonb_object_agg(stage_id, jsonb_build_object(
      'data', data,
      'submitted_by', submitted_by,
      'submitted_at', submitted_at
    ))
    FROM project_stage_data d
    WHERE d.project_id = p.id
    GROUP BY project_id
  )
  WHERE EXISTS (SELECT 1 FROM project_stage_data WHERE project_id = p.id);
  -- d. Initialize remaining nulls to empty objects
  UPDATE projects SET config = '{"seo": {}, "builder": {}}'::jsonb WHERE config IS NULL OR config = '{}'::jsonb;
  UPDATE projects SET stage_data = '{}'::jsonb WHERE stage_data IS NULL;
END $$;

-- 3. DROP OBSOLETE TABLES (Uncomment after verifying app code refactor)
/*
DROP TABLE IF EXISTS seo_config;
DROP TABLE IF EXISTS website_builder_config;
DROP TABLE IF EXISTS project_stage_data;
*/

-- 4. UPDATE REALTIME
-- Re-add projects to realtime to pick up new columns
ALTER PUBLICATION supabase_realtime DROP TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
