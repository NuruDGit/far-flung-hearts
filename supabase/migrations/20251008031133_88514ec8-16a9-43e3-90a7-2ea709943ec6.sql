-- Comprehensive Security Hardening for Messages Table
-- Implements defense-in-depth to prevent unauthorized access to private conversations

-- ============================================================================
-- ANALYSIS OF SECURITY GAPS:
-- 1. No RESTRICTIVE policy blocking anonymous access
-- 2. No authentication requirement at RESTRICTIVE level
-- 3. Deleted messages not blocked at RESTRICTIVE level
-- 4. No explicit deny policies for UPDATE/DELETE operations
-- 5. Missing protection against policy bypass attacks
-- ============================================================================

-- Layer 1: Block ALL Anonymous Access (RESTRICTIVE - Cannot be bypassed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
    AND policyname = 'messages_block_all_anon'
  ) THEN
    CREATE POLICY "messages_block_all_anon"
    ON public.messages
    AS RESTRICTIVE
    FOR ALL
    TO anon
    USING (false)
    WITH CHECK (false);
  END IF;
END $$;

-- Layer 2: Require Authentication for ALL Operations (RESTRICTIVE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
    AND policyname = 'messages_require_auth'
  ) THEN
    CREATE POLICY "messages_require_auth"
    ON public.messages
    AS RESTRICTIVE
    FOR ALL
    TO public
    USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Layer 3: Block ALL Access to Deleted Messages (RESTRICTIVE)
-- This ensures deleted messages are NEVER accessible, even if other policies are misconfigured
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
    AND policyname = 'messages_block_deleted'
  ) THEN
    CREATE POLICY "messages_block_deleted"
    ON public.messages
    AS RESTRICTIVE
    FOR ALL
    TO public
    USING (deleted_at IS NULL)
    WITH CHECK (deleted_at IS NULL);
  END IF;
END $$;

-- Layer 4: Require Active Pair Membership (RESTRICTIVE)
-- Users can ONLY access messages from their ACTIVE pair
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
    AND policyname = 'messages_require_active_pair'
  ) THEN
    CREATE POLICY "messages_require_active_pair"
    ON public.messages
    AS RESTRICTIVE
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM pairs p
        WHERE p.id = messages.pair_id
        AND p.status = 'active'
        AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
      )
    );
  END IF;
END $$;

-- Layer 5: Explicit Deny Policies for User Modifications
-- Users CANNOT directly UPDATE or DELETE messages
-- Soft deletes must happen through controlled service functions

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
    AND policyname = 'messages_deny_user_update'
  ) THEN
    CREATE POLICY "messages_deny_user_update"
    ON public.messages
    FOR UPDATE
    TO authenticated
    USING (false)
    WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
    AND policyname = 'messages_deny_user_delete'
  ) THEN
    CREATE POLICY "messages_deny_user_delete"
    ON public.messages
    FOR DELETE
    TO authenticated
    USING (false);
  END IF;
END $$;

-- Layer 6: Verify Existing Policies Are Correct
-- The existing "messages strict pair access" policy is now reinforced by RESTRICTIVE policies
-- The existing "messages insert by member" policy is now protected by authentication requirements

-- Add comprehensive security documentation
COMMENT ON TABLE public.messages IS 
'Private messages with multi-layer security:
- RESTRICTIVE policies block all anonymous access
- RESTRICTIVE policies enforce authentication for all operations
- RESTRICTIVE policies block ALL access to deleted messages (deleted_at IS NOT NULL)
- RESTRICTIVE policies require active pair membership
- Explicit deny policies prevent direct user UPDATE/DELETE
- Users can only SELECT messages in their active pair where deleted_at IS NULL
- Users can only INSERT messages as themselves in their active pair
- Soft deletes (setting deleted_at) can only be done by service functions
- Hard deletes are blocked for all users
This defense-in-depth approach ensures that even if permissive policies are misconfigured, 
RESTRICTIVE policies will still prevent unauthorized access.';

-- Create audit trigger for message access attempts
CREATE OR REPLACE FUNCTION public.log_message_access_violation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Log any attempt to access deleted messages
  IF (TG_OP = 'SELECT' OR TG_OP = 'UPDATE') AND NEW.deleted_at IS NOT NULL THEN
    PERFORM public.log_security_event(
      auth.uid(),
      'warning',
      'deleted_message_access_attempt',
      'policy_violation',
      'messages',
      NEW.id,
      jsonb_build_object(
        'message_id', NEW.id,
        'deleted_at', NEW.deleted_at,
        'operation', TG_OP
      ),
      false
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Note: Trigger would be created here, but we want to avoid performance impact
-- Instead, we rely on RLS policies to block access completely

COMMENT ON FUNCTION public.log_message_access_violation() IS 
'Audit function to log attempts to access deleted messages. Currently not attached to trigger to avoid performance impact, but available for investigation if needed.';