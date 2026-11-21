/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { locationService } from "@/app/services/locationService";

export interface RwLocation {
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
}

export const EMPTY_LOCATION: RwLocation = { province: "", district: "", sector: "", cell: "", village: "" };

const LEVELS: { key: keyof RwLocation; label: string; required?: boolean }[] = [
  { key: "province", label: "Province", required: true },
  { key: "district", label: "District", required: true },
  { key: "sector", label: "Sector", required: true },
  { key: "cell", label: "Cell" },
  { key: "village", label: "Village" },
];

/** Rwanda location, province → village: each list loads from the one above */
export function RwLocationFields({
  value,
  onChange,
  selectClassName,
}: {
  value: RwLocation;
  onChange: (next: RwLocation) => void;
  selectClassName?: string;
}) {
  const [options, setOptions] = useState<Record<keyof RwLocation, string[]>>({
    province: [],
    district: [],
    sector: [],
    cell: [],
    village: [],
  });

  const set = (key: keyof RwLocation, list: string[]) => setOptions((o) => ({ ...o, [key]: list }));

  useEffect(() => {
    locationService.fetchLocationHierarchy([]).then((h: any) => {
      const list = Array.isArray(h) ? h : h?.provinces ?? [];
      set("province", list.map((p: any) => p.name || p));
    });
  }, []);
  useEffect(() => {
    if (value.province) locationService.getDistrictsByProvince(value.province).then((l) => set("district", l));
    else set("district", []);
  }, [value.province]);
  useEffect(() => {
    if (value.province && value.district) locationService.getSectorsByDistrict(value.province, value.district).then((l) => set("sector", l));
    else set("sector", []);
  }, [value.province, value.district]);
  useEffect(() => {
    if (value.sector) locationService.getCellsBySector(value.province, value.district, value.sector).then((l) => set("cell", l));
    else set("cell", []);
  }, [value.province, value.district, value.sector]);
  useEffect(() => {
    if (value.cell) locationService.getVillagesByCell(value.province, value.district, value.sector, value.cell).then((l) => set("village", l));
    else set("village", []);
  }, [value.province, value.district, value.sector, value.cell]);

  // Choosing a level clears the ones below it
  const choose = (key: keyof RwLocation, v: string) => {
    const i = LEVELS.findIndex((l) => l.key === key);
    const next = { ...value, [key]: v };
    LEVELS.slice(i + 1).forEach((l) => (next[l.key] = ""));
    onChange(next);
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
      {LEVELS.map((l, i) => {
        const list = options[l.key];
        // Keep a saved value shown even before its list loads
        const shown = value[l.key] && !list.includes(value[l.key]) ? [value[l.key], ...list] : list;
        return (
          <label key={l.key} className="block min-w-0">
            <span className="mb-1 block text-xs font-medium text-gray-700">
              {l.label}
              {l.required ? " *" : ""}
            </span>
            <select
              className={selectClassName}
              value={value[l.key]}
              disabled={i > 0 && !value[LEVELS[i - 1].key]}
              onChange={(e) => choose(l.key, e.target.value)}
            >
              <option value="">Choose…</option>
              {shown.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        );
      })}
    </div>
  );
}
