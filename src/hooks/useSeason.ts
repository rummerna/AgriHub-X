import { useMemo } from "react";
import { southernHemisphereCountries } from "@/data/mock";

export type Season = "spring" | "summer" | "autumn" | "winter";

export const useSeason = (country?: string): Season => {
  return useMemo(() => {
    const month = new Date().getMonth(); // 0-11
    const isSouthern = country ? southernHemisphereCountries.includes(country) : false;

    // Northern: Spring Mar-May, Summer Jun-Aug, Autumn Sep-Nov, Winter Dec-Feb
    let season: Season;
    if (month >= 2 && month <= 4) season = "spring";
    else if (month >= 5 && month <= 7) season = "summer";
    else if (month >= 8 && month <= 10) season = "autumn";
    else season = "winter";

    // Flip for southern hemisphere
    if (isSouthern) {
      const flip: Record<Season, Season> = { spring: "autumn", summer: "winter", autumn: "spring", winter: "summer" };
      season = flip[season];
    }

    return season;
  }, [country]);
};
