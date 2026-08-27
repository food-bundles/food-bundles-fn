export interface Product {
  id: string
  submissionId?: string
  name: string
  category: {
    id: string
    name: string
    description?: string
  }
  quantity: string
  unit?: string
  submittedDate: string
  price: string
  status: string
  /** Display-only status: shows REJECTED when the farmer rejected a verified offer,
   * since the underlying submission status itself never becomes REJECTED. */
  displayStatus: string
  statusColor: string
  image: string
  location: string
  priceValue: number
  paidDate?: string
  acceptedQty: number | null
  acceptedPrice: number | null
  farmerFeedbackStatus: "PENDING" | "ACCEPTED" | "REJECTED" | "EXTENDED" | null
  feedbackDeadline: string | null
}
