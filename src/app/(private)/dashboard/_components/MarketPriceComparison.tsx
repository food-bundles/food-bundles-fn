"use client";

import { useState, useEffect } from "react";
import { marketService, PriceHistory } from "@/app/services/marketService";
import { toast } from "sonner";
import { Search } from "lucide-react";

export function MarketPriceComparison() {
    const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await marketService.getPriceHistory(1, 100);
            setPriceHistory(response.data);
        } catch {
            toast.error("Failed to fetch price comparison data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-24 bg-gray-100 rounded"></div>
            </div>
        );
    }

    const pivotedData = new Map();
    priceHistory
        .filter(
            (item) =>
                (item.product.productName || "").toLowerCase().includes(search.toLowerCase()) ||
                item.market.name.toLowerCase().includes(search.toLowerCase())
        )
        .forEach((item) => {
            const productName = item.product.productName;
            if (!pivotedData.has(productName)) {
                pivotedData.set(productName, { ourPrice: item.ourPrice, markets: {} });
            }
            pivotedData.get(productName).markets[item.market.name] = item.marketPrice;
        });

    const marketNames = [...new Set(priceHistory.map((item) => item.market.name))];

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Market Price Comparison
                </h3>
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-3 h-8 w-full sm:w-64 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 border-b uppercase">Product</th>
                            <th className="text-right py-3 px-4 text-xs font-bold text-green-700 border-b uppercase">FoodBundles</th>
                            {marketNames.map((name) => (
                                <th key={name} className="text-right py-3 px-4 text-xs font-bold text-gray-700 border-b uppercase">
                                    {name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from(pivotedData.entries()).map(([productName, data]: [string, any], idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 text-sm font-medium text-gray-900">{productName}</td>
                                <td className="py-3 px-4 text-sm text-right text-green-700 font-semibold">
                                    {data.ourPrice.toLocaleString()} RWF
                                </td>
                                {marketNames.map((marketName) => (
                                    <td key={marketName} className="py-3 px-4 text-sm text-right text-gray-700">
                                        {data.markets[marketName]
                                            ? `${data.markets[marketName].toLocaleString()} RWF`
                                            : <span className="text-gray-400">—</span>}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {pivotedData.size === 0 && (
                            <tr>
                                <td colSpan={marketNames.length + 2} className="py-8 text-center text-gray-500 text-sm">
                                    No price data found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
