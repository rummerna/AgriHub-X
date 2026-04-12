
-- 1. Replace the broad SELECT policy with own-user-only
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2. Create a public view that strips sensitive fields
CREATE OR REPLACE VIEW public.profiles_public AS
  SELECT
    id, user_id, full_name, avatar_url, bio,
    country, county, role,
    verified, verification_status,
    rating_avg, rating_count, trade_count,
    created_at, updated_at,
    weather_location_country, weather_location_county, currency
  FROM public.profiles;

-- 3. Grant access to the view
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;
