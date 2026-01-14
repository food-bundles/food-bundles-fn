"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Mail, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Invitation } from "@/app/services/invitationService";

interface InvitationColumnsProps {
  onResend: (id: string) => void;
  onCancel: (id: string) => void;
}

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (date: string | Date) =>
  new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

export const createInvitationColumns = ({ onResend, onCancel }: InvitationColumnsProps): ColumnDef<Invitation>[] => [
  {
    accessorKey: "#",
    header: "#",
    cell: ({ row }) => <div className="text-xs">{row.index + 1}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-xs">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <div>
          <p className="text-xs lowercase"> {role}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const invitation = row.original;
      const isUsed = invitation.isUsed;
      const isExpired = new Date(invitation.expiresAt) < new Date();
      
      let status = "PENDING";
      let variant: "outline" | "default" | "destructive" | "secondary" = "outline";
      
      if (isUsed) {
        status = "USED";
        variant = "default";
      } else if (isExpired) {
        status = "Not Used";
      }
      
      return (
        <Badge variant={variant} className="text-xs font-normal">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return <div className="flex gap-1 justify-center items-center text-sm">
        {formatDate(date)}
        <p className="text-xs text-gray-500">{formatTime(date)}</p>
      </div>;
    },
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
    cell: ({ row }) => {
      const date = row.original.expiresAt;
      return (
        <div className="flex gap-1 justify-center items-center text-sm">
          {formatDate(date)}
          <p className="text-xs text-gray-500">{formatTime(date)}</p>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const invitation = row.original;
      const isPending = !invitation.isUsed && new Date(invitation.expiresAt) > new Date();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onResend(invitation.id)}>
              <Mail className="mr-2 h-4 w-4" />
              Resend
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onCancel(invitation.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];