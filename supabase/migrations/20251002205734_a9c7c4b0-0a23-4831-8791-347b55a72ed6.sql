-- Create reunion countdown table
CREATE TABLE public.reunion_countdown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id UUID NOT NULL REFERENCES public.pairs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  reunion_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  UNIQUE(pair_id)
);

ALTER TABLE public.reunion_countdown ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reunion_countdown in pair"
ON public.reunion_countdown
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pairs p
    WHERE p.id = reunion_countdown.pair_id
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
);

CREATE POLICY "reunion_countdown insert by pair member"
ON public.reunion_countdown
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pairs p
    WHERE p.id = reunion_countdown.pair_id
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
  AND auth.uid() = created_by
);

CREATE POLICY "reunion_countdown update by pair member"
ON public.reunion_countdown
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pairs p
    WHERE p.id = reunion_countdown.pair_id
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
);

CREATE POLICY "reunion_countdown delete by pair member"
ON public.reunion_countdown
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pairs p
    WHERE p.id = reunion_countdown.pair_id
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
);

-- Create gift wishlist table
CREATE TABLE public.gift_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id UUID NOT NULL REFERENCES public.pairs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  price NUMERIC,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  purchased BOOLEAN DEFAULT false,
  purchased_by UUID,
  purchased_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gift_wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gift_wishlist in pair"
ON public.gift_wishlist
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pairs p
    WHERE p.id = gift_wishlist.pair_id
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
);

CREATE POLICY "gift_wishlist insert self"
ON public.gift_wishlist
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pairs p
    WHERE p.id = gift_wishlist.pair_id
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
  AND auth.uid() = user_id
);

CREATE POLICY "gift_wishlist update by owner or partner"
ON public.gift_wishlist
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pairs p
    WHERE p.id = gift_wishlist.pair_id
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
);

CREATE POLICY "gift_wishlist delete by owner"
ON public.gift_wishlist
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
);

-- Create couple games scores table
CREATE TABLE public.game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id UUID NOT NULL REFERENCES public.pairs(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  game_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "game_scores in pair"
ON public.game_scores
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pairs p
    WHERE p.id = game_scores.pair_id
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
);