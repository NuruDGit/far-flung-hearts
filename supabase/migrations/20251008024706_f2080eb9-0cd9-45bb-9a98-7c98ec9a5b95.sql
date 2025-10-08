-- Fix profiles table RLS policies
-- Remove the restrictive policy that blocks all access
DROP POLICY IF EXISTS "profiles deny unauthenticated access" ON public.profiles;

-- Add proper policies that explicitly deny anonymous access and allow authenticated users
-- This replaces the problematic restrictive policy

-- Deny all access to anonymous users
CREATE POLICY "profiles_deny_anon_access"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Allow authenticated users to view their own profile
-- (This already exists but we're ensuring it's properly scoped)
DROP POLICY IF EXISTS "profiles self access" ON public.profiles;
CREATE POLICY "profiles_self_view"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow authenticated users to view partner profile in active pair
-- (This already exists but we're ensuring it's properly scoped)
DROP POLICY IF EXISTS "profiles partner view in active pair" ON public.profiles;
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

-- Allow users to insert their own profile
-- (This already exists but we're ensuring it's properly scoped)
DROP POLICY IF EXISTS "profiles insert self" ON public.profiles;
CREATE POLICY "profiles_self_insert"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
-- (This already exists but we're ensuring it's properly scoped)
DROP POLICY IF EXISTS "profiles update self" ON public.profiles;
CREATE POLICY "profiles_self_update"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Explicitly deny DELETE operations for all users (no one should delete profiles)
CREATE POLICY "profiles_deny_delete"
ON public.profiles
FOR DELETE
TO authenticated
USING (false);

-- Add comment explaining the security model
COMMENT ON TABLE public.profiles IS 'User profiles with RLS enabled. Only authenticated users can access their own profile and their active partner''s profile. Anonymous access is explicitly denied.';