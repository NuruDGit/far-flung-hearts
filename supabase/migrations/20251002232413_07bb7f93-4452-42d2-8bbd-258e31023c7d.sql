-- Add unique constraint to pair_invites code to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS pair_invites_code_unique ON public.pair_invites(code);