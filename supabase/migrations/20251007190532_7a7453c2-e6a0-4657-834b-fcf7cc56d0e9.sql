-- Drop existing table if it exists (from failed migration)
DROP TABLE IF EXISTS public.security_audit_log CASCADE;

-- Create security_audit_log table for tracking critical security events
CREATE TABLE public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  resource_type TEXT,
  resource_id UUID,
  action TEXT NOT NULL,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  success BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX idx_security_audit_user ON public.security_audit_log(user_id);
CREATE INDEX idx_security_audit_timestamp ON public.security_audit_log(created_at DESC);
CREATE INDEX idx_security_audit_severity ON public.security_audit_log(severity);
CREATE INDEX idx_security_audit_event_type ON public.security_audit_log(event_type);
CREATE INDEX idx_security_audit_resource ON public.security_audit_log(resource_type, resource_id);

-- RLS Policies
-- Only admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON public.security_audit_log
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON public.security_audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON public.security_audit_log
  FOR INSERT
  WITH CHECK (true);

-- Create helper function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_severity TEXT,
  p_action TEXT,
  p_event_type TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_success BOOLEAN DEFAULT true,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    severity,
    action,
    event_type,
    resource_type,
    resource_id,
    metadata,
    success,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_severity,
    p_action,
    p_event_type,
    p_resource_type,
    p_resource_id,
    p_metadata,
    p_success,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Create trigger function to log profile changes
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log email changes
  IF (TG_OP = 'UPDATE' AND OLD.email IS DISTINCT FROM NEW.email) THEN
    PERFORM public.log_security_event(
      NEW.id,
      'warning',
      'email_changed',
      'profile_update',
      'profile',
      NEW.id,
      jsonb_build_object(
        'old_email', OLD.email,
        'new_email', NEW.email
      ),
      true
    );
  END IF;

  -- Log phone number changes
  IF (TG_OP = 'UPDATE' AND OLD.phone_number IS DISTINCT FROM NEW.phone_number) THEN
    PERFORM public.log_security_event(
      NEW.id,
      'info',
      'phone_changed',
      'profile_update',
      'profile',
      NEW.id,
      jsonb_build_object(
        'old_phone', OLD.phone_number,
        'new_phone', NEW.phone_number
      ),
      true
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for profile changes
DROP TRIGGER IF EXISTS trigger_log_profile_changes ON public.profiles;
CREATE TRIGGER trigger_log_profile_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_changes();

-- Create function to track failed login attempts
CREATE OR REPLACE FUNCTION public.track_failed_login(
  p_email TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recent_failures INTEGER;
BEGIN
  -- Count recent failed attempts from this IP
  SELECT COUNT(*) INTO v_recent_failures
  FROM public.security_audit_log
  WHERE event_type = 'failed_login'
    AND ip_address = p_ip_address
    AND created_at > (now() - interval '5 minutes')
    AND success = false;

  -- Log the failed attempt with escalating severity
  PERFORM public.log_security_event(
    NULL,
    CASE 
      WHEN v_recent_failures >= 3 THEN 'critical'
      WHEN v_recent_failures >= 1 THEN 'warning'
      ELSE 'info'
    END,
    'login_failed',
    'failed_login',
    NULL,
    NULL,
    jsonb_build_object(
      'email', p_email,
      'attempt_number', v_recent_failures + 1
    ),
    false,
    p_ip_address,
    p_user_agent
  );
END;
$$;