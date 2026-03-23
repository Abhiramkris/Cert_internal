-- SCHEMA V18: WEBSITE BUILDER SCHEMA FIX
-- Add missing component_settings column to website_builder_config

ALTER TABLE website_builder_config 
ADD COLUMN IF NOT EXISTS component_settings JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN website_builder_config.component_settings IS 'Stores granular configurations for each selected website component (animations, CTA counts, etc)';
