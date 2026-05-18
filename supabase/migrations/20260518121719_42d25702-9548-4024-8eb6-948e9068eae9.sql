
-- 1. Create private contacts table
CREATE TABLE IF NOT EXISTS public.profile_contacts (
  user_id uuid PRIMARY KEY,
  email text,
  phone text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own contacts"
  ON public.profile_contacts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own contacts"
  ON public.profile_contacts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own contacts"
  ON public.profile_contacts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Migrate existing data
INSERT INTO public.profile_contacts (user_id, email, phone)
SELECT user_id, email, phone FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- 3. Drop the now-redundant sensitive columns from profiles
DROP VIEW IF EXISTS public.profiles_public;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone;

-- 4. Relax profiles SELECT policy now that it holds no sensitive data
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Authenticated can view profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

-- 5. Recreate profiles_public view with security_invoker = on (fixes Security Definer View lint)
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT
  user_id, full_name, avatar_url, bio, county, country,
  role, verified, verification_status,
  trade_count, rating_avg, rating_count
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO authenticated, anon;

-- 6. Update new-user trigger to populate both tables
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, country, county)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'Kenya', 'Nairobi');

  INSERT INTO public.profile_contacts (user_id, email, phone)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$function$;
