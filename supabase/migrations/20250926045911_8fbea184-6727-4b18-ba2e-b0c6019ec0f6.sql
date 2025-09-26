-- Add relationship start date to profiles table
ALTER TABLE public.profiles 
ADD COLUMN relationship_start_date date;

COMMENT ON COLUMN public.profiles.relationship_start_date IS 'The date when the couple''s relationship began';