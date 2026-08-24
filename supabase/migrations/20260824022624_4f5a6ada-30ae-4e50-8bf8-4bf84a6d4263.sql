
CREATE OR REPLACE FUNCTION public.mpesa_callback_health(_minutes integer default 1440)
RETURNS TABLE(total bigint, succeeded bigint, failed bigint, duplicates bigint, mismatches bigint, rejected bigint, failure_rate numeric)
LANGUAGE sql
STABLE
SECURITY INVOKER
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
  WHERE created_at > now() - make_interval(mins => greatest(_minutes, 1));
$$;
