import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export interface DelegationHistoryData {
  id: string;
  walletId: string;
  startedAt: string;
  endedAt: string | null;
  approvedBy: string;
  createdAt: string;
  wallet: {
    traderId: string;
    trader: {
      id: string;
      username: string;
      email: string;
      phone: string;
    };
  };
}

export const createDelegationHistoryColumns = (): ColumnDef<DelegationHistoryData>[] => [
  {
    accessorKey: "wallet.trader.username",
    header: "Trader",
    cell: ({ row }) => {
      const trader = row.original.wallet.trader;
      return (
        <div>
          <p className="font-semibold text-sm">{trader.username}</p>
          <p className="text-xs text-gray-500">{trader.email}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "wallet.trader.phone",
    header: "Phone",
    cell: ({ row }) => row.original.wallet.trader.phone,
  },
  {
    accessorKey: "startedAt",
    header: "Started",
    cell: ({ row }) => new Date(row.original.startedAt).toLocaleDateString(),
  },
  {
    accessorKey: "endedAt",
    header: "Status",
    cell: ({ row }) => {
      const isActive = !row.original.endedAt;
      return (
        <Badge className={isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {isActive ? "Active" : "Ended"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "endedAt",
    header: "Ended",
    cell: ({ row }) => row.original.endedAt ? new Date(row.original.endedAt).toLocaleDateString() : "-",
  },
];
