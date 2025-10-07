-- Create AI usage tracking table
CREATE TABLE ai_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost_usd NUMERIC(10, 4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reset_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 month')
);

-- Create index for faster queries
CREATE INDEX idx_ai_usage_user_feature_reset ON ai_usage_tracking(user_id, feature, reset_at);

-- Enable RLS
ALTER TABLE ai_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own usage
CREATE POLICY "Users can view own usage" 
ON ai_usage_tracking
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for service role to insert/update usage
CREATE POLICY "Service role can manage usage" 
ON ai_usage_tracking
FOR ALL 
USING (true);