-- Add archived status and completion tracking to goal_tasks table
ALTER TABLE public.goal_tasks 
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;

-- Create index for better performance when querying archived tasks
CREATE INDEX idx_goal_tasks_archived ON public.goal_tasks(is_archived, archived_at);
CREATE INDEX idx_goal_tasks_completed ON public.goal_tasks(completed_at, status_column);

-- Create function to automatically archive completed tasks after 7 days
CREATE OR REPLACE FUNCTION archive_old_completed_tasks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Archive tasks that have been completed for more than 7 days
  UPDATE goal_tasks 
  SET 
    is_archived = TRUE,
    archived_at = NOW()
  WHERE 
    status_column = 'done' 
    AND completed_at IS NOT NULL 
    AND completed_at < (NOW() - INTERVAL '7 days')
    AND is_archived = FALSE;
    
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  
  RETURN archived_count;
END;
$$;

-- Create trigger to automatically set completed_at when task status changes to 'done'
CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- If status changed to 'done', set completed_at
  IF NEW.status_column = 'done' AND (OLD.status_column IS NULL OR OLD.status_column != 'done') THEN
    NEW.completed_at = NOW();
  END IF;
  
  -- If status changed from 'done' to something else, clear completed_at
  IF OLD.status_column = 'done' AND NEW.status_column != 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER trigger_set_completed_at
  BEFORE UPDATE ON goal_tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_completed_at();

-- Add comments to document the new columns
COMMENT ON COLUMN public.goal_tasks.completed_at IS 'Timestamp when task was marked as completed (status_column = done)';
COMMENT ON COLUMN public.goal_tasks.archived_at IS 'Timestamp when task was archived';
COMMENT ON COLUMN public.goal_tasks.is_archived IS 'Whether task is archived (automatically set after 7 days of completion)';