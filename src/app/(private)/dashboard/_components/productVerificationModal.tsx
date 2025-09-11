"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Save,
  X,
  User,
  MapPin,
  Calendar,
  Package,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import {
  FarmerSubmission,
  useSubmissions,
} from "@/app/contexts/submission-context";

interface ProductVerificationModalProps {
  submission: FarmerSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  mode: "view" | "verify" | "edit";
  onModeChange: (mode: "view" | "verify" | "edit") => void;
}

export function ProductVerificationModal({
  submission,
  isOpen,
  onClose,
  mode,
  onModeChange,
}: ProductVerificationModalProps) {
  const { purchaseSubmission } = useSubmissions();

  // Form states
  const [acceptedPrice, setAcceptedPrice] = useState<number>(0);
  const [acceptedQuantity, setAcceptedQuantity] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form values when submission changes
  useEffect(() => {
    if (submission) {
      setAcceptedPrice(submission.acceptedPrice || submission.wishedPrice || 0);
      setAcceptedQuantity(
        submission.acceptedQty || submission.submittedQty || 0
      );
      setNotes("");
    }
  }, [submission]);

  if (!submission) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-RW", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACCEPTED":
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "VERIFIED":
        return "bg-blue-100 text-blue-800";
      case "PAID":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleVerify = async (action: "accept" | "reject") => {
    if (!submission) return;

    try {
      setIsSubmitting(true);

      if (action === "accept") {
        // Validate inputs
        if (acceptedPrice <= 0) {
          toast.error("Please enter a valid price");
          return;
        }
        if (acceptedQuantity <= 0) {
          toast.error("Please enter a valid quantity");
          return;
        }
        if (acceptedQuantity > submission.submittedQty) {
          toast.error("Accepted quantity cannot exceed submitted quantity");
          return;
        }

        // Call the purchase submission API
        await purchaseSubmission(submission.id, {
          acceptedQty: acceptedQuantity,
          unitPrice: acceptedPrice,
        });

        toast.success("Product verified and accepted successfully!");
      } else {
        // Handle rejection logic here
        toast.success("Product rejected successfully!");
      }

      onClose();
      // Refresh the data or trigger parent component update
      window.location.reload(); // Simple refresh, you might want to implement a more elegant solution
    } catch (error) {
      console.error("Error verifying submission:", error);
      toast.error("Failed to verify submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setIsSubmitting(true);

      // Call API to update the submission
      await purchaseSubmission(submission.id, {
        acceptedQty: acceptedQuantity,
        unitPrice: acceptedPrice,
      });

      toast.success("Submission updated successfully!");
      onModeChange("view");
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error("Error updating submission:", error);
      toast.error("Failed to update submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const farmerName =
    submission.farmer.email.split("@")[0] || submission.farmer.phone;
  const totalAmount = acceptedPrice * acceptedQuantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-6 w-[60%] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            {mode === "view" && "Product Submission Details"}
            {mode === "verify" && "Verify Product Submission"}
            {mode === "edit" && "Edit Verification"}
          </DialogTitle>
          <div className="flex items-center space-x-2">
            {mode === "view" && submission.status === "PENDING" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onModeChange("verify")}
              >
                <Edit className="h-4 w-4 mr-2" />
                Verify
              </Button>
            )}
            {mode === "view" && submission.status === "ACCEPTED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onModeChange("edit")}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {(mode === "verify" || mode === "edit") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onModeChange("view")}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Only
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Farmer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2" />
                Farmer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder-avatar.png" />
                  <AvatarFallback>
                    {farmerName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-lg">{farmerName}</p>
                  <p className="text-sm text-gray-500">
                    {submission.farmer.phone}
                  </p>
                  <p className="text-sm text-gray-500">
                    {submission.farmer.email}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium">Location:</span>
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  {submission.village}, {submission.cell}, {submission.sector}
                  <br />
                  {submission.district}, {submission.province}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submission Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Package className="h-5 w-5 mr-2" />
                Submission Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Product</Label>
                  <p className="text-sm">{submission.productName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(submission.status)}>
                    {submission.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">
                    Submitted Quantity
                  </Label>
                  <p className="text-sm">{submission.submittedQty} kg</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Proposed Price</Label>
                  <p className="text-sm">
                    {formatCurrency(submission.wishedPrice)}/kg
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Submitted At
                </Label>
                <p className="text-sm">
                  {formatDateTime(submission.submittedAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Section */}
        {(mode === "verify" || mode === "edit") && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <DollarSign className="h-5 w-5 mr-2" />
                {mode === "verify"
                  ? "Set Verification Details"
                  : "Edit Verification"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="acceptedPrice">Accepted Price (RWF/kg)</Label>
                  <Input
                    id="acceptedPrice"
                    type="number"
                    value={acceptedPrice}
                    onChange={(e) => setAcceptedPrice(Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="acceptedQuantity">
                    Accepted Quantity (kg)
                  </Label>
                  <Input
                    id="acceptedQuantity"
                    type="number"
                    value={acceptedQuantity}
                    onChange={(e) =>
                      setAcceptedQuantity(Number(e.target.value))
                    }
                    min="0"
                    max={submission.submittedQty}
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    <p className="font-medium">{formatCurrency(totalAmount)}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this verification..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Verification Details (View Mode) */}
        {mode === "view" &&
          (submission.acceptedQty || submission.acceptedPrice) && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Verification Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Accepted Price
                    </Label>
                    <p className="text-sm">
                      {formatCurrency(submission.acceptedPrice || 0)}/kg
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Accepted Quantity
                    </Label>
                    <p className="text-sm">{submission.acceptedQty || 0} kg</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Amount</Label>
                    <p className="text-sm font-medium">
                      {formatCurrency(submission.totalAmount || 0)}
                    </p>
                  </div>
                </div>
                {submission.verifiedAt && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Verified At</Label>
                    <p className="text-sm">
                      {formatDateTime(submission.verifiedAt)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>

          <div className="flex space-x-2">
            {mode === "verify" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleVerify("reject")}
                  disabled={isSubmitting}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleVerify("accept")}
                  disabled={isSubmitting}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Verifying..." : "Accept & Verify"}
                </Button>
              </>
            )}

            {mode === "edit" && (
              <Button onClick={handleSaveEdit} disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
