"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { UnitFormData } from "@/app/services/unitService";

interface Unit {
  id: string;
  tableTronicId: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

interface UnitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: Unit | null;
  onSubmit: (data: UnitFormData) => Promise<void>;
}

export function UnitModal({
  open,
  onOpenChange,
  unit,
  onSubmit,
}: UnitModalProps) {
  const [formData, setFormData] = useState<UnitFormData>({
    tableTronicId: 0,
    name: "",
    description: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (unit) {
      setFormData({
        tableTronicId: unit.tableTronicId,
        name: unit.name,
        description: unit.description || "",
        isActive: unit.isActive ?? true,
      });
    } else {
      setFormData({
        tableTronicId: 0,
        name: "",
        description: "",
        isActive: true,
      });
    }
  }, [unit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.tableTronicId) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{unit ? "Edit Unit" : "Create New Unit"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tableTronicId">Table Tronic ID *</Label>
            <Input
              id="tableTronicId"
              type="number"
              value={formData.tableTronicId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  tableTronicId: Number(e.target.value) || 0,
                }))
              }
              placeholder="Enter table tronic ID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter unit name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter unit description"
              rows={3}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : unit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}