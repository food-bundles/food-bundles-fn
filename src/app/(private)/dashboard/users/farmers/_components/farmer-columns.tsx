import Link from "next/link";
import { lookupHref } from "@/lib/user-lookup";
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";
import { AccountStatusSwitch } from "@/components/account-status-switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Farmer } from "@/app/contexts/FarmersContext";

export const getFarmerColumns = (
  onManage: (farmer: Farmer) => void,
  onAssignSite?: (farmer: Farmer) => void
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
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return name ? (
        <div className="font-medium">
          {name}
        </div>
      ) : (
        <span className="text-gray-400">Not provided</span>
      );
    },
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
            <span className="text-[14px]">{location}</span>
            <span className="text-[12px] text-gray-500">{subLocation}</span>
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
    id: "aggregationSite",
    header: "Aggregation site",
    cell: ({ row }) => {
      const { aggregationSite, siteAssignedByAdmin } = row.original;
      return aggregationSite ? (
        <div className="flex flex-col">
          <span className="text-[14px]">{aggregationSite.name}</span>
          <span className="text-[12px] text-gray-500">{siteAssignedByAdmin ? "Chosen by an admin" : "Nearest"}</span>
        </div>
      ) : (
        <span className="text-gray-400">Not assigned</span>
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
    // Active / deactivated: a deactivated account can't log in
    cell: ({ row }) => (
      <AccountStatusSwitch type="farmer" id={row.original.id} name={row.original.name} />
    ),
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
        <div className="flex items-center">
        <Button asChild variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
            <Link href={lookupHref(farmer)}>Details</Link>
          </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onManage(farmer);
          }}
          className="flex items-center gap-2"
        >
          Manage
        </Button>
        {onAssignSite && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAssignSite(farmer);
            }}
          >
            Site
          </Button>
        )}
        </div>
      );
    },
  },
];
