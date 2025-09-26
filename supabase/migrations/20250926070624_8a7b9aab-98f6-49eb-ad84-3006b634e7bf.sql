-- Add INSERT, UPDATE, and DELETE policies for events table
CREATE POLICY "events insert by pair member" 
ON public.events 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pairs p 
    WHERE p.id = events.pair_id 
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
);

CREATE POLICY "events update by pair member" 
ON public.events 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM pairs p 
    WHERE p.id = events.pair_id 
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
);

CREATE POLICY "events delete by pair member" 
ON public.events 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM pairs p 
    WHERE p.id = events.pair_id 
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
);