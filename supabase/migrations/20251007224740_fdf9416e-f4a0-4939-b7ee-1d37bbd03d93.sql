-- Make relationship_status a flexible free-text field
ALTER TABLE profiles 
  ALTER COLUMN relationship_status TYPE TEXT,
  DROP CONSTRAINT IF EXISTS profiles_relationship_status_check;

-- Add descriptive comment
COMMENT ON COLUMN profiles.relationship_status IS 
  'Free-text field for relationship status. Examples: married, dating, engaged, long-distance, etc.';