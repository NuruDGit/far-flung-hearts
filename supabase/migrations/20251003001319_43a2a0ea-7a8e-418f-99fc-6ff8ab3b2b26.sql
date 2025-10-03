-- 1) Data cleanup: enforce a single active pair per user and a single pending pair per inviter

-- Disconnect older active pairs per user_a
WITH active_pairs_a AS (
  SELECT id, user_a, created_at,
         ROW_NUMBER() OVER (PARTITION BY user_a ORDER BY created_at DESC) AS rn
  FROM public.pairs
  WHERE status = 'active'
),
-- Disconnect older active pairs per user_b (only non-null)
active_pairs_b AS (
  SELECT id, user_b, created_at,
         ROW_NUMBER() OVER (PARTITION BY user_b ORDER BY created_at DESC) AS rn
  FROM public.pairs
  WHERE status = 'active' AND user_b IS NOT NULL
),
active_to_disconnect AS (
  SELECT id FROM active_pairs_a WHERE rn > 1
  UNION
  SELECT id FROM active_pairs_b WHERE rn > 1
)
UPDATE public.pairs p
SET status = 'disconnected',
    disconnected_at = now()
WHERE p.id IN (SELECT id FROM active_to_disconnect);

-- Disconnect older pending pairs per user_a (inviter)
WITH pending_pairs AS (
  SELECT id, user_a, created_at,
         ROW_NUMBER() OVER (PARTITION BY user_a ORDER BY created_at DESC) AS rn
  FROM public.pairs
  WHERE status = 'pending'
)
UPDATE public.pairs p
SET status = 'disconnected',
    disconnected_at = now()
WHERE p.id IN (
  SELECT id FROM pending_pairs WHERE rn > 1
);

-- 2) Guardrails: partial unique indexes to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_user_a
  ON public.pairs(user_a)
  WHERE status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_user_b
  ON public.pairs(user_b)
  WHERE status = 'active' AND user_b IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_user_a
  ON public.pairs(user_a)
  WHERE status = 'pending';

-- Ensure pair_invites code is unique
CREATE UNIQUE INDEX IF NOT EXISTS pair_invites_code_unique
  ON public.pair_invites(code);

-- 3) Subscriptions: ensure one row per pair for pair-level subscription propagation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'subscriptions_pair_unique'
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_pair_unique UNIQUE (pair_id);
  END IF;
END $$;

-- 4) Realtime configuration for pairs
ALTER TABLE public.pairs REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'pairs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pairs;
  END IF;
END $$;