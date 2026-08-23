
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Prevent self-service edits to trust/reputation columns
CREATE OR REPLACE FUNCTION public.protect_profile_trust_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.verified := OLD.verified;
    NEW.verification_status := OLD.verification_status;
    NEW.rating_avg := OLD.rating_avg;
    NEW.rating_count := OLD.rating_count;
    NEW.trade_count := OLD.trade_count;
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.protect_profile_trust_fields() FROM anon, authenticated;

DROP TRIGGER IF EXISTS protect_profile_trust_fields_trg ON public.profiles;
CREATE TRIGGER protect_profile_trust_fields_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_trust_fields();

-- Admin management access
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Store the M-Pesa checkout request reference for exact payment matching
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS mpesa_checkout_request_id text;
CREATE INDEX IF NOT EXISTS orders_mpesa_checkout_request_id_idx
  ON public.orders (mpesa_checkout_request_id);
