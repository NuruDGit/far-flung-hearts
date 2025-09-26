-- Update the default color value to use design system semantic tokens
ALTER TABLE public.goalboard 
ALTER COLUMN color SET DEFAULT 'heart';

-- Update any existing records that might have the old default hex value
UPDATE public.goalboard 
SET color = 'heart' 
WHERE color = '#3B82F6';

-- Add comment to clarify the expected values
COMMENT ON COLUMN public.goalboard.color IS 'Semantic color name from design system (e.g., heart, coral, deep, primary, accent, secondary, muted, destructive)';