import { useEffect, useRef } from "react";
import type { PestMarker } from "@/data/weatherSources";

// County center coordinates (approx)
const countyCoords: Record<string, [number, number]> = {
  Machakos: [-1.52, 37.26],
  Nairobi: [-1.29, 36.82],
  Kisumu: [-0.09, 34.77],
  Mombasa: [-4.05, 39.67],
  Kiambu: [-1.17, 36.83],
  Nakuru: [-0.30, 36.07],
  Nyeri: [-0.42, 36.95],
  Kampala: [0.35, 32.58],
  "Dar es Salaam": [-6.79, 39.28],
  Lagos: [6.52, 3.38],
  Accra: [5.56, -0.19],
};

function getCenter(county: string): [number, number] {
  return countyCoords[county] || [-1.29, 36.82]; // default Nairobi
}

const severityColors: Record<string, string> = {
  high: "#dc2626",
  medium: "#f59e0b",
  low: "#6b7280",
};

interface Props {
  pestMarkers: PestMarker[];
  county: string;
}

const WeatherMap = ({ pestMarkers, county }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapRef.current) return;

      // Clean up previous instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const center = getCenter(county);
      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
      }).setView(center, 7);

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      // Weather overlay – OpenWeatherMap free tile (precipitation)
      L.tileLayer(
        "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=demo",
        { opacity: 0.4, maxZoom: 18 }
      ).addTo(map);

      // Pest markers
      pestMarkers.forEach((pm) => {
        const color = severityColors[pm.severity] || "#6b7280";
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        L.marker([pm.lat, pm.lng], { icon })
          .addTo(map)
          .bindPopup(`<strong>${pm.pest}</strong><br/>${pm.crop} – ${pm.severity}<br/><small>${pm.description}</small>`);
      });

      // County marker
      const countyIcon = L.divIcon({
        className: "",
        html: `<div style="width:10px;height:10px;border-radius:50%;background:hsl(122,46%,34%);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });
      L.marker(center, { icon: countyIcon })
        .addTo(map)
        .bindPopup(`<strong>${county}</strong><br/>Your location`);

      // Force a re-render of tiles
      setTimeout(() => map.invalidateSize(), 100);
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [county, pestMarkers]);

  return (
    <div>
      <div ref={mapRef} style={{ height: 400, width: "100%" }} />
      <div className="flex items-center gap-4 px-4 py-2 text-xs text-muted-foreground border-t border-border">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-destructive inline-block" /> High severity</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" /> Medium</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-muted-foreground inline-block" /> Low</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" /> Your county</span>
      </div>
    </div>
  );
};

export default WeatherMap;
