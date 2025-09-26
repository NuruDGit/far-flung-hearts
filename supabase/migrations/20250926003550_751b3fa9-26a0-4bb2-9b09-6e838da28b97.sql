-- Add assigned_to column to goal_tasks table for task assignment
ALTER TABLE public.goal_tasks 
ADD COLUMN assigned_to uuid REFERENCES public.profiles(id);