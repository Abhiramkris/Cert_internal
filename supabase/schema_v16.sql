-- SCHEMA V16: AUTOMATED NOTIFICATIONS & ACTIVITY LOGGING
-- This migration adds triggers to automatically notify team members when a comment is posted.

-- 1. NOTIFICATION FUNCTION
CREATE OR REPLACE FUNCTION public.handle_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  team_record RECORD;
  member_id UUID;
BEGIN
  -- Get the team for this project
  SELECT * INTO team_record FROM public.project_team WHERE project_id = NEW.project_id;
  
  -- Notify Manager
  IF team_record.manager_id IS NOT NULL AND team_record.manager_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, project_id, type, message)
    VALUES (team_record.manager_id, NEW.project_id, 'NEW_COMMENT', 'New comment on project: ' || (SELECT client_name FROM projects WHERE id = NEW.project_id));
  END IF;

  -- Notify SEO
  IF team_record.seo_id IS NOT NULL AND team_record.seo_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, project_id, type, message)
    VALUES (team_record.seo_id, NEW.project_id, 'NEW_COMMENT', 'New comment on project: ' || (SELECT client_name FROM projects WHERE id = NEW.project_id));
  END IF;

  -- Notify Developer
  IF team_record.developer_id IS NOT NULL AND team_record.developer_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, project_id, type, message)
    VALUES (team_record.developer_id, NEW.project_id, 'NEW_COMMENT', 'New comment on project: ' || (SELECT client_name FROM projects WHERE id = NEW.project_id));
  END IF;

  -- Notify Sales
  IF team_record.sales_id IS NOT NULL AND team_record.sales_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, project_id, type, message)
    VALUES (team_record.sales_id, NEW.project_id, 'NEW_COMMENT', 'New comment on project: ' || (SELECT client_name FROM projects WHERE id = NEW.project_id));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TRIGGER
DROP TRIGGER IF EXISTS on_comment_created ON public.comments;
CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_comment_notification();

-- 3. ACTIVITY LOGGING TRIGGER (Duplicate of logic but ensures global consistency)
CREATE OR REPLACE FUNCTION public.log_comment_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, details)
  VALUES (NEW.user_id, 'COMMENT_POSTED', jsonb_build_object('project_id', NEW.project_id, 'is_internal', NEW.is_internal));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_logged ON public.comments;
CREATE TRIGGER on_comment_logged
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE PROCEDURE public.log_comment_activity();
