/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
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

export const restaurantColumns: ColumnDef<Restaurant>[] = [
  {
    accessorKey: "name",
    header: "Restaurant Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-gray-500" />
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
          <Phone className="h-4 w-4 text-gray-500" />
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
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-gray-500" />
        <span>{row.getValue("location")}</span>
      </div>
    ),
  },
  {
    accessorKey: "ordersCount",
    header: "Orders",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-4 w-4 text-gray-500" />
        <Badge variant="outline">{row.getValue("ordersCount")} orders</Badge>
      </div>
    ),
  },
  {
    accessorKey: "totalSpent",
    header: "Total Spent",
    cell: ({ row }) => {
      const amount = row.getValue("totalSpent") as number;
      return <div className="font-medium">KSh {amount.toLocaleString()}</div>;
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Restaurant
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Suspend Restaurant
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
