-- One additive security/payment migration. Existing orders and messages are retained.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency text;
UPDATE public.orders o SET currency = x.currency FROM (
  SELECT order_id, CASE WHEN count(DISTINCT currency)=1 THEN min(currency) ELSE NULL END currency
  FROM public.order_items GROUP BY order_id
) x WHERE o.id=x.order_id AND o.currency IS NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS is_deleted_by_1 boolean NOT NULL DEFAULT false;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS is_deleted_by_2 boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.protect_order_fields() RETURNS trigger
LANGUAGE plpgsql SET search_path=public AS $$
DECLARE allowed_cancel boolean;
BEGIN
  IF TG_OP='INSERT' THEN
    NEW.status:='pending'; NEW.paid_at:=NULL;
    NEW.mpesa_checkout_request_id:=NULL; NEW.mpesa_merchant_request_id:=NULL;
    NEW.mpesa_amount_expected:=NULL; NEW.mpesa_phone:=NULL; NEW.mpesa_receipt:=NULL; NEW.mpesa_requested_at:=NULL;
    RETURN NEW;
  END IF;
  -- Invoker identity cannot be forged by a client: trusted definer RPCs run as their database owner.
  IF current_user IN ('postgres','supabase_admin','service_role') OR auth.role()='service_role'
    OR public.has_role(auth.uid(),'admin') THEN RETURN NEW; END IF;
  allowed_cancel := auth.uid()=OLD.user_id AND OLD.status IN ('pending','pending_payment','negotiating') AND NEW.status='cancelled';
  NEW := jsonb_populate_record(NEW, (SELECT jsonb_object_agg(key,value) FROM jsonb_each(to_jsonb(OLD))
    WHERE key LIKE 'mpesa_%' OR key IN ('status','total_amount','delivery_fee','paid_at','seller_id','user_id','currency','id','created_at')));
  IF allowed_cancel THEN NEW.status:='cancelled'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_orders_insert BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.protect_order_fields();
CREATE TRIGGER protect_orders_update BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.protect_order_fields();
REVOKE ALL ON FUNCTION public.protect_order_fields() FROM PUBLIC,anon,authenticated;
-- Direct inserts would bypass trusted pricing; all new purchases go through place_order.
DROP POLICY IF EXISTS "Users create orders" ON public.orders;
DROP POLICY IF EXISTS "Users create order items" ON public.order_items;
REVOKE INSERT ON public.orders,public.order_items FROM anon,authenticated;
GRANT SELECT,UPDATE ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;
CREATE POLICY "Sellers read their order items" ON public.order_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_id AND o.seller_id=auth.uid()));

CREATE OR REPLACE FUNCTION public.place_order(_items jsonb,_payment_method text,_delivery_address text)
RETURNS uuid[] LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE buyer uuid:=auth.uid(); item record; prod public.products%ROWTYPE; seller record;
  curr text; product_currency text; oid uuid; ids uuid[]:=ARRAY[]::uuid[]; total numeric;
BEGIN
  IF buyer IS NULL THEN RAISE EXCEPTION 'Please sign in to place an order'; END IF;
  IF jsonb_typeof(_items) IS DISTINCT FROM 'array' OR jsonb_array_length(_items)=0 OR jsonb_array_length(_items)>100 THEN
    RAISE EXCEPTION 'Cart must contain between 1 and 100 items'; END IF;
  IF _payment_method IS NULL OR _payment_method NOT IN ('mpesa','card','paypal','bank') THEN RAISE EXCEPTION 'Invalid payment method'; END IF;
  IF _delivery_address IS NULL OR length(btrim(_delivery_address))=0 OR length(_delivery_address)>2000 THEN RAISE EXCEPTION 'Enter a valid delivery address'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(_items) j WHERE jsonb_typeof(j) IS DISTINCT FROM 'object'
    OR (j->>'product_id') IS NULL OR jsonb_typeof(j->'quantity') IS DISTINCT FROM 'number'
    OR (j->>'quantity') !~ '^[0-9]+$' OR (j->>'quantity')::numeric<=0 OR (j->>'quantity')::numeric>2147483647) THEN
    RAISE EXCEPTION 'Every item needs a product and a positive whole quantity'; END IF;
  -- Deterministic lock order prevents deadlocks between overlapping carts; duplicates are combined.
  FOR item IN SELECT (j->>'product_id')::uuid product_id,sum((j->>'quantity')::bigint) requested
    FROM jsonb_array_elements(_items) j GROUP BY 1 ORDER BY 1 LOOP
    SELECT * INTO prod FROM public.products WHERE id=item.product_id FOR UPDATE;
    IF NOT FOUND OR prod.status<>'active' OR COALESCE(prod.quantity,0)<=0 THEN RAISE EXCEPTION 'Product is missing, inactive or out of stock'; END IF;
    IF prod.user_id=buyer THEN RAISE EXCEPTION 'You cannot buy your own product'; END IF;
    IF prod.quantity<item.requested THEN RAISE EXCEPTION 'Insufficient stock for %',prod.title; END IF;
    IF prod.price<0 OR prod.price::text IN ('NaN','Infinity','-Infinity') THEN RAISE EXCEPTION 'Invalid price for %',prod.title; END IF;
    product_currency:=upper(NULLIF(btrim(prod.currency),''));
    IF product_currency IS NULL THEN RAISE EXCEPTION 'Product currency is missing'; END IF;
    IF curr IS NOT NULL AND curr<>product_currency THEN RAISE EXCEPTION 'Mixed-currency carts are not supported. Order one currency at a time.'; END IF;
    curr:=product_currency;
  END LOOP;
  FOR seller IN SELECT DISTINCT p.user_id FROM public.products p JOIN jsonb_array_elements(_items) j ON p.id=(j->>'product_id')::uuid ORDER BY p.user_id LOOP
    SELECT sum(p.price*(j->>'quantity')::numeric) INTO total FROM public.products p
      JOIN jsonb_array_elements(_items) j ON p.id=(j->>'product_id')::uuid WHERE p.user_id=seller.user_id;
    INSERT INTO public.orders(user_id,seller_id,total_amount,delivery_fee,currency,payment_method,delivery_address)
      VALUES(buyer,seller.user_id,total+500,500,curr,_payment_method,btrim(_delivery_address)) RETURNING id INTO oid;
    FOR item IN SELECT p.id product_id,p.price,sum((j->>'quantity')::bigint) requested FROM public.products p
      JOIN jsonb_array_elements(_items) j ON p.id=(j->>'product_id')::uuid WHERE p.user_id=seller.user_id GROUP BY p.id,p.price LOOP
      INSERT INTO public.order_items(order_id,product_id,quantity,unit_price,currency) VALUES(oid,item.product_id,item.requested,item.price,curr);
      UPDATE public.products SET quantity=quantity-item.requested,status=CASE WHEN quantity-item.requested=0 THEN 'sold_out' ELSE status END
        WHERE id=item.product_id AND quantity>=item.requested;
      IF NOT FOUND THEN RAISE EXCEPTION 'Stock changed. Please refresh your cart'; END IF;
    END LOOP;
    INSERT INTO public.notifications(user_id,type,reference_id,message) VALUES(seller.user_id,'new_order',oid,'You have a new order.');
    ids:=array_append(ids,oid);
  END LOOP;
  RETURN ids;
END $$;
REVOKE ALL ON FUNCTION public.place_order(jsonb,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.seller_update_order_status(_order_id uuid,_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.orders%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Please sign in'; END IF;
  SELECT * INTO o FROM public.orders WHERE id=_order_id FOR UPDATE;
  IF NOT FOUND OR o.seller_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'This order does not belong to you'; END IF;
  IF NOT ((o.status='pending' AND _status='processing') OR (o.status='processing' AND _status='shipped')
    OR (o.status='shipped' AND _status='delivered') OR (o.status IN ('pending','pending_payment','negotiating','paid','processing') AND _status='cancelled')) THEN
    RAISE EXCEPTION 'This order status transition is not allowed'; END IF;
  UPDATE public.orders SET status=_status,updated_at=now() WHERE id=o.id;
  INSERT INTO public.notifications(user_id,type,reference_id,message) VALUES(o.user_id,'order_update',o.id,'Your order is now '||_status||'.');
END $$;
REVOKE ALL ON FUNCTION public.seller_update_order_status(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.seller_update_order_status(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.protect_auction_fields() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE cancellation boolean;
BEGIN
  IF current_user IN ('postgres','supabase_admin','service_role') OR auth.role()='service_role' OR public.has_role(auth.uid(),'admin') THEN RETURN NEW; END IF;
  cancellation:=auth.uid()=OLD.seller_id AND OLD.bids_count=0 AND OLD.status='active' AND NEW.status='cancelled';
  -- Only description, image and permitted cancellation survive a seller update.
  NEW:=jsonb_populate_record(NEW,to_jsonb(OLD)-'description'-'image_url');
  IF cancellation THEN NEW.status:='cancelled'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_auctions_update BEFORE UPDATE ON public.auctions FOR EACH ROW EXECUTE FUNCTION public.protect_auction_fields();
REVOKE ALL ON FUNCTION public.protect_auction_fields() FROM PUBLIC,anon,authenticated;
DROP POLICY IF EXISTS "Sellers can update their own auctions" ON public.auctions;
CREATE POLICY "Sellers edit auction details or cancel without bids" ON public.auctions FOR UPDATE TO authenticated
USING (seller_id=auth.uid()) WITH CHECK(seller_id=auth.uid() AND (status<>'cancelled' OR bids_count=0));
-- Column-level grants hide the reserve even from arbitrary Data API queries.
REVOKE SELECT ON public.auctions FROM PUBLIC,anon,authenticated;
DO $$ DECLARE cols text; BEGIN
  SELECT string_agg(quote_ident(column_name),',') INTO cols FROM information_schema.columns
    WHERE table_schema='public' AND table_name='auctions' AND column_name<>'reserve_price';
  EXECUTE 'GRANT SELECT ('||cols||') ON public.auctions TO anon,authenticated';
END $$;
CREATE OR REPLACE FUNCTION public.get_auction_reserve(_auction_id uuid) RETURNS numeric
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.auctions%ROWTYPE;
BEGIN
  SELECT * INTO a FROM public.auctions WHERE id=_auction_id;
  IF auth.uid() IS NULL OR (a.seller_id IS DISTINCT FROM auth.uid() AND NOT public.has_role(auth.uid(),'admin')) THEN
    RAISE EXCEPTION 'Reserve price is private to the seller'; END IF;
  RETURN a.reserve_price;
END $$;
REVOKE ALL ON FUNCTION public.get_auction_reserve(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_auction_reserve(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.validate_bid_amount() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.auctions%ROWTYPE; minimum numeric;
BEGIN
  SELECT * INTO a FROM public.auctions WHERE id=NEW.auction_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Auction not found'; END IF;
  IF a.status<>'active' OR a.end_time<=now() OR a.start_time>now() THEN RAISE EXCEPTION 'Auction is not active or has ended'; END IF;
  IF NEW.bidder_id=a.seller_id THEN RAISE EXCEPTION 'You cannot bid on your own auction'; END IF;
  IF auth.role() IS DISTINCT FROM 'service_role' AND auth.uid() IS DISTINCT FROM NEW.bidder_id THEN RAISE EXCEPTION 'Bidder must be the signed-in user'; END IF;
  IF COALESCE((SELECT score FROM public.auction_integrity WHERE user_id=NEW.bidder_id),100)<40 THEN RAISE EXCEPTION 'Your auction integrity score is too low to bid'; END IF;
  minimum:=COALESCE(a.current_bid,a.starting_bid);
  IF NEW.amount IS NULL OR NEW.amount::text IN ('NaN','Infinity','-Infinity') OR NEW.amount<=minimum THEN RAISE EXCEPTION 'Bid must be greater than current bid of %',minimum; END IF;
  UPDATE public.auctions SET current_bid=NEW.amount,current_winner_id=NEW.bidder_id,bids_count=bids_count+1,
    end_time=CASE WHEN end_time-now()<interval '3 minutes' THEN now()+interval '3 minutes' ELSE end_time END,updated_at=now() WHERE id=a.id;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS validate_bid_before_insert ON public.bids;
CREATE TRIGGER validate_bid_before_insert BEFORE INSERT ON public.bids FOR EACH ROW EXECUTE FUNCTION public.validate_bid_amount();
REVOKE ALL ON FUNCTION public.validate_bid_amount() FROM PUBLIC,anon,authenticated;
DROP POLICY IF EXISTS "System can insert integrity" ON public.auction_integrity;
DROP POLICY IF EXISTS "System can update integrity" ON public.auction_integrity;
REVOKE INSERT,UPDATE ON public.auction_integrity FROM anon,authenticated;
GRANT ALL ON public.auction_integrity TO service_role;

CREATE OR REPLACE FUNCTION public.validate_order_review() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE o public.orders%ROWTYPE;
BEGIN
  SELECT * INTO o FROM public.orders WHERE id=NEW.order_id;
  IF NOT FOUND OR o.status<>'delivered' OR NEW.reviewer_id IS DISTINCT FROM o.user_id OR NEW.reviewed_id IS DISTINCT FROM o.seller_id THEN
    RAISE EXCEPTION 'Only the buyer may review the seller of a delivered order'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER validate_review_insert BEFORE INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.validate_order_review();
ALTER TABLE public.reviews ADD CONSTRAINT reviews_order_reviewer_unique UNIQUE(order_id,reviewer_id);
REVOKE ALL ON FUNCTION public.validate_order_review() FROM PUBLIC,anon,authenticated;

DROP POLICY IF EXISTS "Public read chat images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view chat images" ON storage.objects;
CREATE POLICY "Conversation partners read chat images" ON storage.objects FOR SELECT TO authenticated
USING(bucket_id='chat-images' AND ((storage.foldername(name))[1]=auth.uid()::text OR EXISTS (
 SELECT 1 FROM public.conversations c WHERE (c.participant_1_id=auth.uid() AND c.participant_2_id::text=(storage.foldername(name))[1])
 OR (c.participant_2_id=auth.uid() AND c.participant_1_id::text=(storage.foldername(name))[1]))));
GRANT UPDATE ON public.messages TO authenticated;
CREATE POLICY "Recipients mark messages read" ON public.messages FOR UPDATE TO authenticated
USING(sender_id<>auth.uid() AND EXISTS(SELECT 1 FROM public.conversations c WHERE c.id=conversation_id AND auth.uid() IN(c.participant_1_id,c.participant_2_id)))
WITH CHECK(is_read=true AND sender_id<>auth.uid() AND EXISTS(SELECT 1 FROM public.conversations c WHERE c.id=conversation_id AND auth.uid() IN(c.participant_1_id,c.participant_2_id)));
CREATE OR REPLACE FUNCTION public.protect_message_update() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF current_user IN ('postgres','supabase_admin','service_role') OR auth.role()='service_role' THEN RETURN NEW; END IF;
  IF NEW.is_read IS DISTINCT FROM true OR OLD.sender_id=auth.uid() OR (to_jsonb(NEW)-'is_read') IS DISTINCT FROM (to_jsonb(OLD)-'is_read') THEN
    RAISE EXCEPTION 'Only the recipient may mark a message read; other fields cannot change'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_messages_update BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.protect_message_update();
REVOKE ALL ON FUNCTION public.protect_message_update() FROM PUBLIC,anon,authenticated;
DROP POLICY IF EXISTS "Users delete own conversations" ON public.conversations;
REVOKE DELETE ON public.conversations FROM anon,authenticated;
CREATE OR REPLACE FUNCTION public.protect_conversation_update() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF current_user IN ('postgres','supabase_admin','service_role') OR auth.role()='service_role' THEN RETURN NEW; END IF;
  NEW.id:=OLD.id; NEW.participant_1_id:=OLD.participant_1_id; NEW.participant_2_id:=OLD.participant_2_id; NEW.created_at:=OLD.created_at;
  IF auth.uid()=OLD.participant_1_id THEN NEW.is_deleted_by_2:=OLD.is_deleted_by_2; NEW.is_archived_by_2:=OLD.is_archived_by_2;
  ELSIF auth.uid()=OLD.participant_2_id THEN NEW.is_deleted_by_1:=OLD.is_deleted_by_1; NEW.is_archived_by_1:=OLD.is_archived_by_1;
  ELSE RAISE EXCEPTION 'This conversation does not belong to you'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_conversations_update BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.protect_conversation_update();
REVOKE ALL ON FUNCTION public.protect_conversation_update() FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.profiles(user_id,full_name,country,county) VALUES(NEW.id,COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    NULLIF(btrim(NEW.raw_user_meta_data->>'country'),''),NULLIF(btrim(NEW.raw_user_meta_data->>'county'),''));
  INSERT INTO public.profile_contacts(user_id,email,phone) VALUES(NEW.id,NEW.email,NEW.raw_user_meta_data->>'phone') ON CONFLICT(user_id) DO NOTHING;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC,anon,authenticated;