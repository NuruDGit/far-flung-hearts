-- Fix the function search path security warning
CREATE OR REPLACE FUNCTION public.set_completed_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Update the archive function
CREATE OR REPLACE FUNCTION public.archive_old_completed_tasks()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;