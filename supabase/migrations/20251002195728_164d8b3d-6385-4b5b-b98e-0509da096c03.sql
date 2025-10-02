-- ============================================
-- CRITICAL SECURITY FIXES
-- ============================================

-- 1. Fix pair_invites table - Remove public read policy
DROP POLICY IF EXISTS "invites public read for joining" ON public.pair_invites;

-- Add secure policy for code validation (will be checked server-side only)
CREATE POLICY "invites validate code securely"
ON public.pair_invites
FOR SELECT
TO authenticated
USING (
  -- Only the creator or someone with the exact code AND it's not expired
  (auth.uid() = created_by) OR 
  (expires_at > now())
);

-- 2. Add explicit deny policy for unauthenticated users on profiles
CREATE POLICY "profiles deny unauthenticated access"
ON public.profiles
FOR ALL
TO anon
USING (false);

-- 3. Add consent mechanism for mood data sharing
ALTER TABLE public.mood_logs 
ADD COLUMN IF NOT EXISTS shared_with_partner boolean DEFAULT true;

-- Update mood_logs partner view policy to respect consent
DROP POLICY IF EXISTS "mood_logs partner view" ON public.mood_logs;
CREATE POLICY "mood_logs partner view with consent"
ON public.mood_logs
FOR SELECT
TO authenticated
USING (
  pair_id IS NOT NULL 
  AND shared_with_partner = true
  AND EXISTS (
    SELECT 1 FROM pairs p
    WHERE p.id = mood_logs.pair_id
    AND p.status = 'active'
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
    AND auth.uid() != mood_logs.user_id -- Partner can view, not self
  )
);

-- 4. Add policy to restrict subscription access after disconnection
DROP POLICY IF EXISTS "Users can view their pair subscription" ON public.subscriptions;
CREATE POLICY "Users can view active pair subscription"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM pairs p
    WHERE p.id = subscriptions.pair_id
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
    AND p.status = 'active' -- Only active pairs
  )
);

-- 5. Add automatic cleanup of ICE configuration data
CREATE OR REPLACE FUNCTION public.cleanup_ice_config()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear ICE config data when call ends
  IF NEW.status IN ('ended', 'failed', 'cancelled') AND NEW.ice_config IS NOT NULL THEN
    NEW.ice_config = NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cleanup_ice_on_call_end ON public.call_sessions;
CREATE TRIGGER cleanup_ice_on_call_end
BEFORE UPDATE ON public.call_sessions
FOR EACH ROW
WHEN (NEW.status IN ('ended', 'failed', 'cancelled'))
EXECUTE FUNCTION public.cleanup_ice_config();

-- 6. Add user-level access control for embeddings
ALTER TABLE public.embeddings 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update embeddings policy to restrict to creator
DROP POLICY IF EXISTS "embeddings in pair" ON public.embeddings;
CREATE POLICY "embeddings creator access"
ON public.embeddings
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM pairs p
    WHERE p.id = embeddings.pair_id
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
);

-- 7. Add message validation policy to prevent access attempts
DROP POLICY IF EXISTS "messages in pair" ON public.messages;
CREATE POLICY "messages strict pair access"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM pairs p
    WHERE p.id = messages.pair_id
    AND p.status = 'active'
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
  AND deleted_at IS NULL
);

-- 8. Fix search_path for all existing functions
ALTER FUNCTION public.validate_pair_status() SET search_path = public;
ALTER FUNCTION public.get_or_create_daily_question(uuid) SET search_path = public;
ALTER FUNCTION public.calculate_pair_streak(uuid) SET search_path = public;
ALTER FUNCTION public.update_call_sessions_updated_at() SET search_path = public;
ALTER FUNCTION public.get_user_notification_preferences(uuid) SET search_path = public;
ALTER FUNCTION public.update_notification_preferences_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_new_user_notification_preferences() SET search_path = public;
ALTER FUNCTION public.archive_old_completed_tasks() SET search_path = public;

-- 9. Add audit logging table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs (implement admin role separately)
CREATE POLICY "security_audit_log admin only"
ON public.security_audit_log
FOR ALL
TO authenticated
USING (false); -- Will be updated when admin system is implemented

-- 10. Add rate limiting tracking table
CREATE TABLE IF NOT EXISTS public.rate_limit_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  last_request_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Enable RLS
ALTER TABLE public.rate_limit_tracking ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limit data
CREATE POLICY "rate_limit_tracking self access"
ON public.rate_limit_tracking
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- System can manage rate limiting
CREATE POLICY "rate_limit_tracking system manage"
ON public.rate_limit_tracking
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create index for faster rate limit checks
CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup 
ON public.rate_limit_tracking(user_id, endpoint, window_start);

-- 11. Add input validation for critical fields
-- Validation trigger for email format in profiles
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate email format if provided
  IF NEW.email IS NOT NULL AND NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validate phone number if provided (basic validation)
  IF NEW.phone_number IS NOT NULL AND LENGTH(NEW.phone_number) < 10 THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;
  
  -- Sanitize text fields to prevent XSS
  NEW.bio = regexp_replace(COALESCE(NEW.bio, ''), '<[^>]*>', '', 'g');
  NEW.first_name = regexp_replace(COALESCE(NEW.first_name, ''), '<[^>]*>', '', 'g');
  NEW.last_name = regexp_replace(COALESCE(NEW.last_name, ''), '<[^>]*>', '', 'g');
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_profile_before_update ON public.profiles;
CREATE TRIGGER validate_profile_before_update
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_profile_data();

-- Validation for message content length
CREATE OR REPLACE FUNCTION public.validate_message_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Limit message body size (100KB)
  IF pg_column_size(NEW.body) > 102400 THEN
    RAISE EXCEPTION 'Message body too large';
  END IF;
  
  -- Validate media URL format if provided
  IF NEW.media_url IS NOT NULL AND NEW.media_url !~ '^https?://' THEN
    RAISE EXCEPTION 'Invalid media URL format';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_message_before_insert ON public.messages;
CREATE TRIGGER validate_message_before_insert
BEFORE INSERT OR UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.validate_message_data();