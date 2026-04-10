
-- ============================================================
-- 1. user_roles: Remove self-assign INSERT and DELETE policies
-- ============================================================
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;

-- ============================================================
-- 2. user_scores: Remove user INSERT/UPDATE policies
-- ============================================================
DROP POLICY IF EXISTS "Users can insert own scores" ON public.user_scores;
DROP POLICY IF EXISTS "Users can update own scores" ON public.user_scores;

-- ============================================================
-- 3. score_events: Remove user INSERT policy
-- ============================================================
DROP POLICY IF EXISTS "Users can insert own score events" ON public.score_events;

-- ============================================================
-- 4. notifications: Fix INSERT policy to prevent spoofing
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users insert notifications" ON public.notifications;
CREATE POLICY "Users insert own notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5. profiles: Restrict SELECT to authenticated users only
-- ============================================================
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- ============================================================
-- 6. bids: Add server-side bid validation trigger
-- ============================================================
ALTER TABLE public.bids ADD CONSTRAINT bids_amount_positive CHECK (amount > 0);

CREATE OR REPLACE FUNCTION public.validate_bid_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_bid numeric;
  v_starting_bid numeric;
  v_status text;
  v_min_bid numeric;
BEGIN
  SELECT current_bid, starting_bid, status
  INTO v_current_bid, v_starting_bid, v_status
  FROM public.auctions
  WHERE id = NEW.auction_id;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Auction not found';
  END IF;

  IF v_status != 'active' THEN
    RAISE EXCEPTION 'Auction is not active';
  END IF;

  v_min_bid := COALESCE(v_current_bid, v_starting_bid);

  IF NEW.amount <= v_min_bid THEN
    RAISE EXCEPTION 'Bid must be greater than current bid of %', v_min_bid;
  END IF;

  -- Atomically update the auction
  UPDATE public.auctions
  SET current_bid = NEW.amount,
      current_winner_id = NEW.bidder_id,
      bids_count = bids_count + 1,
      updated_at = now()
  WHERE id = NEW.auction_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_bid_before_insert
  BEFORE INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_bid_amount();

-- ============================================================
-- 7. orders: Add WITH CHECK to restrict status changes
-- ============================================================
DROP POLICY IF EXISTS "Users update own orders" ON public.orders;
CREATE POLICY "Users update own orders" ON public.orders
  FOR UPDATE TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status IN ('pending', 'cancelled'));

-- ============================================================
-- 8. Storage: Fix upload path restrictions for shared buckets
-- ============================================================
DROP POLICY IF EXISTS "Auth users upload chat images" ON storage.objects;
CREATE POLICY "Auth users upload chat images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-images'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Auth users upload post images" ON storage.objects;
CREATE POLICY "Auth users upload post images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Auth users upload question images" ON storage.objects;
CREATE POLICY "Auth users upload question images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'question-images'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
