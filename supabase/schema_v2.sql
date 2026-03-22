-- ADD CURRENT ASSIGNEE TO PROJECTS
ALTER TABLE projects ADD COLUMN current_assignee_id UUID REFERENCES profiles(id);

-- TASKS (Kanban Board)
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  column_status TEXT CHECK (column_status IN ('todo', 'in_progress', 'review', 'done')) DEFAULT 'todo',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees can see all tasks" ON tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Employees can manage tasks" ON tasks FOR ALL USING (auth.role() = 'authenticated');

-- CALENDAR EVENTS
CREATE TABLE calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  meeting_link TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  attendees JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees can see all calendar events" ON calendar_events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Employees can manage calendar events" ON calendar_events FOR ALL USING (auth.role() = 'authenticated');

-- ATTENDANCE
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('present', 'absent', 'leave', 'half_day')) DEFAULT 'present',
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, date)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees can see all attendance" ON attendance FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Employees can manage attendance" ON attendance FOR ALL USING (auth.role() = 'authenticated');
-- Note: Simplified to allow authenticated users to manage attendance (e.g. HR or own checkins via app logic)

-- UPDATE REALTIME PUBLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE tasks, calendar_events, attendance;
