-- Fix RLS policies for moderation_logs and subscriptions tables that have RLS enabled but no policies
-- Add basic RLS policies for moderation_logs (admin access only)
CREATE POLICY "Service role can manage moderation logs" 
ON public.moderation_logs 
FOR ALL 
USING (auth.jwt()->>'role' = 'service_role');

-- Add basic RLS policies for subscriptions (users can view their pair's subscription)
CREATE POLICY "Users can view their pair subscription" 
ON public.subscriptions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM pairs p 
  WHERE p.id = subscriptions.pair_id 
  AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
));