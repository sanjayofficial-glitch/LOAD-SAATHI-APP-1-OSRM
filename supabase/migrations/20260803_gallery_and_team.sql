-- =============================================================
-- Gallery images + Team members + Storage bucket
-- =============================================================

-- 1. Gallery storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('gallery', 'gallery', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- 2. gallery_images table
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  title TEXT,
  caption TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INT DEFAULT 0,
  width INT,
  height INT,
  file_size INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Public can read all gallery images
CREATE POLICY "Gallery images are public"
  ON public.gallery_images FOR SELECT
  USING (true);

-- Authenticated users can insert/update/delete
CREATE POLICY "Authenticated can manage gallery images"
  ON public.gallery_images FOR ALL
  USING (auth.role() = 'authenticated');

-- 3. team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  linkedin TEXT,
  twitter TEXT,
  instagram TEXT,
  quote TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Public can read all team members
CREATE POLICY "Team members are public"
  ON public.team_members FOR SELECT
  USING (true);

-- Authenticated users can manage team members
CREATE POLICY "Authenticated can manage team members"
  ON public.team_members FOR ALL
  USING (auth.role() = 'authenticated');

-- 4. Storage policies for gallery bucket
-- Public can read images from gallery bucket
CREATE POLICY "Gallery images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

-- Authenticated users can upload to gallery bucket
CREATE POLICY "Authenticated can upload gallery images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- Authenticated users can update gallery images
CREATE POLICY "Authenticated can update gallery images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- Authenticated users can delete gallery images
CREATE POLICY "Authenticated can delete gallery images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- 5. Seed default team members
INSERT INTO public.team_members (id, name, role, phone, linkedin, sort_order) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Sanjaya Sahu', 'Founder & CEO', '+918328998031', 'https://www.linkedin.com/in/sanjaya-sahu-253315305/', 1),
  ('a2222222-2222-2222-2222-222222222222', 'Prince Mallik', 'Co-Founder & COO', '+91 76848 43985', 'https://www.linkedin.com/in/prince-mallik-177a472a0/', 2),
  ('a3333333-3333-3333-3333-333333333333', 'TBD', 'Customer Executive', NULL, NULL, 3)
ON CONFLICT (id) DO NOTHING;
