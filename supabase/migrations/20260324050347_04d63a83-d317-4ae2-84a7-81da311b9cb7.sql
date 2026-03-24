ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weather_location_country text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weather_location_county text DEFAULT NULL;