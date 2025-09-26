-- Create message_reactions table for storing emoji reactions to messages
CREATE TABLE public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable Row Level Security
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for message reactions
CREATE POLICY "Users can view reactions in their pair messages" 
ON public.message_reactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.messages m 
    JOIN public.pairs p ON p.id = m.pair_id 
    WHERE m.id = message_reactions.message_id 
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
);

CREATE POLICY "Users can add reactions to pair messages" 
ON public.message_reactions 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.messages m 
    JOIN public.pairs p ON p.id = m.pair_id 
    WHERE m.id = message_reactions.message_id 
    AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
  )
);

CREATE POLICY "Users can remove their own reactions" 
ON public.message_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable realtime for message reactions
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;