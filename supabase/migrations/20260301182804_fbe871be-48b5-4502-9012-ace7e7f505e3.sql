
-- Farms table (no FK to auth.users, uses user_id UUID)
CREATE TABLE public.farms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT '',
  region text NOT NULL,
  country text NOT NULL DEFAULT 'Kenya',
  farm_size numeric NOT NULL DEFAULT 1,
  farm_size_unit text NOT NULL DEFAULT 'acres',
  crop_type text NOT NULL DEFAULT 'Maize',
  soil_type text NOT NULL DEFAULT 'Loam',
  irrigation_type text NOT NULL DEFAULT 'Rainfed',
  planting_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Region climate baselines
CREATE TABLE public.region_climate (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region text NOT NULL,
  country text NOT NULL DEFAULT 'Kenya',
  historical_rainfall_avg numeric NOT NULL DEFAULT 0,
  historical_temp_avg numeric NOT NULL DEFAULT 0,
  seasonal_projection_rainfall numeric,
  seasonal_projection_temp numeric,
  drought_risk_index numeric NOT NULL DEFAULT 0,
  flood_risk_index numeric NOT NULL DEFAULT 0,
  last_updated timestamptz NOT NULL DEFAULT now(),
  UNIQUE(region, country)
);

-- Simulation results
CREATE TABLE public.simulation_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  projected_yield numeric NOT NULL DEFAULT 0,
  yield_change_pct numeric NOT NULL DEFAULT 0,
  risk_score numeric NOT NULL DEFAULT 0,
  pest_risk_pct numeric NOT NULL DEFAULT 0,
  water_usage_estimate numeric NOT NULL DEFAULT 0,
  irrigation_recommendation text NOT NULL DEFAULT 'Normal',
  profit_projection numeric NOT NULL DEFAULT 0,
  insights text[] NOT NULL DEFAULT '{}',
  last_updated timestamptz NOT NULL DEFAULT now()
);

-- Crop thresholds for simulation engine
CREATE TABLE public.crop_thresholds (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_name text NOT NULL UNIQUE,
  optimal_rainfall_min numeric NOT NULL DEFAULT 0,
  optimal_rainfall_max numeric NOT NULL DEFAULT 0,
  optimal_temp_min numeric NOT NULL DEFAULT 0,
  optimal_temp_max numeric NOT NULL DEFAULT 0,
  water_requirement_per_acre numeric NOT NULL DEFAULT 0,
  pest_susceptibility_index numeric NOT NULL DEFAULT 50,
  base_yield_per_acre numeric NOT NULL DEFAULT 0,
  yield_unit text NOT NULL DEFAULT 'kg'
);

-- Enable RLS
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.region_climate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_thresholds ENABLE ROW LEVEL SECURITY;

-- RLS: farms
CREATE POLICY "Users can view their own farms" ON public.farms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own farms" ON public.farms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own farms" ON public.farms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own farms" ON public.farms FOR DELETE USING (auth.uid() = user_id);

-- RLS: region_climate (public read)
CREATE POLICY "Anyone can view region climate" ON public.region_climate FOR SELECT USING (true);

-- RLS: simulation_results (through farm ownership)
CREATE POLICY "Users can view their simulation results" ON public.simulation_results FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.farms WHERE farms.id = simulation_results.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can insert simulation results" ON public.simulation_results FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.farms WHERE farms.id = simulation_results.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can update simulation results" ON public.simulation_results FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.farms WHERE farms.id = simulation_results.farm_id AND farms.user_id = auth.uid()));

-- RLS: crop_thresholds (public read)
CREATE POLICY "Anyone can view crop thresholds" ON public.crop_thresholds FOR SELECT USING (true);

-- Updated_at trigger for farms
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON public.farms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed crop thresholds
INSERT INTO public.crop_thresholds (crop_name, optimal_rainfall_min, optimal_rainfall_max, optimal_temp_min, optimal_temp_max, water_requirement_per_acre, pest_susceptibility_index, base_yield_per_acre, yield_unit) VALUES
  ('Maize', 500, 800, 18, 32, 500, 65, 2000, 'kg'),
  ('Wheat', 450, 650, 15, 25, 400, 40, 1800, 'kg'),
  ('Rice', 1000, 2000, 22, 35, 1200, 55, 3000, 'kg'),
  ('Tomatoes', 400, 600, 18, 30, 600, 70, 15000, 'kg'),
  ('Coffee', 1200, 1800, 15, 28, 800, 60, 800, 'kg'),
  ('Tea', 1200, 2500, 13, 25, 900, 35, 1200, 'kg'),
  ('Beans', 300, 500, 16, 28, 350, 50, 1000, 'kg'),
  ('Potatoes', 500, 750, 10, 24, 500, 45, 8000, 'kg'),
  ('Sorghum', 300, 600, 20, 35, 300, 30, 1500, 'kg'),
  ('Avocado', 800, 1200, 16, 30, 700, 40, 5000, 'kg'),
  ('Banana', 1000, 2000, 20, 35, 1000, 55, 12000, 'kg'),
  ('Cassava', 500, 1500, 20, 35, 400, 35, 10000, 'kg'),
  ('Cocoa', 1500, 2500, 21, 32, 900, 60, 500, 'kg'),
  ('Sugarcane', 1200, 1800, 20, 35, 1500, 45, 50000, 'kg'),
  ('Cotton', 500, 800, 20, 35, 600, 55, 800, 'kg');

-- Seed region climate baselines for key regions
INSERT INTO public.region_climate (region, country, historical_rainfall_avg, historical_temp_avg, drought_risk_index, flood_risk_index) VALUES
  ('Machakos', 'Kenya', 550, 22, 35, 10),
  ('Nairobi', 'Kenya', 900, 20, 15, 25),
  ('Kisumu', 'Kenya', 1200, 26, 10, 40),
  ('Mombasa', 'Kenya', 1050, 28, 20, 30),
  ('Nakuru', 'Kenya', 950, 18, 20, 20),
  ('Nyeri', 'Kenya', 1100, 17, 10, 15),
  ('Kiambu', 'Kenya', 1000, 19, 12, 20),
  ('Kampala', 'Uganda', 1200, 24, 8, 35),
  ('Dar es Salaam', 'Tanzania', 1100, 28, 15, 30),
  ('Lagos', 'Nigeria', 1600, 27, 5, 45),
  ('Accra', 'Ghana', 800, 27, 30, 20),
  ('Kumasi', 'Ghana', 1400, 26, 10, 30);
