-- Fix the function search path security warning
CREATE OR REPLACE FUNCTION public.get_or_create_daily_question(target_pair_id uuid)
RETURNS TABLE (
  id uuid,
  question_text text,
  question_date date,
  answered_by uuid,
  answered_at timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  today_date date := CURRENT_DATE;
  question_exists boolean;
  new_question_text text;
  questions text[] := ARRAY[
    'What made you smile today?',
    'What are you most grateful for right now?',
    'What''s one thing you''re looking forward to tomorrow?',
    'Describe your day in three words.',
    'What was the highlight of your week so far?',
    'What''s something new you learned recently?',
    'How did you show kindness today?',
    'What''s your favorite memory from this month?',
    'If you could relive one moment from today, what would it be?',
    'What''s something that challenged you today?',
    'What made you feel loved today?',
    'What''s one thing you''re proud of accomplishing recently?',
    'How did you take care of yourself today?',
    'What''s something beautiful you noticed today?',
    'What made you laugh out loud recently?'
  ];
BEGIN
  -- Check if question already exists for today
  SELECT EXISTS(
    SELECT 1 FROM public.daily_questions dq 
    WHERE dq.pair_id = target_pair_id 
    AND dq.question_date = today_date
  ) INTO question_exists;
  
  -- If no question exists, create one
  IF NOT question_exists THEN
    -- Generate question based on pair_id and date for consistency
    SELECT questions[
      (ABS(HASHTEXT(target_pair_id::text || today_date::text)) % array_length(questions, 1)) + 1
    ] INTO new_question_text;
    
    INSERT INTO public.daily_questions (pair_id, question_text, question_date)
    VALUES (target_pair_id, new_question_text, today_date);
  END IF;
  
  -- Return the question for today
  RETURN QUERY
  SELECT dq.id, dq.question_text, dq.question_date, dq.answered_by, dq.answered_at
  FROM public.daily_questions dq
  WHERE dq.pair_id = target_pair_id 
  AND dq.question_date = today_date;
END;
$$;