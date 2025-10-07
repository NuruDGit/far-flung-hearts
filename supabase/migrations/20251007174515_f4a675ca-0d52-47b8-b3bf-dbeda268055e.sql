-- Create subscription status table
CREATE TABLE subscription_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  product_id TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment failures table
CREATE TABLE payment_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  invoice_id TEXT NOT NULL,
  amount INTEGER,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_subscription_email ON subscription_status(customer_email);
CREATE INDEX idx_subscription_status ON subscription_status(status);
CREATE INDEX idx_payment_failures_customer ON payment_failures(customer_id);

-- Enable RLS
ALTER TABLE subscription_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_failures ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own subscription status
CREATE POLICY "Users can view own subscription status" 
ON subscription_status
FOR SELECT 
USING (customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Policy for service role to manage subscriptions
CREATE POLICY "Service role can manage subscription status" 
ON subscription_status
FOR ALL 
USING (true);

-- Policy for service role to manage payment failures
CREATE POLICY "Service role can manage payment failures" 
ON payment_failures
FOR ALL 
USING (true);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription_status updated_at
CREATE TRIGGER update_subscription_status_updated_at
BEFORE UPDATE ON subscription_status
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();