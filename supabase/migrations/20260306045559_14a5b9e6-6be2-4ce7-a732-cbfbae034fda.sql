
-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  reference_id uuid,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Currency exchange rates table
CREATE TABLE public.currency_rates (
  code text PRIMARY KEY,
  name text NOT NULL,
  symbol text NOT NULL,
  rate_to_usd numeric NOT NULL DEFAULT 1,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rates" ON public.currency_rates
  FOR SELECT USING (true);

-- Seed with approximate exchange rates (1 USD = X of currency)
INSERT INTO public.currency_rates (code, name, symbol, rate_to_usd) VALUES
  ('USD', 'US Dollar', '$', 1),
  ('KES', 'Kenyan Shilling', 'KSh', 129),
  ('UGX', 'Ugandan Shilling', 'USh', 3750),
  ('TZS', 'Tanzanian Shilling', 'TSh', 2500),
  ('NGN', 'Nigerian Naira', '₦', 1550),
  ('GHS', 'Ghanaian Cedi', 'GH₵', 15.5),
  ('ETB', 'Ethiopian Birr', 'Br', 57),
  ('RWF', 'Rwandan Franc', 'FRw', 1300),
  ('ZAR', 'South African Rand', 'R', 18.5),
  ('XOF', 'West African CFA', 'CFA', 610),
  ('XAF', 'Central African CFA', 'FCFA', 610),
  ('EGP', 'Egyptian Pound', 'E£', 50),
  ('MAD', 'Moroccan Dirham', 'MAD', 10),
  ('MZN', 'Mozambican Metical', 'MT', 64),
  ('ZMW', 'Zambian Kwacha', 'ZK', 27),
  ('MWK', 'Malawian Kwacha', 'MK', 1700),
  ('EUR', 'Euro', '€', 0.92),
  ('GBP', 'British Pound', '£', 0.79),
  ('INR', 'Indian Rupee', '₹', 83),
  ('CNY', 'Chinese Yuan', '¥', 7.25),
  ('BRL', 'Brazilian Real', 'R$', 5),
  ('AUD', 'Australian Dollar', 'A$', 1.55),
  ('CAD', 'Canadian Dollar', 'C$', 1.36);
