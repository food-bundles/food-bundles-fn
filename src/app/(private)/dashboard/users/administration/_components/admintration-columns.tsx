import Link from "next/link";
import { lookupHref } from "@/lib/user-lookup";
import type { ColumnDef } from "@tanstack/react-table";
import { AccountStatusSwitch } from "@/components/account-status-switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Admin } from "@/app/contexts/AdminsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export const getAdminColumns = (
  onManage: (admin: Admin) => void,
  onUpdateCommission: (admin: Admin) => void,
  onAssignSite?: (admin: Admin) => void
): ColumnDef<Admin>[] => [
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
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="">{row.getValue("username")}</span>
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
      // One row per person: all their staff roles
      cell: ({ row }) => {
        const roles = row.original.staffRoles?.length
          ? row.original.staffRoles
          : [{ role: row.original.role, label: row.original.role, status: "ACTIVE", dashboardRole: null }];
        return (
          <div className="flex max-w-[260px] flex-wrap items-center gap-1">
            {roles.map((r) => (
              <Badge
                key={r.role}
                variant="outline"
                title={r.dashboardRole ? `Dashboard role: ${r.dashboardRole}` : undefined}
                className={`text-[10px] ${r.status === "ACTIVE" ? "bg-orange-50 text-orange-500" : "bg-gray-100 text-gray-500 line-through"}`}
              >
                {r.label}
              </Badge>
            ))}
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
        const location = `${admin.location}`;
        return (
          <div className="flex items-center gap-2">
            <span className="">{location}</span>
          </div>
        );
      },
    },
    {
      id: "aggregationSite",
      header: "Aggregation site",
      cell: ({ row }) => {
        const { role, aggregationSite, siteAssignedByAdmin, staffRoles } = row.original;
        const isAggregator = role === "AGGREGATOR" || !!staffRoles?.some((r) => r.role === "AGGREGATOR");
        if (!isAggregator) return <span className="text-gray-400">-</span>;
        return aggregationSite ? (
          <div className="flex flex-col">
            <span>{aggregationSite.name}</span>
            <span className="text-[12px] text-gray-500">{siteAssignedByAdmin ? "Chosen by an admin" : "Nearest"}</span>
          </div>
        ) : (
          <span className="text-gray-400">Not assigned</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      // Active / deactivated: a deactivated account can't log in
      cell: ({ row }) => (
        <AccountStatusSwitch type="admin" id={row.original.id} name={row.original.username} />
      ),
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

        const holds = (role: string) => admin.role === role || !!admin.staffRoles?.some((r) => r.role === role);

        return (
          <div className="flex items-center">
          <Button asChild variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
            <Link href={lookupHref(admin)}>Details</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onManage(admin);
              }}>
                Manage User
              </DropdownMenuItem>
              {holds("AGGREGATOR") && onAssignSite && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onAssignSite(admin);
                  }}>
                    Aggregation Site
                  </DropdownMenuItem>
                </>
              )}
              {holds("TRADER") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onUpdateCommission(admin);
                  }}>
                    Set Commission
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        );
      },
    },
  ];
