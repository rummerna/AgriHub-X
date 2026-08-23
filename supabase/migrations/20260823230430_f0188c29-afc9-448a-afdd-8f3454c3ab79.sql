REVOKE ALL ON FUNCTION public.ensure_user_scores() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_bid_amount() FROM PUBLIC, anon, authenticated;