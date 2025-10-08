-- Fix subscription_status table to remove email exposure
-- This migration replaces customer_email with user_id for better security

-- Step 1: Drop all existing policies that might depend on customer_email
DROP POLICY IF EXISTS "Users can view own subscription status" ON public.subscription_status;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscription_status;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscription_status;
DROP POLICY IF EXISTS "Service role full access" ON public.subscription_status;

-- Step 2: Add user_id column to subscription_status
ALTER TABLE public.subscription_status 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Populate user_id from existing customer_email where possible
-- Match emails between subscription_status and profiles table
UPDATE public.subscription_status ss
SET user_id = p.id
FROM public.profiles p
WHERE ss.customer_email = p.email
AND ss.user_id IS NULL;

-- Step 4: Drop the customer_email column to prevent email enumeration
ALTER TABLE public.subscription_status 
DROP COLUMN IF EXISTS customer_email CASCADE;

-- Step 5: Make user_id NOT NULL now that data is migrated
-- Any remaining rows without user_id will be deleted (orphaned subscriptions)
DELETE FROM public.subscription_status WHERE user_id IS NULL;
ALTER TABLE public.subscription_status 
ALTER COLUMN user_id SET NOT NULL;

-- Step 6: Add unique constraint on user_id to prevent multiple subscriptions per user
CREATE UNIQUE INDEX IF NOT EXISTS subscription_status_user_id_key 
ON public.subscription_status(user_id);

-- Step 7: Enable RLS if not already enabled
ALTER TABLE public.subscription_status ENABLE ROW LEVEL SECURITY;

-- Step 8: Create restrictive policies

-- Block all anonymous access
CREATE POLICY "subscription_status_block_anon"
ON public.subscription_status
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Require authentication for all operations
CREATE POLICY "subscription_status_require_auth"
ON public.subscription_status
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- Allow users to view only their own subscription status
CREATE POLICY "subscription_status_self_view"
ON public.subscription_status
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only service role can insert/update subscription status
CREATE POLICY "subscription_status_service_role_manage"
ON public.subscription_status
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Deny all user modifications (only service role via webhooks can modify)
CREATE POLICY "subscription_status_deny_user_modify"
ON public.subscription_status
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "subscription_status_deny_user_update"
ON public.subscription_status
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "subscription_status_deny_user_delete"
ON public.subscription_status
FOR DELETE
TO authenticated
USING (false);

-- Add table comment
COMMENT ON TABLE public.subscription_status IS 
'Subscription status with strict security: user_id links to auth.users, no email storage, service-role-only modifications, users can only view their own data.';