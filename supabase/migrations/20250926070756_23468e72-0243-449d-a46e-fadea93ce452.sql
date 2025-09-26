-- Drop the existing check constraint
ALTER TABLE public.events DROP CONSTRAINT events_kind_check;

-- Add a new check constraint with the correct event types
ALTER TABLE public.events ADD CONSTRAINT events_kind_check 
CHECK (kind IN ('date', 'anniversary', 'travel', 'birthday', 'meeting', 'other'));