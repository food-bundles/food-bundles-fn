"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { AggregationSiteWithCounts as AggregationSite } from "@/app/services/aggregationSiteService";

interface SitesMapProps {
  sites: AggregationSite[];
  canEdit: boolean;
  onViewPeople: (site: AggregationSite) => void;
  onEdit: (site: AggregationSite) => void;
}

// Rwanda, shown when there is nothing to fit
const RWANDA_CENTER: [number, number] = [-1.9403, 29.8739];

// Zooms to the sites on screen whenever the list (search, status filter) changes
function FitToSites({ sites }: { sites: AggregationSite[] }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      if (sites.length === 0) {
        map.setView(RWANDA_CENTER, 8);
        return;
      }
      map.fitBounds(L.latLngBounds(sites.map((s) => [s.latitude, s.longitude] as [number, number])), {
        padding: [30, 30],
        maxZoom: 13,
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [map, sites]);
  return null;
}

export default function SitesMap({ sites, canEdit, onViewPeople, onEdit }: SitesMapProps) {
  return (
    <div className="relative h-[420px] overflow-hidden rounded-lg border">
      <MapContainer center={RWANDA_CENTER} zoom={8} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <FitToSites sites={sites} />
        {sites.map((site) => {
          const color = site.isActive ? "#16a34a" : "#9ca3af";
          return (
            <CircleMarker
              key={site.id}
              center={[site.latitude, site.longitude]}
              radius={site.farmerCount > 0 ? 9 : 7}
              pathOptions={{ color: "#ffffff", weight: 2, fillColor: color, fillOpacity: 0.95 }}
            >
              <Popup>
                <div className="space-y-1 text-xs">
                  <p className="text-sm font-semibold">{site.name}</p>
                  <p className="text-gray-600">
                    {[site.district, site.province].filter(Boolean).join(", ") || "No district or province"}
                  </p>
                  <p>
                    <span className="font-medium">{site.farmerCount}</span> farmer{site.farmerCount === 1 ? "" : "s"} ·{" "}
                    <span className="font-medium">{site.aggregatorCount}</span> aggregator
                    {site.aggregatorCount === 1 ? "" : "s"}
                  </p>
                  <p className={site.isActive ? "text-green-700" : "text-gray-500"}>
                    {site.isActive ? "Active" : "Switched off"}
                  </p>
                  <p className="tabular-nums text-gray-500">
                    {site.latitude.toFixed(5)}, {site.longitude.toFixed(5)}
                  </p>
                  <div className="flex gap-3 pt-1">
                    <button type="button" className="text-blue-600 underline" onClick={() => onViewPeople(site)}>
                      People
                    </button>
                    {canEdit && (
                      <button type="button" className="text-blue-600 underline" onClick={() => onEdit(site)}>
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div className="absolute bottom-2 left-2 z-[1000] flex items-center gap-3 rounded-md bg-white/95 px-2.5 py-1.5 text-[11px] shadow">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-green-600" /> Active
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-400" /> Switched off
        </span>
        <span className="text-gray-500">Larger dot = has farmers</span>
      </div>
    </div>
  );
}
