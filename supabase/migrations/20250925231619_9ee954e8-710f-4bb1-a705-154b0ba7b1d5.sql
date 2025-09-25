-- Create storage policies for media bucket
-- Allow users in pairs to upload their own files
CREATE POLICY "Media files accessible by pair members" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'media' AND 
  EXISTS (
    SELECT 1 FROM pairs p 
    WHERE (p.user_a = auth.uid() OR p.user_b = auth.uid()) 
    AND p.status = 'active'
    AND (storage.foldername(name))[1] IN (p.user_a::text, p.user_b::text)
  )
);

CREATE POLICY "Users can upload media files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own media files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own media files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);