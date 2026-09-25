export type UserType = "ADMIN" | "RETAILER";

export interface User {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  retailerId?: string;
  createdAt: string;
}

export interface Retailer {
  id: string;
  userId: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  taxNumber?: string;
  status: "ACTIVE" | "INACTIVE";
  balance: number;
  currency: string;
  createdAt: string;
}

export type ProductType = "DATA" | "ESIM";

export interface Product {
  id: string;
  name: string;
  sku: string;
  type: ProductType;

  dataAmount: number;
  dataUnit: "GB" | "MB";

  validity: number;
  validityUnit: "DAYS";

  // Telelys internal cost
  costPrice: number;

  // Price charged to retailer
  retailerPrice: number;

  // Suggested customer selling price
  suggestedPrice: number;

  currency: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";

  createdAt: string;
  availableStock?: number;
}

export type EsimStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "ASSIGNED"
  | "SOLD"
  | "ACTIVATED"
  | "EXPIRED"
  | "CANCELLED";

export interface Esim {
  id: string;

  productId: string;
  productName?: string;
  productSku?: string;

  iccid: string;
  activationCode: string;
  qrCode: string;

  status: EsimStatus;

  retailerId?: string | null;
  retailerName?: string | null;

  orderId?: string | null;

  assignedAt?: string | null;

  customerName?: string | null;
  customerEmail?: string | null;
  customerNote?: string | null;

  createdAt: string;
}

export type OrderStatus =
  | "COMPLETED"
  | "PENDING"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "PAID"
  | "PENDING"
  | "FAILED"
  | "REFUNDED";

export interface Order {
  id: string;
  orderNumber: string;

  retailerId: string;
  retailerName: string;

  productId: string;
  productName: string;
  productSku: string;

  quantity: number;
  unitPrice: number;
  total: number;

  currency: string;

  status: OrderStatus;
  paymentStatus: PaymentStatus;

  paymentMethod?: string;

  assignedEsimIds: string[];

  createdAt: string;
}

export type PaymentMethod =
  | "WALLET_BALANCE"
  | "BANK_TRANSFER"
  | "CREDIT_LINE"
  | "CARD";

export interface Payment {
  id: string;

  paymentReference: string;
  paymentNumber?: string;

  retailerId: string;
  retailerName: string;

  orderId?: string | null;

  amount: number;
  currency: string;

  method: PaymentMethod;

  reference?: string;
  transactionId: string;
  notes?: string;

  status: "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED";

  date: string;
  createdAt?: string;
}

export type WalletTxType =
  | "CREDIT"
  | "DEBIT"
  | "REFUND"
  | "ADJUSTMENT";

export interface WalletTransaction {
  id: string;

  retailerId: string;
  retailerName: string;

  type: WalletTxType;

  amount: number;
  balanceBefore: number;
  balanceAfter: number;

  reference: string;
  description: string;
  date: string;
}

export type InquiryCategory =
  | "Product"
  | "Order"
  | "Payment"
  | "Stock"
  | "eSIM"
  | "Technical"
  | "General";

export type InquiryStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export interface InquiryMessage {
  id: string;

  inquiryId: string;

  senderType: UserType;
  senderRole?: UserType;

  senderName: string;
  message: string;

  createdAt: string;
}

export interface Inquiry {
  id: string;
  inquiryNumber: string;

  retailerId: string;
  retailerName: string;

  subject: string;

  category: InquiryCategory;
  status: InquiryStatus;

  createdAt: string;
  updatedAt: string;

  messages: InquiryMessage[];
}

export interface CompanySetting {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  website: string;

  currency: string;
  timezone: string;

  lowStockThreshold: number;
  notificationsEnabled: boolean;
}

export interface DashboardStatsAdmin {
  totalRetailers: number;
  activeRetailers: number;

  totalEsimProducts: number;
  availableEsimStock: number;

  retailerOrders: number;
  totalSales: number;

  pendingPayments: number;
  openInquiries: number;

  currency: string;
}

export interface DashboardStatsRetailer {
  availableBalance: number;
  balance?: number;

  totalPurchases: number;
  totalOrders: number;

  esimStockCount: number;
  myStockCount?: number;

  activeStockCount: number;
  soldStockCount: number;
  soldEsimCount?: number;

  currency: string;
}