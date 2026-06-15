-- SCHEMA V22: ATTENDANCE SYSTEM

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    in_time TIMESTAMP WITH TIME ZONE,
    out_time TIMESTAMP WITH TIME ZONE,
    in_location TEXT,
    out_location TEXT,
    in_photo_url TEXT,
    out_photo_url TEXT,
    status TEXT DEFAULT 'present',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    attendance_id UUID REFERENCES public.attendance(id) ON DELETE CASCADE,
    adjusted_by UUID REFERENCES public.profiles(id),
    reason TEXT NOT NULL,
    previous_in_time TIMESTAMP WITH TIME ZONE,
    previous_out_time TIMESTAMP WITH TIME ZONE,
    new_in_time TIMESTAMP WITH TIME ZONE,
    new_out_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own attendance" ON public.attendance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins, HR, Managers can view all attendance" ON public.attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'HR', 'Manager'))
);
CREATE POLICY "Users can insert their own attendance" ON public.attendance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own attendance" ON public.attendance FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins and HR can update any attendance" ON public.attendance FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'HR'))
);

CREATE POLICY "Users can view their own attendance logs" ON public.attendance_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.attendance a WHERE a.id = attendance_id AND a.user_id = auth.uid())
);
CREATE POLICY "Admins, HR, Managers can view all attendance logs" ON public.attendance_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'HR', 'Manager'))
);
CREATE POLICY "HR can insert attendance logs" ON public.attendance_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('HR', 'Admin'))
);

-- Create a storage bucket for attendance photos
INSERT INTO storage.buckets (id, name, public) VALUES ('attendance', 'attendance', true) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own attendance photos" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'attendance' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Anyone can view attendance photos" ON storage.objects FOR SELECT USING (bucket_id = 'attendance');

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
