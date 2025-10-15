
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

