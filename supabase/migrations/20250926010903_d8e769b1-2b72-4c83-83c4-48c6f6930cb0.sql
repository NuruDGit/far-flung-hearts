-- Make the media bucket public so images can display as thumbnails
UPDATE storage.buckets 
SET public = true 
WHERE id = 'media';