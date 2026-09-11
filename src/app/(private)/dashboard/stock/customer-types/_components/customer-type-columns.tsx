"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Power } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomerType } from "@/app/services/customerTypeService";

export const createCustomerTypeColumns = (
  onEdit: (customerType: CustomerType) => void,
  onDelete: (id: string) => void,
  onToggle: (id: string) => void
): ColumnDef<CustomerType>[] => [
  {
    id: "nbr",
    header: "Nbr",
    cell: ({ row }) => (
      <span className="text-gray-600">{row.index + 1}</span>
    ),
    size: 50,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-gray-600">{row.original.description || "—"}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        className={
          row.original.isActive
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-red-100 text-red-800 hover:bg-red-200"
        }
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      if (!date) return <span className="text-gray-400">—</span>;
      try {
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) return <span className="text-gray-400">—</span>;
        return <span className="text-gray-600">{parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>;
      } catch {
        return <span className="text-gray-400">—</span>;
      }
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggle(row.original.id)}
          title={row.original.isActive ? "Deactivate" : "Activate"}
          className={`h-8 w-8 p-0 ${
            row.original.isActive
              ? "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
              : "text-gray-600 hover:text-green-600 hover:bg-green-50"
          }`}
        >
          <Power className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(row.original)}
          className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(row.original.id)}
          className="h-8 w-8 p-0 text-gray-600 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
