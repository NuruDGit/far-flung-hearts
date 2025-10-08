-- CRITICAL SECURITY FIX: Correct Bug in Enumeration Prevention Policy
-- The policy had a typo that completely broke the enumeration protection

-- ============================================================================
-- CRITICAL BUG FOUND:
-- The profiles_prevent_enumeration policy incorrectly referenced 'p.id' 
-- instead of 'profiles.id' in the EXISTS subquery.
-- 
-- This means it was comparing:
--   (p.user_b = p.id)  -- WRONG: always false or comparing pair ID to itself
-- 
-- Instead of:
--   (p.user_b = profiles.id)  -- CORRECT: checking if profiles.id is the partner
-- 
-- IMPACT: The RESTRICTIVE enumeration prevention was NOT WORKING
-- Users could potentially access profiles they shouldn't see
-- ============================================================================

-- Drop the broken policy
DROP POLICY IF EXISTS "profiles_prevent_enumeration" ON public.profiles;

-- Recreate with correct logic
CREATE POLICY "profiles_prevent_enumeration"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
  -- Users can ONLY view their own profile OR their active partner's profile
  -- No scanning/enumeration of other users' profiles
  auth.uid() = id 
  OR EXISTS (
    SELECT 1 FROM pairs p
    WHERE p.status = 'active'
    -- FIXED: Now correctly references profiles.id instead of p.id
    AND ((p.user_a = auth.uid() AND p.user_b = profiles.id) 
      OR (p.user_b = auth.uid() AND p.user_a = profiles.id))
  )
);

COMMENT ON POLICY "profiles_prevent_enumeration" ON public.profiles IS
'RESTRICTIVE policy preventing profile enumeration attacks.
Users can ONLY SELECT:
- Their own profile (auth.uid() = profiles.id)
- Their active partner''s profile (via active pair relationship)
This prevents users from scanning or accessing arbitrary user profiles.
Even if other SELECT policies are permissive, this RESTRICTIVE policy
will block access to profiles outside these two specific cases.';

-- Also strengthen the partner view policy to be more explicit about field access
-- The current policy allows SELECT but we should document expected usage
COMMENT ON POLICY "profiles_partner_view_restricted" ON public.profiles IS
'Permissive policy allowing partners in active relationships to view each other.
CRITICAL: This policy grants SELECT access to the full profiles table,
but the APPLICATION LAYER must use profiles_partner_safe view to exclude
sensitive PII fields (email, phone_number, birth_date).
The enumeration prevention policy still restricts this to active partners only.';

-- Verify the fix
DO $$
BEGIN
  -- Check that the policy exists and is RESTRICTIVE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'profiles_prevent_enumeration'
    AND permissive = 'RESTRICTIVE'
  ) THEN
    RAISE EXCEPTION 'SECURITY CHECK FAILED: Enumeration prevention policy not found or not RESTRICTIVE';
  END IF;
  
  -- Check that the policy references profiles.id correctly
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'profiles_prevent_enumeration'
    AND qual LIKE '%profiles.id%'
  ) THEN
    RAISE EXCEPTION 'SECURITY CHECK FAILED: Policy does not correctly reference profiles.id';
  END IF;
  
  RAISE NOTICE 'SECURITY CHECK PASSED: Enumeration prevention policy correctly configured';
END $$;