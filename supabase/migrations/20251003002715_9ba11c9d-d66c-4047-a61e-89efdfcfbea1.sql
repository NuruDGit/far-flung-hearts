-- Fix: Prevent multiple active pairs and cleanup orphaned data

-- Step 1: Create unique index to prevent users from appearing in multiple active pairs
-- This prevents a user from being in multiple active pairs regardless of whether they're user_a or user_b
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_pair_user_a 
ON public.pairs (user_a) 
WHERE status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_pair_user_b 
ON public.pairs (user_b) 
WHERE status = 'active' AND user_b IS NOT NULL;

-- Step 2: Data cleanup - Move subscription from orphaned pair to the correct pair with Margaret
-- Kelvin's correct pair with Margaret: 369faaaf-0723-4d6b-a3ff-34bdb5a15565
-- Kelvin's orphaned solo pair: 505a10a1-dcb9-4b79-befd-55396c7148f6

-- Update subscription to point to the correct pair
UPDATE public.subscriptions
SET pair_id = '369faaaf-0723-4d6b-a3ff-34bdb5a15565'
WHERE pair_id = '505a10a1-dcb9-4b79-befd-55396c7148f6';

-- Step 3: Disconnect the orphaned pair
UPDATE public.pairs
SET 
  status = 'disconnected',
  disconnected_at = NOW(),
  disconnected_by = user_a
WHERE id = '505a10a1-dcb9-4b79-befd-55396c7148f6'
AND status = 'active';