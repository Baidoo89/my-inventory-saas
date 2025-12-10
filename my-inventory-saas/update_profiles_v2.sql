-- Add low_stock_threshold to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 5;
