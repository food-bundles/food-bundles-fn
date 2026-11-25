"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { KeyRound, MoreHorizontal, Pause, Play, RotateCcw, ShieldCheck, ShoppingBag, Trash, Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/contexts/auth-context";
import {
    affiliatorManageService,
    apiMessage,
    type AffiliatorPermissionOption,
    type ManagedAffiliator,
} from "@/app/services/affiliatorManageService";
import { InviteDialog } from "./_components/InviteDialog";
import { PermissionsDialog } from "./_components/PermissionsDialog";
import { DeleteDialog } from "./_components/DeleteDialog";
import { OrdersDialog } from "./_components/OrdersDialog";

export default function AffiliatorsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [tab, setTab] = useState<"active" | "trash">("active");
    const [affiliators, setAffiliators] = useState<ManagedAffiliator[]>([]);
    const [options, setOptions] = useState<AffiliatorPermissionOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [editing, setEditing] = useState<ManagedAffiliator | null>(null);
    const [deleting, setDeleting] = useState<ManagedAffiliator | null>(null);
    const [ordersOf, setOrdersOf] = useState<ManagedAffiliator | null>(null);

    const isAffiliator = user?.role === "AFFILIATOR";

    useEffect(() => {
        // Affiliators act for a business; they don't manage other affiliators
        if (isAffiliator) router.push("/restaurant");
    }, [isAffiliator, router]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await affiliatorManageService.list(tab === "trash");
            setAffiliators(res.affiliators);
        } catch (err) {
            toast.error(apiMessage(err, "Failed to load affiliators"));
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => {
        if (isAffiliator) return;
        load();
    }, [load, isAffiliator]);

    useEffect(() => {
        if (isAffiliator) return;
        affiliatorManageService.permissions().then(setOptions).catch(() => setOptions([]));
    }, [isAffiliator]);

    const act = async (run: () => Promise<unknown>, done: string) => {
        try {
            await run();
            toast.success(done);
            load();
        } catch (err) {
            toast.error(apiMessage(err, "Something went wrong"));
        }
    };

    const labelOf = (key: string) => options.find((p) => p.key === key)?.label ?? key;

    const columns: ColumnDef<ManagedAffiliator>[] = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "phone", header: "Phone", cell: ({ row }) => row.original.phone || "N/A" },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) =>
                tab === "trash" ? (
                    <Badge variant="outline" className="text-gray-500">In trash</Badge>
                ) : row.original.status === "ACTIVE" ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                ) : (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Paused</Badge>
                ),
        },
        {
            id: "permissions",
            header: "Can",
            cell: ({ row }) => {
                const list = row.original.permissions;
                if (!list.length) return <span className="text-xs text-gray-400">Nothing yet</span>;
                return (
                    <span className="text-xs text-gray-600" title={list.map(labelOf).join("\n")}>
                        {list.length === options.length ? "Everything" : `${list.length} of ${options.length || list.length}`}
                    </span>
                );
            },
        },
        { id: "orders", header: "Orders", cell: ({ row }) => row.original._count?.orders ?? 0 },
        {
            accessorKey: "createdAt",
            header: "Added",
            cell: ({ row }) => format(new Date(row.original.createdAt), "PP"),
        },
        {
            id: "actions",
            size: 50,
            cell: ({ row }) => {
                const a = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{a.name}</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setOrdersOf(a)}>
                                <ShoppingBag className="mr-2 h-4 w-4" /> View orders
                            </DropdownMenuItem>
                            {tab === "active" ? (
                                <>
                                    <DropdownMenuItem onClick={() => setEditing(a)}>
                                        <ShieldCheck className="mr-2 h-4 w-4" /> Permissions
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            if (!window.confirm(`Send ${a.name} a new login code by SMS? It replaces their current password.`)) return;
                                            act(() => affiliatorManageService.resendLogin(a.id), `New login code sent to ${a.phone ?? "their phone"}`);
                                        }}
                                    >
                                        <KeyRound className="mr-2 h-4 w-4" /> Send new login code
                                    </DropdownMenuItem>
                                    {a.status === "ACTIVE" ? (
                                        <DropdownMenuItem onClick={() => act(() => affiliatorManageService.setStatus(a.id, "INACTIVE"), `${a.name} is paused`)}>
                                            <Pause className="mr-2 h-4 w-4" /> Deactivate
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem onClick={() => act(() => affiliatorManageService.setStatus(a.id, "ACTIVE"), `${a.name} is active again`)}>
                                            <Play className="mr-2 h-4 w-4" /> Activate
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600"
                                        onClick={() => act(() => affiliatorManageService.trash(a.id), `${a.name} moved to trash`)}
                                    >
                                        <Trash className="mr-2 h-4 w-4" /> Move to trash
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuItem onClick={() => act(() => affiliatorManageService.restore(a.id), `${a.name} restored`)}>
                                        <RotateCcw className="mr-2 h-4 w-4" /> Restore
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleting(a)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete for good
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    if (isAffiliator) return null;

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Affiliators</h2>
                    <p className="text-sm text-gray-500 mt-1">People who order for your business, with only the permissions you give them.</p>
                </div>
                <Button onClick={() => setInviteOpen(true)} className="bg-green-700 hover:bg-green-600">
                    Add affiliator
                </Button>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "trash")}>
                <TabsList>
                    <TabsTrigger value="active">Affiliators</TabsTrigger>
                    <TabsTrigger value="trash">Trash</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="bg-white rounded-lg border shadow-sm">
                <DataTable columns={columns} data={affiliators} isLoading={loading} showSearch searchKey="name" searchPlaceholder="Search by name..." />
            </div>

            <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} options={options} onDone={load} />
            <PermissionsDialog affiliator={editing} options={options} onClose={() => setEditing(null)} onDone={load} />
            <DeleteDialog affiliator={deleting} onClose={() => setDeleting(null)} onDone={load} />
            <OrdersDialog affiliator={ordersOf} onClose={() => setOrdersOf(null)} />
        </div>
    );
}
