-- Fix the function to address security linter warning
CREATE OR REPLACE FUNCTION public.calculate_pair_streak(target_pair_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_date_check date := CURRENT_DATE;
  streak_count integer := 0;
  check_date date;
BEGIN
  -- Start from today and go backwards to find consecutive days with activity
  check_date := current_date_check;
  
  LOOP
    -- Check if there was any activity (messages or mood logs) on this date
    IF NOT EXISTS (
      SELECT 1 FROM public.messages 
      WHERE pair_id = target_pair_id 
      AND DATE(created_at) = check_date
      AND deleted_at IS NULL
      
      UNION
      
      SELECT 1 FROM public.mood_logs 
      WHERE pair_id = target_pair_id 
      AND date = check_date
    ) THEN
      -- No activity found for this date, break the streak
      EXIT;
    END IF;
    
    -- Activity found, increment streak and check previous day
    streak_count := streak_count + 1;
    check_date := check_date - INTERVAL '1 day';
    
    -- Prevent infinite loops by limiting to reasonable timeframe (1 year)
    IF streak_count >= 365 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$function$