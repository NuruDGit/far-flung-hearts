-- Fix ai_usage_tracking RLS policies to prevent public access

-- Drop existing policies
DROP POLICY IF EXISTS "Service role can manage usage" ON public.ai_usage_tracking;
DROP POLICY IF EXISTS "Users can view own usage" ON public.ai_usage_tracking;

-- Block all anonymous access
CREATE POLICY "Block anonymous access"
  ON public.ai_usage_tracking
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Users can only view their own usage data
CREATE POLICY "Users can view own usage"
  ON public.ai_usage_tracking
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can manage all usage tracking (for automated processes)
CREATE POLICY "Service role can manage usage"
  ON public.ai_usage_tracking
  FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);