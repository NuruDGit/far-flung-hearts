-- Strengthen profiles table security against anonymous access
-- This migration ensures complete protection against anonymous access

-- First, verify RLS is enabled (should already be, but let's be explicit)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop the current restrictive policy for anon
DROP POLICY IF EXISTS "profiles_deny_anon_access" ON public.profiles;

-- Create a stronger restrictive policy that blocks ALL operations for anonymous users
CREATE POLICY "profiles_block_all_anon"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Add an additional restrictive policy to ensure only authenticated users can access
-- This provides defense in depth
CREATE POLICY "profiles_require_auth"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- Ensure no orphaned or overly permissive policies exist
-- Re-create all policies with explicit role specifications

-- Self view policy (already exists but recreating for consistency)
DROP POLICY IF EXISTS "profiles_self_view" ON public.profiles;
CREATE POLICY "profiles_self_view"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Partner view in active pair
DROP POLICY IF EXISTS "profiles_partner_view" ON public.profiles;
CREATE POLICY "profiles_partner_view"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM pairs p
    WHERE p.status = 'active'
    AND (
      (p.user_a = auth.uid() AND p.user_b = profiles.id)
      OR (p.user_b = auth.uid() AND p.user_a = profiles.id)
    )
  )
);

-- Self insert policy
DROP POLICY IF EXISTS "profiles_self_insert" ON public.profiles;
CREATE POLICY "profiles_self_insert"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Self update policy
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Deny all deletes
DROP POLICY IF EXISTS "profiles_deny_delete" ON public.profiles;
CREATE POLICY "profiles_deny_delete"
ON public.profiles
FOR DELETE
TO authenticated
USING (false);

-- Add table comment documenting the security model
COMMENT ON TABLE public.profiles IS 
'User profiles table with multi-layer RLS protection:
1. Anonymous access is completely blocked via restrictive policies
2. All access requires authentication (auth.uid() IS NOT NULL)
3. Users can only view/modify their own profile
4. Users can view partner profiles only in active pairs
5. Profile deletion is forbidden for all users
This provides defense-in-depth against unauthorized access.';