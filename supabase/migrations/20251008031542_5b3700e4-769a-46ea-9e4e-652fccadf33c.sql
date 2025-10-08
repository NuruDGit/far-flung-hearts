-- Fix Security Definer View Issue
-- Views must use SECURITY INVOKER to respect RLS policies

-- ============================================================================
-- ISSUE: Views created without explicit SECURITY INVOKER use the permissions
-- of the view creator (postgres superuser), which bypasses RLS policies.
-- This is a critical security vulnerability.
-- 
-- FIX: Recreate view with explicit SECURITY INVOKER to ensure RLS policies
-- are enforced based on the querying user's permissions, not the creator's.
-- ============================================================================

-- Drop the existing view
DROP VIEW IF EXISTS public.profiles_partner_safe;

-- Recreate with explicit SECURITY INVOKER
CREATE VIEW public.profiles_partner_safe
WITH (security_invoker = true) AS
SELECT
  id,
  display_name,
  avatar_url,
  pronouns,
  tz,
  created_at,
  first_name,
  last_name,
  bio,
  interests,
  relationship_status,
  city,
  country,
  relationship_start_date
  -- EXCLUDED for privacy: email, phone_number, birth_date
FROM public.profiles;

-- Grant access to authenticated users (RLS will still apply)
GRANT SELECT ON public.profiles_partner_safe TO authenticated;

-- Add comprehensive security documentation
COMMENT ON VIEW public.profiles_partner_safe IS
'SECURITY INVOKER view for safe partner profile access.

SECURITY MODEL:
- Uses SECURITY INVOKER (security_invoker = true) to enforce RLS policies
- Queries execute with the permissions of the USER, not the view creator
- All RLS policies on the profiles table are still enforced
- Users can only see data they have permission to access via RLS

EXCLUDED SENSITIVE FIELDS (protected PII):
- ❌ email (prevents spam/phishing campaigns)
- ❌ phone_number (prevents harassment/stalking)
- ❌ birth_date (prevents identity theft)

INCLUDED SAFE FIELDS:
- ✅ Name, avatar, pronouns, timezone
- ✅ Bio, interests, location (city/country only)
- ✅ Relationship status and dates

USAGE:
Partners in active relationships can query this view to see limited profile info.
The view automatically respects all RLS policies on the profiles table.

Example:
  SELECT * FROM profiles_partner_safe WHERE id = $partner_id;

This will only return data if the querying user has permission via RLS policies.';

-- Verify the security configuration
DO $$
DECLARE
  view_options text[];
BEGIN
  SELECT reloptions INTO view_options
  FROM pg_class
  WHERE relname = 'profiles_partner_safe'
    AND relnamespace = 'public'::regnamespace;
  
  IF view_options IS NULL OR NOT ('security_invoker=true' = ANY(view_options)) THEN
    RAISE EXCEPTION 'SECURITY CHECK FAILED: View profiles_partner_safe is not configured as SECURITY INVOKER';
  END IF;
  
  RAISE NOTICE 'SECURITY CHECK PASSED: View profiles_partner_safe is correctly configured with security_invoker=true';
END $$;