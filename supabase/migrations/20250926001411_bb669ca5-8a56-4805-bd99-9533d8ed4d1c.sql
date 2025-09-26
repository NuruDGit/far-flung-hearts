-- Add goal_id column to goal_tasks table to link tasks to specific goals
ALTER TABLE public.goal_tasks 
ADD COLUMN goal_id UUID REFERENCES public.goalboard(id) ON DELETE CASCADE;

-- Create index for better performance when querying tasks by goal
CREATE INDEX idx_goal_tasks_goal_id ON public.goal_tasks(goal_id);

-- Add comment to document the relationship
COMMENT ON COLUMN public.goal_tasks.goal_id IS 'Links task to a specific goal. When goal is deleted, associated tasks are also deleted.';