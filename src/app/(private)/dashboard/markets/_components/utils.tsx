import { PriceRecord } from "@/types/market-pricing";

/** Format RWF amount */
export const fmt = (n: number) => `${Math.round(n).toLocaleString()} RWF`;

/** Format ISO date string */
export const fmtDate = (d: string) =>
  new Intl.DateTimeFormat("en-RW", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));

/** Return an ISO string N days in the past */
export const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

/** Split records into "active" (≤ 30 days) and "recent" (> 30 days) */
export const splitByAge = (records: PriceRecord[]) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  return {
    active: records.filter((r) => new Date(r.recordedDate) >= cutoff),
    recent: records.filter((r) => new Date(r.recordedDate) < cutoff),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Toast system
// ─────────────────────────────────────────────────────────────────────────────

// Rwanda provinces / districts reference data
export const RW_PROVINCES = [
  "Kigali City",
  "Northern",
  "Southern",
  "Eastern",
  "Western",
];

export const RW_DISTRICTS: Record<string, string[]> = {
  "Kigali City": ["Gasabo", "Kicukiro", "Nyarugenge"],
  Northern: ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"],
  Southern: [
    "Gisagara",
    "Huye",
    "Kamonyi",
    "Muhanga",
    "Nyamagabe",
    "Nyanza",
    "Nyaruguru",
    "Ruhango",
  ],
  Eastern: [
    "Bugesera",
    "Gatsibo",
    "Kayonza",
    "Kirehe",
    "Ngoma",
    "Nyagatare",
    "Rwamagana",
  ],
  Western: [
    "Karongi",
    "Ngororero",
    "Nyabihu",
    "Nyamasheke",
    "Rubavu",
    "Rutsiro",
    "Rusizi",
  ],
};
