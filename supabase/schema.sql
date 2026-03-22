-- PROFILES
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('Sales', 'Manager', 'SEO', 'Developer', 'HR', 'Admin')) DEFAULT 'Sales',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- PROJECTS
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  preferred_comm_channel TEXT,
  client_type TEXT CHECK (client_type IN ('employee', 'owner', 'referral', 'external')),
  domain_required BOOLEAN DEFAULT FALSE,
  existing_domain TEXT,
  budget DECIMAL,
  reference_websites TEXT[],
  color_scheme TEXT,
  design_preferences TEXT,
  description TEXT,
  status TEXT DEFAULT 'NEW_LEAD' NOT NULL,
  secure_token UUID DEFAULT gen_random_uuid() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- PROJECT TEAM
CREATE TABLE project_team (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE PRIMARY KEY,
  sales_id UUID REFERENCES profiles(id),
  manager_id UUID REFERENCES profiles(id),
  seo_id UUID REFERENCES profiles(id),
  developer_id UUID REFERENCES profiles(id),
  hr_id UUID REFERENCES profiles(id)
);

-- Enable RLS for project_team
ALTER TABLE project_team ENABLE ROW LEVEL SECURITY;

-- SEO CONFIG
CREATE TABLE seo_config (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE PRIMARY KEY,
  website_title TEXT,
  meta_description TEXT,
  target_keywords TEXT,
  sitemap_required BOOLEAN DEFAULT FALSE,
  facebook_page TEXT,
  instagram TEXT,
  linkedin TEXT,
  twitter TEXT,
  youtube TEXT,
  google_analytics TEXT,
  google_search_console TEXT,
  schema_required BOOLEAN DEFAULT FALSE,
  robots_txt TEXT,
  favicon_url TEXT,
  og_image_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for seo_config
ALTER TABLE seo_config ENABLE ROW LEVEL SECURITY;

-- DEV CONFIG
CREATE TABLE dev_config (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE PRIMARY KEY,
  hosting_provider TEXT,
  hosting_email TEXT,
  hosting_password TEXT,
  domain_registrar TEXT,
  domain_login TEXT,
  cms_used TEXT,
  repo_link TEXT,
  staging_link TEXT,
  live_preview_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for dev_config
ALTER TABLE dev_config ENABLE ROW LEVEL SECURITY;

-- COMMENTS
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  role TEXT,
  comment_text TEXT NOT NULL,
  attachments TEXT[],
  visibility TEXT CHECK (visibility IN ('internal', 'client')) DEFAULT 'internal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- NOTIFICATIONS
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PAYMENTS
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('PENDING', 'PAID', 'CANCELLED')),
  payment_method TEXT,
  invoice_number TEXT,
  receipt_file_url TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES (BASIC)
-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: Employees can see all projects, clients can only see their own via token (token logic handled in app logic or RLS with functions)
-- For simplicity in RLS, we'll allow all authenticated users (employees) to see projects.
CREATE POLICY "Employees can see all projects" ON projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Sales can create projects" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can do everything on projects" ON projects FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- Realtime: Enable for projects, comments, notifications
ALTER PUBLICATION supabase_realtime ADD TABLE projects, comments, notifications;

-- Function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', COALESCE(new.raw_user_meta_data->>'role', 'Sales'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
