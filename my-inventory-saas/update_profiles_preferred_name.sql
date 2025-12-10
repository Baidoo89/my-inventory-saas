-- Add preferred_name column if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_name text;

-- Optional: If you already created full_name and want to migrate data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        UPDATE public.profiles SET preferred_name = full_name WHERE preferred_name IS NULL;
    END IF;
END $$;
