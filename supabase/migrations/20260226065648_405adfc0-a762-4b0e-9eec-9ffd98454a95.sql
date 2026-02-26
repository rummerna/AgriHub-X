
-- Auctions table
CREATE TABLE public.auctions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  product_name text NOT NULL,
  category text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'kg',
  description text DEFAULT '',
  starting_bid numeric NOT NULL,
  reserve_price numeric,
  current_bid numeric,
  current_winner_id uuid,
  bids_count integer NOT NULL DEFAULT 0,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
  image_url text,
  country text DEFAULT '',
  county text DEFAULT '',
  currency text DEFAULT 'KES',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Bids table
CREATE TABLE public.bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id uuid NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  bidder_id uuid NOT NULL,
  amount numeric NOT NULL,
  is_auto_bid boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Auction watchers
CREATE TABLE public.auction_watchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  auction_id uuid NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, auction_id)
);

-- Auction integrity scores
CREATE TABLE public.auction_integrity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  score integer NOT NULL DEFAULT 100,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_watchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_integrity ENABLE ROW LEVEL SECURITY;

-- Auctions policies
CREATE POLICY "Anyone can view auctions" ON public.auctions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create auctions" ON public.auctions FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update their own auctions" ON public.auctions FOR UPDATE TO authenticated USING (auth.uid() = seller_id);

-- Bids policies
CREATE POLICY "Anyone can view bids" ON public.bids FOR SELECT USING (true);
CREATE POLICY "Authenticated users can place bids" ON public.bids FOR INSERT TO authenticated WITH CHECK (auth.uid() = bidder_id);

-- Watchers policies
CREATE POLICY "Users can view their own watches" ON public.auction_watchers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can watch auctions" ON public.auction_watchers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unwatch auctions" ON public.auction_watchers FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Integrity policies
CREATE POLICY "Anyone can view integrity scores" ON public.auction_integrity FOR SELECT USING (true);
CREATE POLICY "System can insert integrity" ON public.auction_integrity FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update integrity" ON public.auction_integrity FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for auctions and bids
ALTER PUBLICATION supabase_realtime ADD TABLE public.auctions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;

-- Trigger for updated_at on auctions
CREATE TRIGGER update_auctions_updated_at
  BEFORE UPDATE ON public.auctions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
