-- First drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their pair's media" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;

-- Ensure the media bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', false)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  public = EXCLUDED.public;

-- Create proper storage policies for the media bucket
CREATE POLICY "Users can view their pair media" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update media" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete media" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);