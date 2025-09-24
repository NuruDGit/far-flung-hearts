-- Add new fields to profiles table for enhanced couple features
ALTER TABLE public.profiles 
ADD COLUMN birth_date DATE,
ADD COLUMN city TEXT,
ADD COLUMN country TEXT;