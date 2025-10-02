-- Enable realtime for game_sessions table
ALTER TABLE game_sessions REPLICA IDENTITY FULL;

-- Add publication for realtime
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;