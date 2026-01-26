"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Trash2, MoreHorizontal, Search, Ban, CheckCircle, Edit } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { usePromo } from "@/app/contexts/PromoContext";
import { IPromoCode } from "@/app/services/promoService";
import { Input } from "@/components/ui/input";
import PromoDetailsModal from "./PromoDetailsModal";
import RestaurantExclusionModal from "./RestaurantExclusionModal";
import DeletePromoModal from "./DeletePromoModal";
import EditPromoModal from "./EditPromoModal";

interface PromoCodesTableProps {
    onCreatePromo?: () => void;
}

export default function PromoCodesTable({ onCreatePromo }: PromoCodesTableProps) {
    const { promos, loading, deletePromo, updatePromo, fetchPromos } = usePromo();
    const [selectedPromo, setSelectedPromo] = useState<IPromoCode | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isExclusionModalOpen, setIsExclusionModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [searchFilter, setSearchFilter] = useState("");

    const handleToggleStatus = async (promo: IPromoCode) => {
        try {
            // Some backends require all fields for PUT
            await updatePromo(promo.id, {
                code: promo.code,
                name: promo.name,
                description: promo.description,
                type: promo.type,
                discountType: promo.discountType,
                discountValue: promo.discountValue,
                isReusable: promo.isReusable,
                maxUsageCount: promo.maxUsageCount,
                maxUsagePerUser: promo.maxUsagePerUser,
                minOrderAmount: promo.minOrderAmount,
                minItemQuantity: promo.minItemQuantity,
                applyToAllProducts: promo.applyToAllProducts,
                startDate: promo.startDate,
                expiryDate: promo.expiryDate,
                isActive: !promo.isActive as any,
            });
        } catch (error) {
            console.error("Failed to toggle status", error);
        }
    }

    const filteredPromos = useMemo(() => {
        if (!searchFilter) return promos || [];
        return (promos || []).filter((promo) =>
            promo.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
            promo.name.toLowerCase().includes(searchFilter.toLowerCase())
        );
    }, [promos, searchFilter]);

    const formatDate = (date: string | Date) =>
        new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    const columns: ColumnDef<IPromoCode>[] = [
        {
            accessorKey: "index",
            header: "#",
            cell: ({ row }) => (
                <div className="text-sm font-medium">{row.index + 1}</div>
            ),
        },
        {
            accessorKey: "code",
            header: "Code",
            cell: ({ row }) => (
                <div className="font-mono font-bold text-green-700">{row.original.code}</div>
            ),
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => <div className="text-sm font-medium">{row.original.name}</div>,
        },
        {
            accessorKey: "discountValue",
            header: "Discount",
            cell: ({ row }) => (
                <div className="text-sm">
                    {row.original.discountValue}
                    {row.original.discountType === "PERCENTAGE" ? "%" : " RWF"}
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => {
                const type = row.original.type;
                const getTypeDisplay = () => {
                    switch (type) {
                        case "PUBLIC":
                            return { text: "Public", className: "text-green-600 border-green-200 bg-green-50" };
                        case "SUBSCRIBERS":
                            return { text: "Subscribers", className: "text-blue-600 border-blue-200 bg-blue-50" };
                        case "EXCEPTIONAL":
                            return { text: "Exceptional", className: "text-purple-600 border-purple-200 bg-purple-50" };
                        default:
                            return { text: "Public", className: "" };
                    }
                };
                const display = getTypeDisplay();
                return (
                    <Badge variant="outline" className={display.className}>
                        {display.text}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "usage",
            header: "Usage",
            cell: ({ row }) => (
                <div className="text-sm">
                    {row.original.currentUsageCount} / {row.original.maxUsageCount}
                </div>
            ),
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.isActive ? "default" : "destructive"} className={row.original.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                    {row.original.isActive ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            accessorKey: "expiryDate",
            header: "Expiry",
            cell: ({ row }) => <div className="text-sm">{formatDate(row.original.expiryDate)}</div>,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const promo = row.original;
                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedPromo(promo);
                                        setIsDetailsModalOpen(true);
                                    }}
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedPromo(promo);
                                        setIsEditModalOpen(true);
                                    }}
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedPromo(promo);
                                        setIsExclusionModalOpen(true);
                                    }}
                                >
                                    <Ban className="mr-2 h-4 w-4" />
                                    Manage Exclusions
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleToggleStatus(promo)}
                                >
                                    {promo.isActive ? (
                                        <>
                                            <Ban className="mr-2 h-4 w-4 text-orange-500" />
                                            Deactivate
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                            Activate
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                        setSelectedPromo(promo);
                                        setIsDeleteModalOpen(true);
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={filteredPromos}
                isLoading={loading}
                customFilters={
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search code or name..."
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                }
            />

            {selectedPromo && (
                <>
                    <PromoDetailsModal
                        promo={selectedPromo}
                        open={isDetailsModalOpen}
                        onOpenChange={setIsDetailsModalOpen}
                    />
                    <EditPromoModal
                        promo={selectedPromo}
                        open={isEditModalOpen}
                        onOpenChange={setIsEditModalOpen}
                        onSuccess={() => fetchPromos()}
                    />
                    <RestaurantExclusionModal
                        promo={selectedPromo}
                        open={isExclusionModalOpen}
                        onOpenChange={setIsExclusionModalOpen}
                    />
                    <DeletePromoModal
                        open={isDeleteModalOpen}
                        onOpenChange={setIsDeleteModalOpen}
                        loading={loading}
                        onConfirm={async () => {
                            await deletePromo(selectedPromo.id);
                            setIsDeleteModalOpen(false);
                            setSelectedPromo(null);
                        }}
                    />
                </>
            )}
        </div>
    );
}
