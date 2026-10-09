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
    case "REJECTED":
    case "Rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/** The submission's real DB status never becomes "REJECTED" — a farmer's rejection of a
 * verified offer lives on farmerFeedbackStatus while status itself stays VERIFIED. This
 * derives the label the farmer should actually see, without touching the real status. */
export function deriveDisplayStatus(
  status: string,
  farmerFeedbackStatus: string | null
): string {
  return farmerFeedbackStatus === "REJECTED" ? "REJECTED" : status;
}
