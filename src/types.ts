export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'cod' | 'pay_later';

export type PaymentStatus = 'paid' | 'pending' | 'returned';

export type LanguageMode = 'bilingual' | 'ta' | 'en';

export type AppMode = 'website' | 'pos';

export type UserRole = 'customer' | 'staff' | 'manager' | 'admin';

export interface UserAccount {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  password?: string;
  pin?: string;
  address?: string;
  createdAt: number;
  lastLoginAt?: number;
  avatarColor?: string;
}

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  nameTa?: string;
  description?: string;
  descriptionTa?: string;
  price: number; // Regular Selling price (விற்பனை விலை)
  buyPrice?: number; // Cost / Buy price (வாங்கிய விலை / அடக்க விலை)
  stockQty?: number; // Stock on hand quantity (இருப்பு எண்ணிக்கை)
  minStockAlert?: number; // Low stock threshold (default 5 units)
  specialPrice?: number; // Discounted / Special promotional price (சிறப்பு விலை)
  category: string;
  iconName: string;
  image?: string; // Product photo URL or data URL
  inStock?: boolean;
  rating?: number;
  reviewsCount?: number;
  features?: string[];
  isFeatured?: boolean;
}

export interface CartItem {
  product: Product;
  qty: number;
  isReturn?: boolean; // If true, customer is returning this item (subtracts from total / refund)
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  notes: string;
  pointsEarned?: number;
  pointsRedeemed?: number;
  previousPoints?: number;
  newBalancePoints?: number;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  address?: string;
  points: number;
  totalSpent: number;
  ordersCount: number;
  createdAt: number;
  lastVisit: string;
  isDeleted?: boolean; // Soft delete flag
  deletedAt?: number;
}

export interface SaleRecord {
  id: string;
  invoiceNo: string;
  date: string;
  timestamp: number;
  items: {
    id: string;
    name: string;
    price: number; // Sale price
    buyPrice?: number; // Cost / Buy price at time of sale
    regularPrice?: number;
    qty: number;
    subtotal: number;
    isReturn?: boolean;
  }[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  cashReceived: number;
  balanceGiven: number;
  customer?: CustomerInfo;
  isReturnRecord?: boolean;
  originalInvoiceNo?: string;
  pointsEarned?: number;
  pointsRedeemed?: number;
  customerPointsBalance?: number;
  orderOrigin?: 'pos' | 'online_website';
}

export interface StoreSettings {
  storeName: string;
  storeNameTa?: string;
  tagline: string;
  phone: string;
  address?: string;
  logoUrl?: string;
  currencySymbol: string;
  language: LanguageMode;
  soundEnabled: boolean;
  thermalWidth: '58mm' | '80mm';
  receiptHeaderNote?: string;
  receiptFooterNote?: string;
  pointsPer100Rs?: number; // Loyalty points awarded per Rs. 100 spent (Default: 1)
  pointValueInRs?: number; // Redemption monetary value per point in Rs. (Default: 1)
  freeDeliveryThreshold?: number; // e.g. Free delivery above Rs. 5000
  whatsappNumber?: string;
  defaultStockAlertThreshold?: number; // Low stock warning threshold (Default: 5)
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  text: string;
}

export interface BackupData {
  version: string;
  exportedAt: string;
  timestamp: number;
  settings: StoreSettings;
  products: Product[];
  sales: SaleRecord[];
  customers: CustomerProfile[];
  users?: UserAccount[];
}
