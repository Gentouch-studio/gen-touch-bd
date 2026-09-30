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
    id: 'gt-audio-01',
    name: 'Edifier W820NB Plus ANC Wireless Headphones',
    category: 'Electronics & Gadgets',
    price: 4850,
    originalPrice: 5800,
    rating: 4.9,
    ratingCount: 142,
    inStock: true,
    stockCount: 18,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=60',
    galleryImages: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=60'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'LDAC certified Hi-Res Wireless active noise cancelling headphones with up to 49 hours of non-stop battery life, crystal-clear 40mm titanium diaphragm drivers, and ultra-comfortable ergonomic protein ear cushions.',
    features: [
      '-43dB Hybrid Active Noise Cancellation with ambient sound awareness',
      'LDAC Hi-Res Audio wireless transmission code for studio-grade acoustic depth',
      '0.08s Ultra-Low latency gaming and movie mode with synchronized precision',
      'DNN crystal-clear voice ENC dual microphone calling filters background wind'
    ],
    reviews: [
      {
        id: 'rev-1',
        userName: 'Zubair Al Mahmud',
        rating: 5,
        comment: 'The ANC performance at this price point is truly unbeatable in Bangladesh. Sounds deep, punchy and bass is immaculate!',
        date: '2025-05-10',
        verified: true,
      },
      {
        id: 'rev-2',
        userName: 'Sabbir Rahman',
        rating: 4.8,
        comment: 'Received within 24 hours inside Dhaka! Original Edifier authentic hologram included on box.',
        date: '2025-05-08',
        verified: true,
      }
    ]
  },
  {
    id: 'gt-mech-02',
    name: 'Royal Kludge RK61 Pro Wireless Hot-Swap RGB Mechanical Keyboard',
    category: 'Electronics & Gadgets',
    price: 4350,
    originalPrice: 5200,
    rating: 4.8,
    ratingCount: 98,
    inStock: true,
    stockCount: 14,
    badge: 'Top Pick',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60',
    galleryImages: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=60'
    ],
    description: 'Compact 60% mechanical gaming keyboard engineered with CNC aluminum frame, pre-lubed mechanical switches, triple-mode wireless connectivity (Bluetooth 5.0 / 2.4Ghz / Type-C), and dynamic per-key RGB backlight.',
    features: [
      'CNC milled solid aircraft-grade aerospace aluminum frame structure',
      'Triple-mode seamless connectivity: Bluetooth 5.0, 2.4GHz dongle, and braided Type-C',
      'Fully hot-swappable 3-pin and 5-pin mechanical switch PCB layout',
      'Vibrant south-facing 16.8M RGB backlighting effects with software macro mapping'
    ],
    reviews: [
      {
        id: 'rev-3',
        userName: 'Tanvir Hossain',
        rating: 5,
        comment: 'Super heavy aluminum casing gives premium thocky sound right out of the box!',
        date: '2025-05-02',
        verified: true,
      }
    ]
  },
  {
    id: 'gt-smart-03',
    name: 'Haylou Solar Pro Smartwatch with Bluetooth Calling & AMOLED',
    category: 'Electronics & Gadgets',
    price: 3650,
    originalPrice: 4400,
    rating: 4.7,
    ratingCount: 84,
    inStock: true,
    stockCount: 22,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=60',
    galleryImages: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60'
    ],
    description: '1.43-inch High Definition AMOLED touchscreen display with Always-On Mode, anti-sedentary military durability, anti-scratch sapphire coating, real-time SpO2 and continuous optical heart rate monitoring sensors.',
    features: [
      '1.43" Vivid Ultra Retina AMOLED display with 466x466 high pixel density',
      'One-tap Bluetooth calling support with noise-canceling digital speaker',
      '100+ Professional sports tracking modes and 24H sleep science monitoring',
      'IP68 Certified dust & water resistance rating for rainy rides and workouts'
    ],
    reviews: [
      {
        id: 'rev-4',
        userName: 'Nafis Anjum',
        rating: 4.8,
        comment: 'Battery lasts almost 8 days easily. Screen brightness outdoors in daylight is super crisp.',
        date: '2025-05-04',
        verified: true,
      }
    ]
  },
  {
    id: 'gt-auto-04',
    name: '70mai Smart Dash Cam Pro Plus+ A500S Dual Vision with Built-in GPS',
    category: 'Automotive Tech',
    price: 8900,
    originalPrice: 10500,
    rating: 5.0,
    ratingCount: 67,
    inStock: true,
    stockCount: 9,
    badge: 'Pro Tier',
    image: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800&auto=format&fit=crop&q=60',
    galleryImages: [
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=60'
    ],
    description: 'State of the art 1944P Ultra HD front recording and 1080P rear dual-channel camera powered by Sony IMX335 image sensors with Advanced Driver Assistance Systems (ADAS) and G-Sensor automated incident loop recording.',
    features: [
      '2.7K 1944P front + 1080P rear HDR dual-channel recording synchronized',
      'Sony IMX335 Sensor with 3D DNR and WDR night-vision algorithm',
      'Real-time ADAS alerts: Lane departure warning and forward collision caution',
      'Built-in GPS & GLONASS tracks speed, location coordinates, and route logs'
    ],
    reviews: [
      {
        id: 'rev-5',
        userName: 'Capt. Ariful Islam',
        rating: 5.0,
        comment: 'Night video quality on highway driving is extremely clear. Must have security device for all car owners!',
        date: '2025-05-11',
        verified: true,
      }
    ]
  },
  {
    id: 'gt-auto-05',
    name: 'Baseus 65W GaN Car Charger with Digital Voltage Display',
    category: 'Automotive Tech',
    price: 1850,
    originalPrice: 2400,
    rating: 4.8,
    ratingCount: 115,
    inStock: true,
    stockCount: 30,
    badge: 'Must Have',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=60',
    galleryImages: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=60'
    ],
    description: 'Super-fast 65W GaN charging adapter for vehicles with Type-C and USB dual-port fast charge capability. Powers MacBooks, laptops, iPhones, and Android devices at full fast charge speed.',
    features: [
      '65W High Power GaN fast charging architecture fits standard 12V-24V car sockets',
      'Dual output Type-C + USB handles laptop and flagship mobile simultaneous charging',
      'Intelligent LED digital display displays real-time battery voltage monitoring',
      'Multiple safety protections preventing over-current, over-voltage, and short circuits'
    ],
    reviews: []
  },
  {
    id: 'gt-lifestyle-06',
    name: 'Anker Soundcore Motion+ 30W Hi-Res Bluetooth Speaker',
    category: 'Electronics & Gadgets',
    price: 11200,
    originalPrice: 13500,
    rating: 4.9,
    ratingCount: 53,
    inStock: true,
    stockCount: 8,
    badge: 'Audiophile',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=60',
    galleryImages: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=60'
    ],
    description: 'Ultra-wide frequency range Bluetooth speaker loaded with Qualcomm aptX, BassUp acoustic calibration, customizable pro EQ in Soundcore app, and IPX7 fully waterproof construction.',
    features: [
      'Hi-Res Audio Certified with Qualcomm aptX lossless streaming reproduction',
      'Two ultra-high frequency tweeters + neodymium woofers pumped by 30W amplifiers',
      'BassUp technology boosts low-end frequencies in real-time without distortion',
      'IPX7 certified waterproof casing ready for pool parties, beach trips and tours'
    ],
    reviews: []
  }
];

// Initial user classified ads for testing
const INITIAL_USER_ADS: UserAd[] = [
  {
    id: 'uad-01',
    title: 'Sony WH-1000XM4 Noise Cancelling Headphones (Gently Used)',
    category: 'Electronics & Gadgets',
    price: 21500,
    originalPrice: 32000,
    condition: 'Used - Like New',
    description: 'Used for about 4 months with utmost care. Battery health is great, 28+ hours with ANC on. Full box with travel case and original aux cable available.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60'
    ],
    sellerName: 'Tanvir Ahmed',
    sellerPhone: '01711223344',
    sellerLocation: 'Dhanmondi, Dhaka',
    bkashTrxId: 'BL98437291',
    status: 'approved',
    createdAt: '2025-05-11 04:30 PM',
  },
  {
    id: 'uad-02',
    title: 'Logitech G502 HERO High Performance Gaming Mouse',
    category: 'Electronics & Gadgets',
    price: 3200,
    originalPrice: 4900,
    condition: 'Used - Good',
    description: 'HERO 25K optical sensor with customizable tuning weights included. RGB lighting works perfect with Logitech G HUB software.',
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=60'
    ],
    sellerName: 'Mahir Faysal',
    sellerPhone: '01822334455',
    sellerLocation: 'Uttara Sector 11, Dhaka',
    bkashTrxId: 'BK33918274',
    status: 'approved',
    createdAt: '2025-05-12 10:15 AM',
  }
];

export function App() {
  // Products
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
      return saved ? JSON.parse(saved);
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

  // Persistent storage updates (Protected against QuotaExceededError)
  useEffect(() => {
    try {
      localStorage.setItem('gentouch_products', JSON.stringify(products));
    } catch (e) {
      console.warn('LocalStorage limit exceeded, preserving in memory:', e);
    }
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

  // Cart operations
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

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Orders
  const handleCheckoutSuccess = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCartItems([]);
    if (activeCoupon) {
      setActiveCoupon(null);
      localStorage.removeItem('gentouch_active_coupon');
    }

    // Add notifications
    const adminAlert: NotificationItem = {
      id: `notif-ord-${Date.now()}`,
      title: `🛒 New Order: #${order.id}`,
      message: `${order.customer.name} ordered items worth ৳${order.total} via ${order.paymentMethod}.`,
      type: 'order',
      timestamp: 'Just now',
      read: false,
      forRole: 'admin',
    };

    const userNotif: NotificationItem = {
      id: `notif-user-${Date.now()}`,
      title: '✅ Order Placed Successfully!',
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

    // Notify Admin about new ad submission
    const adNotif: NotificationItem = {
      id: `notif-ad-${Date.now()}`,
      title: '📢 New Classified Ad Submitted',
      message: `${newAd.sellerName} posted "${newAd.title}" with TrxID: ${newAd.bkashTrxId}. Verification needed.`,
      type: 'ad',
      timestamp: 'Just now',
      read: false,
      forRole: 'admin',
    };
    setNotifications((prev) => [adNotif, ...prev]);
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

  // Filter products by category & search term (Safe guard against undefined/corrupted items)
  const filteredProducts = (products || []).filter((item) => {
    if (!item || typeof item !== 'object') return false;
    const itemCat = String(item.category || '');
    const matchesCategory =
      selectedCategory === 'All Products' || itemCat === selectedCategory;

    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return matchesCategory;

    const nameStr = String(item.name || '').toLowerCase();
    const descStr = String(item.description || '').toLowerCase();
    const catStr = itemCat.toLowerCase();

    return matchesCategory && (nameStr.includes(q) || descStr.includes(q) || catStr.includes(q));
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
      {/* Top Bar Announcement */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-black text-red-200 text-xs py-2 px-4 text-center font-medium border-b border-red-900/40 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-red-400 animate-pulse" />
        <span>১০০% আসল ও প্রিমিয়াম গ্যাজেট • সারাদেশে হোম ডেলিভারি • বিকাশ ও ক্যাশ অন ডেলিভারি</span>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-30 bg-[#12141c]/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 p-0.5 shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-[#12141c] rounded-[14px] flex items-center justify-center">
                  <span className="text-xl font-black text-white italic tracking-tighter">GT</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-white group-hover:text-red-500 transition-colors">
                    GEN<span className="text-red-600">-TOUCH</span>
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] font-bold uppercase bg-red-600/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                  Online Shopping BD
                </span>
              </div>
            </a>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search acoustics, mechanical keyboards, smart watches, car tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1d26] border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Post Ad / Sell Gear Button */}
            <button
              onClick={() => setIsPostAdOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-red-600/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdmin ? 'Upload Official' : 'Post Ad'}</span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2.5 rounded-xl bg-[#1a1d26] hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Admin / Portal Trigger */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className={`p-2.5 rounded-xl border transition-colors ${
                isAdmin
                  ? 'bg-red-600/20 text-red-400 border-red-500/40 hover:bg-red-600/30'
                  : 'bg-[#1a1d26] hover:bg-gray-800 text-gray-300 hover:text-white border-gray-800'
              }`}
              title={isAdmin ? 'Admin Dashboard' : 'Admin Login'}
            >
              <User className="w-4 h-4" />
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-red-600/25 transition-all hover:scale-105"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-black/30 px-1.5 py-0.5 rounded text-[11px] font-mono">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search gadgets, car tech, gears..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1d26] border border-gray-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </header>

      {/* Hero Section with Interactive Sports Car Game Trigger */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#12141c] via-[#0d0e14] to-[#0f1115] border-b border-gray-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20 text-red-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>অরিজিনাল ব্র্যান্ডের ইলেকট্রনিক্স ও অটোমোবাইল গ্যাজেট</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                GENUINE TECH. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-amber-500">
                  UNMATCHED SPEED.
                </span>
              </h1>
              <p className="text-sm md:text-base text-gray-400 max-w-xl leading-relaxed">
                জেন-টাচ অনলাইন শপ বিডি নিয়ে এসেছে আসল অরিজিনাল অডিও, হাই-স্পিড গেমিং অ্যাক্সেসরিজ, ড্যাশক্যাম এবং অটোমোবাইল গ্যাজেট। ঢাকা সিটিতে ২৪ ঘণ্টায় দ্রুত ডেলিভারি!
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#products-section"
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-xl shadow-red-600/25 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>এখনই কেনাকাটা করুন</span>
                </a>

                {/* Turbo Racer Game Challenge Button */}
                <button
                  onClick={() => setIsGameOpen(true)}
                  className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold px-5 py-3 rounded-xl text-sm shadow-xl shadow-amber-600/20 flex items-center gap-2 transition-all hover:scale-105 group border border-amber-500/30"
                >
                  <Gamepad2 className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform" />
                  <span>কার গেম খেলুন (৳৩০ কুপন জিতুন)</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-800/80 max-w-lg">
                <div>
                  <div className="text-lg font-black text-white">১০০%</div>
                  <div className="text-xs text-gray-400">অথেনটিক গ্যাজেট</div>
                </div>
                <div>
                  <div className="text-lg font-black text-white">২৪-৪৮ ঘণ্টা</div>
                  <div className="text-xs text-gray-400">এক্সপ্রেস ডেলিভারি</div>
                </div>
                <div>
                  <div className="text-lg font-black text-white">৭ দিন</div>
                  <div className="text-xs text-gray-400">রিপ্লেসমেন্ট গ্যারান্টি</div>
                </div>
              </div>
            </div>

            {/* Right Hero Interactive Card / Game Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-gradient-to-br from-[#161922] to-[#12141a] border border-gray-800 p-6 shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                      Mini Sports Car Challenge
                    </span>
                  </div>
                  <span className="text-[11px] font-mono bg-red-600/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30">
                    Play & Win
                  </span>
                </div>

                <div 
                  onClick={() => setIsGameOpen(true)}
                  className="cursor-pointer relative rounded-2xl overflow-hidden aspect-video bg-[#0a0b0e] border border-gray-800/80 group-hover:border-red-600/50 transition-all flex flex-col items-center justify-center p-4 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all shadow-lg shadow-red-600/20 mb-3">
                    <Gamepad2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                    GEN-TOUCH Turbo Racer
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">
                    স্পোর্টস কার ড্রাইভ করে স্কোর ৩০০+ তুললেই পাবেন নিশ্চিত ৳৩০ স্পেশাল ক্যাশ ভাউচার!
                  </p>
                  <span className="mt-3 text-xs font-bold text-red-500 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    গেম শুরু করুন <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {activeCoupon && (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/40 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-400">🎉 অ্যাক্টিভ কুপন ডিসকাউন্ট!</div>
                      <div className="text-[11px] text-gray-300">কুপন কোড: <span className="font-mono font-bold text-white">{activeCoupon.code}</span> (৳{activeCoupon.discountAmount} ছাড়)</div>
                    </div>
                    <button
                      onClick={() => setIsCartOpen(true)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                    >
                      ব্যবহার করুন
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section id="products-section" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
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
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-base font-bold text-gray-300">No products found</p>
            <p className="text-xs text-gray-500 mt-1">Try clearing your search query or switching categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(prod) => {
                  setSelectedProduct(prod);
                  setIsDetailsOpen(true);
                }}
                onAddToCart={(prod) => handleAddToCart(prod, 1)}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlist.includes(product.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Community Classifieds & User Ads Section */}
      <UserAdSection
        ads={userAds}
        onOpenPostModal={() => setIsPostAdOpen(true)}
      />

      {/* Global Footer */}
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* WhatsApp Floating Chat Widget */}
      <WhatsAppButton />

      {/* Modals & Overlays */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCart}
        onAddReview={handleAddReview}
        isWishlisted={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        activeCoupon={activeCoupon}
        onCheckoutSuccess={handleCheckoutSuccess}
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
        products={products}
        onAddProduct={handleAddProduct}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />

      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default App;
