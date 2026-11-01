"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product } from "@/app/contexts/product-context";
import { ebmService } from "@/app/services/ebmService";

const PACKAGING_UNITS = ["AM","BA","BC","BE","BF","BG","BJ","BK","BL","BQ","BR","BV","BZ","CA","CH","CJ","CL","CR","CS","CT","CTN","CY","DR","GT","HH","IZ","JR","JU","JY","KZ","LZ","NT","OU","PD","PG","PI","PO","PU","RL","RO","RZ","SK","TY","VG","VL","VO","VQ","VR","VT","VY","ML","TN"];
const QUANTITY_UNITS = ["4B","AV","BA","BE","BG","BL","BLL","BX","CA","CEL","CMT","CR","DR","DZ","GLL","GRM","GRO","KG","KTM","KWT","L","LBR","LK","LTR","M","M2","M3","MGM","MTR","MWT","NO","NX","PA","PG","PR","RL","RO","SET","ST","TNE","TU","U","YRD"];

interface EbmRegisterModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EbmRegisterModal({ product, open, onOpenChange, onSuccess }: EbmRegisterModalProps) {
  const [itemType, setItemType] = useState("FINISHED_PRODUCT");
  const [taxType, setTaxType] = useState("B");
  const [packagingUnit, setPackagingUnit] = useState("NT");
  const [quantityUnit, setQuantityUnit] = useState("U");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!product) return;
    try {
      setIsLoading(true);
      const res = await ebmService.registerItemForProduct(product.id, { itemType, taxType, packagingUnit, quantityUnit });
      if (res.success) {
        toast.success(`EBM: ${res.message}`);
        onSuccess();
        onOpenChange(false);
      } else {
        toast.warning(`EBM: ${res.message}`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to register EBM item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-2 border-green-500">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Register to EBM (IMB)</DialogTitle>
          <p className="text-xs text-gray-500 mt-1">
            Product: <span className="font-medium text-gray-800">{product?.productName}</span>
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Item Type</Label>
              <Select value={itemType} onValueChange={setItemType}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FINISHED_PRODUCT">Finished Product</SelectItem>
                  <SelectItem value="RAW_MATERIAL">Raw Material</SelectItem>
                  <SelectItem value="SERVICE">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Tax Type</Label>
              <Select value={taxType} onValueChange={setTaxType}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A (Standard)</SelectItem>
                  <SelectItem value="B">B (Zero-rated)</SelectItem>
                  <SelectItem value="A-EX">A-EX (Exempt)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Packaging Unit</Label>
              <Select value={packagingUnit} onValueChange={setPackagingUnit}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-52">
                  {PACKAGING_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Quantity Unit</Label>
              <Select value={quantityUnit} onValueChange={setQuantityUnit}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-52">
                  {QUANTITY_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
            {isLoading ? "Registering..." : "Register to EBM"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
