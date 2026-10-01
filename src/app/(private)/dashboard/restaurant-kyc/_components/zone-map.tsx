"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface ZoneRestaurant {
  id: number;
  restaurant: string;
  zone: string;
  lat: number;
  lng: number;
  avgZonePrice: number;
  restaurantAvg: number;
  deviation: number;
  flag: string;
  peers: number;
}

interface ZoneMapProps {
  restaurants: ZoneRestaurant[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

function createIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
    "><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

const normalIcon = createIcon("#16a34a");
const underpricedIcon = createIcon("#d97706");
const selectedIcon = createIcon("#dc2626");

function FlyToSelected({ selected }: { selected: ZoneRestaurant | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], 15, { duration: 0.8 });
    }
  }, [selected, map]);
  return null;
}

export default function ZoneMap({ restaurants, selectedId, onSelect }: ZoneMapProps) {
  const selected = restaurants.find((r) => r.id === selectedId);

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm" style={{ height: 400 }}>
      <MapContainer
        center={[-1.955, 30.065]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToSelected selected={selected} />
        {restaurants.map((r) => {
          const isSelected = r.id === selectedId;
          const icon = isSelected ? selectedIcon : r.flag === "Under-priced" ? underpricedIcon : normalIcon;
          return (
            <Marker
              key={r.id}
              position={[r.lat, r.lng]}
              icon={icon}
              eventHandlers={{ click: () => onSelect(r.id) }}
            >
              <Popup>
                <div className="text-xs space-y-1 min-w-[160px]">
                  <p className="font-bold text-gray-900">{r.restaurant}</p>
                  <p className="text-gray-500">{r.zone}</p>
                  <p className="text-gray-700">Avg: {r.restaurantAvg.toLocaleString()} RWF</p>
                  <p className={`font-semibold ${r.deviation < 0 ? "text-amber-600" : "text-green-600"}`}>
                    {r.deviation > 0 ? "+" : ""}{r.deviation}% vs zone
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
