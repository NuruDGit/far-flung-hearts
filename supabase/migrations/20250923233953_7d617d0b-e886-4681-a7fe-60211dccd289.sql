-- Add INSERT policy for pairs table
CREATE POLICY "pairs insert by creator" 
ON public.pairs 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_a);