import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Bell, Search, User, Sparkles, 
  Gamepad2, Plus, ArrowRight 
} from 'lucide-react';
import type { Product, ProductCategory, CartItem, Order, UserAd, NotificationItem, GameCoupon, ProductReview, OrderStatus } from "./types";
import { WhatsAppButton } from './components/WhatsAppButton';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { CarGameModal } from './components/CarGameModal';
import { UserAdModal } from './components/UserAdModal';
import { NotificationModal } from './components/NotificationModal';
import { AdminModal } from './components/AdminModal';
import { UserAdSection } from './components/UserAdSection';
import { Footer } from './components/Footer';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { productService } from './services/productService';

// Initial Curated Products for GEN-TOUCH
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'gt-01',
    name: 'AcousticPro ANC Active Noise Cancelling Headset',
    category: 'Electronics & Gadgets',
    price: 3499,
    originalPrice: 4800,
    rating: 4.9,
    ratingCount: 28,
    inStock: true,
    stockCount: 15,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
    ],
    description: 'High-fidelity audio drivers engineered with deep bass matrix, hybrid -35dB active noise cancellation, and 40 hours battery endurance.',
    features: ['Hybrid Active Noise Cancelling', '40-Hour Battery Life', 'Bluetooth 5.3 Low Latency', 'Memory Foam Earcups'],
    reviews: [
      {
        id: 'rev-1',
        userName: 'Tanvir Hossain',
        rating: 5,
        comment: 'অসাধারণ সাউন্ড কোয়ালিটি এবং ব্যাস খুব ভালো। ডেলিভারি ২ দিনের মধ্যে পেয়েছি।',
        date: '2 দিন আগে',
        verifiedPurchase: true,
      },
      {
        id: 'rev-2',
        userName: 'Rahim Ahmed',
        rating: 4.8,
        comment: 'Great ANC performance in noisy road traffic.',
        date: '৫ দিন আগে',
        verifiedPurchase: true,
      },
    ],
  },
  {
    id: 'gt-02',
    name: 'ApexTactical Chrono Smartwatch with Amoled Screen',
    category: 'Electronics & Gadgets',
    price: 2850,
    originalPrice: 3950,
    rating: 4.8,
    ratingCount: 19,
    inStock: true,
    stockCount: 8,
    badge: 'Trending',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&q=80',
    ],
    description: 'Military grade zinc-alloy frame, 1.43 inch super vivid AMOLED retina display with 100+ health workout modes and IP68 water sealing.',
    features: ['1.43" AMOLED Display', 'Bluetooth Calling', 'IP68 Waterproof', 'SpO2 & Heart Rate 24/7'],
    reviews: [
      {
        id: 'rev-3',
        userName: 'Sabbir Rahman',
        rating: 5,
        comment: 'ডিসপ্লেটা সত্যি অসাধারণ, রোদেও একদম ক্লিয়ার দেখা যায়।',
        date: '১ সপ্তাহ আগে',
        verifiedPurchase: true,
      },
    ],
  },
  {
    id: 'gt-03',
    name: 'Precision Barista Electric Coffee & Spice Grinder',
    category: 'Home & Living',
    price: 1950,
    originalPrice: 2600,
    rating: 4.7,
    ratingCount: 12,
    inStock: true,
    stockCount: 20,
    badge: 'Hot Deal',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80',
    ],
    description: 'Heavy duty stainless steel 304 blades operating at 28000 RPM for instant consistent fine espresso grinding and dry masala processing.',
    features: ['304 Stainless Steel Blades', '28,000 RPM Motor', 'One-Touch Pulse Operation', 'Overheat Safety Guard'],
    reviews: [],
  },
  {
    id: 'gt-04',
    name: 'HydroPure Smart Ultrasonic Cool Mist Humidifier',
    category: 'Home & Living',
    price: 2200,
    originalPrice: 3100,
    rating: 4.9,
    ratingCount: 34,
    inStock: true,
    stockCount: 12,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',
    ],
    description: 'Aroma diffuser with 7-color gentle ambient night glowing LEDs, whisper silent 22dB sleep operation and anti-microbial tank.',
    features: ['3.5L Tank Capacity', 'Essential Oil Diffuser Tray', 'Whisper Quiet 22dB', 'Auto Shut-Off Safety'],
    reviews: [
      {
        id: 'rev-4',
        userName: 'Nadia Islam',
        rating: 5,
        comment: 'বাচ্চার রুমে রেখেছি, খুব সুন্দর সুগন্ধ ছড়ায় এবং শান্ত ঘুম হয়।',
        date: '৪ দিন আগে',
        verifiedPurchase: true,
      },
    ],
  },
  {
    id: 'gt-05',
    name: 'CyberPunk Neon LED Edge Ergonomic Mousepad XXL',
    category: 'Electronics & Gadgets',
    price: 1150,
    originalPrice: 1750,
    rating: 4.6,
    ratingCount: 15,
    inStock: true,
    stockCount: 25,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
    ],
    description: '900x400mm micro-textured cloth weave surface with 14 chroma lighting modes and non-slip textured natural rubber base.',
    features: ['900x400x4mm Huge Dimension', '14 RGB Lighting Effects', 'Water-Resistant Coating', 'Non-Slip Rubber Bottom'],
    reviews: [],
  },
  {
    id: 'gt-06',
    name: 'Titanium Lumina EDC Rechargeable Tactical Flashlight',
    category: 'Automotive Tech',
    price: 1450,
    originalPrice: 2200,
    rating: 4.8,
    ratingCount: 22,
    inStock: true,
    stockCount: 14,
    badge: 'Must Have',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    ],
    description: 'Blinding 2000 Lumen output with 350-meter throw distance, Type-C quick charging, aircraft aluminium body with IPX7 rating.',
    features: ['2000 Lumens Max Output', 'Type-C Fast Charging', 'Emergency SOS Strobe', 'Aircraft Grade Body'],
    reviews: [],
  },
];

// Initial Approved User Ads
const INITIAL_USER_ADS: UserAd[] = [
  {
    id: 'ad-01',
    title: 'Corsair K70 RGB MK.2 Rapidfire (Mint Condition)',
    category: 'Electronics & Gadgets',
    price: 5500,
    sellerName: 'Shakil Ahmed',
    sellerPhone: '01822334455',
    sellerLocation: 'Uttara Sector 7, Dhaka',
    description: 'Cherry MX Speed switches, brushed aluminium frame, dedicated volume roller. Used only 4 months with full box and all spare keycaps.',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    feeAmount: 20,
    feeSenderNumber: '01822334455',
    feeTrxId: 'BL889X09',
    status: 'approved',
    createdAt: '2025-05-10T10:30:00.000Z',
  },
  {
    id: 'ad-02',
    title: 'Keychron K2 V2 Wireless Bluetooth Mechanical Keyboard',
    category: 'Electronics & Gadgets',
    price: 6200,
    sellerName: 'Farhan Kabir',
    sellerPhone: '01711223344',
    sellerLocation: 'Dhanmondi 27, Dhaka',
    description: 'Gateron G Pro Brown switches, RGB backlight, Mac & Windows compatible. 4000mAh battery. Excellent condition, fresh box.',
    imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80',
    feeAmount: 10,
    feeSenderNumber: '01711223344',
    feeTrxId: 'BK991Z22',
    status: 'approved',
    createdAt: '2025-05-11T14:15:00.000Z',
  },
];

export const App: React.FC = () => {
  // Products & Categories
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_products');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_PRODUCTS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All Products');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart & Drawer
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_cart');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isGameOpen, setIsGameOpen] = useState<boolean>(false);
  const [isPostAdOpen, setIsPostAdOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // User Ads
  const [userAds, setUserAds] = useState<UserAd[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_user_ads');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_USER_ADS;
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'GT-ORD-7721',
        customer: {
          name: 'Tanzim Taj',
          phone: '01310588979',
          address: 'Mirpur DOHS, Road 4',
          district: 'Dhaka',
        },
        items: [
          {
            product: INITIAL_PRODUCTS[0],
            quantity: 1,
          },
        ],
        total: 3559,
        paymentMethod: 'bKash',
        paymentTrxId: 'BK79182390',
        paymentNumber: '01310588979',
        status: 'Confirmed',
        createdAt: '2025-05-12 12:40 PM',
      },
    ];
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: '🎉 Welcome to GEN-TOUCH!',
      message: 'Enjoy fast home delivery across Bangladesh & 100% original quality gear.',
      type: 'promo',
      timestamp: 'Just now',
      read: false,
      forRole: 'all',
    },
    {
      id: 'notif-2',
      title: '🏎️ Play Turbo Racer to Win ৳30!',
      message: 'Compete in the mini sports car game to earn instant coupon discounts.',
      type: 'game',
      timestamp: '1 hour ago',
      read: false,
      forRole: 'user',
    },
  ]);

  // Admin state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('gentouch_is_admin') === 'true';
  });

  // Active coupon from Game or promos
  const [activeCoupon, setActiveCoupon] = useState<GameCoupon | null>(() => {
    try {
      const saved = localStorage.getItem('gentouch_active_coupon');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  // Realtime Cloud listener
  useEffect(() => {
    const unsubscribe = productService.subscribeToProducts((liveItems) => {
      if (liveItems && liveItems.length > 0) {
        setProducts(liveItems);
        try {
          localStorage.setItem('gentouch_products', JSON.stringify(liveItems));
        } catch {
          // ignore
        }
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Persistent storage updates
  useEffect(() => {
    localStorage.setItem('gentouch_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('gentouch_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('gentouch_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('gentouch_user_ads', JSON.stringify(userAds));
  }, [userAds]);

  useEffect(() => {
    localStorage.setItem('gentouch_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (activeCoupon) {
      localStorage.setItem('gentouch_active_coupon', JSON.stringify(activeCoupon));
    }
  }, [activeCoupon]);

  // Cart handlers
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCheckoutSuccess = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCartItems([]);
    setIsCartOpen(false);

    const adminAlert: NotificationItem = {
      id: `notif-ord-adm-${Date.now()}`,
      title: `🛍️ New Order Received (${order.id})`,
      message: `${order.customer.name} placed order for ৳${order.total} via ${order.paymentMethod}. Phone: ${order.customer.phone}`,
      type: 'order',
      timestamp: 'Just now',
      read: false,
      forRole: 'admin',
    };

    const userNotif: NotificationItem = {
      id: `notif-ord-usr-${Date.now()}`,
      title: `✅ Order Placed: ${order.id}`,
      message: `Your order for ৳${order.total} has been placed. We are verifying it.`,
      type: 'order',
      timestamp: 'Just now',
      read: false,
      forRole: 'user',
    };

    setNotifications((prev) => [adminAlert, userNotif, ...prev]);
  };

  const handleAddProduct = async (newProduct: Product) => {
    try {
      await productService.saveProduct(newProduct);
    } catch (e) {
      console.error(e);
    }
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleSubmitAd = async (newAd: UserAd) => {
    try {
      await productService.saveUserAd(newAd);
    } catch (e) {
      console.error(e);
    }
    setUserAds((prev) => [newAd, ...prev]);

    const adminAlert: NotificationItem = {
      id: `notif-ad-${Date.now()}`,
      title: `📢 New User Ad Pending Approval (${newAd.title})`,
      message: `${newAd.sellerName} submitted an ad with TrxID: ${newAd.feeTrxId} (৳${newAd.feeAmount}). Please verify and approve.`,
      type: 'admin',
      timestamp: 'Just now',
      read: false,
      forRole: 'admin',
    };

    setNotifications((prev) => [adminAlert, ...prev]);
  };

  const handleAuthenticateAdmin = (code: string) => {
    const trimmed = code.trim();
    if (trimmed === 'Hunter#11220' || trimmed === 'Hunter#1122' || trimmed === 'Hunter#1212') {
      setIsAdmin(true);
      sessionStorage.setItem('gentouch_is_admin', 'true');
      return true;
    }
    return false;
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('gentouch_is_admin');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handleUpdateAdStatus = (adId: string, status: 'approved' | 'rejected') => {
    setUserAds((prev) =>
      prev.map((a) => (a.id === adId ? { ...a, status } : a))
    );
  };

  const handleDeleteAd = (adId: string) => {
    setUserAds((prev) => prev.filter((a) => a.id !== adId));
    setProducts((prev) => prev.filter((p) => p.id !== adId));
  };

  const handleAddReview = (productId: string, review: ProductReview) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedReviews = [review, ...(p.reviews || [])];
          const newAvg =
            updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
          return {
            ...p,
            reviews: updatedReviews,
            rating: parseFloat(newAvg.toFixed(1)),
            ratingCount: updatedReviews.length,
          };
        }
        return p;
      })
    );
  };

  // Filter products
  const filteredProducts = products.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All Products' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    'All Products',
    'Electronics & Gadgets',
    'Automotive Tech',
    'Fashion & Apparel',
    'Home & Living',
    'Beauty & Health',
  ];

  const unreadNotifsCount = notifications.filter(
    (n) => !n.read && (n.forRole === 'all' || (isAdmin ? n.forRole === 'admin' : n.forRole === 'user'))
  ).length;

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* 1. TOP ANNOUNCEMENT / HERO SLIDER BAR */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-black text-white text-xs font-semibold py-2 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold">
              GEN-TOUCH Online Shopping BD
            </span>
            <span className="hidden sm:inline text-gray-200">
              ⚡ Use secret coupon <strong className="text-yellow-300 font-mono">ilovegentouch</strong> for ৳10 OFF! | Play Turbo Race to win up to ৳30!
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] shrink-0">
            <button
              onClick={() => setIsGameOpen(true)}
              className="hover:text-yellow-300 font-bold flex items-center gap-1 transition"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-yellow-300" /> Play Game
            </button>
            <button
              onClick={() => setIsPostAdOpen(true)}
              className="hover:text-yellow-300 font-bold flex items-center gap-1 transition bg-black/25 px-2 py-0.5 rounded"
            >
              <Plus className="w-3.5 h-3.5" /> Post Ad (৳10)
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <header className="sticky top-0 z-30 bg-[#12141a]/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-3.5 group">
              {/* Guaranteed Inline Chrome Car Logo */}
              <div className="h-10 sm:h-12 w-32 sm:w-40 flex items-center justify-center transition duration-300 group-hover:scale-105">
                <svg
                  viewBox="0 0 900 620"
                  className="w-full h-full drop-shadow-[0_2px_10px_rgba(239,68,68,0.35)]"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="silverChromeTop" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#475569" stopOpacity="0.2" />
                      <stop offset="15%" stopColor="#cbd5e1" />
                      <stop offset="30%" stopColor="#ffffff" />
                      <stop offset="55%" stopColor="#f8fafc" />
                      <stop offset="75%" stopColor="#cbd5e1" />
                      <stop offset="100%" stopColor="#334155" stopOpacity="0.3" />
                    </linearGradient>

                    <linearGradient id="chromeBevel" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="45%" stopColor="#e2e8f0" />
                      <stop offset="55%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor="#334155" />
                    </linearGradient>

                    <linearGradient id="laserRed" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ff1a1a" />
                      <stop offset="50%" stopColor="#e60000" />
                      <stop offset="100%" stopColor="#990000" />
                    </linearGradient>

                    <linearGradient id="touchRed3D" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ff4d4d" />
                      <stop offset="25%" stopColor="#e60000" />
                      <stop offset="60%" stopColor="#b30000" />
                      <stop offset="100%" stopColor="#660000" />
                    </linearGradient>
                  </defs>

                  {/* Sports Car Streamlined Body */}
                  <g>
                    <path
                      d="M 52,298 C 110,265 240,205 450,195 C 640,195 780,242 858,266 C 820,268 765,258 720,248 C 550,210 380,214 260,260 C 180,290 110,305 52,298 Z"
                      fill="url(#silverChromeTop)"
                    />
                    <path
                      d="M 285,245 C 370,208 530,208 642,238 C 585,225 435,224 330,242 Z"
                      fill="#0a0c10"
                      opacity="0.9"
                    />
                    <path
                      d="M 330,242 C 435,224 585,225 642,238 C 560,242 450,250 365,252 Z"
                      fill="#ffffff"
                      opacity="0.5"
                    />
                    <path
                      d="M 46,298 C 90,285 145,270 170,278 C 130,292 85,310 46,298 Z"
                      fill="url(#silverChromeTop)"
                    />
                    <path
                      d="M 148,284 C 180,268 250,270 282,296 C 262,294 200,278 165,286 Z"
                      fill="url(#silverChromeTop)"
                      opacity="0.9"
                    />
                    <path
                      d="M 460,265 C 570,248 720,250 855,274 C 775,272 630,260 520,272 Z"
                      fill="url(#laserRed)"
                    />
                    <path
                      d="M 520,266 C 620,254 750,258 840,274 C 760,268 640,260 550,268 Z"
                      fill="#ff8080"
                    />
                  </g>

                  {/* Brand Typography */}
                  <g transform="skewX(-10)">
                    <text
                      x="175"
                      y="382"
                      fontFamily="'Montserrat', 'Arial Black', Impact, sans-serif"
                      fontWeight="900"
                      fontStyle="italic"
                      fontSize="94"
                      fill="url(#chromeBevel)"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      letterSpacing="2"
                    >
                      GEN-
                    </text>
                    <text
                      x="470"
                      y="382"
                      fontFamily="'Montserrat', 'Arial Black', Impact, sans-serif"
                      fontWeight="900"
                      fontStyle="italic"
                      fontSize="94"
                      fill="url(#touchRed3D)"
                      stroke="#ff6666"
                      strokeWidth="1"
                      letterSpacing="2"
                    >
                      Touch
                    </text>
                  </g>

                  {/* Official Slogan */}
                  <g>
                    <line x1="140" y1="416" x2="210" y2="416" stroke="url(#laserRed)" strokeWidth="2.5" strokeLinecap="round" />
                    <text
                      x="450"
                      y="420"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      fontWeight="700"
                      fontSize="16.5"
                      textAnchor="middle"
                      fill="#cbd5e1"
                      letterSpacing="6.5"
                    >
                      ONLINE SHOPPING BD
                    </text>
                    <line x1="690" y1="416" x2="760" y2="416" stroke="url(#laserRed)" strokeWidth="2.5" strokeLinecap="round" />
                  </g>
                  <path
                    d="M 260,432 C 370,490 530,490 640,432 C 550,476 350,476 260,432 Z"
                    fill="url(#silverChromeTop)"
                    stroke="#ffffff"
                    strokeWidth="0.8"
                    opacity="0.85"
                  />
                </svg>
              </div>

              <div className="hidden sm:block">
                <span className="text-xl font-black tracking-tight text-white">
                  GEN-<span className="text-red-500">TOUCH</span>
                </span>
                <span className="block text-[9px] tracking-widest text-gray-400 uppercase font-semibold">
                  Online Shopping BD
                </span>
              </div>
            </a>
          </div>

          <div className="hidden md:flex flex-1 max-w-lg relative">
            <input
              type="text"
              placeholder="Search acoustics, mechanical keyboards, smart watches, car tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#161920] border border-gray-800 focus:border-red-600 rounded-2xl text-xs text-white placeholder-gray-500 outline-none transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setIsPostAdOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-bold rounded-xl shadow transition active:scale-95"
            >
              <Plus className="w-4 h-4" /> Post Ad
            </button>

            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2.5 text-gray-300 hover:text-white bg-[#161920] hover:bg-gray-800 rounded-xl border border-gray-800 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="p-2.5 text-gray-300 hover:text-white bg-[#161920] hover:bg-gray-800 rounded-xl border border-gray-800 transition flex items-center gap-1.5"
              aria-label="User Account"
            >
              <User className="w-5 h-5" />
              {isAdmin && <span className="text-[10px] font-bold text-red-400">Admin</span>}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 py-2 px-3 sm:px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-black/30 px-1.5 py-0.5 rounded-full font-mono text-[11px]">
                {cartItems.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO BANNER */}
      <div className="relative bg-gradient-to-br from-[#161922] via-[#101217] to-black border-b border-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.15),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/50 border border-red-800/60 text-red-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Official Premium Tech & Classifieds BD
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              GEN-TOUCH <span className="text-red-500">Online Shopping BD</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-xl">
              Discover authentic audiophile acoustic gear, high-grade mechanical keyboards, 4K automotive dash cams, and verified community classifieds.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#products"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/30 transition flex items-center gap-2"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsGameOpen(true)}
                className="px-6 py-3 bg-[#1e222d] hover:bg-[#272d3b] text-white font-bold text-xs sm:text-sm rounded-xl border border-gray-700 transition flex items-center gap-2"
              >
                <Gamepad2 className="w-4 h-4 text-yellow-400" /> Play Turbo Race (Win ৳30)
              </button>
              <button
                onClick={() => setIsPostAdOpen(true)}
                className="px-6 py-3 bg-[#161920] hover:bg-[#20242e] text-red-400 hover:text-red-300 font-bold text-xs sm:text-sm rounded-xl border border-red-900/50 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Sell Your Item (৳10)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT CONTAINER (ALL PRODUCTS ON TOP, MEMBER ADS AT BOTTOM) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Category Pills */}
        <div id="products" className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'bg-[#161920] text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              {selectedCategory}
              <span className="text-xs font-normal text-gray-400">
                ({filteredProducts.length} items available)
              </span>
            </h2>
            <p className="text-xs text-gray-400">Hover over any item for smooth zoom & quick view</p>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-[#161920] rounded-3xl border border-gray-800">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-bold text-white mb-1">No products found</h3>
            <p className="text-xs">Try clearing your search query or switching categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onViewDetails={(p) => {
                  setSelectedProduct(p);
                  setIsDetailsOpen(true);
                }}
                isWishlisted={wishlist.includes(prod.id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        )}

        {/* Community Classifieds & Member Ads (Placed below All Products) */}
        <UserAdSection
          ads={userAds}
          onOpenPostAd={() => setIsPostAdOpen(true)}
        />
      </main>

      {/* 5. MODALS & POPUPS */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        isWishlisted={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckoutSuccess={handleCheckoutSuccess}
        activeCoupon={activeCoupon}
      />

      <CarGameModal
        isOpen={isGameOpen}
        onClose={() => setIsGameOpen(false)}
        onClaimCoupon={(coupon) => {
          setActiveCoupon(coupon);
          setIsCartOpen(true);
        }}
      />

      <UserAdModal
        isOpen={isPostAdOpen}
        onClose={() => setIsPostAdOpen(false)}
        onSubmitAd={handleSubmitAd}
        onAddProduct={handleAddProduct}
        isAdmin={isAdmin}
      />

      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onActionClick={(target) => {
          if (target === 'game') setIsGameOpen(true);
          if (target === 'ad_post') setIsPostAdOpen(true);
          if (target === 'admin') setIsAdminOpen(true);
        }}
        isAdmin={isAdmin}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        userAds={userAds}
        onUpdateAdStatus={handleUpdateAdStatus}
        onDeleteAd={handleDeleteAd}
        isAuthenticated={isAdmin}
        onAuthenticate={handleAuthenticateAdmin}
        onLogout={handleLogoutAdmin}
      />

      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        orders={orders}
        onOpenAdmin={() => setIsAdminOpen(true)}
        whatsappNumber="01310588979"
      />

      <WhatsAppButton phoneNumber="8801310588979" />

      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenGame={() => setIsGameOpen(true)}
      />
    </div>
  );
};

export default App;
