-- Update the messages type check constraint to include 'media' type
ALTER TABLE public.messages 
DROP CONSTRAINT messages_type_check;

ALTER TABLE public.messages 
ADD CONSTRAINT messages_type_check 
CHECK (type = ANY (ARRAY['text'::text, 'image'::text, 'video'::text, 'voice'::text, 'reaction'::text, 'system'::text, 'media'::text]));