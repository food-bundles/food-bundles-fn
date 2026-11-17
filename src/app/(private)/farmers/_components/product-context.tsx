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
  counterOfferPrice?: number | null
  agreedPrice?: number | null
  /** What Food Bundles pays per unit for this product */
  foodBundlesPrice?: number | null
  farmerFeedbackStatus: "PENDING" | "ACCEPTED" | "REJECTED" | "EXTENDED" | null
  feedbackDeadline: string | null
  /** The aggregator who receives the harvest */
  aggregator?: { name: string; phone: string | null } | null
  /** How it was paid, once paid */
  paymentMethod?: "MOMO" | "CASH" | null
}
