-- Create newsletter subscribers table
CREATE TABLE newsletter_subscribers (
  email TEXT PRIMARY KEY,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  source TEXT DEFAULT 'blog',
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create index for faster queries on subscription status
CREATE INDEX idx_newsletter_active ON newsletter_subscribers(email) WHERE unsubscribed_at IS NULL;

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy for service role to manage subscriptions
CREATE POLICY "Service role can manage subscribers" 
ON newsletter_subscribers
FOR ALL 
USING (true);