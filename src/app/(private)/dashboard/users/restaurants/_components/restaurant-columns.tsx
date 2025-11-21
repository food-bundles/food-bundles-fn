import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
} from "lucide-react";
import { format } from "date-fns";

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
};

export const getRestaurantColumns = (
  onManage: (restaurant: Restaurant) => void
): ColumnDef<Restaurant>[] => [
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
    header: "Rest Name",
    cell: ({ row }) => {
      const fullName = row.getValue("name") as string;
      const shortName = fullName.split(" - ")[0];
      return <div className="">{shortName}</div>;
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
          onClick={() => onManage(restaurant)}
          className="flex items-center gap-2"
        >
          view
        </Button>
      );
    },
  },
];
