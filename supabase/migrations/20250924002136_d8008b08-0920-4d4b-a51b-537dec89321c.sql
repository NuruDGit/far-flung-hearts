-- Add columns to profiles table for enhanced signup
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create mood_logs table for daily mood tracking
CREATE TABLE public.mood_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pair_id UUID,
  emoji TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(user_id, date) -- One mood entry per user per day
);

-- Enable RLS on mood_logs
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for mood_logs
CREATE POLICY "mood_logs self access" 
ON public.mood_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "mood_logs insert self" 
ON public.mood_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mood_logs update self" 
ON public.mood_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "mood_logs partner view" 
ON public.mood_logs 
FOR SELECT 
USING (
  pair_id IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM pairs p 
    WHERE p.id = mood_logs.pair_id 
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
);

-- Create index for better performance
CREATE INDEX idx_mood_logs_user_date ON public.mood_logs(user_id, date);
CREATE INDEX idx_mood_logs_pair_date ON public.mood_logs(pair_id, date);