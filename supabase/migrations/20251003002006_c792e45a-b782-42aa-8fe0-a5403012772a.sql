-- Allow users to view their active partner's profile
CREATE POLICY "profiles partner view in active pair"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pairs p
    WHERE p.status = 'active'
    AND (
      (p.user_a = auth.uid() AND p.user_b = profiles.id)
      OR
      (p.user_b = auth.uid() AND p.user_a = profiles.id)
    )
  )
);