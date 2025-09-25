-- Fix RLS policies for mood_logs to allow proper partner viewing
-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "mood_logs partner view" ON public.mood_logs;

-- Create a better policy for partner mood viewing
CREATE POLICY "mood_logs partner view" 
ON public.mood_logs 
FOR SELECT 
USING (
  pair_id IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM pairs p 
    WHERE p.id = mood_logs.pair_id 
    AND p.status = 'active'
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
);

-- Create mood analytics table for storing computed insights
CREATE TABLE IF NOT EXISTS public.mood_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  pair_id uuid,
  period_type text NOT NULL, -- 'weekly', 'monthly', 'yearly'
  period_start date NOT NULL,
  period_end date NOT NULL,
  mood_counts jsonb NOT NULL, -- counts of each mood emoji
  dominant_mood text,
  mood_score numeric, -- average happiness score
  streak_days integer DEFAULT 0,
  insights jsonb, -- AI-generated insights
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on mood_analytics
ALTER TABLE public.mood_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for mood_analytics
CREATE POLICY "mood_analytics self access" 
ON public.mood_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "mood_analytics partner view" 
ON public.mood_analytics 
FOR SELECT 
USING (
  pair_id IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM pairs p 
    WHERE p.id = mood_analytics.pair_id 
    AND p.status = 'active'
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
);

CREATE POLICY "mood_analytics insert self" 
ON public.mood_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mood_analytics update self" 
ON public.mood_analytics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create mood notifications table for partner support
CREATE TABLE IF NOT EXISTS public.mood_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pair_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  mood_log_id uuid,
  notification_type text NOT NULL, -- 'mood_shared', 'cheer_up', 'milestone'
  message text,
  action_type text, -- 'hug', 'encourage', 'celebrate', 'support'
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on mood_notifications
ALTER TABLE public.mood_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for mood_notifications
CREATE POLICY "mood_notifications in pair" 
ON public.mood_notifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM pairs p 
    WHERE p.id = mood_notifications.pair_id 
    AND p.status = 'active'
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
);

CREATE POLICY "mood_notifications insert by member" 
ON public.mood_notifications 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM pairs p 
    WHERE p.id = mood_notifications.pair_id 
    AND p.status = 'active'
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date ON public.mood_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_logs_pair_date ON public.mood_logs(pair_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_analytics_user_period ON public.mood_analytics(user_id, period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_mood_notifications_receiver ON public.mood_notifications(receiver_id, created_at DESC);