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
} from "lucide-react";
import { format } from "date-fns";

export type Farmer = {
  id: string;
  location: string;
  role: string;
  phone?: string;
  email?: string;
  createdAt: string;
  submissionsCount: number;
  status: "active" | "inactive" | "pending";
};

export const farmerColumns: ColumnDef<Farmer>[] = [
  {
    accessorKey: "id",
    header: "Farmer ID",
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.getValue("id")?.toString().slice(0, 8)}
      </div>
    ),
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
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return email ? (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span>{email}</span>
        </div>
      ) : (
        <span className="text-gray-400">Not provided</span>
      );
    },
  },
  {
    accessorKey: "submissionsCount",
    header: "Submissions",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.getValue("submissionsCount")} submissions
      </Badge>
    ),
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
              : status === "pending"
              ? "secondary"
              : "destructive"
          }
          className={
            status === "active"
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : status === "pending"
              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
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
      const farmer = row.original;

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
              Edit Farmer
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Farmer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
