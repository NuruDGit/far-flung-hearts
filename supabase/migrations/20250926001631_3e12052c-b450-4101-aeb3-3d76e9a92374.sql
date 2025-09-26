-- Add color and icon columns to goalboard table for visual indicators
ALTER TABLE public.goalboard 
ADD COLUMN color TEXT DEFAULT '#3B82F6',
ADD COLUMN icon TEXT DEFAULT 'target';

-- Add index for better performance when filtering by color
CREATE INDEX idx_goalboard_color ON public.goalboard(color);

-- Add comment to document the new columns
COMMENT ON COLUMN public.goalboard.color IS 'Hex color code for goal visual identification (e.g., #3B82F6)';
COMMENT ON COLUMN public.goalboard.icon IS 'Lucide icon name for goal visual identification (e.g., target, heart, star)';