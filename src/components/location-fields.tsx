"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { locationService } from "@/app/services/locationService";

export interface LocationValue {
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
}

const LEVELS = ["province", "district", "sector", "cell", "village"] as const;
type Level = (typeof LEVELS)[number];

const LABELS: Record<Level, string> = {
  province: "Province",
  district: "District",
  sector: "Sector",
  cell: "Cell",
  village: "Village",
};

// A value saved before the dropdowns (typed by hand, or spelled differently) stays a choice, so nothing is lost
const withCurrent = (options: string[], current: string) =>
  current && !options.some((o) => o.toLowerCase() === current.toLowerCase()) ? [current, ...options] : options;

interface LocationFieldsProps {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
  disabled?: boolean;
  /** How many levels to show, from the province down (2 = province and district). All five by default. */
  levels?: 1 | 2 | 3 | 4 | 5;
}

/**
 * Province → District → Sector → Cell → Village, each picked from Rwanda's official list (the same one
 * farmers register with). A level opens once the one above is chosen, and changing a level clears the
 * ones below it, so a place can never mix two provinces.
 */
export function LocationFields({ value, onChange, disabled = false, levels = 5 }: LocationFieldsProps) {
  const [options, setOptions] = useState<Record<Level, string[]>>({
    province: [],
    district: [],
    sector: [],
    cell: [],
    village: [],
  });
  const [loading, setLoading] = useState<Level | null>(null);

  const load = (level: Level, fetcher: () => Promise<string[]>) => {
    let active = true;
    setLoading(level);
    fetcher()
      .then((list) => active && setOptions((current) => ({ ...current, [level]: list })))
      .finally(() => active && setLoading((current) => (current === level ? null : current)));
    return () => {
      active = false;
    };
  };

  useEffect(
    () =>
      load("province", async () => {
        const result: unknown = await locationService.fetchLocationHierarchy([]);
        const list = Array.isArray(result) ? result : ((result as { provinces?: unknown[] })?.provinces ?? []);
        return list.map((p) => (typeof p === "string" ? p : (p as { name: string }).name)).filter(Boolean);
      }),
    []
  );

  useEffect(() => {
    if (!value.province) return setOptions((o) => ({ ...o, district: [] }));
    return load("district", () => locationService.getDistrictsByProvince(value.province));
  }, [value.province]);

  useEffect(() => {
    if (levels < 3 || !value.province || !value.district) return setOptions((o) => ({ ...o, sector: [] }));
    return load("sector", () => locationService.getSectorsByDistrict(value.province, value.district));
  }, [value.province, value.district]);

  useEffect(() => {
    if (!value.province || !value.district || !value.sector) return setOptions((o) => ({ ...o, cell: [] }));
    return load("cell", () => locationService.getCellsBySector(value.province, value.district, value.sector));
  }, [value.province, value.district, value.sector]);

  useEffect(() => {
    if (!value.province || !value.district || !value.sector || !value.cell) return setOptions((o) => ({ ...o, village: [] }));
    return load("village", () =>
      locationService.getVillagesByCell(value.province, value.district, value.sector, value.cell)
    );
  }, [value.province, value.district, value.sector, value.cell]);

  const pick = (level: Level, picked: string) => {
    if (picked === value[level]) return;
    const next = { ...value, [level]: picked };
    // Everything below the changed level belongs to the old choice
    for (const lower of LEVELS.slice(LEVELS.indexOf(level) + 1)) next[lower] = "";
    onChange(next);
  };

  const field = (level: Level) => {
    const index = LEVELS.indexOf(level);
    const parent = index > 0 ? LEVELS[index - 1] : null;
    const waitingForParent = !!parent && !value[parent];
    const choices = withCurrent(options[level], value[level]);
    const placeholder = waitingForParent
      ? `Choose a ${LABELS[parent!].toLowerCase()} first`
      : loading === level
        ? "Loading..."
        : `Choose a ${LABELS[level].toLowerCase()}`;
    return (
      <div key={level} className="min-w-0 space-y-2">
        <Label htmlFor={`location-${level}`} className="text-gray-900">
          {LABELS[level]}
        </Label>
        <Select
          value={value[level] || undefined}
          onValueChange={(picked) => pick(level, picked)}
          disabled={disabled || waitingForParent}
        >
          <SelectTrigger id={`location-${level}`} className="w-full bg-white border-gray-300 text-gray-900">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {choices.map((choice) => (
              <SelectItem key={choice} value={choice}>
                {choice}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const shown = LEVELS.slice(0, levels);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{shown.slice(0, 2).map(field)}</div>
      {shown.length > 2 && <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{shown.slice(2).map(field)}</div>}
    </div>
  );
}
