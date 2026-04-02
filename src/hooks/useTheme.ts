import { useState, useEffect } from "react";

interface HolidayTheme {
  name: string;
  themeClass: string;
  month: number;
  day: number;
  endMonth?: number;
  endDay?: number;
  countries: string[]; // empty = global
}

const holidays: HolidayTheme[] = [
  // Global
  { name: "New Year", themeClass: "theme-newyear", month: 1, day: 1, countries: [] },
  { name: "Valentine's Day", themeClass: "theme-valentine", month: 2, day: 14, countries: [] },
  { name: "Easter", themeClass: "theme-easter", month: 3, day: 22, endMonth: 4, endDay: 25, countries: [] },
  { name: "Earth Day", themeClass: "theme-earth", month: 4, day: 22, countries: [] },
  { name: "World Food Day", themeClass: "theme-harvest", month: 10, day: 16, countries: [] },
  { name: "Christmas", themeClass: "theme-christmas", month: 12, day: 25, countries: [] },
  { name: "Christmas Eve", themeClass: "theme-christmas", month: 12, day: 24, countries: [] },
  { name: "New Year's Eve", themeClass: "theme-newyear", month: 12, day: 31, countries: [] },
  // Kenya
  { name: "Madaraka Day", themeClass: "theme-madaraka", month: 6, day: 1, countries: ["Kenya"] },
  { name: "Mashujaa Day", themeClass: "theme-mashujaa", month: 10, day: 20, countries: ["Kenya"] },
  { name: "Jamhuri Day", themeClass: "theme-jamhuri", month: 12, day: 12, countries: ["Kenya"] },
  // US
  { name: "Independence Day", themeClass: "theme-independence", month: 7, day: 4, countries: ["United States"] },
  { name: "Thanksgiving", themeClass: "theme-harvest", month: 11, day: 28, countries: ["United States"] },
  // India
  { name: "Republic Day", themeClass: "theme-india", month: 1, day: 26, countries: ["India"] },
  { name: "Independence Day", themeClass: "theme-india", month: 8, day: 15, countries: ["India"] },
  // France
  { name: "Bastille Day", themeClass: "theme-bastille", month: 7, day: 14, countries: ["France"] },
  // Germany
  { name: "Unity Day", themeClass: "theme-germany", month: 10, day: 3, countries: ["Germany"] },
  // China
  { name: "National Day", themeClass: "theme-china", month: 10, day: 1, countries: ["China"] },
  // Canada
  { name: "Canada Day", themeClass: "theme-canada", month: 7, day: 1, countries: ["Canada"] },
  // Nigeria
  { name: "Independence Day", themeClass: "theme-nigeria", month: 10, day: 1, countries: ["Nigeria"] },
  // South Africa
  { name: "Freedom Day", themeClass: "theme-southafrica", month: 4, day: 27, countries: ["South Africa"] },
  // Uganda
  { name: "Independence Day", themeClass: "theme-uganda", month: 10, day: 9, countries: ["Uganda"] },
  // Tanzania
  { name: "Union Day", themeClass: "theme-tanzania", month: 4, day: 26, countries: ["Tanzania"] },
];

const equatorialCountries = ["Kenya", "Uganda", "Tanzania", "Nigeria", "Ethiopia", "Rwanda", "Burundi", "Colombia", "Ecuador", "Brazil", "Indonesia"];

function getSeason(country: string): string {
  if (equatorialCountries.includes(country)) return "theme-tropical";
  // Simplified hemisphere check – Southern hemisphere countries
  const southernHemisphere = ["South Africa", "Australia", "New Zealand", "Argentina", "Chile"];
  const now = new Date();
  const month = now.getMonth() + 1;
  const isSouth = southernHemisphere.includes(country);

  if (isSouth) {
    if (month >= 9 && month <= 11) return "theme-spring";
    if (month >= 12 || month <= 2) return "theme-summer";
    if (month >= 3 && month <= 5) return "theme-autumn";
    return "theme-winter";
  }
  if (month >= 3 && month <= 5) return "theme-spring";
  if (month >= 6 && month <= 8) return "theme-summer";
  if (month >= 9 && month <= 11) return "theme-autumn";
  return "theme-winter";
}

export function getActiveTheme(country: string): { themeClass: string; holidayName: string | null } {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  for (const h of holidays) {
    const isGlobal = h.countries.length === 0;
    const isCountryMatch = isGlobal || h.countries.includes(country);
    if (!isCountryMatch) continue;

    if (h.endMonth && h.endDay) {
      // Variable-date holiday range
      const startNum = h.month * 100 + h.day;
      const endNum = h.endMonth * 100 + h.endDay;
      const currentNum = month * 100 + day;
      if (currentNum >= startNum && currentNum <= endNum) {
        return { themeClass: h.themeClass, holidayName: h.name };
      }
    } else if (h.month === month && h.day === day) {
      return { themeClass: h.themeClass, holidayName: h.name };
    }
  }

  return { themeClass: getSeason(country), holidayName: null };
}

export function useTheme(country: string) {
  const [theme, setTheme] = useState(() => getActiveTheme(country || "Kenya"));

  useEffect(() => {
    const result = getActiveTheme(country || "Kenya");
    setTheme(result);

    // Remove any previous theme classes
    const body = document.body;
    body.classList.forEach(cls => {
      if (cls.startsWith("theme-")) body.classList.remove(cls);
    });

    // Apply new theme
    if (result.themeClass && result.themeClass !== "theme-default") {
      body.classList.add(result.themeClass);
    }

    return () => {
      body.classList.forEach(cls => {
        if (cls.startsWith("theme-")) body.classList.remove(cls);
      });
    };
  }, [country]);

  return theme;
}
