
CREATE TABLE IF NOT EXISTS public.phone_otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  phone text NOT NULL,
  code_hash text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  consumed boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.phone_otp_codes TO service_role;

ALTER TABLE public.phone_otp_codes ENABLE ROW LEVEL SECURITY;
-- No policies: only the backend (service role) may access these codes.

CREATE INDEX IF NOT EXISTS phone_otp_codes_user_idx ON public.phone_otp_codes (user_id, created_at DESC);
