-- Create call_sessions table for active call persistence
CREATE TABLE public.call_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pair_id UUID NOT NULL,
  caller_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  call_type TEXT NOT NULL CHECK (call_type IN ('video', 'audio')),
  status TEXT NOT NULL DEFAULT 'initiating' CHECK (status IN ('initiating', 'ringing', 'connected', 'ended', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  ice_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create call_history table for historical records
CREATE TABLE public.call_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pair_id UUID NOT NULL,
  caller_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  call_type TEXT NOT NULL CHECK (call_type IN ('video', 'audio')),
  duration_seconds INTEGER DEFAULT 0,
  end_reason TEXT CHECK (end_reason IN ('completed', 'declined', 'failed', 'timeout', 'network_error')),
  quality_score DECIMAL(3,2), -- 0.00 to 1.00
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create call_quality_logs table for connection monitoring
CREATE TABLE public.call_quality_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_session_id UUID NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  connection_state TEXT,
  ice_connection_state TEXT,
  audio_quality DECIMAL(3,2), -- 0.00 to 1.00
  video_quality DECIMAL(3,2), -- 0.00 to 1.00
  latency_ms INTEGER,
  packet_loss_rate DECIMAL(5,4) -- 0.0000 to 1.0000
);

-- Enable Row Level Security
ALTER TABLE public.call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_quality_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for call_sessions
CREATE POLICY "call_sessions in pair" 
ON public.call_sessions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM pairs p 
  WHERE p.id = call_sessions.pair_id 
  AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
));

CREATE POLICY "call_sessions insert by pair member" 
ON public.call_sessions 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM pairs p 
  WHERE p.id = call_sessions.pair_id 
  AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
) AND auth.uid() = caller_id);

CREATE POLICY "call_sessions update by pair member" 
ON public.call_sessions 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM pairs p 
  WHERE p.id = call_sessions.pair_id 
  AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
));

-- RLS Policies for call_history
CREATE POLICY "call_history in pair" 
ON public.call_history 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM pairs p 
  WHERE p.id = call_history.pair_id 
  AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
));

CREATE POLICY "call_history insert by pair member" 
ON public.call_history 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM pairs p 
  WHERE p.id = call_history.pair_id 
  AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
));

-- RLS Policies for call_quality_logs
CREATE POLICY "call_quality_logs access by call participants" 
ON public.call_quality_logs 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM call_sessions cs
  JOIN pairs p ON p.id = cs.pair_id
  WHERE cs.id = call_quality_logs.call_session_id 
  AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
));

-- Add foreign key constraints
ALTER TABLE public.call_sessions 
ADD CONSTRAINT fk_call_sessions_pair 
FOREIGN KEY (pair_id) REFERENCES public.pairs(id) ON DELETE CASCADE;

ALTER TABLE public.call_history 
ADD CONSTRAINT fk_call_history_pair 
FOREIGN KEY (pair_id) REFERENCES public.pairs(id) ON DELETE CASCADE;

ALTER TABLE public.call_quality_logs 
ADD CONSTRAINT fk_call_quality_call_session 
FOREIGN KEY (call_session_id) REFERENCES public.call_sessions(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_call_sessions_pair_id ON public.call_sessions(pair_id);
CREATE INDEX idx_call_sessions_status ON public.call_sessions(status);
CREATE INDEX idx_call_history_pair_id ON public.call_history(pair_id);
CREATE INDEX idx_call_history_started_at ON public.call_history(started_at DESC);
CREATE INDEX idx_call_quality_logs_call_session_id ON public.call_quality_logs(call_session_id);

-- Add updated_at trigger function for call_sessions
CREATE OR REPLACE FUNCTION public.update_call_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_call_sessions_updated_at
BEFORE UPDATE ON public.call_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_call_sessions_updated_at();