CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read company settings" ON public.company_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update company settings" ON public.company_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
);

INSERT INTO public.company_settings (key, value) VALUES ('office_location', '{"lat": 0, "lng": 0, "radius": 100}') ON CONFLICT (key) DO NOTHING;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
