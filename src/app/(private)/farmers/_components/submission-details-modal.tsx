"use client";

import { stageLabel } from "./status-helpers";
import { useEffect, useState } from "react";
import { Package, Tag, Hash, MapPin, Calendar, Phone, UserRound, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useSubmissions } from "@/app/contexts/submission-context";
import { showToast } from "@/lib/toast";
import type { Product } from "./product-context";
import { farmerDashboardService, type FarmerSubmissionDetail } from "@/app/services/farmerDashboardService";

interface SubmissionDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  getStatusColor: (status: string) => string;
  onFeedbackSubmitted?: () => void;
}

const DETAIL_ROWS = (
  product: Product,
): Array<{ icon: typeof Package; iconBg: string; iconColor: string; label: string; value: string }> => [
  { icon: Package, iconBg: "bg-blue-100", iconColor: "text-blue-600", label: "Name", value: product.name },
  { icon: Tag, iconBg: "bg-purple-100", iconColor: "text-purple-600", label: "Category", value: product.category.name },
  { icon: Hash, iconBg: "bg-[#E3F3E8]", iconColor: "text-[#007A35]", label: "Quantity", value: product.quantity },
  { icon: MapPin, iconBg: "bg-red-100", iconColor: "text-red-600", label: "Location", value: product.location },
  { icon: Calendar, iconBg: "bg-indigo-100", iconColor: "text-indigo-600", label: "Submitted", value: product.submittedDate },
];

type Action = "ACCEPTED" | "REJECTED" | "EXTENDED" | null;

/** Click-to-open submission detail view, with farmer accept/reject/counter-offer actions on VERIFIED submissions. */
export function SubmissionDetailsModal({
  product,
  onClose,
  getStatusColor,
  onFeedbackSubmitted,
}: SubmissionDetailsModalProps) {
  const { submitFarmerFeedback } = useSubmissions();
  const [action, setAction] = useState<Action>(null);
  const [notes, setNotes] = useState("");
  const [counterOffer, setCounterOffer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Payment details (the number it was paid to) and the drop-off site come with the submission's detail
  const [detail, setDetail] = useState<FarmerSubmissionDetail | null>(null);

  useEffect(() => {
    setDetail(null);
    const id = product?.submissionId ?? product?.id;
    if (!id) return;
    let active = true;
    farmerDashboardService
      .getSubmissionDetail(id)
      .then((d) => active && setDetail(d))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [product?.id, product?.submissionId]);

  const aggregator = detail?.aggregator ?? product?.aggregator ?? null;
  const payment = detail?.payment ?? null;
  const paidBy = payment?.method ?? product?.paymentMethod ?? null;

  // A counter-offer from Food Bundles the farmer answers
  const awaitingFeedback = !!product && product.status === "NEGOTIATING" && !!product.counterOfferPrice;

  const resetForm = () => {
    setAction(null);
    setNotes("");
    setCounterOffer("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmitFeedback = async () => {
    if (!product?.submissionId && !product?.id) return;
    if (!action) return;

    if (action === "EXTENDED" && !(Number(counterOffer) > 0)) {
      showToast("error", "Enter the price you want per unit.");
      return;
    }

    try {
      setSubmitting(true);
      await submitFarmerFeedback(product.submissionId ?? product.id, {
        feedbackStatus: action,
        notes: notes || undefined,
        counterOffer: counterOffer ? Number(counterOffer) : undefined,

      });
      showToast(
        "success",
        action === "ACCEPTED"
          ? "Offer accepted. Your product is approved."
          : action === "REJECTED"
            ? "Offer declined."
            : "Your price was sent to Food Bundles."
      );
      resetForm();
      onFeedbackSubmitted?.();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit feedback. Please try again.";
      showToast("error", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#007A35]" />
            Product Details
          </DialogTitle>
        </DialogHeader>

        {product && (
          <div className="flex flex-col gap-3 text-sm text-[#2E4A3B] mt-2">
            {DETAIL_ROWS(product).map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-lg ${row.iconBg} flex items-center justify-center shrink-0`}>
                    <row.icon className={`w-3 h-3 ${row.iconColor}`} />
                  </div>
                  <span className="font-medium">{row.label}:</span>
                </div>
                <span className="text-right">{row.value}</span>
              </div>
            ))}

            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-yellow-600" />
                </div>
                <span className="font-medium">Price:</span>
              </div>
              <span className="text-right font-semibold">{product.price}</span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-[#F6F9F7] flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-gray-600" />
                </div>
                <span className="font-medium">Status:</span>
              </div>
              <Badge className={`${getStatusColor(product.displayStatus)} border-0 text-xs`}>
                {stageLabel(product.displayStatus)}
              </Badge>
            </div>

            {product.foodBundlesPrice != null && product.foodBundlesPrice > 0 && (
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-600" />
                  </div>
                  <span className="font-medium">Food Bundles price:</span>
                </div>
                <span className="text-right font-semibold text-green-700">
                  RWF {product.foodBundlesPrice.toLocaleString()} per {product.unit}
                </span>
              </div>
            )}

            {/* Who receives the harvest, with a number to call */}
            <div className="rounded-lg border border-gray-100 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <UserRound className="w-3.5 h-3.5 text-green-700" /> Your aggregator
              </div>
              {aggregator ? (
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{aggregator.name}</p>
                    <p className="text-xs text-gray-500">
                      {aggregator.phone ?? "No phone number yet. Call 8000 to get it."}
                    </p>
                  </div>
                  <a
                    href={`tel:${aggregator.phone || "8000"}`}
                    className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                </div>
              ) : (
                <p className="mt-1.5 text-xs text-gray-500">Not assigned yet. You will see their name and number here.</p>
              )}
              {detail?.deliverySite && (
                <p className="mt-2 flex items-center gap-1 text-xs text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> Bring it to {detail.deliverySite.name}
                </p>
              )}
            </div>

            {/* How it was paid */}
            {product.status === "PAID" && paidBy && (
              <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-xs text-green-900">
                <div className="flex items-center gap-2 font-medium">
                  <Wallet className="w-3.5 h-3.5" /> Paid by {paidBy === "MOMO" ? "Mobile Money (MoMo)" : "cash"}
                </div>
                <p className="mt-1">
                  {payment ? `RWF ${payment.amount.toLocaleString()}` : ""}
                  {payment?.paidTo ? ` to ••${payment.paidTo.slice(-3)}` : ""}
                  {payment?.paidAt ? ` on ${new Date(payment.paidAt).toLocaleDateString()}` : ""}
                </p>
              </div>
            )}

            {awaitingFeedback && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                Food Bundles offers <strong>RWF {product.counterOfferPrice!.toLocaleString()}</strong> per unit
                (you asked {product.price}). Accept, decline, or propose your own price.
              </div>
            )}
            {product.agreedPrice != null && ["APPROVED", "VERIFIED", "PAID"].includes(product.status) && (
              <div className="rounded-lg bg-[#EFFAF3] border border-green-100 p-3 text-xs text-green-900">
                Agreed price: RWF {product.agreedPrice.toLocaleString()} per unit
                {product.acceptedQty != null && ` · received ${product.acceptedQty} units`}
              </div>
            )}

            {awaitingFeedback && !action && (
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-[#4A6358]">Respond to this offer:</p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-[#0B2E1F] hover:bg-[#0F5C36] flex-1" onClick={() => setAction("ACCEPTED")}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setAction("EXTENDED")}>
                    My price
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => setAction("REJECTED")}>
                    Decline
                  </Button>
                </div>
              </div>
            )}

            {action && (
              <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
                {action === "EXTENDED" && (
                  <Input
                    type="number"
                    min="1"
                    placeholder="Your price per unit (RWF)"
                    value={counterOffer}
                    onChange={(e) => setCounterOffer(e.target.value)}
                  />
                )}
                <Textarea
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-[#0B2E1F] hover:bg-[#0F5C36] flex-1"
                    onClick={handleSubmitFeedback}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit response"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={resetForm} disabled={submitting}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
