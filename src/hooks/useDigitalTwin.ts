import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { aggregateWeather } from "@/data/weatherSources";
import type { AggregatedWeather } from "@/data/weatherSources";
import { runSimulation, type CropThreshold, type RegionClimate, type FarmConfig, type SimulationOutput } from "@/lib/simulationEngine";

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  region: string;
  country: string;
  farm_size: number;
  farm_size_unit: string;
  crop_type: string;
  soil_type: string;
  irrigation_type: string;
  planting_date: string | null;
}

export function useDigitalTwin() {
  const { user, supabaseUser, isLoggedIn } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [cropThresholds, setCropThresholds] = useState<CropThreshold[]>([]);
  const [regionClimates, setRegionClimates] = useState<RegionClimate[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch crop thresholds (public)
  useEffect(() => {
    supabase.from("crop_thresholds").select("*").then(({ data }) => {
      if (data) setCropThresholds(data as unknown as CropThreshold[]);
    });
  }, []);

  // Fetch region climates (public)
  useEffect(() => {
    supabase.from("region_climate").select("*").then(({ data }) => {
      if (data) setRegionClimates(data as unknown as RegionClimate[]);
    });
  }, []);

  // Fetch user farms
  useEffect(() => {
    if (!isLoggedIn) {
      setFarms([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("farms")
      .select("*")
      .then(({ data }) => {
        const f = (data ?? []) as unknown as Farm[];
        setFarms(f);
        if (f.length > 0 && !selectedFarmId) setSelectedFarmId(f[0].id);
        setLoading(false);
      });
  }, [isLoggedIn]);

  const selectedFarm = useMemo(() => farms.find((f) => f.id === selectedFarmId) ?? null, [farms, selectedFarmId]);

  // Build simulation for selected farm
  const simulation: SimulationOutput | null = useMemo(() => {
    if (!selectedFarm) return null;
    const weather = aggregateWeather(selectedFarm.region);
    const climate = regionClimates.find(
      (rc) => rc.region === selectedFarm.region && rc.country === selectedFarm.country
    ) ?? null;
    const threshold = cropThresholds.find((ct) => ct.crop_name === selectedFarm.crop_type) ?? null;
    const farmConfig: FarmConfig = {
      id: selectedFarm.id,
      name: selectedFarm.name,
      region: selectedFarm.region,
      country: selectedFarm.country,
      farm_size: selectedFarm.farm_size,
      crop_type: selectedFarm.crop_type,
      soil_type: selectedFarm.soil_type,
      irrigation_type: selectedFarm.irrigation_type,
    };
    return runSimulation(farmConfig, weather, climate, threshold);
  }, [selectedFarm, regionClimates, cropThresholds]);

  const weather = useMemo(() => {
    if (!selectedFarm) return null;
    return aggregateWeather(selectedFarm.region);
  }, [selectedFarm]);

  const addFarm = useCallback(async (farm: Omit<Farm, "id" | "user_id">) => {
    if (!supabaseUser) return null;
    const { data, error } = await supabase
      .from("farms")
      .insert({ ...farm, user_id: supabaseUser.id } as any)
      .select()
      .single();
    if (data) {
      const newFarm = data as unknown as Farm;
      setFarms((prev) => [...prev, newFarm]);
      setSelectedFarmId(newFarm.id);
      return newFarm;
    }
    return null;
  }, [supabaseUser]);

  const deleteFarm = useCallback(async (id: string) => {
    await supabase.from("farms").delete().eq("id", id);
    setFarms((prev) => prev.filter((f) => f.id !== id));
    if (selectedFarmId === id) setSelectedFarmId(farms[0]?.id ?? null);
  }, [selectedFarmId, farms]);

  // Demo farm for non-logged-in users
  const demoFarm: FarmConfig = {
    id: "demo",
    name: "Demo Farm",
    region: user?.county || "Machakos",
    country: user?.country || "Kenya",
    farm_size: 5,
    crop_type: "Maize",
    soil_type: "Loam",
    irrigation_type: "Rainfed",
  };

  const demoWeather = useMemo(() => aggregateWeather(demoFarm.region), [demoFarm.region]);
  const demoSimulation = useMemo(() => {
    const climate = regionClimates.find((rc) => rc.region === demoFarm.region) ?? null;
    const threshold = cropThresholds.find((ct) => ct.crop_name === demoFarm.crop_type) ?? null;
    return runSimulation(demoFarm, demoWeather, climate, threshold);
  }, [demoFarm.region, regionClimates, cropThresholds]);

  return {
    farms,
    selectedFarm,
    selectedFarmId,
    setSelectedFarmId,
    simulation: selectedFarm ? simulation : demoSimulation,
    weather: selectedFarm ? weather : demoWeather,
    loading,
    isLoggedIn,
    addFarm,
    deleteFarm,
    cropThresholds,
    regionClimates,
    demoFarm,
  };
}
