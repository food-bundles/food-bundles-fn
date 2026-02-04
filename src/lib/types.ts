/* eslint-disable @typescript-eslint/no-explicit-any */
import { PaymentMethod } from "@/app/services/subscriptionService";

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
  role?: "RESTAURANT" | "HOTEL";
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
  HOTEL = "HOTEL",
  ADMIN = "ADMIN",
  TRADER = "TRADER",
  LOGISTICS = "LOGISTICS",
  AGGREGATOR = "AGGREGATOR",
  FOOD_BUNDLE = "FOOD_BUNDLE",
  AFFILIATOR="AFFILIATOR"
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
  orderNumber: string
  customer: string
  items: Array<{
    name: string
    image: string
    quantity: number
  }>
  total: number
  status: OrderStatus
  deliveryPerson?: string
  createdAt: string
  time: string
  estimatedTime?: string
}

// Voucher Types (matching Prisma schema)
export enum VoucherStatus {
  ACTIVE = "ACTIVE",
  USED = "USED",
  EXPIRED = "EXPIRED",
  MATURED = "MATURED",
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
  ACCEPTED = "ACCEPTED",
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
  repaymentDays: number;
  minTransactionAmount: number;
  maxTransactionAmount?: number;
  totalCredit: number;
  usedCredit: number;
  remainingCredit: number;
  status: VoucherStatus;
  transactions: {
    id: string;
    voucherId: string;
    restaurantId: number;
    originalAmount: number;
    discountPercentage: number;
    discountAmount: number;
    amountCharged: number;
    serviceFee: number;
    totalDeducted: number;
    transactionDate: Date;
    createdAt: Date;
  };
  expiryDate?: Date;
  issuedDate: Date;
  loanId?: string;
 
}

export interface ILoanApplication {
  id: string;
  restaurantId: string;
  restaurantName: string;
  requestedAmount: number;
  purpose?: string;
  status: LoanStatus;
  approvedAmount?: number;
  ILoanApplication: string;
  repaymentDays: number;
  approvedBy?: string;
  disbursementDate?: Date;
  repaymentDueDate?: Date;
  voucherDays?: number;
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

// Wallet Types
export enum TransactionType {
  TOP_UP = "TOP_UP",
  PAYMENT = "PAYMENT",
  REFUND = "REFUND",
  ADJUSTMENT = "ADJUSTMENT",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum WalletPaymentMethod {
  MOBILE_MONEY = "MOBILE_MONEY",
  CARD = "CARD",
}

export interface IWallet {
  id: string;
  restaurantId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  restaurant: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  _count: {
    transactions: number;
  };
}

export interface IWalletTransaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  previousBalance: number;
  newBalance: number;
  description: string;
  reference?: string;
  flwTxRef?: string;
  flwRef?: string;
  flwStatus?: string;
  flwMessage?: string;
  paymentMethod?: WalletPaymentMethod;
  externalTxId?: string;
  status: TransactionStatus;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  wallet: {
    id: string;
    currency: string;
    restaurant: {
      id: string;
      name: string;
    };
  };
}

