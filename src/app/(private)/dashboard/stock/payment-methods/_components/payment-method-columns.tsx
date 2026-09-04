"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export const createPaymentMethodColumns = (
  onEdit: (method: PaymentMethod) => void,
  onDelete: (methodId: string) => void
): ColumnDef<PaymentMethod>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name.replace(/_/g, " "),
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "secondary"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(row.original)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(row.original.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];