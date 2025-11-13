-- Create storage bucket for farm images
-- Run this in Supabase SQL Editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('farm-images', 'farm-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload farm images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'farm-images'
    AND auth.role() = 'authenticated'
  );

-- Allow public access to view images
CREATE POLICY "Anyone can view farm images" ON storage.objects
  FOR SELECT USING (bucket_id = 'farm-images');

-- Allow users to delete their own uploaded images
CREATE POLICY "Users can delete their farm images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'farm-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );