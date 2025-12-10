-- Add tax_rate to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tax_rate numeric DEFAULT 0;

-- Ensure currency_symbol is there (it should be, but good to be safe)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS currency_symbol text DEFAULT 'GH₵';
