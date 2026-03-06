
-- Fix overly permissive INSERT policy on notifications
-- Anyone authenticated should be able to create notifications for other users (e.g. order notifications)
DROP POLICY "Users insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
