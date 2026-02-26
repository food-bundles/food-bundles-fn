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
      const response = await axiosClient.get("/products");
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to record price");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Record Market Price</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product">Product</Label>
            <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.productName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="market">Market</Label>
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
            <Label htmlFor="marketPrice">Market Price (RWF)</Label>
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
