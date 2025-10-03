-- Step 1: Drop the old constraint that only allows 'free' and 'pro'
ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_plan_check;

-- Step 2: Update all "pro" subscriptions to "premium" BEFORE adding new constraint
UPDATE subscriptions
SET plan = 'premium'
WHERE plan = 'pro';

-- Step 3: Add new constraint that allows standard tier names
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check 
  CHECK (plan IN ('free', 'premium', 'super_premium'));

-- Add a comment to document the standard tier names
COMMENT ON COLUMN subscriptions.plan IS 'Subscription tier: free, premium, or super_premium';