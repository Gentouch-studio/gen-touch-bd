export interface ProductReview {
  id: string;
  productId: string;
  orderId?: string;
  customerName: string;
  customerPhone?: string;
  rating: number;
  comment: string;
  photos?: string[];
  createdAt: string;
  verifiedBuyer?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  inStock: boolean;
  stockCount: number;
  badge?: string;
  image: string;
  galleryImages?: string[];
  description: string;
  features?: string[];
  reviews?: ProductReview[];
}

export type ProductCategory = 
  | 'All Products'
  | 'Electronics & Gadgets'
  | 'Automotive Tech'
  | 'Acoustics & Audio'
  | 'Mechanical Keyboards'
  | 'Fashion & Apparel'
  | string;

export interface CartItem {
  product: Product;
  quantity: number;
  selectedForCheckout: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = 
  | 'Pending' 
  | 'Pending Approval' 
  | 'Confirmed' 
  | 'Processing' 
  | 'Shipped' 
  | 'Delivered' 
  | 'Cancelled';

export type PaymentMethod = 'bkash' | 'cod' | 'card' | string;

export interface Order {
  id: string;
  customerId?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  couponApplied?: string;
  customer: {
    fullName: string;
    phone: string;
    altPhone?: string;
    district: 'Dhaka City' | 'Outside Dhaka' | string;
    fullAddress: string;
    notes?: string;
  };
  paymentMethod: PaymentMethod;
  advanceAmountRequired: number; // 80 for Dhaka, 120 for Outside Dhaka
  advancePaymentDetails?: {
    method: string;
    senderNumber: string;
    transactionId: string;
    verified?: boolean;
  };
  paymentDetails?: {
    senderNumber?: string;
    transactionId?: string;
  };
  status: OrderStatus;
  isApprovedByAdmin?: boolean;
  reviewedBy?: string;
  createdAt: string;
}

export interface UserAd {
  id: string;
  title: string;
  category: string;
  price: number;
  condition?: 'Brand New' | 'Used - Like New' | 'Used - Good' | string;
  location?: string;
  sellerLocation?: string;
  sellerName: string;
  sellerPhone: string;
  images?: string[];
  imageUrl?: string;
  videoUrl?: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  paidFee?: number;
  feeAmount?: number;
  feePaymentMethod?: string;
  feeSenderNumber?: string;
  feeTrxId?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'game' | 'ad_promo' | 'ad_review' | 'system' | string;
  linkTarget?: 'orders' | 'game' | 'ad_post' | 'admin' | string;
  timestamp: string;
  read: boolean;
  forRole: 'user' | 'admin' | 'all';
}

export interface GameCoupon {
  code: string;
  discount: number;
  validUntil: string;
}

export type UserRole = 'customer' | 'admin' | 'moderator';

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  password?: string;
  role: UserRole;
  createdAt: string;
}

export interface CouponItem {
  id: string;
  code: string;
  discountAmount: number;
  description?: string;
  isActive: boolean;
  isPermanent?: boolean;
  createdAt: string;
}