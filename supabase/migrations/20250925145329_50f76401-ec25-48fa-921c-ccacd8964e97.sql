-- Add 'disconnected' status to pairs table
ALTER TABLE public.pairs 
ADD COLUMN disconnected_at timestamp with time zone,
ADD COLUMN disconnected_by uuid;

-- Update the status check constraint to include 'disconnected'
-- Note: We'll use a trigger instead of CHECK constraint for better flexibility
CREATE OR REPLACE FUNCTION validate_pair_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'active', 'disconnected') THEN
    RAISE EXCEPTION 'Invalid pair status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_pair_status_trigger
  BEFORE INSERT OR UPDATE ON public.pairs
  FOR EACH ROW
  EXECUTE FUNCTION validate_pair_status();

-- Add RLS policy for disconnecting from pairs
CREATE POLICY "pairs member can disconnect"
ON public.pairs
FOR UPDATE
TO authenticated
USING ((auth.uid() = user_a) OR (auth.uid() = user_b))
WITH CHECK (
  -- Allow updating status to disconnected and setting disconnected_by
  (status = 'disconnected' AND disconnected_by = auth.uid() AND disconnected_at IS NOT NULL) OR
  -- Allow other updates as long as they don't violate existing rules
  (status != 'disconnected')
);