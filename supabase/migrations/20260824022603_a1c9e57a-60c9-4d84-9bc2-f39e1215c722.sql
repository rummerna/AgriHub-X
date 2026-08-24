
CREATE TABLE IF NOT EXISTS public.mpesa_callback_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid,
  checkout_request_id text,
  merchant_request_id text,
  outcome text not null,
  reason text,
  result_code integer,
  amount numeric,
  created_at timestamptz not null default now()
);
CREATE INDEX IF NOT EXISTS mpesa_callback_events_created_idx ON public.mpesa_callback_events (created_at DESC);
CREATE INDEX IF NOT EXISTS mpesa_callback_events_outcome_idx ON public.mpesa_callback_events (outcome, created_at DESC);
GRANT SELECT ON public.mpesa_callback_events TO authenticated;
GRANT ALL ON public.mpesa_callback_events TO service_role;
ALTER TABLE public.mpesa_callback_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view mpesa callback events" ON public.mpesa_callback_events;
CREATE POLICY "Admins can view mpesa callback events" ON public.mpesa_callback_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.mpesa_alerts (
  id uuid primary key default gen_random_uuid(),
  alert_type text not null,
  severity text not null default 'warning',
  message text not null,
  details jsonb not null default '{}'::jsonb,
  acknowledged_at timestamptz,
  acknowledged_by uuid,
  created_at timestamptz not null default now()
);
CREATE INDEX IF NOT EXISTS mpesa_alerts_type_created_idx ON public.mpesa_alerts (alert_type, created_at DESC);
GRANT SELECT, UPDATE ON public.mpesa_alerts TO authenticated;
GRANT ALL ON public.mpesa_alerts TO service_role;
ALTER TABLE public.mpesa_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view mpesa alerts" ON public.mpesa_alerts;
CREATE POLICY "Admins can view mpesa alerts" ON public.mpesa_alerts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can acknowledge mpesa alerts" ON public.mpesa_alerts;
CREATE POLICY "Admins can acknowledge mpesa alerts" ON public.mpesa_alerts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Records one callback outcome and raises alerts when anomaly thresholds are crossed.
CREATE OR REPLACE FUNCTION public.record_mpesa_callback_event(
  _outcome text,
  _reason text default null,
  _order_id uuid default null,
  _checkout_request_id text default null,
  _merchant_request_id text default null,
  _result_code integer default null,
  _amount numeric default null
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_recent int;
  failed_recent int;
  dup_recent int;
  mismatch_recent int;
  fail_rate numeric;
BEGIN
  INSERT INTO public.mpesa_callback_events(order_id, checkout_request_id, merchant_request_id, outcome, reason, result_code, amount)
  VALUES (_order_id, _checkout_request_id, _merchant_request_id, _outcome, _reason, _result_code, _amount);

  SELECT count(*),
         count(*) FILTER (WHERE outcome = 'failed'),
         count(*) FILTER (WHERE outcome = 'duplicate'),
         count(*) FILTER (WHERE outcome = 'mismatch')
    INTO total_recent, failed_recent, dup_recent, mismatch_recent
  FROM public.mpesa_callback_events
  WHERE created_at > now() - interval '15 minutes';

  fail_rate := CASE WHEN total_recent > 0 THEN failed_recent::numeric / total_recent ELSE 0 END;

  IF total_recent >= 5 AND fail_rate >= 0.5
     AND NOT EXISTS (SELECT 1 FROM public.mpesa_alerts WHERE alert_type = 'high_failure_rate' AND created_at > now() - interval '30 minutes') THEN
    INSERT INTO public.mpesa_alerts(alert_type, severity, message, details)
    VALUES ('high_failure_rate', 'critical',
      format('M-PESA callback failure rate is %s%% over the last 15 minutes (%s of %s callbacks failed).', round(fail_rate*100), failed_recent, total_recent),
      jsonb_build_object('window_minutes', 15, 'total', total_recent, 'failed', failed_recent));
  END IF;

  IF dup_recent >= 3
     AND NOT EXISTS (SELECT 1 FROM public.mpesa_alerts WHERE alert_type = 'duplicate_callbacks' AND created_at > now() - interval '30 minutes') THEN
    INSERT INTO public.mpesa_alerts(alert_type, severity, message, details)
    VALUES ('duplicate_callbacks', 'warning',
      format('%s duplicate/replayed M-PESA callbacks received in the last 15 minutes.', dup_recent),
      jsonb_build_object('window_minutes', 15, 'duplicates', dup_recent));
  END IF;

  IF mismatch_recent >= 2
     AND NOT EXISTS (SELECT 1 FROM public.mpesa_alerts WHERE alert_type = 'mismatched_payloads' AND created_at > now() - interval '30 minutes') THEN
    INSERT INTO public.mpesa_alerts(alert_type, severity, message, details)
    VALUES ('mismatched_payloads', 'critical',
      format('%s mismatched or unverifiable M-PESA callback payloads in the last 15 minutes — possible forgery attempts.', mismatch_recent),
      jsonb_build_object('window_minutes', 15, 'mismatches', mismatch_recent));
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_mpesa_callback_event(text, text, uuid, text, text, integer, numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_mpesa_callback_event(text, text, uuid, text, text, integer, numeric) TO service_role;

-- Compact health snapshot for the admin dashboard.
CREATE OR REPLACE FUNCTION public.mpesa_callback_health(_minutes integer default 1440)
RETURNS TABLE(total bigint, succeeded bigint, failed bigint, duplicates bigint, mismatches bigint, rejected bigint, failure_rate numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*),
         count(*) FILTER (WHERE outcome = 'success'),
         count(*) FILTER (WHERE outcome = 'failed'),
         count(*) FILTER (WHERE outcome = 'duplicate'),
         count(*) FILTER (WHERE outcome = 'mismatch'),
         count(*) FILTER (WHERE outcome = 'rejected'),
         CASE WHEN count(*) > 0
              THEN round(count(*) FILTER (WHERE outcome IN ('failed','mismatch','rejected'))::numeric * 100 / count(*), 1)
              ELSE 0 END
  FROM public.mpesa_callback_events
  WHERE created_at > now() - make_interval(mins => greatest(_minutes, 1))
    AND public.has_role(auth.uid(), 'admin');
$$;

REVOKE EXECUTE ON FUNCTION public.mpesa_callback_health(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mpesa_callback_health(integer) TO authenticated, service_role;
