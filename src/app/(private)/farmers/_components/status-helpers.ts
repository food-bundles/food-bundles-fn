export function getStatusColor(status: string): string {
  switch (status) {
    case "APPROVED":
    case "PAID":
    case "Approved":
      return "bg-green-100 text-green-800";
    case "PENDING":
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "VERIFIED":
    case "Verified":
      return "bg-blue-100 text-blue-800";
    case "NEGOTIATING":
      return "bg-amber-100 text-amber-800";
    case "REJECTED":
    case "Rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/** Status shown to the farmer. Submissions are now REJECTED in their own
 * status; older ones only carried the rejection on farmerFeedbackStatus. */
export function deriveDisplayStatus(
  status: string,
  farmerFeedbackStatus: string | null
): string {
  return farmerFeedbackStatus === "REJECTED" ? "REJECTED" : status;
}

/** Plain words for each stage: submit → approve → verify → pay. */
export const STAGE_LABELS: Record<string, string> = {
  PENDING: "Submitted",
  NEGOTIATING: "Offer waiting for you",
  APPROVED: "Approved",
  VERIFIED: "Received, to be paid",
  PAID: "Paid",
  REJECTED: "Rejected",
};

/** The price Food Bundles put on a submission, if any: agreed once approved, otherwise a pending offer. */
export function foodBundlesPriceNote(p: {
  status: string;
  agreedPrice?: number | null;
  counterOfferPrice?: number | null;
  foodBundlesPrice?: number | null;
}): { label: string; value: string } | null {
  if (p.agreedPrice != null && ["APPROVED", "VERIFIED", "PAID"].includes(p.status)) {
    return { label: "Agreed", value: `RWF ${p.agreedPrice.toLocaleString()}` };
  }
  if (p.counterOfferPrice != null) {
    return { label: "Offer", value: `RWF ${p.counterOfferPrice.toLocaleString()}` };
  }
  if (p.foodBundlesPrice != null && p.foodBundlesPrice > 0) {
    return { label: "Food Bundles", value: `RWF ${p.foodBundlesPrice.toLocaleString()}` };
  }
  return null;
}

export const stageLabel =(status: string) => STAGE_LABELS[status] ?? status;
