"use client";

import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash, Loader2 } from "lucide-react";
import { affiliatorService } from "@/app/services/affiliatorService";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/app/contexts/auth-context";
import { useRouter } from "next/navigation";

interface Affiliator {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    password?: string;
    phone?: string | null;
    restaurantId: string;
    restaurant?: {
        id: string;
        name: string;
        email?: string;
    };
    orders?: any[];
}

export default function AffiliatorsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect affiliators away from this page
    if (user?.role === "AFFILIATOR") {
      router.push("/restaurant");
    }
  }, [user, router]);

  // Don't render content for affiliators
  if (user?.role === "AFFILIATOR") {
    return null;
  }
    const [data, setData] = useState<Affiliator[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentAffiliator, setCurrentAffiliator] = useState<Affiliator | null>(null);
    const [formData, setFormData] = useState({ name: "", email: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAffiliators = async () => {
        try {
            setLoading(true);
            const res = await affiliatorService.getMyAffiliators();
            setData(res.data);
        } catch (error) {
            toast.error("Failed to fetch affiliators");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAffiliators();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (currentAffiliator) {
                await affiliatorService.updateAffiliator(currentAffiliator.id, {
                    name: formData.name,
                });
                toast.success("Affiliator updated successfully");
            } else {
                await affiliatorService.createAffiliator(formData);
                toast.success("Affiliator created successfully");
            }
            setIsDialogOpen(false);
            fetchAffiliators();
            resetForm();
        } catch (error) {
            toast.error(currentAffiliator ? "Failed to update affiliator" : "Failed to create affiliator");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!currentAffiliator) return;
        setIsSubmitting(true);
        try {
            await affiliatorService.deleteAffiliator(currentAffiliator.id);
            toast.success("Affiliator deleted successfully");
            setIsDeleteDialogOpen(false);
            fetchAffiliators();
        } catch (error) {
            toast.error("Failed to delete affiliator");
        } finally {
            setIsSubmitting(false);
            setCurrentAffiliator(null);
        }
    };

    const resetForm = () => {
        setFormData({ name: "", email: "" });
        setCurrentAffiliator(null);
    };

    const openEditDialog = (affiliator: Affiliator) => {
        setCurrentAffiliator(affiliator);
        setFormData({ name: affiliator.name, email: affiliator.email });
        setIsDialogOpen(true);
    };

    const openDeleteDialog = (affiliator: Affiliator) => {
        setCurrentAffiliator(affiliator);
        setIsDeleteDialogOpen(true);
    };

    const columns: ColumnDef<Affiliator>[] = [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "restaurant.name",
            header: "Restaurant",
            cell: ({ row }) => row.original.restaurant?.name || "N/A",
        },
        {
            accessorKey: "createdAt",
            header: "Created At",
            cell: ({ row }) => {
                try {
                    return format(new Date(row.original.createdAt), "PPP");
                } catch {
                    return "Invalid Date";
                }
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const affiliator = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditDialog(affiliator)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => openDeleteDialog(affiliator)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            size: 50,
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Affiliators</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your affiliators here.</p>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-green-700 hover:bg-green-600">
                    Add Affiliator
                </Button>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                <DataTable
                    columns={columns}
                    data={data}
                    isLoading={loading}
                    showSearch
                    searchKey="name"
                    searchPlaceholder="Search by name..."
                />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentAffiliator ? "Edit Affiliator" : "Add Affiliator"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={!!currentAffiliator}
                                placeholder="john.doe@example.com"
                                className={currentAffiliator ? "bg-gray-100" : ""}
                            />
                            {currentAffiliator && (
                                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                            )}
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-green-700 hover:bg-green-600">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {currentAffiliator ? "Save Changes" : "Create Affiliator"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the affiliator
                            <span className="font-semibold text-gray-900"> {currentAffiliator?.name}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
