-- Grant pro access to Kelvin (kwambugu2024@gmail.com)
DO $$
DECLARE
  kelvin_id uuid := 'd2b80372-eda5-4703-94f5-8bc50a1a681d';
  kelvin_pair_id uuid;
BEGIN
  -- Check if Kelvin has an active pair
  SELECT id INTO kelvin_pair_id 
  FROM pairs 
  WHERE (user_a = kelvin_id OR user_b = kelvin_id) 
    AND status = 'active'
  LIMIT 1;
  
  -- If no active pair exists, create one for Kelvin
  IF kelvin_pair_id IS NULL THEN
    INSERT INTO pairs (user_a, status)
    VALUES (kelvin_id, 'active')
    RETURNING id INTO kelvin_pair_id;
  END IF;
  
  -- Grant pro subscription with lifetime access
  INSERT INTO subscriptions (pair_id, plan, store, renews_on)
  VALUES (kelvin_pair_id, 'pro', 'stripe', '2099-12-31')
  ON CONFLICT (pair_id) 
  DO UPDATE SET 
    plan = 'pro',
    store = 'stripe',
    renews_on = '2099-12-31';
END $$;