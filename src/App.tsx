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
    category: 'Home & Kitchen',
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
    category: 'Smart Living',
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
    category: 'Smart Living',
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

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart & Drawer
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_cart');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isGameOpen, setIsGameOpen] = useState<boolean>(false);
  const [isPostAdOpen, setIsPostAdOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
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
      title: '🎉 ওয়েলকাম ডিসকাউন্ট কোড!',
      message: 'প্রথম অর্ডারে ১০% ছাড় পেতে চেকআউটে "TOUCH10" কোপন কোডটি ব্যবহার করুন।',
      type: 'promo',
      linkTarget: 'cart',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: 'notif-2',
      title: '🏎️ কার রেসিং গেম খেলুন আর জিতুন!',
      message: 'স্পিড রেসার গেম খেলে হাইস্কোর তৈরি করুন এবং পান ২০% পর্যন্ত মেগা ভাউচার!',
      type: 'game',
      linkTarget: 'game',
      timestamp: '5 hours ago',
      read: false,
    },
    {
      id: 'notif-3',
      title: '📢 মেম্বার ক্লাসিফায়েড বিজ্ঞাপন',
      message: 'আপনার পুরোনো বা নতুন গ্যাজেট বিক্রি করতে সরাসরি বিজ্ঞাপন পোস্ট করুন!',
      type: 'ad',
      linkTarget: 'ad_post',
      timestamp: '1 day ago',
      read: true,
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

  // Persistent storage updates
  useEffect(() => {
    localStorage.setItem('gentouch_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('gentouch_cart', JSON.stringify(cart));
  }, [cart]);

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
    setCart((prev) => {
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

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleApplyCoupon = (coupon: GameCoupon) => {
    setActiveCoupon(coupon);
  };

  const handleCreateOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setIsCartOpen(false);

    // Notify Admin & User
    const adminNotif: NotificationItem = {
      id: `notif-ord-adm-${Date.now()}`,
      title: `🛍️ New Order Received (${newOrder.id})`,
      message: `${newOrder.customer.name} placed order for ৳${newOrder.total} via ${newOrder.paymentMethod}. Phone: ${newOrder.customer.phone}`,
      type: 'order',
      linkTarget: 'admin',
      timestamp: 'Just now',
      read: false,
      forRole: 'admin',
    };

    const userNotif: NotificationItem = {
      id: `notif-ord-usr-${Date.now()}`,
      title: `✅ Order Placed: ${newOrder.id}`,
      message: `আপনার ৳${newOrder.total} টাকার অর্ডার সফলভাবে সম্পন্ন হয়েছে। TrxID যাচাইয়ের পর দ্রুত কনফার্ম করা হবে।`,
      type: 'order',
      linkTarget: 'orders',
      timestamp: 'Just now',
      read: false,
      forRole: 'user',
    };

    setNotifications((prev) => [adminNotif, userNotif, ...prev]);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleSubmitAd = (newAd: UserAd) => {
    setUserAds((prev) => [newAd, ...prev]);

    const adminAlert: NotificationItem = {
      id: `notif-ad-${Date.now()}`,
      title: `📢 New User Ad Pending Approval (${newAd.title})`,
      message: `${newAd.sellerName} submitted an ad with TrxID: ${newAd.feeTrxId} (৳${newAd.feeAmount}). Please verify and approve.`,
      type: 'admin',
      linkTarget: 'admin',
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

  // অ্যাডমিন ডিলিট হ্যান্ডলার
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
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotalCount = cart.reduce((total, item) => total + item.quantity, 0);
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#07080a] text-gray-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Banner Ticker */}
      <div className="bg-gradient-to-r from-red-950/70 via-black to-red-950/70 border-b border-red-900/30 py-1.5 px-4 text-center text-[11px] sm:text-xs text-red-200/90 flex items-center justify-center gap-3">
        <span className="flex items-center gap-1 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span>জেন-টাচ মেগা অফার: সারা দেশে ক্যাশ অন হোম ডেলিভারি ও দ্রুত সার্ভিস</span>
        </span>
        <span className="hidden md:inline text-red-500/50">•</span>
        <button 
          onClick={() => setIsGameOpen(true)}
          className="hidden md:flex items-center gap-1 font-bold text-red-400 hover:text-white underline decoration-red-500 decoration-wavy transition"
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>গেম খেলে ২০% ভাউচার কুপন জিতুন</span>
        </button>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-[#07080a]/90 backdrop-blur-xl border-b border-gray-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-black text-xl tracking-tighter">GT</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-2xl font-black tracking-tight text-white group-hover:text-red-500 transition-colors">
                  GEN<span className="text-red-600">-</span>TOUCH
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-widest text-gray-400 uppercase -mt-1 font-semibold">
                  Official BD Store
                </span>
              </div>
            </a>
          </div>

          {/* Search Bar - Center Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="গ্যাজেট, হেডফোন বা এক্সেসরিজ খুঁজুন..."
                className="w-full pl-10 pr-4 py-2 bg-[#101217] border border-gray-800/80 focus:border-red-600 rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 outline-none transition shadow-inner"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-gray-500 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play Game Button */}
            <button
              onClick={() => setIsGameOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-600/20 border border-red-800/40 text-red-400 hover:text-red-300 text-xs font-bold transition group shadow-sm"
              title="কার রেসিং গেম খেলে ডিসকাউন্ট ভাউচার জিতুন"
            >
              <Gamepad2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>প্লে গেম</span>
            </button>

            {/* Post Ad Button */}
            <button
              onClick={() => setIsPostAdOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-lg shadow-red-600/30 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">{isAdmin ? 'Add Product' : 'Post Ad'}</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="relative p-2.5 rounded-xl bg-[#12141a] hover:bg-[#1a1e27] border border-gray-800 text-gray-300 hover:text-white transition"
              title="নোটিফিকেশন ও অফার"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center shadow-md animate-bounce">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-[#12141a] hover:bg-[#1a1e27] border border-gray-800 text-gray-300 hover:text-white transition"
              title="শপিং কার্ট"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center shadow-md">
                  {cartTotalCount}
                </span>
              )}
            </button>

            {/* User Profile / Order Tracking Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="p-2.5 rounded-xl bg-[#12141a] hover:bg-[#1a1e27] border border-gray-800 text-gray-300 hover:text-white transition"
              title="প্রোফাইল ও আমার অর্ডার"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="px-4 pb-3 lg:hidden">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="গ্যাজেট বা প্রোডাক্ট খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 bg-[#101217] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 outline-none"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* Hero Banner Section */}
        <section className="relative rounded-3xl overflow-hidden border border-red-950/60 bg-gradient-to-br from-[#120507] via-[#090b10] to-[#06070a] p-6 sm:p-10 lg:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.18),transparent_50%)] pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>প্রিমিয়াম কোয়ালিটি লাইফস্টাইল ও ইলেকট্রনিক্স</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              স্মার্ট গ্যাজেট ও আধুনিক <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-amber-400">
                লাইফস্টাইলের বিশ্বস্ত ঠিকানা
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xl">
              সেরা মূল্যে অরিজিনাল গ্যাজেট, দ্রুততম ডেলিভারি ও শতভাগ ক্যাশ অন ডেলিভারি সুবিধা। এখনই অর্ডার করুন অথবা গেম খেলে জিতে নিন অতিরিক্ত ছাড়!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('products-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 transition hover:scale-105"
              >
                <span>কালেকশন দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsGameOpen(true)}
                className="px-6 py-3 rounded-2xl bg-[#14161f] hover:bg-[#1d212d] border border-gray-800 text-gray-200 text-xs sm:text-sm font-bold flex items-center gap-2 transition"
              >
                <Gamepad2 className="w-4 h-4 text-red-500" />
                <span>স্পিড রেসার খেলুন</span>
              </button>
            </div>
          </div>
        </section>

        {/* Community Classified Ads (Member Ads) Section */}
        <UserAdSection
          ads={userAds}
          onPostAdClick={() => setIsPostAdOpen(true)}
        />

        {/* Category Tabs */}
        <section id="products-grid" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>অল প্রোডাক্টস</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-600/30">
                  {filteredProducts.length} আইটেম
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">জেন-টাচ অফিশিয়াল ভেরিফাইড প্রোডাক্ট কালেকশন</p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar">
              {(['All', 'Electronics & Gadgets', 'Home & Kitchen', 'Smart Living'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-[#12141a] text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {cat === 'All' ? 'সকল পণ্য' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-[#0c0d12] rounded-3xl border border-gray-800/60 p-6 space-y-3">
              <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto" />
              <h3 className="text-base font-bold text-gray-300">কোনো প্রোডাক্ট খুঁজে পাওয়া যায়নি</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                আপনার সার্চ কুয়েরির সাথে কোনো আইটেম মিলেনি। দয়া করে অন্য কোনো নাম দিয়ে সার্চ করুন।
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition"
              >
                সব প্রোডাক্ট দেখুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(p) => setSelectedProduct(p)}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onAddReview={handleAddReview}
          onBuyNow={(prod, qty) => {
            handleAddToCart(prod, qty);
            setSelectedProduct(null);
            setIsCartOpen(true);
          }}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveFromCart}
        onCreateOrder={handleCreateOrder}
        activeCoupon={activeCoupon}
        onApplyCoupon={handleApplyCoupon}
        bkashNumber="01310588979"
      />

      {/* Speed Racer Mini Game Modal */}
      <CarGameModal
        isOpen={isGameOpen}
        onClose={() => setIsGameOpen(false)}
        onWinCoupon={(coupon) => {
          setActiveCoupon(coupon);
          setIsCartOpen(true);
        }}
      />

      {/* Post User Ad / Admin Product Upload Modal */}
      <UserAdModal
        isOpen={isPostAdOpen}
        onClose={() => setIsPostAdOpen(false)}
        onSubmitAd={handleSubmitAd}
        onAddProduct={handleAddProduct}
        isAdmin={isAdmin}
        bkashNumber="01310588979"
      />

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
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

      {/* Admin Management Dashboard */}
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

      {/* Customer Profile & My Orders Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        orders={orders}
        onOpenAdmin={() => setIsAdminOpen(true)}
        whatsappNumber="01310588979"
      />

      {/* Floating WhatsApp Button */}
      <WhatsAppButton phoneNumber="8801310588979" />

      {/* Footer */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenGame={() => setIsGameOpen(true)}
      />
    </div>
  );
};

export default App;
