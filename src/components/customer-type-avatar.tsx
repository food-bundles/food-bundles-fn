"use client";

import { useState } from "react";
import {
  BedDouble,
  Building2,
  ChefHat,
  Coffee,
  GraduationCap,
  HeartPulse,
  Store,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from "lucide-react";

/**
 * What a customer type looks like until an admin uploads its own picture:
 * a real photo of that kind of place (public/home/…), and an icon only if
 * that photo file is missing.
 */
const LOOKS: { match: RegExp; photo: string; icon: LucideIcon; bg: string; fg: string }[] = [
  { match: /resta|resto|food court|eat/i, photo: "/home/kitchens/kitchen-1.jpg", icon: UtensilsCrossed, bg: "#FFE9D6", fg: "#B4530F" },
  { match: /hotel|lodge|guest|motel|resort/i, photo: "/home/customer-types/hotel.jpg", icon: BedDouble, bg: "#E4EEF7", fg: "#1B4F7A" },
  { match: /school|universit|college|academ|institut/i, photo: "/home/customer-types/school.jpg", icon: GraduationCap, bg: "#EDE7FB", fg: "#5B3BB5" },
  { match: /bar|pub|club|lounge/i, photo: "/home/customer-types/bar.jpg", icon: Wine, bg: "#FCE4EC", fg: "#A1224E" },
  { match: /caf|coffee|bakery/i, photo: "/home/customer-types/cafe.jpg", icon: Coffee, bg: "#F3E9DD", fg: "#7A4E1F" },
  { match: /cater|event|kitchen|chef/i, photo: "/home/kitchens/kitchen-6.jpg", icon: ChefHat, bg: "#E3F3E8", fg: "#007A35" },
  { match: /hospital|clinic|health|care/i, photo: "/home/customer-types/hospital.jpg", icon: HeartPulse, bg: "#FDE8E8", fg: "#B42318" },
  { match: /shop|store|market|super|retail|kiosk|mall/i, photo: "/home/inzovu-mall.jpg", icon: Store, bg: "#FFF4DD", fg: "#9A6400" },
];
const OTHER = { photo: "/home/customer-types/business.jpg", icon: Building2, bg: "#EFFAF3", fg: "#0B2E1F" };

export function customerTypeLook(name: string) {
  return LOOKS.find((l) => l.match.test(name)) ?? OTHER;
}

/**
 * A customer type in a circle: the picture an admin uploaded, else a real
 * photo of that kind of business, else (photo file missing) a fitting icon.
 */
export function CustomerTypeAvatar({
  name,
  imageUrl,
  size = 72,
  className = "",
}: {
  name: string;
  imageUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const look = customerTypeLook(name);
  const [failed, setFailed] = useState<string | null>(null);
  const src = imageUrl || look.photo;
  const Icon = look.icon;
  const showIcon = failed === src;
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size, background: showIcon ? look.bg : "#F6F9F7" }}
      aria-hidden="true"
    >
      {showIcon ? (
        <Icon style={{ width: size * 0.42, height: size * 0.42, color: look.fg }} strokeWidth={1.8} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" onError={() => setFailed(src)} />
      )}
    </span>
  );
}
