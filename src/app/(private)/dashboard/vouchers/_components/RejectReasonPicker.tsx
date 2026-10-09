"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

// Standard reasons shown to the restaurant when a loan / loan access is rejected
export const LOAN_REJECT_REASONS = [
  "You have an outstanding loan that is not fully repaid",
  "Requested amount is higher than your approved limit",
  "Not enough order history with Food Bundles yet",
  "Late or missed repayments on previous loans",
  "Business or KYC information is incomplete or not verified",
  "An active subscription is required for this loan",
  "Financing is not available at the moment",
] as const;

const OTHER = "__other__";

/**
 * Pick a predefined rejection reason, or "Other" and type one.
 * Calls onChange with the final text ("" until a usable reason is chosen).
 * Give it a new `key` each time the dialog opens so it starts empty.
 */
export function RejectReasonPicker({
  onChange,
  disabled,
}: {
  onChange: (reason: string) => void;
  disabled?: boolean;
}) {
  const [selected, setSelected] = useState("");
  const [otherText, setOtherText] = useState("");

  const choose = (value: string) => {
    setSelected(value);
    onChange(value === OTHER ? otherText.trim() : value);
  };

  return (
    <div>
      <p className="block text-sm font-medium mb-2">Reason for rejection *</p>
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        {[...LOAN_REJECT_REASONS, OTHER].map((reason) => (
          <label
            key={reason}
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
              selected === reason
                ? "border-red-400 bg-red-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="reject-reason"
              checked={selected === reason}
              onChange={() => choose(reason)}
              disabled={disabled}
              className="mt-0.5 h-4 w-4 accent-red-600"
            />
            <span className="text-gray-800">{reason === OTHER ? "Other reason" : reason}</span>
          </label>
        ))}
      </div>
      {selected === OTHER && (
        <Textarea
          value={otherText}
          onChange={(e) => {
            setOtherText(e.target.value);
            onChange(e.target.value.trim());
          }}
          placeholder="Write the reason..."
          disabled={disabled}
          rows={2}
          className="mt-2 text-sm"
          autoFocus
        />
      )}
    </div>
  );
}
