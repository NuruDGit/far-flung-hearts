-- Migration: Normalize subscription tiers to new standard
-- Update all super_premium, premium_monthly, premium_annual to just "premium"

-- Update subscriptions table to normalize old tier names
UPDATE subscriptions 
SET plan = 'premium' 
WHERE plan IN ('super_premium', 'premium_monthly', 'premium_annual');

-- Add comment to document the migration
COMMENT ON TABLE subscriptions IS 'Subscription tiers: free, premium. Old values (super_premium, premium_monthly, premium_annual) migrated to premium.';