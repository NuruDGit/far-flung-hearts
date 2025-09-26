-- Update relationship_goals column to relationship_status and add new values
ALTER TABLE public.profiles 
RENAME COLUMN relationship_goals TO relationship_status;

-- Add a comment to clarify the purpose of this field
COMMENT ON COLUMN public.profiles.relationship_status IS 'Type of relationship (Dating, In a Relationship, Engaged, Married, Long Distance, It''s Complicated) for better AI recommendations';