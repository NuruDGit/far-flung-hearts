-- Enable INSERT, UPDATE, DELETE policies for goal_tasks
CREATE POLICY "goal_tasks insert by pair member" 
ON public.goal_tasks 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM pairs p 
  WHERE p.id = goal_tasks.pair_id 
  AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
));

CREATE POLICY "goal_tasks update by pair member" 
ON public.goal_tasks 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM pairs p 
  WHERE p.id = goal_tasks.pair_id 
  AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
));

CREATE POLICY "goal_tasks delete by pair member" 
ON public.goal_tasks 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM pairs p 
  WHERE p.id = goal_tasks.pair_id 
  AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
));

-- Enable INSERT, UPDATE, DELETE policies for goalboard
CREATE POLICY "goalboard insert by pair member" 
ON public.goalboard 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM pairs p 
  WHERE p.id = goalboard.pair_id 
  AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
));

CREATE POLICY "goalboard update by pair member" 
ON public.goalboard 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM pairs p 
  WHERE p.id = goalboard.pair_id 
  AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
));

CREATE POLICY "goalboard delete by pair member" 
ON public.goalboard 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM pairs p 
  WHERE p.id = goalboard.pair_id 
  AND (auth.uid() = p.user_a OR auth.uid() = p.user_b)
));