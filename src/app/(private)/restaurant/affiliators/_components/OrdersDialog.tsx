"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { affiliatorService } from "@/app/services/affiliatorService";
import type { ManagedAffiliator } from "@/app/services/affiliatorManageService";

/** The orders an affiliator placed for the business */
export function OrdersDialog({ affiliator, onClose }: { affiliator: ManagedAffiliator | null; onClose: () => void }) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!affiliator) return;
        setLoading(true);
        setOrders([]);
        affiliatorService
            .getAffiliator(affiliator.id)
            .then((res) => setOrders(res.data?.orders || []))
            .catch(() => toast.error("Failed to fetch affiliator orders"))
            .finally(() => setLoading(false));
    }, [affiliator]);

    return (
        <Dialog open={!!affiliator} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Orders for {affiliator?.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-green-700" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">No orders found for this affiliator.</div>
                    ) : (
                        <div className="border rounded-lg overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                                    <tr>
                                        <th className="px-4 py-3">Order #</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                                            <td className="px-4 py-3">{Number(order.totalAmount ?? 0).toLocaleString()} RWF</td>
                                            <td className="px-4 py-3">{order.status}</td>
                                            <td className="px-4 py-3">{format(new Date(order.createdAt), "PP")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
