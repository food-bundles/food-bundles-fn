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

export const stageLabel = (status: string) => STAGE_LABELS[status] ?? status;
