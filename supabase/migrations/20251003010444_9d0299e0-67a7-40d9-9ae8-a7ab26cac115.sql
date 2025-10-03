-- Create daily question answers table
CREATE TABLE daily_question_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_question_id uuid NOT NULL REFERENCES daily_questions(id) ON DELETE CASCADE,
  pair_id uuid NOT NULL REFERENCES pairs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  answer_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(daily_question_id, user_id)
);

-- Add indexes for performance
CREATE INDEX idx_daily_question_answers_question ON daily_question_answers(daily_question_id);
CREATE INDEX idx_daily_question_answers_pair ON daily_question_answers(pair_id);
CREATE INDEX idx_daily_question_answers_user ON daily_question_answers(user_id);

-- Enable RLS
ALTER TABLE daily_question_answers ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view answers in their pair"
  ON daily_question_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pairs p
      WHERE p.id = daily_question_answers.pair_id
      AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
    )
  );

CREATE POLICY "Users can create their own answers"
  ON daily_question_answers FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM pairs p
      WHERE p.id = daily_question_answers.pair_id
      AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
    )
  );

CREATE POLICY "Users can update their own answers"
  ON daily_question_answers FOR UPDATE
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_daily_question_answers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_daily_question_answers_updated_at
  BEFORE UPDATE ON daily_question_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_question_answers_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE daily_question_answers;