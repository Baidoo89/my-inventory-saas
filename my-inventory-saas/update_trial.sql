-- Add created_at to profiles to track trial duration
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
