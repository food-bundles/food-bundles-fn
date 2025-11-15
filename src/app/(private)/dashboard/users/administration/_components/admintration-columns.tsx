import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Admin } from "@/app/contexts/AdminsContext";

export const getAdminColumns = (
  onManage: (admin: Admin) => void
): ColumnDef<Admin>[] => [
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
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{row.getValue("username")}</span>
      </div>
    ),
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
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-400 text-[10px]"
          >
            {role}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "province",
    header: "Location",
    cell: ({ row }) => {
      const admin = row.original;
      if (!admin.location) {
        return (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Not provided</span>
          </div>
        );
      }
      const location = `${admin.province}, ${admin.district}`;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{location}</span>
        </div>
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
              : displayStatus === "suspended"
              ? "destructive"
              : "secondary"
          }
          className={
            displayStatus === "active"
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : displayStatus === "suspended"
              ? "bg-red-100 text-red-800 hover:bg-red-200"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }
        >
          {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div>{format(date, "MMM dd, yyyy")}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const admin = row.original;

      return (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onManage(admin)}
          className="flex items-center gap-2"
        >
          view
        </Button>
      );
    },
  },
];
