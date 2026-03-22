-- SCHEMA V17: AI WEBSITE BUILDER CONFIGURATION
-- This migration adds the necessary storage for global styles and component selections.

CREATE TABLE IF NOT EXISTS website_builder_config (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Global Design Tokens (JSONB for flexibility)
  global_styles JSONB DEFAULT '{
    "primary_color": "#000000",
    "secondary_color": "#ffffff",
    "accent_color": "#3b82f6",
    "font_family": "Inter, sans-serif",
    "heading_font": "Outfit, sans-serif",
    "spacing_scale": "md",
    "border_radius": "xl",
    "animation_type": "smooth",
    "dark_mode": true
  }'::jsonb,

  -- Selected Components (Array of strings/IDs)
  selected_components TEXT[] DEFAULT ARRAY['NAV_SIMPLE', 'HERO_AI', 'FEATURES_GRID', 'FOOTER_MINIMAL'],

  -- AI Injected Content Overrides
  content_overrides JSONB DEFAULT '{}'::jsonb,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS
ALTER TABLE website_builder_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage website config" ON website_builder_config;
CREATE POLICY "Staff can manage website config" ON website_builder_config FOR ALL USING (
  auth.role() = 'authenticated'
);

-- Seed initial config for existing projects if needed (Manual or via app)
