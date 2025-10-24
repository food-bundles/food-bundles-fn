
export interface IUssdRequest {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
}

export interface ISessionData {
  location?: string;
  password?: string;
  confirmPassword?: string;
  selectedProduct?: string;
  quantity?: string;
  mode?: "register" | "submit";
  wishedPrice?: string;
}

export interface ICreateFarmerData {
  location: string;
  phone?: string;
  email?: string;
  password?: string;
  tin: string;
}

export interface ICreateRestaurantData {
  name: string;
  email: string;
  phone?: string;
  location: string;
  password: string;
  tin: string;
}
export interface ICreateAdministratorsData {
  username: string;
  email: string;
  phone?: string;
  password: string;
  role: "ADMIN" | "AGGREGATOR" |"FOOD_BUNDLE" | "LOGISTIC_OFFICER";
}

export interface IUpdateFarmerData {
  location?: string;
  phone?: string;
  email?: string;
  password?: string;
}

export interface IUpdateRestaurantData {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  password?: string;
}

export interface IPaginationQuery {
  page: number;
  limit: number;
}

export interface ILoginData {
  phone?: string;
  email?: string;
  password: string;
  tin?: string;
}

export interface IPaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
export enum UserRole {
  FARMER = "FARMER",
  RESTAURANT = "RESTAURANT",
  ADMIN = "ADMIN",
  LOGISTIC = "LOGISTIC",
  AGGREGATOR = "AGGREGATOR",
  FOOD_BUNDLE = "FOOD_BUNDLE",
}

 

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  role: UserRole;
  profileImage: string;
}

export interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  location?: Location;
  login: (loginData: ILoginData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

 
export enum OrderStatus {
  PENDING = "PENDING",  
  CONFIRMED = "CONFIRMED",  
  PREPARING = "PREPARING",  
  READY = "READY",  
  IN_TRANSIT = "IN_TRANSIT",  
  DELIVERED = "DELIVERED",  
  CANCELLED = "CANCELLED",  
  REFUNDED = "REFUNDED",  
}

export type Order = {
  id: string
  customer: string
  items: Array<{
    name: string
    image: string
    quantity: number
  }>
  total: number
  status: OrderStatus
  deliveryPerson?: string
  time: string
  estimatedTime?: string
}

// Voucher Types (matching Prisma schema)
export enum VoucherStatus {
  ACTIVE = "ACTIVE",
  USED = "USED",
  EXPIRED = "EXPIRED",
  SUSPENDED = "SUSPENDED",
  SETTLED = "SETTLED",
}

export enum VoucherType {
  DISCOUNT_10 = "DISCOUNT_10",
  DISCOUNT_20 = "DISCOUNT_20",
  DISCOUNT_50 = "DISCOUNT_50",
  DISCOUNT_80 = "DISCOUNT_80",
  DISCOUNT_100 = "DISCOUNT_100",
}

export enum LoanStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DISBURSED = "DISBURSED",
  REJECTED = "REJECTED",
  SETTLED = "SETTLED",
}

export enum PenaltyStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  WAIVED = "WAIVED",
}

export interface IVoucher {
  id: string;
  voucherCode: string;
  voucherType: VoucherType;
  discountPercentage: number;
  creditLimit: number;
  minTransactionAmount: number;
  maxTransactionAmount?: number;
  totalCredit: number;
  usedCredit: number;
  remainingCredit: number;
  status: VoucherStatus;
  expiryDate?: Date;
  issuedDate: Date;
  restaurantId: string;
  loanId?: string;
  serviceFeeRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoanApplication {
  id: string;
  restaurantId: string;
  requestedAmount: number;
  purpose?: string;
  status: LoanStatus;
  approvedAmount?: number;
  approvedBy?: string;
  disbursementDate?: Date;
  repaymentDueDate?: Date;
  terms?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
}

export interface IVoucherTransaction {
  id: string;
  voucherId: string;
  orderId: string;
  restaurantId: string;
  originalAmount: number;
  discountPercentage: number;
  discountAmount: number;
  amountCharged: number;
  serviceFee: number;
  totalDeducted: number;
  transactionDate: Date;
  createdAt: Date;
}

export interface IVoucherRepayment {
  id: string;
  voucherId?: string;
  restaurantId: string;
  loanId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  allocatedToPrincipal: number;
  allocatedToServiceFee: number;
  allocatedToPenalty: number;
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVoucherPenalty {
  id: string;
  voucherId: string;
  restaurantId: string;
  penaltyAmount: number;
  daysOverdue: number;
  penaltyRate: number;
  reason?: string;
  status: PenaltyStatus;
  appliedDate: Date;
  paidDate?: Date;
  createdAt: Date;
}

export interface ICreditSummary {
  restaurantId: string;
  totalCreditLimit: number;
  totalUsedCredit: number;
  totalRemainingCredit: number;
  activeVouchers: number;
  pendingLoans: number;
  outstandingBalance: number;
  totalPenalties: number;
}

