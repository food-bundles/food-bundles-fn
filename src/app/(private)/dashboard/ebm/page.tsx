"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { RefreshCw, Database, Globe, Receipt } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ebmService } from "@/app/services/ebmService";
import { EbmItemsTable } from "./_components/EbmItemsTable";

export default function EbmItemsPage() {
  const [apiItems, setApiItems] = useState<any[]>([]);
  const [dbItems, setDbItems] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [dbSales, setDbSales] = useState<any[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [isDbLoading, setIsDbLoading] = useState(false);
  const [isSalesLoading, setIsSalesLoading] = useState(false);
  const [isDbSalesLoading, setIsDbSalesLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [salesFromDate, setSalesFromDate] = useState("");

  const fetchApiItems = useCallback(async () => {
    try {
      setIsApiLoading(true);
      const date = fromDate ? new Date(fromDate) : undefined;
      const res = await ebmService.getItemsFromApi(date);
      // response shape: { success, data: { message, data: [...] } }
      const items = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setApiItems(items);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch EBM API items");
    } finally {
      setIsApiLoading(false);
    }
  }, [fromDate]);

  const fetchDbItems = useCallback(async () => {
    try {
      setIsDbLoading(true);
      const res = await ebmService.getItemsFromDb();
      setDbItems(Array.isArray(res?.data) ? res.data : []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch DB items");
    } finally {
      setIsDbLoading(false);
    }
  }, []);

  const fetchSales = useCallback(async () => {
    try {
      setIsSalesLoading(true);
      const date = salesFromDate ? new Date(salesFromDate) : undefined;
      const res = await ebmService.getSales(date);
      const items = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setSales(items);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch EBM sales");
    } finally {
      setIsSalesLoading(false);
    }
  }, [salesFromDate]);

  const fetchDbSales = useCallback(async () => {
    try {
      setIsDbSalesLoading(true);
      const res = await ebmService.getSalesFromDb();
      setDbSales(Array.isArray(res?.data) ? res.data : []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch DB sales");
    } finally {
      setIsDbSalesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiItems();
    fetchDbItems();
    fetchSales();
    fetchDbSales();
  }, [fetchApiItems, fetchDbItems, fetchSales, fetchDbSales]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">EBM Items (IMB)</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and view items registered with the Electronic Billing Machine
          </p>
        </div>
      </div>

      <Tabs defaultValue="api" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            EBM API Items
          </TabsTrigger>
          <TabsTrigger value="db" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Food Bundles DB Items
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            EBM Sales (API)
          </TabsTrigger>
          <TabsTrigger value="dbsales" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            FB DB Sales
          </TabsTrigger>
        </TabsList>

        {/* EBM API Tab */}
        <TabsContent value="api" className="space-y-4">
          <div className="flex items-end gap-4 bg-white p-4 rounded-lg border">
            <div className="space-y-1">
              <Label htmlFor="fromDate" className="text-xs font-medium">
                From Date (optional)
              </Label>
              <Input
                id="fromDate"
                type="datetime-local"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-56 text-xs"
              />
            </div>
            <Button
              onClick={fetchApiItems}
              disabled={isApiLoading}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isApiLoading ? "animate-spin" : ""}`} />
              {isApiLoading ? "Loading..." : "Fetch"}
            </Button>
          </div>
          <EbmItemsTable items={apiItems} isLoading={isApiLoading} source="api" />
        </TabsContent>

        {/* DB Tab */}
        <TabsContent value="db" className="space-y-4">
          <div className="flex justify-end bg-white p-4 rounded-lg border">
            <Button
              onClick={fetchDbItems}
              disabled={isDbLoading}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isDbLoading ? "animate-spin" : ""}`} />
              {isDbLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>
          <EbmItemsTable items={dbItems} isLoading={isDbLoading} source="db" />
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="flex items-end gap-4 bg-white p-4 rounded-lg border">
            <div className="space-y-1">
              <Label htmlFor="salesFromDate" className="text-xs font-medium">From Date (optional)</Label>
              <Input
                id="salesFromDate"
                type="datetime-local"
                value={salesFromDate}
                onChange={(e) => setSalesFromDate(e.target.value)}
                className="w-56 text-xs"
              />
            </div>
            <Button
              onClick={fetchSales}
              disabled={isSalesLoading}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSalesLoading ? "animate-spin" : ""}`} />
              {isSalesLoading ? "Loading..." : "Fetch"}
            </Button>
          </div>
          {isSalesLoading ? (
            <div className="text-center py-10 text-gray-500 text-sm">Loading sales...</div>
          ) : sales.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">No sales found</div>
          ) : (
            <div className="bg-white rounded-lg border overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["Invoice No", "Order No", "Payment", "Items", "Total", "Status", "Date"].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale: any, i: number) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono">{sale.invoice_no ?? sale.invoiceNo ?? "-"}</td>
                      <td className="px-3 py-2">{sale.order_no ?? sale.orderNo ?? "-"}</td>
                      <td className="px-3 py-2 uppercase">{sale.payment_method ?? sale.paymentMethod ?? "-"}</td>
                      <td className="px-3 py-2">{Array.isArray(sale.items) ? sale.items.length : "-"}</td>
                      <td className="px-3 py-2">{sale.total_amount ?? sale.totalAmount ?? "-"}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full border text-[11px] ${
                          sale.status === "APPROVED" ? "bg-green-100 text-green-700 border-green-200" :
                          sale.status === "FAILED" ? "bg-red-100 text-red-700 border-red-200" :
                          "bg-gray-100 text-gray-700 border-gray-200"
                        }`}>{sale.status ?? "-"}</span>
                      </td>
                      <td className="px-3 py-2">{sale.created_at ?? sale.createdAt ? new Date(sale.created_at ?? sale.createdAt).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* FB DB Sales Tab */}
        <TabsContent value="dbsales" className="space-y-4">
          <div className="flex justify-end bg-white p-4 rounded-lg border">
            <Button
              onClick={fetchDbSales}
              disabled={isDbSalesLoading}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isDbSalesLoading ? "animate-spin" : ""}`} />
              {isDbSalesLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>
          {isDbSalesLoading ? (
            <div className="text-center py-10 text-gray-500 text-sm">Loading...</div>
          ) : dbSales.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">No sales found in database</div>
          ) : (
            <div className="bg-white rounded-lg border overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["Invoice No", "Order No", "Type", "Payment", "Items", "Status", "Refund Reason", "Date"].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dbSales.map((sale: any, i: number) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono">{sale.invoiceNo}</td>
                      <td className="px-3 py-2">{sale.order?.orderNumber ?? "-"}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full border text-[11px] ${
                          sale.type === "SALE" ? "bg-blue-100 text-blue-700 border-blue-200" :
                          sale.type === "REFUND" ? "bg-orange-100 text-orange-700 border-orange-200" :
                          "bg-gray-100 text-gray-700 border-gray-200"
                        }`}>{sale.type}</span>
                      </td>
                      <td className="px-3 py-2 uppercase">{sale.paymentMethod}</td>
                      <td className="px-3 py-2">{Array.isArray(sale.itemsSnapshot) ? sale.itemsSnapshot.length : "-"}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full border text-[11px] ${
                          sale.status === "SUBMITTED" ? "bg-green-100 text-green-700 border-green-200" :
                          sale.status === "FAILED" ? "bg-red-100 text-red-700 border-red-200" :
                          "bg-gray-100 text-gray-700 border-gray-200"
                        }`}>{sale.status}</span>
                      </td>
                      <td className="px-3 py-2">{sale.refundReason ?? "-"}</td>
                      <td className="px-3 py-2">{new Date(sale.submittedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
