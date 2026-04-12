
-- =============================================
-- FIX 1: Profiles - Hide email/phone from other users
-- =============================================

-- Restrict base table SELECT to own row only
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- The profiles_public view already exists and excludes email/phone.
-- Change it to security_invoker=off so it bypasses the restrictive RLS
-- on the base table, allowing users to see other users' public info.
ALTER VIEW public.profiles_public SET (security_invoker = off);

-- Ensure view is accessible
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;

-- =============================================
-- FIX 2: Orders UPDATE - prevent reopening completed orders
-- =============================================

DROP POLICY IF EXISTS "Users update own orders" ON public.orders;

CREATE POLICY "Users update own orders"
ON public.orders FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND status IN ('negotiating', 'pending', 'pending_payment')
)
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FIX 3: Chat-images bucket - make private
-- =============================================

UPDATE storage.buckets SET public = false WHERE id = 'chat-images';

-- Drop any overly permissive SELECT policies for chat-images
DROP POLICY IF EXISTS "Chat images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view chat images" ON storage.objects;
DROP POLICY IF EXISTS "Public read chat-images" ON storage.objects;

-- Only authenticated users can view chat images
CREATE POLICY "Authenticated users can view chat images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat-images');
