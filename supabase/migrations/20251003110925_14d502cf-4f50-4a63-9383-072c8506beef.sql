-- Fix rate_limit_tracking security vulnerability
-- Remove the overly permissive policy that allows any user to manipulate rate limits
DROP POLICY IF EXISTS "rate_limit_tracking system manage" ON public.rate_limit_tracking;

-- Create service role only policies for write operations
CREATE POLICY "rate_limit_tracking service role insert"
ON public.rate_limit_tracking
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "rate_limit_tracking service role update"
ON public.rate_limit_tracking
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "rate_limit_tracking service role delete"
ON public.rate_limit_tracking
FOR DELETE
TO service_role
USING (true);

-- The existing "rate_limit_tracking self access" SELECT policy remains unchanged
-- Users can only view their own rate limit data (read-only)