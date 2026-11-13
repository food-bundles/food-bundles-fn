import type { ReactNode } from "react";

// Small produce drawings shared by the live-market belts and the bundle crate.
// All are decorative: callers hide them from screen readers.
export const PRODUCE: { name: string; svg: ReactNode }[] = [
  {
    name: "tomato",
    svg: (
      <>
        <circle cx="16" cy="18" r="11" fill="#E5402D" />
        <path d="M16 7l2 4 4-1-3 3 1 3-4-2-4 2 1-3-3-3 4 1z" fill="#3FA34D" />
        <ellipse cx="12" cy="15" rx="2.5" ry="1.5" fill="#FFFFFF66" />
      </>
    ),
  },
  {
    name: "meat",
    svg: (
      <>
        <path d="M5 16C5 8 14 5 21 7c7 2 8 11 3 16-5 5-15 4-18-1z" fill="#F4E3D3" />
        <path d="M8 16c0-6 7-8 12-6 5 2 6 8 2 11-4 4-12 3-14-1z" fill="#B83A3A" />
        <circle cx="19" cy="15" r="2" fill="#F4E3D3" />
      </>
    ),
  },
  {
    name: "banana",
    svg: (
      <>
        <path d="M5 11C8 26 24 28 29 17C22 22 12 20 8 9z" fill="#F6C945" />
        <path d="M5 11L4 7" stroke="#6B4E16" strokeWidth="2.2" strokeLinecap="round" />
      </>
    ),
  },
  {
    name: "cabbage",
    svg: (
      <>
        <circle cx="16" cy="17" r="11" fill="#8CC152" />
        <path d="M16 6c-5 6-5 16 0 22M16 6c5 6 5 16 0 22M6 15c5 2 15 2 20 0" stroke="#5E9A2F" strokeWidth="1.6" fill="none" />
      </>
    ),
  },
  {
    name: "carrot",
    svg: (
      <>
        <path d="M7 27L21 11l4 4z" fill="#F28C28" />
        <path d="M12 22l3-1M15 18l3-1" stroke="#C9661A" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M22 11l1-7M23 12l6-3M24 13l5 2" stroke="#3FA34D" strokeWidth="2.4" strokeLinecap="round" />
      </>
    ),
  },
  {
    name: "fish",
    svg: (
      <>
        <path d="M3 16c6-8 16-8 21 0-5 8-15 8-21 0z" fill="#7FB3D5" />
        <path d="M24 16l5-5v10z" fill="#5B93B8" />
        <circle cx="9" cy="15" r="1.5" fill="#0B2E1F" />
      </>
    ),
  },
  {
    name: "avocado",
    svg: (
      <>
        <path d="M16 3C10 3 7 14 7 20a9 9 0 0 0 18 0C25 14 22 3 16 3z" fill="#4E7D2E" />
        <path d="M16 7C12 7 10 15 10 20a6 6 0 0 0 12 0C22 15 20 7 16 7z" fill="#D7E58A" />
        <circle cx="16" cy="20" r="4" fill="#8B5A2B" />
      </>
    ),
  },
  {
    name: "chicken",
    svg: (
      <>
        <path d="M14 18C8 18 5 12 9 7c4-4 12-3 13 3 1 4-3 6-4 8z" fill="#C8752E" />
        <path d="M17 17l7 7" stroke="#F4E3D3" strokeWidth="3" strokeLinecap="round" />
        <circle cx="25.5" cy="22.5" r="2.2" fill="#F4E3D3" />
        <circle cx="23.5" cy="25.5" r="2.2" fill="#F4E3D3" />
      </>
    ),
  },
  {
    name: "pineapple",
    svg: (
      <>
        <ellipse cx="16" cy="21" rx="7" ry="9" fill="#F2B233" />
        <path d="M11 16l10 10M11 22l6 6M13 13l9 9M21 16L11 26M21 22l-6 6" stroke="#C47F12" strokeWidth="1.2" />
        <path d="M16 12l-4-9 4 4V2l2 5 4-4-4 9z" fill="#3FA34D" />
      </>
    ),
  },
  {
    name: "drink",
    svg: (
      <>
        <rect x="12" y="12" width="8" height="17" rx="2.5" fill="#8B5A00" />
        <rect x="14" y="3" width="4" height="10" rx="1" fill="#8B5A00" />
        <rect x="12" y="17" width="8" height="5" fill="#F6C945" />
      </>
    ),
  },
  {
    name: "eggplant",
    svg: (
      <>
        <path d="M20 8c6 4 7 14 0 19-7 4-14-3-11-9 2-4 6-6 11-10z" fill="#6B3FA0" />
        <path d="M18 9l4-5 3 3-4 3z" fill="#3FA34D" />
      </>
    ),
  },
  {
    name: "potato",
    svg: (
      <>
        <ellipse cx="16" cy="17" rx="11" ry="8" fill="#C9965A" />
        <circle cx="11" cy="15" r="1" fill="#8B5A2B" />
        <circle cx="19" cy="19" r="1" fill="#8B5A2B" />
        <circle cx="21" cy="14" r="1" fill="#8B5A2B" />
      </>
    ),
  },
];

export function ProduceIcon({ index, size = 30 }: { index: number; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      {PRODUCE[index % PRODUCE.length].svg}
    </svg>
  );
}

export function DeliveryTruck({ width = 72 }: { width?: number }) {
  return (
    <svg width={width} height={(width * 38) / 72} viewBox="0 0 72 38" aria-hidden="true">
      <circle cx="10" cy="10" r="5" fill="#E5402D" />
      <circle cx="18" cy="8" r="5.5" fill="#8CC152" />
      <circle cx="27" cy="10" r="5" fill="#F6C945" />
      <circle cx="35" cy="9" r="5" fill="#F28C28" />
      <circle cx="22" cy="12" r="4" fill="#B83A3A" />
      <rect x="3" y="12" width="40" height="16" rx="2" fill="#00A43A" />
      <path d="M3 18h40" stroke="#007A35" strokeWidth="1.5" />
      <path d="M45 14h12l8 8v6H45z" fill="#FFFFFF" />
      <path d="M48 16h8l5 6H48z" fill="#BFE3F2" />
      <rect x="43" y="26" width="24" height="2" fill="#0B2E1F" />
      <g className="fb-wheel">
        <circle cx="14" cy="30" r="5" fill="#1B1B1B" />
        <path d="M14 26v8M10 30h8" stroke="#9AA59F" strokeWidth="1.4" />
      </g>
      <g className="fb-wheel">
        <circle cx="56" cy="30" r="5" fill="#1B1B1B" />
        <path d="M56 26v8M52 30h8" stroke="#9AA59F" strokeWidth="1.4" />
      </g>
    </svg>
  );
}
