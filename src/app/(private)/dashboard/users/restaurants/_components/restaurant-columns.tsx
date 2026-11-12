import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShoppingCart,
} from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { restaurantShowcaseService } from "@/app/services/restaurantShowcaseService";

// Show or hide a customer in the homepage "Trusted by Kigali's kitchens".
// An admin decides; it saves at once.
function FeaturedSwitch({
  restaurant,
  canFeature,
  onChanged,
}: {
  restaurant: Restaurant;
  canFeature: boolean;
  onChanged?: () => void;
}) {
  const [on, setOn] = useState(!!restaurant.featuredOnWebsite);
  const [saving, setSaving] = useState(false);
  useEffect(() => setOn(!!restaurant.featuredOnWebsite), [restaurant.featuredOnWebsite]);

  if (!canFeature) {
    return <span className="text-sm text-gray-600">{on ? "Shown" : "—"}</span>;
  }
  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <Switch
        checked={on}
        disabled={saving}
        aria-label={`Show ${restaurant.name} on the website`}
        onCheckedChange={async (next) => {
          setOn(next);
          setSaving(true);
          try {
            await restaurantShowcaseService.setFeatured(restaurant.id, next);
            toast.success(next ? `${restaurant.name} is now on the website` : `${restaurant.name} removed from the website`);
            onChanged?.();
          } catch (error: any) {
            setOn(!next);
            toast.error(error?.response?.data?.message || "Could not update website visibility");
          } finally {
            setSaving(false);
          }
        }}
      />
      <span className="text-xs text-gray-600">{on ? "Shown" : "Hidden"}</span>
    </div>
  );
}

export type Restaurant = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  role: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
  status: "active" | "inactive" | "suspended";
  /** Customer type (school, hotel, restaurant…) */
  customerType?: { id: string; name: string } | null;
  /** Product categories hidden from this specific customer */
  categoryExclusions?: { categoryId: string; category: { id: string; name: string } }[];
  categoryExclusionIds?: string[];
  /** Business photo the customer uploaded */
  businessImage?: string | null;
  /** Shown on the homepage ("Trusted by Kigali's kitchens") */
  featuredOnWebsite?: boolean;
};

export const getRestaurantColumns = (
  onManage: (restaurant: Restaurant) => void,
  onViewDetails: (restaurantId: string) => void,
  website: { canFeature: boolean; onChanged?: () => void } = { canFeature: false },
): ColumnDef<Restaurant>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.index + 1}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => {
      const fullName = row.getValue("name") as string;
      const shortName = fullName.split(" - ")[0];
      return <div className="">{shortName}</div>;
    },
  },
  {
    id: "featuredOnWebsite",
    header: "On website",
    cell: ({ row }) => (
      <FeaturedSwitch restaurant={row.original} canFeature={website.canFeature} onChanged={website.onChanged} />
    ),
    enableSorting: false,
  },
  {
    id: "customerType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.customerType;
      return type ? (
        <span className="inline-flex rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-medium capitalize text-emerald-800">
          {type.name.toLowerCase()}
        </span>
      ) : (
        <span className="text-xs text-gray-400">No type</span>
      );
    },
  },
  {
    id: "hiddenCategories",
    header: "Hidden categories",
    cell: ({ row }) => {
      const hidden = row.original.categoryExclusions ?? [];
      if (hidden.length === 0) {
        return <span className="text-xs text-gray-400">None</span>;
      }
      return (
        <span className="text-xs text-gray-700">
          {hidden.map((row) => row.category.name).join(", ")}
        </span>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span>{row.getValue("email")}</span>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return phone ? (
        <div className="flex items-center gap-2">
          <span>{phone}</span>
        </div>
      ) : (
        <span className="text-gray-400">Not provided</span>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const location = row.getValue("location") as string;
      const parts = location.split(", ");
      const mainLocation = parts.slice(0, 2).join(", ");
      const subLocations = parts.slice(2).join(", ");
      
      return (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="">{mainLocation}</span>
            {subLocations && (
              <span className="text-xs text-gray-500">{subLocations}</span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "ordersCount",
    header: "Orders",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-4 w-4 text-gray-500" />
        <Badge variant="outline" className="font-normal">{row.getValue("ordersCount")} orders</Badge>
      </div>
    ),
  },
  {
    accessorKey: "totalSpent",
    header: "Total Spent",
    cell: ({ row }) => {
      const amount = row.getValue("totalSpent") as number;
      return <div className=""> {amount.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "active"
              ? "default"
              : status === "suspended"
              ? "destructive"
              : "secondary"
          }
          className={
            status === "active"
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : status === "suspended"
              ? "bg-red-100 text-red-800 hover:bg-red-200"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div>{format(date, "MMM dd, yyyy")}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const restaurant = row.original;

      return (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onManage(restaurant);
          }}
          className="flex items-center gap-2"
        >
          Manage
        </Button>
      );
    },
  },
];
