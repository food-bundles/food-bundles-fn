import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export type NotificationRecipient = {
  id: string;
  name: string;
  phoneNumber: string;
  category: string;
  isActive: boolean;
  createdAt: string;
};

const categoryLabels: Record<string, string> = {
  MATURED_VOUCHERS: "Matured Vouchers",
  EXPIRED_VOUCHERS: "Expired Vouchers",
  LOW_STOCK: "Low Stock",
  PAYMENT_ISSUES: "Payment Issues",
  SYSTEM_ALERTS: "System Alerts",
};

export const getRecipientColumns = (
  onManage: (recipient: NotificationRecipient) => void
): ColumnDef<NotificationRecipient>[] => [
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
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span>{row.getValue("phoneNumber")}</span>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      return (
        <Badge variant="outline" className="font-normal">
          {categoryLabels[category] || category}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge
          variant={isActive ? "default" : "secondary"}
          className={
            isActive
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }
        >
          {isActive ? "Active" : "Inactive"}
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
      const recipient = row.original;

      return (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onManage(recipient)}
          className="flex items-center gap-2"
        >
          view
        </Button>
      );
    },
  },
];
