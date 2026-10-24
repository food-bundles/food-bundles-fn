"use client";

import { useEffect, useState } from "react";
import { Banknote, Loader2, Lock, Smartphone } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  agreedPriceOf,
  askedPriceOf,
  farmerDisplayName,
  type FarmerSubmission,
  type SubmissionStage,
} from "@/app/contexts/submission-context";
import { submissionService } from "@/app/services/submissionServices";
import { useAdminAccess } from "@/app/hooks/useAdminAccess";

const rwf = (value: number | null | undefined) => `${Math.round(value ?? 0).toLocaleString()} RWF`;

const errorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
  (error as Error)?.message ||
  fallback;

// ─── Stage progress (Submitted → Approved → Verified → Paid) ──────────────────
const STEPS: Array<{ key: SubmissionStage; label: string }> = [
  { key: "PENDING", label: "Submitted" },
  { key: "APPROVED", label: "Approved" },
  { key: "VERIFIED", label: "Verified" },
  { key: "PAID", label: "Paid" },
];

const stepIndex = (status: SubmissionStage) =>
  status === "NEGOTIATING" ? 0 : Math.max(0, STEPS.findIndex((s) => s.key === status));

/** Compact progress through the four stages, with the current one named. */
export function StageProgress({ status }: { status: SubmissionStage }) {
  if (status === "REJECTED") {
    return (
      <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
        Rejected
      </span>
    );
  }
  const current = stepIndex(status);
  const label =
    status === "NEGOTIATING" ? "Waiting for farmer" : STEPS[current]?.label ?? status;
  return (
    <div className="flex min-w-32 flex-col gap-1">
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => (
          <span
            key={step.key}
            title={step.label}
            className={`h-1.5 flex-1 rounded-full ${
              i < current || status === "PAID"
                ? "bg-green-600"
                : i === current
                  ? status === "NEGOTIATING"
                    ? "bg-amber-400"
                    : "bg-green-400"
                  : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <span
        className={`text-xs font-medium ${
          status === "NEGOTIATING" ? "text-amber-700" : status === "PAID" ? "text-green-700" : "text-gray-700"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

interface StageModalProps {
  submission: FarmerSubmission | null;
  onClose: () => void;
  onDone: () => void;
}

function PriceLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={strong ? "font-semibold text-gray-900" : "text-gray-900"}>{value}</span>
    </div>
  );
}

// ─── Stage 2: approve, or send a counter offer ───────────────────────────────
export function ApproveSubmissionModal({ submission, onClose, onDone }: StageModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [foodBundlesPrice, setFoodBundlesPrice] = useState<number | null>(null);
  const [canSetPrice, setCanSetPrice] = useState(false);
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (!submission) return;
    setLoading(true);
    submissionService
      .getSubmissionPrice(submission.id)
      .then((res) => {
        setFoodBundlesPrice(res.data.foodBundlesPrice);
        setCanSetPrice(res.data.canSetPrice);
        setPrice(res.data.foodBundlesPrice ? String(res.data.foodBundlesPrice) : "");
      })
      .catch((error) => toast.error(errorMessage(error, "Failed to load prices")))
      .finally(() => setLoading(false));
  }, [submission]);

  if (!submission) return null;
  const asked = askedPriceOf(submission);
  const value = Number(price) || 0;
  const approves = value > 0 && value >= asked;
  const missingPrice = !foodBundlesPrice && !canSetPrice;

  const submit = async () => {
    setSaving(true);
    try {
      await submissionService.approveSubmission(submission.id, canSetPrice ? value : undefined);
      toast.success(approves ? "Submission approved" : "Counter offer sent to the farmer");
      onDone();
      onClose();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to approve submission"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!submission} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve submission</DialogTitle>
          <DialogDescription>
            {submission.submittedQty} {submission.productName} from {farmerDisplayName(submission.farmer)}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-green-600" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 rounded-lg border bg-gray-50 p-3">
              <PriceLine
                label={submission.farmerCounterOffer ? "Farmer asks (new price)" : "Farmer asks"}
                value={`${rwf(asked)} / unit`}
                strong
              />
              <PriceLine
                label="Food Bundles price"
                value={foodBundlesPrice ? `${rwf(foodBundlesPrice)} / unit` : "Not in stock yet"}
                strong
              />
            </div>

            {missingPrice ? (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                This product has no Food Bundles price in stock yet. Someone allowed to set prices must
                approve it.
              </p>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="approve-price" className="flex items-center gap-1.5">
                  Price per unit (RWF)
                  {!canSetPrice && <Lock className="h-3.5 w-3.5 text-gray-400" />}
                </Label>
                <Input
                  id="approve-price"
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={!canSetPrice || saving}
                />
                {!canSetPrice && (
                  <p className="text-xs text-gray-500">The Food Bundles price is used. You can&apos;t change it.</p>
                )}
                {value > 0 && (
                  <p
                    className={`rounded-md px-3 py-2 text-xs ${
                      approves ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {approves
                      ? `The farmer asked ${rwf(asked)}, so this is approved right away at ${rwf(value)}.`
                      : `This is less than the farmer asked (${rwf(asked)}), so it goes to them as a counter offer. It is approved only if they accept.`}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={loading || saving || missingPrice || value <= 0}
            className={approves ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {approves ? `Approve at ${rwf(value)}` : `Send counter offer ${rwf(value)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Stage 3: verify face to face ────────────────────────────────────────────
export function VerifySubmissionModal({ submission, onClose, onDone }: StageModalProps) {
  const { can } = useAdminAccess();
  const canSetPrice = can("farmer_submissions", "set_price");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!submission) return;
    setQuantity(String(submission.submittedQty ?? ""));
    // Older approvals kept the price in acceptedPrice
    const agreed = agreedPriceOf(submission);
    setPrice(agreed ? String(agreed) : "");
  }, [submission]);

  if (!submission) return null;
  const qty = Number(quantity) || 0;
  const unitPrice = Number(price) || 0;
  const tooMuch = qty > (submission.submittedQty ?? Infinity);

  const submit = async () => {
    setSaving(true);
    try {
      await submissionService.purchaseSubmission(submission.id, { acceptedQty: qty, unitPrice });
      toast.success("Submission verified");
      onDone();
      onClose();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to verify submission"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!submission} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify submission</DialogTitle>
          <DialogDescription>
            Weigh the {submission.productName} with {farmerDisplayName(submission.farmer)} and record what you
            receive.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2 rounded-lg border bg-gray-50 p-3">
            <PriceLine label="Submitted" value={`${submission.submittedQty}`} />
            <PriceLine label="Agreed price" value={`${rwf(agreedPriceOf(submission))} / unit`} strong />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="verify-qty">Quantity received</Label>
              <Input
                id="verify-qty"
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="verify-price" className="flex items-center gap-1.5">
                Price / unit
                {!canSetPrice && <Lock className="h-3.5 w-3.5 text-gray-400" />}
              </Label>
              <Input
                id="verify-price"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={!canSetPrice || saving}
              />
            </div>
          </div>
          {tooMuch && (
            <p className="text-xs text-red-600">
              Can&apos;t be more than the {submission.submittedQty} submitted.
            </p>
          )}
          <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
            <span className="text-sm text-green-800">Total to pay the farmer</span>
            <span className="text-lg font-bold text-green-800">{rwf(qty * unitPrice)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={saving || qty <= 0 || unitPrice <= 0 || tooMuch}
            className="bg-green-600 hover:bg-green-700"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Stage 4: pay the farmer (MoMo or cash) ──────────────────────────────────
export function PaySubmissionModal({ submission, onClose, onDone }: StageModalProps) {
  const [method, setMethod] = useState<"MOMO" | "CASH">("MOMO");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!submission) return;
    setMethod(submission.farmer?.phone ? "MOMO" : "CASH");
    setPhone(submission.farmer?.phone || "");
  }, [submission]);

  if (!submission) return null;

  const submit = async () => {
    setSaving(true);
    try {
      if (method === "CASH") {
        await submissionService.paySubmissionCash(submission.id);
        toast.success("Payment recorded. The farmer gets an SMS receipt.");
      } else {
        await submissionService.paySubmissionMomo(submission.id, phone.trim());
        toast.success("MoMo payment sent. Confirm it in the payout history once it arrives.");
      }
      onDone();
      onClose();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to pay the farmer"));
    } finally {
      setSaving(false);
    }
  };

  const options = [
    { key: "MOMO" as const, label: "Mobile money", hint: "Send to the farmer's MoMo", icon: Smartphone },
    { key: "CASH" as const, label: "Cash", hint: "Already paid by hand", icon: Banknote },
  ];

  return (
    <Dialog open={!!submission} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay farmer</DialogTitle>
          <DialogDescription>
            {submission.acceptedQty} {submission.productName} × {rwf(submission.acceptedPrice)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-3">
            <span className="text-sm text-green-800">Amount</span>
            <span className="text-xl font-bold text-green-800">{rwf(submission.totalAmount)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {options.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setMethod(option.key)}
                className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors cursor-pointer ${
                  method === option.key
                    ? "border-green-600 bg-green-50 ring-1 ring-green-600"
                    : "border-gray-300 hover:border-green-300"
                }`}
              >
                <option.icon className="h-4 w-4 text-green-700" />
                <span className="text-sm font-semibold text-gray-900">{option.label}</span>
                <span className="text-xs text-gray-500">{option.hint}</span>
              </button>
            ))}
          </div>
          {method === "MOMO" && (
            <div className="space-y-1.5">
              <Label htmlFor="pay-phone">MoMo number</Label>
              <Input
                id="pay-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="078XXXXXXX"
                disabled={saving}
              />
            </div>
          )}
          <p className="text-xs text-gray-500">
            Once paid, the amount is added to Food Bundles&apos; expenses.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={saving || (method === "MOMO" && !phone.trim())}
            className="bg-green-600 hover:bg-green-700"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {method === "CASH" ? "Record cash payment" : `Send ${rwf(submission.totalAmount)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
