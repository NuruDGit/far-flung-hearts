-- Fix the pairs status check constraint to allow 'disconnected' status
ALTER TABLE pairs DROP CONSTRAINT IF EXISTS pairs_status_check;

-- Add proper constraint that allows all valid statuses including 'disconnected'
ALTER TABLE pairs ADD CONSTRAINT pairs_status_check 
CHECK (status IN ('pending', 'active', 'disconnected'));

-- Fix the disconnect pair dialog HTML structure issue
-- This will be handled in the component fix