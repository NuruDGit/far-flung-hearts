-- Fix pair_invites RLS policies to allow public read for joining
DROP POLICY IF EXISTS "invites public read for joining" ON pair_invites;
CREATE POLICY "invites public read for joining" 
ON pair_invites 
FOR SELECT 
TO authenticated
USING (true);

-- Add delete policy for cleanup after joining
DROP POLICY IF EXISTS "invites delete after join" ON pair_invites;
CREATE POLICY "invites delete after join" 
ON pair_invites 
FOR DELETE 
TO authenticated
USING (true);