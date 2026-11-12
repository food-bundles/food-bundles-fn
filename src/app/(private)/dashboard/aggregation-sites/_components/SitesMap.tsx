"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Compass, Minus, Navigation, Plus, RotateCcw } from "lucide-react";
import { AggregationSiteWithCounts as AggregationSite } from "@/app/services/aggregationSiteService";

interface SitesMapProps {
  sites: AggregationSite[];
  canEdit: boolean;
  onViewPeople: (site: AggregationSite) => void;
  onEdit: (site: AggregationSite) => void;
}

// Same province colours as the markets spatial map. Names are matched loosely because a site from the WFP list may spell them differently
const PROVINCES = [
  { key: "Kigali City", match: "kigali", color: "#10b981" },
  { key: "Northern", match: "north", color: "#3b82f6" },
  { key: "Southern", match: "south", color: "#f59e0b" },
  { key: "Eastern", match: "east", color: "#8b5cf6" },
  { key: "Western", match: "west", color: "#ec4899" },
];
const NO_PROVINCE = { key: "Other", match: "", color: "#64748b" };

const provinceOf = (province: string | null) => {
  const name = (province ?? "").toLowerCase();
  return PROVINCES.find((p) => name.includes(p.match)) ?? NO_PROVINCE;
};

// Coordinate projection for Rwanda (Lat: -1.0 to -2.9, Lng: 28.8 to 30.9), same as the markets map
function projectCoordinates(lat: number, lng: number) {
  const minLat = -2.9;
  const maxLat = -1.05;
  const minLng = 28.85;
  const maxLng = 30.95;

  const x = ((lng - minLng) / (maxLng - minLng)) * 100;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 100;

  return {
    x: Math.max(5, Math.min(95, x)),
    y: Math.max(5, Math.min(95, y)),
  };
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 10;

export default function SitesMap({ sites, canEdit, onViewPeople, onEdit }: SitesMapProps) {
  const [hovered, setHovered] = useState<AggregationSite | null>(null);
  const [selected, setSelected] = useState<AggregationSite | null>(null);
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ px: number; py: number; moved: boolean; down: boolean } | null>(null);

  // Zooms towards (cx, cy), a point in canvas pixels, and keeps the map covering the canvas
  const zoomAt = (factor: number, cx?: number, cy?: number) => {
    const el = canvasRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const px = cx ?? width / 2;
    const py = cy ?? height / 2;
    setView((v) => {
      const scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.scale * factor));
      const k = scale / v.scale;
      return {
        scale,
        x: Math.max(width * (1 - scale), Math.min(0, px - (px - v.x) * k)),
        y: Math.max(height * (1 - scale), Math.min(0, py - (py - v.y) * k)),
      };
    });
  };

  // React's onWheel is passive, so the page would scroll while zooming
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.25 : 0.8, e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { px: e.clientX, py: e.clientY, moved: false, down: true };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = canvasRef.current;
    if (!d || !d.down || !el) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
    d.moved = true;
    d.px = e.clientX;
    d.py = e.clientY;
    const { width, height } = el.getBoundingClientRect();
    setView((v) => ({
      ...v,
      x: Math.max(width * (1 - v.scale), Math.min(0, v.x + dx)),
      y: Math.max(height * (1 - v.scale), Math.min(0, v.y + dy)),
    }));
  };
  // Keep the record after a drag so the click that follows it doesn't select a pin
  const onPointerUp = () => {
    if (drag.current) drag.current.down = false;
  };

  // Counter-scale so pins and labels keep their size while the map zooms
  const inverse = `scale(${1 / view.scale})`;

  const mapped = sites
    .filter((s) => Number.isFinite(s.latitude) && Number.isFinite(s.longitude))
    .map((s) => ({ site: s, coords: projectCoordinates(s.latitude, s.longitude) }));

  const target = hovered || selected;

  return (
    <div className="relative flex min-h-[500px] flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm">
      <div className="z-10 flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800">
            <Compass className="h-3.5 w-3.5 text-emerald-600" />
            Rwanda Aggregation Sites Spatial Map
          </div>
          <h3 className="text-lg font-black text-gray-900">
            {mapped.length} Aggregation Site{mapped.length === 1 ? "" : "s"} Across GPS Locations
          </h3>
        </div>

        <div className="hidden flex-wrap items-center gap-1.5 text-[10px] font-bold sm:flex">
          {PROVINCES.map((p) => (
            <span
              key={p.key}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-gray-700"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.key}
            </span>
          ))}
        </div>
      </div>

      <div
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className={`relative my-4 h-96 w-full touch-none select-none overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/70 ${
          view.scale > 1 ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        {/* Everything geographic lives in this layer, which is what zooms and pans */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transformOrigin: "0 0",
          }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-size-[16px_16px]" />

          <div
            className="pointer-events-none absolute left-6 top-4 font-mono text-[10px] font-semibold uppercase text-gray-400"
            style={{ transform: inverse, transformOrigin: "top left" }}
          >
            NORTHERN PROVINCE (-1.6°)
          </div>
          <div
            className="pointer-events-none absolute left-6 top-1/2 font-mono text-[10px] font-semibold uppercase text-gray-400"
            style={{ transform: inverse, transformOrigin: "top left" }}
          >
            WESTERN PROVINCE (29.3°E)
          </div>
          <div
            className="pointer-events-none absolute right-6 top-1/2 font-mono text-[10px] font-semibold uppercase text-gray-400"
            style={{ transform: inverse, transformOrigin: "top right" }}
          >
            EASTERN PROVINCE (30.8°E)
          </div>
          <div
            className="pointer-events-none absolute bottom-4 left-1/3 font-mono text-[10px] font-semibold uppercase text-gray-400"
            style={{ transform: inverse, transformOrigin: "bottom left" }}
          >
            SOUTHERN PROVINCE (-2.6°)
          </div>
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 font-mono text-[10px] font-bold uppercase text-emerald-600/50"
            style={{ transform: `translate(-50%, -50%) ${inverse}` }}
          >
            KIGALI CITY
          </div>

          {mapped.map(({ site, coords }) => {
            const isActive = hovered?.id === site.id || selected?.id === site.id;
            return (
              <div
                key={site.id}
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                  transform: `translate(-50%, -50%) ${inverse}`,
                }}
                onMouseEnter={() => setHovered(site)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => {
                  if (!drag.current?.moved) setSelected(site);
                }}
                className="group absolute z-20 cursor-pointer"
              >
                <span
                  className={`block h-3.5 w-3.5 rounded-full border-2 border-white shadow-md transition-transform duration-200 ${
                    isActive ? "scale-150 ring-4 ring-emerald-500/40" : "scale-100 hover:scale-125"
                  } ${site.isActive ? "" : "opacity-40"}`}
                  style={{ backgroundColor: provinceOf(site.province).color }}
                />
              </div>
            );
          })}
        </div>

        {/* Zoom controls */}
        <div
          className="absolute left-3 top-3 z-30 flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Zoom in"
            disabled={view.scale >= MAX_ZOOM}
            onClick={() => zoomAt(1.5)}
            className="p-1.5 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            disabled={view.scale <= MIN_ZOOM}
            onClick={() => zoomAt(1 / 1.5)}
            className="border-t border-gray-200 p-1.5 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Reset view"
            disabled={view.scale === 1}
            onClick={() => setView({ scale: 1, x: 0, y: 0 })}
            className="border-t border-gray-200 p-1.5 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {target && (
          <motion.div
            key={target.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 right-4 z-30 max-w-xs space-y-2 rounded-2xl border border-emerald-500/30 bg-white/95 p-4 text-xs text-gray-900 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
              <span className="text-sm font-black text-emerald-700">{target.name}</span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                {target.province || "No province"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-gray-500">District:</span>
                <p className="font-bold text-gray-800">{target.district || "N/A"}</p>
              </div>
              <div>
                <span className="text-gray-500">Coordinates:</span>
                <p className="font-mono text-[10px] text-gray-700">
                  {target.latitude.toFixed(2)}, {target.longitude.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-2">
              <span className="text-[11px] text-gray-500">
                {target.farmerCount} farmer{target.farmerCount === 1 ? "" : "s"} · {target.aggregatorCount} aggregator
                {target.aggregatorCount === 1 ? "" : "s"}
              </span>
              <span className={`text-sm font-black ${target.isActive ? "text-emerald-700" : "text-gray-500"}`}>
                {target.isActive ? "Active" : "Switched off"}
              </span>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" className="text-blue-600 underline" onClick={() => onViewPeople(target)}>
                People
              </button>
              {canEdit && (
                <button type="button" className="text-blue-600 underline" onClick={() => onEdit(target)}>
                  Edit
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <div className="z-10 flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-500">
        <span>Showing {mapped.length} geo-mapped sites across Rwanda</span>
        <span className="flex items-center gap-1 font-bold text-emerald-700">
          <Navigation className="h-3.5 w-3.5" /> Click any pin to inspect site details
        </span>
      </div>
    </div>
  );
}
