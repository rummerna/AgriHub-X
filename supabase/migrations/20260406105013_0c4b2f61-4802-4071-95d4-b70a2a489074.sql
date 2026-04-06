
-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  reviewer_id UUID NOT NULL,
  reviewed_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price NUMERIC(12,2),
  price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed','hourly','negotiable','free')),
  currency TEXT DEFAULT 'KES',
  location TEXT,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add seller_id to orders for seller access
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS seller_id UUID;

-- Add rating fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(3,2) DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trade_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'farmer';

-- RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

-- RLS for services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Users can create their own services" ON public.services FOR INSERT TO authenticated WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Users can update their own services" ON public.services FOR UPDATE TO authenticated USING (auth.uid() = provider_id);
CREATE POLICY "Users can delete their own services" ON public.services FOR DELETE TO authenticated USING (auth.uid() = provider_id);

-- Update orders RLS to allow seller access
CREATE POLICY "Sellers see orders for their products" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = seller_id);
