-- Create game sessions table for tracking active multiplayer games
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id UUID NOT NULL REFERENCES pairs(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  player1_id UUID NOT NULL,
  player2_id UUID,
  player1_answers JSONB DEFAULT '[]'::jsonb,
  player2_answers JSONB DEFAULT '[]'::jsonb,
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  game_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT valid_status CHECK (status IN ('waiting', 'in_progress', 'completed'))
);

-- Enable RLS
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for game sessions
CREATE POLICY "game_sessions_in_pair" ON game_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pairs p
      WHERE p.id = game_sessions.pair_id
      AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
    )
  );

CREATE POLICY "game_sessions_create" ON game_sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pairs p
      WHERE p.id = game_sessions.pair_id
      AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
    )
    AND auth.uid() = player1_id
  );

CREATE POLICY "game_sessions_update_players" ON game_sessions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pairs p
      WHERE p.id = game_sessions.pair_id
      AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_game_sessions_pair_id ON game_sessions(pair_id);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_game_sessions_created_at ON game_sessions(created_at DESC);