
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS mpesa_merchant_request_id text,
  ADD COLUMN IF NOT EXISTS mpesa_amount_expected numeric,
  ADD COLUMN IF NOT EXISTS mpesa_phone text,
  ADD COLUMN IF NOT EXISTS mpesa_receipt text,
  ADD COLUMN IF NOT EXISTS mpesa_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS orders_mpesa_checkout_request_id_key
  ON public.orders (mpesa_checkout_request_id)
  WHERE mpesa_checkout_request_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS orders_mpesa_receipt_key
  ON public.orders (mpesa_receipt)
  WHERE mpesa_receipt IS NOT NULL;
