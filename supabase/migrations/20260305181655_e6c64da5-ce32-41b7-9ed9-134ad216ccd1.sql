
-- User scores table
CREATE TABLE public.user_scores (
  user_id UUID NOT NULL PRIMARY KEY,
  marketplace_score INTEGER NOT NULL DEFAULT 100,
  community_score INTEGER NOT NULL DEFAULT 100,
  auction_score INTEGER NOT NULL DEFAULT 100,
  delivery_score INTEGER NOT NULL DEFAULT 100,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scores" ON public.user_scores FOR SELECT USING (true);
CREATE POLICY "Users can insert own scores" ON public.user_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON public.user_scores FOR UPDATE USING (auth.uid() = user_id);

-- Score events history
CREATE TABLE public.score_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score_type TEXT NOT NULL,
  change INTEGER NOT NULL,
  reason TEXT NOT NULL,
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.score_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own score events" ON public.score_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own score events" ON public.score_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reactions table (posts, questions, answers)
CREATE TABLE public.reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_type TEXT NOT NULL, -- 'post', 'question', 'answer'
  target_id UUID NOT NULL,
  reaction_type TEXT NOT NULL, -- 'upvote', 'downvote', 'love', 'insightful', 'best_answer'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_id, reaction_type)
);

ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Users can insert own reactions" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions" ON public.reactions FOR DELETE USING (auth.uid() = user_id);

-- Saved items (wishlist)
CREATE TABLE public.saved_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own saved items" ON public.saved_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users save items" ON public.saved_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove saved items" ON public.saved_items FOR DELETE USING (auth.uid() = user_id);

-- Cart items
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users add to cart" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update cart" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users remove from cart" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- Orders
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT,
  delivery_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

-- Order items
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES'
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users create order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Trigger to create scores on first login
CREATE OR REPLACE FUNCTION public.ensure_user_scores()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_scores (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_scores
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_user_scores();
