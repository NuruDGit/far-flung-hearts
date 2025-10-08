-- Comprehensive Security Hardening Migration (Idempotent)
-- This migration addresses all critical and medium priority security findings

-- ============================================================================
-- PHASE 1: CRITICAL FIXES - Secure Sensitive Data Tables
-- ============================================================================

-- 1. Secure newsletter_subscribers table
DO $$
BEGIN
  -- Block all anonymous access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'newsletter_subscribers' AND policyname = 'newsletter_subscribers_block_anon'
  ) THEN
    CREATE POLICY "newsletter_subscribers_block_anon"
    ON public.newsletter_subscribers
    AS RESTRICTIVE
    FOR ALL
    TO anon
    USING (false)
    WITH CHECK (false);
  END IF;

  -- Block all authenticated user access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'newsletter_subscribers' AND policyname = 'newsletter_subscribers_block_authenticated'
  ) THEN
    CREATE POLICY "newsletter_subscribers_block_authenticated"
    ON public.newsletter_subscribers
    AS RESTRICTIVE
    FOR ALL
    TO authenticated
    USING (false)
    WITH CHECK (false);
  END IF;
END $$;

COMMENT ON TABLE public.newsletter_subscribers IS 
'Newsletter subscriber emails - SERVICE ROLE ONLY ACCESS. Contains PII (email addresses) and must never be accessible to regular users or anonymous requests. Only backend services can read/write this data.';

-- 2. Secure payment_failures table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payment_failures' AND policyname = 'payment_failures_block_anon'
  ) THEN
    CREATE POLICY "payment_failures_block_anon"
    ON public.payment_failures
    AS RESTRICTIVE
    FOR ALL
    TO anon
    USING (false)
    WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payment_failures' AND policyname = 'payment_failures_block_authenticated'
  ) THEN
    CREATE POLICY "payment_failures_block_authenticated"
    ON public.payment_failures
    AS RESTRICTIVE
    FOR ALL
    TO authenticated
    USING (false)
    WITH CHECK (false);
  END IF;
END $$;

COMMENT ON TABLE public.payment_failures IS 
'Payment failure logs - SERVICE ROLE ONLY ACCESS. Contains sensitive financial data (customer IDs, invoice IDs, amounts) and must never be accessible to regular users. Only backend payment systems can access this data.';

-- 3. Add explicit deny policies for read-only tables

-- checklist_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'checklist_items' AND policyname = 'checklist_items_deny_user_insert'
  ) THEN
    CREATE POLICY "checklist_items_deny_user_insert"
    ON public.checklist_items
    FOR INSERT
    TO authenticated
    WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'checklist_items' AND policyname = 'checklist_items_deny_user_update'
  ) THEN
    CREATE POLICY "checklist_items_deny_user_update"
    ON public.checklist_items
    FOR UPDATE
    TO authenticated
    USING (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'checklist_items' AND policyname = 'checklist_items_deny_user_delete'
  ) THEN
    CREATE POLICY "checklist_items_deny_user_delete"
    ON public.checklist_items
    FOR DELETE
    TO authenticated
    USING (false);
  END IF;
END $$;

COMMENT ON TABLE public.checklist_items IS 
'Checklist items - READ ONLY for users. Users can view items in their pair but cannot create, update, or delete. Only service functions can modify this table.';

-- checklists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'checklists' AND policyname = 'checklists_deny_user_insert'
  ) THEN
    CREATE POLICY "checklists_deny_user_insert"
    ON public.checklists
    FOR INSERT
    TO authenticated
    WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'checklists' AND policyname = 'checklists_deny_user_update'
  ) THEN
    CREATE POLICY "checklists_deny_user_update"
    ON public.checklists
    FOR UPDATE
    TO authenticated
    USING (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'checklists' AND policyname = 'checklists_deny_user_delete'
  ) THEN
    CREATE POLICY "checklists_deny_user_delete"
    ON public.checklists
    FOR DELETE
    TO authenticated
    USING (false);
  END IF;
END $$;

COMMENT ON TABLE public.checklists IS 
'Checklists - READ ONLY for users. Users can view checklists in their pair but cannot create, update, or delete. Only service functions can modify this table.';

-- presence
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'presence' AND policyname = 'presence_deny_user_insert'
  ) THEN
    CREATE POLICY "presence_deny_user_insert"
    ON public.presence
    FOR INSERT
    TO authenticated
    WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'presence' AND policyname = 'presence_deny_user_update'
  ) THEN
    CREATE POLICY "presence_deny_user_update"
    ON public.presence
    FOR UPDATE
    TO authenticated
    USING (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'presence' AND policyname = 'presence_deny_user_delete'
  ) THEN
    CREATE POLICY "presence_deny_user_delete"
    ON public.presence
    FOR DELETE
    TO authenticated
    USING (false);
  END IF;
END $$;

COMMENT ON TABLE public.presence IS 
'User presence tracking - READ ONLY for users. Users can view presence status in their pair but cannot modify. Only service functions update presence data via realtime system.';

-- embeddings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'embeddings' AND policyname = 'embeddings_deny_user_insert'
  ) THEN
    CREATE POLICY "embeddings_deny_user_insert"
    ON public.embeddings
    FOR INSERT
    TO authenticated
    WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'embeddings' AND policyname = 'embeddings_deny_user_update'
  ) THEN
    CREATE POLICY "embeddings_deny_user_update"
    ON public.embeddings
    FOR UPDATE
    TO authenticated
    USING (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'embeddings' AND policyname = 'embeddings_deny_user_delete'
  ) THEN
    CREATE POLICY "embeddings_deny_user_delete"
    ON public.embeddings
    FOR DELETE
    TO authenticated
    USING (false);
  END IF;
END $$;

COMMENT ON TABLE public.embeddings IS 
'AI embeddings for search - READ ONLY for users. Users can view embeddings in their pair but cannot modify. Only AI service functions can create/update embeddings.';

-- message_summaries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'message_summaries' AND policyname = 'message_summaries_deny_user_insert'
  ) THEN
    CREATE POLICY "message_summaries_deny_user_insert"
    ON public.message_summaries
    FOR INSERT
    TO authenticated
    WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'message_summaries' AND policyname = 'message_summaries_deny_user_update'
  ) THEN
    CREATE POLICY "message_summaries_deny_user_update"
    ON public.message_summaries
    FOR UPDATE
    TO authenticated
    USING (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'message_summaries' AND policyname = 'message_summaries_deny_user_delete'
  ) THEN
    CREATE POLICY "message_summaries_deny_user_delete"
    ON public.message_summaries
    FOR DELETE
    TO authenticated
    USING (false);
  END IF;
END $$;

COMMENT ON TABLE public.message_summaries IS 
'AI-generated message summaries - READ ONLY for users. Users can view summaries in their pair but cannot modify. Only AI service functions can create summaries.';

-- ============================================================================
-- PHASE 2: MEDIUM PRIORITY - Fix Function Security
-- ============================================================================

-- Fix database function search paths
CREATE OR REPLACE FUNCTION public.validate_pair_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.status NOT IN ('pending', 'active', 'disconnected') THEN
    RAISE EXCEPTION 'Invalid pair status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_ice_config()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.status IN ('ended', 'failed', 'cancelled') AND NEW.ice_config IS NOT NULL THEN
    NEW.ice_config = NULL;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_call_sessions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Add function security documentation
COMMENT ON FUNCTION public.validate_pair_status() IS 
'Validates pair status values. SECURITY DEFINER with fixed search_path to prevent injection attacks.';

COMMENT ON FUNCTION public.cleanup_ice_config() IS 
'Cleans up ICE configuration data after calls end. SECURITY DEFINER with fixed search_path to prevent injection attacks.';

COMMENT ON FUNCTION public.update_call_sessions_updated_at() IS 
'Updates call session timestamps. SECURITY DEFINER with fixed search_path to prevent injection attacks.';

COMMENT ON FUNCTION public.update_updated_at_column() IS 
'Updates updated_at timestamps. SECURITY DEFINER with fixed search_path to prevent injection attacks.';