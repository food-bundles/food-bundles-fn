/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Farmer } from "@/app/contexts/FarmersContext";

export const getFarmerColumns = (
  onManage: (farmer: Farmer) => void
): ColumnDef<Farmer>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.index + 1}
      </div>
    ),
  },
  {
    accessorKey: "province",
    header: "Location",
    cell: ({ row }) => {
      const farmer = row.original;
      const location = `${farmer.province}, ${farmer.district}`;
      const subLocation = `${farmer.sector}, ${farmer.cell}, ${farmer.village}`;
      
      return (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="font-medium">{location}</span>
            <span className="text-xs text-gray-500">{subLocation}</span>
          </div>
        </div>
      );
    },
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
    accessorKey: "submissions",
    header: "Submissions",
    cell: ({ row }) => {
      const submissions = row.getValue("submissions") as any[];
      return (
        <Badge variant="outline">
          {submissions.length} submissions
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const displayStatus = status || "active";
      return (
        <Badge
          variant={
            displayStatus === "active"
              ? "default"
              : displayStatus === "pending"
              ? "secondary"
              : "destructive"
          }
          className={
            displayStatus === "active"
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : displayStatus === "pending"
              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }
        >
          {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
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
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onManage(farmer)}
          className="flex items-center gap-2"
        >
          view
        </Button>
      );
    },
  },
];
