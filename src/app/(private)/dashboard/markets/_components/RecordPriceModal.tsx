"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { marketService, Market } from "@/app/services/marketService";
import { toast } from "sonner";
import createAxiosClient from "@/app/hooks/axiosClient";

interface RecordPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  markets: Market[];
}

export default function RecordPriceModal({
  isOpen,
  onClose,
  onSuccess,
  markets,
}: RecordPriceModalProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    productId: "",
    marketId: "",
    marketPrice: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      const axiosClient = createAxiosClient();
      const response = await axiosClient.get("/products?limit=1000");
      setProducts(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await marketService.recordPrice({
        productId: formData.productId,
        marketId: formData.marketId,
        marketPrice: Number(formData.marketPrice),
      });
      toast.success("Price recorded successfully");
      onSuccess();
      onClose();
      setFormData({ productId: "", marketId: "", marketPrice: "" });
      setProductSearch("");
      setSelectedProduct(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to record price");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setFormData({ ...formData, productId: product.id });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Market Price</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product">Product *</Label>
            <Input
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="mb-2"
            />
            <div className="border rounded p-2 space-y-2 h-60 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded" 
                  onClick={() => handleProductSelect(product)}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    selectedProduct?.id === product.id
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedProduct?.id === product.id && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm">
                    {product.productName} - {product.unitPrice.toLocaleString()} RWF
                  </span>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="text-sm text-gray-500 py-2">No products found</div>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="market">Market *</Label>
            <Select value={formData.marketId} onValueChange={(value) => setFormData({ ...formData, marketId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select market" />
              </SelectTrigger>
              <SelectContent>
                {markets.map((market) => (
                  <SelectItem key={market.id} value={market.id}>
                    {market.name} - {market.district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="marketPrice">Market Price (RWF) *</Label>
            <Input
              id="marketPrice"
              type="number"
              value={formData.marketPrice}
              onChange={(e) => setFormData({ ...formData, marketPrice: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? "Recording..." : "Record Price"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
