import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  SlidersHorizontal, 
  Plus, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Headphones, 
  RotateCcw,
  Tag,
  Gamepad2,
  Lock,
  Heart
} from 'lucide-react';
import { Product, CartItem, UserAd, Order, NotificationItem, Coupon } from './types';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { UserAdModal } from './components/UserAdModal';
import { TurboRaceGame } from './components/TurboRaceGame';
import { AdminModal } from './components/AdminModal';
import { NotificationCenter } from './components/NotificationCenter';
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
  },
  {
    id: 'gt-02',
    name: 'Stealth Horizon Smartwatch Series 9 (AMOLED)',
    category: 'Electronics & Gadgets',
    price: 2850,
    originalPrice: 3600,
    rating: 4.8,
    ratingCount: 42,
    inStock: true,
    stockCount: 8,
    badge: 'Trending',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
    ],
    description: 'Ultra-thin aerospace aluminum alloy frame with 1.96-inch curved AMOLED always-on display, SpO2 sensor, and Bluetooth calling.',
    features: ['AMOLED Always-On Display', 'Bluetooth Calling & Mic', 'Heart Rate & Sleep Tracking', 'IP68 Water Resistance'],
  },
  {
    id: 'gt-03',
    name: 'Apex Mechanical RGB Gaming Keyboard (Hot-Swap)',
    category: 'Electronics & Gadgets',
    price: 3199,
    originalPrice: 4200,
    rating: 4.95,
    ratingCount: 19,
    inStock: true,
    stockCount: 5,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
    ],
    description: 'Compact 75% mechanical keyboard fitted with factory lubed linear red switches, per-key RGB backlighting, and sound-dampening foam.',
    features: ['Hot-Swappable 5-Pin PCB', 'Sound Dampening Silicone Pads', 'South-Facing Per-Key RGB', 'Type-C Braided Cable'],
  },
  {
    id: 'gt-04',
    name: 'Falcon 4K UHD Dual-Camera GPS Drone',
    category: 'Electronics & Gadgets',
    price: 8990,
    originalPrice: 12500,
    rating: 4.7,
    ratingCount: 14,
    inStock: true,
    stockCount: 4,
    badge: 'Flash Deal',
    image: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800&q=80',
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80',
    ],
    description: 'Intelligent obstacle-sensing drone equipped with 3-axis gimbal stabilized 4K video recording, 32-minute flight time, and auto return-to-home.',
    features: ['4K 60FPS Gimbal Camera', '32 Min Extended Flight', 'GPS Auto-Return Home', 'Optical Flow Hovering'],
  },
  {
    id: 'gt-05',
    name: 'Titanium Polarized UV400 Aviator Sunglasses',
    category: 'Fashion & Lifestyle',
    price: 1250,
    originalPrice: 1950,
    rating: 4.85,
    ratingCount: 37,
    inStock: true,
    stockCount: 22,
    badge: 'Hot',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80',
    ],
    description: 'Precision engineered ultralight titanium frame with TAC polarized 9-layer glare protection lenses for driving and outdoors.',
    features: ['100% UV400 Protection', 'TAC Polarized 9-Layer Lens', 'Ultralight Titanium Frame', 'Anti-Slip Silicone Nose Pads'],
  },
  {
    id: 'gt-06',
    name: 'Precision Barista Electric Coffee Bean Grinder',
    category: 'Home & Kitchen',
    price: 2450,
    originalPrice: 3200,
    rating: 4.9,
    ratingCount: 16,
    inStock: true,
    stockCount: 10,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80',
    ],
    description: 'Conical stainless steel burr mechanism offering 31 grind adjustments from ultra-fine espresso to coarse French press consistency.',
    features: ['Stainless Conical Burrs', '31 Precise Grind Settings', 'One-Touch Timer Control', 'Anti-Static Grind Chamber'],
  },
  {
    id: 'gt-07',
    name: 'MagSafe 10000mAh Ultra-Slim Wireless Power Bank',
    category: 'Electronics & Gadgets',
    price: 1850,
    originalPrice: 2400,
    rating: 4.8,
    ratingCount: 51,
    inStock: true,
    stockCount: 30,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1609592424360-15497ff4f333?w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1609592424360-15497ff4f333?w=800&q=80',
    ],
    description: 'Snap-on magnetic wireless charging with 20W PD Type-C fast bi-directional charging port and digital LED percentage display.',
    features: ['15W MagSafe Wireless', '20W PD Fast Charging', 'Digital Battery % LED', 'Airline Approved Capacity'],
  },
  {
    id: 'gt-08',
    name: 'Nordic Minimalist Oak & Metal Desk Organizer Lamp',
    category: 'Home & Kitchen',
    price: 1950,
    originalPrice: 2800,
    rating: 4.75,
    ratingCount: 22,
    inStock: true,
    stockCount: 12,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    ],
    description: 'Scandinavian warm LED ambient illumination with integrated pen docks, smartphone wireless charging pad, and touch stepless dimming.',
    features: ['3 Color Temperatures', 'Touch Stepless Dimming', 'Wireless Phone Dock', 'Solid Oak Wood Base'],
  }
];

const INITIAL_USER_ADS: UserAd[] = [
  {
    id: 'ad-01',
    title: 'Sony PlayStation 5 Disc Edition (with 2 DualSense)',
    category: 'Electronics & Gadgets',
    price: 54000,
    originalPrice: 65000,
    sellerName: 'Tanvir Hossain',
    sellerPhone: '01711223344',
    sellerLocation: 'Dhanmondi 27, Dhaka',
    condition: 'Like New',
    description: 'Barely 4 months used, pristine condition with box, power cord, 2 controllers, and FIFA 24 disc.',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80',
    status: 'active',
    createdAt: '2025-05-10',
    views: 142,
  },
  {
    id: 'ad-02',
    title: 'Apple MacBook Air M2 (16GB RAM / 512GB SSD)',
    category: 'Electronics & Gadgets',
    price: 118000,
    originalPrice: 145000,
    sellerName: 'Rafiqul Islam',
    sellerPhone: '01899887766',
    sellerLocation: 'Mirpur DOHS, Dhaka',
    condition: 'Used',
    description: 'Midnight color, 97% battery health, original 35W dual charger with warranty receipt.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    status: 'active',
    createdAt: '2025-05-12',
    views: 89,
  }
];

export function App() {
  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
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
  const [isPostAdOpen, setIsPostAdOpen] = useState<boolean>(false);
  const [isGameOpen, setIsGameOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // User Classified Ads
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
          address: 'GEN-TOUCH HQ, Dhaka',
          city: 'Dhaka',
        },
        items: [
          {
            product: INITIAL_PRODUCTS[0],
            quantity: 1,
            selectedColor: 'Matte Obsidian',
          },
        ],
        totalAmount: 3499,
        paymentMethod: 'bKash',
        status: 'Delivered',
        date: '2025-05-14',
      },
    ];
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_notifications');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: '1',
        title: '🎉 Welcome to GEN-TOUCH!',
        message: 'Claim ৳10 off your first purchase using coupon code ilovegentouch.',
        timestamp: 'Just now',
        read: false,
        type: 'promo',
      },
    ];
  });

  // Active Coupon
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
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

  // Sync to local storage
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
    localStorage.setItem('gentouch_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('gentouch_active_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('gentouch_active_coupon');
    }
  }, [appliedCoupon]);

  // Cart Operations
  const handleAddToCart = (product: Product, quantity = 1, color?: string) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedColor === color
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedColor === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedColor: color }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
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
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

  const handleApplyCoupon = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toLowerCase();
    if (clean === 'ilovegentouch') {
      const coupon: Coupon = {
        code: 'ilovegentouch',
        discountType: 'fixed',
        discountAmount: 10,
        description: 'Special Community Discount',
      };
      setAppliedCoupon(coupon);
      return { success: true, message: '৳10 discount coupon applied successfully!' };
    }
    if (clean.startsWith('turbo-') || clean.startsWith('turbowin')) {
      const coupon: Coupon = {
        code: clean,
        discountType: 'fixed',
        discountAmount: 30,
        description: 'Turbo Race Winner Voucher',
      };
      setAppliedCoupon(coupon);
      return { success: true, message: '৳30 Turbo Race Champion Voucher Applied!' };
    }
    return { success: false, message: 'Invalid or expired coupon code.' };
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleCheckoutComplete = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setAppliedCoupon(null);

    // Notify user
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: '📦 Order Placed Successfully!',
      message: `Your order #${newOrder.id} of ৳${newOrder.totalAmount.toLocaleString()} has been placed. We will contact you soon.`,
      timestamp: 'Just now',
      read: false,
      type: 'order',
    };
    setNotifications((prev) => [notif, ...prev]);
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
      message: `User ad "${newAd.title}" submitted by ${newAd.sellerName}.`,
      timestamp: 'Just now',
      read: false,
      type: 'info',
    };
    setNotifications((prev) => [adNotif, ...prev]);
  };

  // Filter products
  const categories = ['All Products', 'Electronics & Gadgets', 'Fashion & Lifestyle', 'Home & Kitchen', 'Classified Ads'];

  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'All Products' || prod.category === selectedCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="25%" stopColor="#f8fafc" />
                      <stop offset="50%" stopColor="#cbd5e1" />
                      <stop offset="75%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#64748b" />
                    </linearGradient>
                    <linearGradient id="silverChromeMid" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#64748b" />
                      <stop offset="30%" stopColor="#e2e8f0" />
                      <stop offset="50%" stopColor="#334155" />
                      <stop offset="70%" stopColor="#f1f5f9" />
                      <stop offset="100%" stopColor="#475569" />
                    </linearGradient>
                    <linearGradient id="silverChromeBot" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#475569" />
                      <stop offset="40%" stopColor="#cbd5e1" />
                      <stop offset="50%" stopColor="#1e293b" />
                      <stop offset="70%" stopColor="#f8fafc" />
                      <stop offset="100%" stopColor="#334155" />
                    </linearGradient>
                    <linearGradient id="redGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff1133" />
                      <stop offset="100%" stopColor="#880000" />
                    </linearGradient>
                  </defs>

                  {/* Red Sportscar Profile Silhouette */}
                  <g transform="translate(180, 20) scale(0.6)">
                    <path
                      d="M80 180 C180 170, 260 120, 380 110 C500 100, 620 125, 750 175 C810 200, 840 230, 830 250 C790 255, 740 215, 680 215 C620 215, 590 260, 500 260 C420 260, 400 215, 330 215 C260 215, 230 255, 140 255 C90 255, 70 230, 80 180 Z"
                      fill="url(#redGlow)"
                      opacity="0.95"
                    />
                    <ellipse cx="235" cy="245" rx="42" ry="42" fill="#0b0d11" stroke="#ef4444" strokeWidth="6" />
                    <ellipse cx="685" cy="245" rx="42" ry="42" fill="#0b0d11" stroke="#ef4444" strokeWidth="6" />
                    <path d="M340 145 C440 135, 560 145, 640 180 L490 180 Z" fill="#00f2fe" opacity="0.45" />
                  </g>

                  {/* Chrome Typography GEN-TOUCH */}
                  <text
                    x="450"
                    y="370"
                    fontFamily="Arial Black, Impact, sans-serif"
                    fontSize="115"
                    fontWeight="900"
                    textAnchor="middle"
                    letterSpacing="8"
                    fill="url(#silverChromeMid)"
                    stroke="#0f172a"
                    strokeWidth="7"
                  >
                    GEN-TOUCH
                  </text>
                  <text
                    x="450"
                    y="368"
                    fontFamily="Arial Black, Impact, sans-serif"
                    fontSize="115"
                    fontWeight="900"
                    textAnchor="middle"
                    letterSpacing="8"
                    fill="url(#silverChromeTop)"
                    opacity="0.9"
                  >
                    GEN-TOUCH
                  </text>

                  {/* Red Accent Wing Lines */}
                  <path d="M120 420 L780 420" stroke="url(#redGlow)" strokeWidth="6" strokeLinecap="round" />
                  <path d="M220 435 L680 435" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />

                  {/* Tagline */}
                  <text
                    x="450"
                    y="500"
                    fontFamily="Arial, sans-serif"
                    fontSize="36"
                    fontWeight="800"
                    textAnchor="middle"
                    letterSpacing="18"
                    fill="#e2e8f0"
                  >
                    ONLINE SHOPPING BD
                  </text>
                </svg>
              </div>
            </a>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-2 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search premium gadgets, smartwatches, headsets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1b1f29] border border-gray-700/80 rounded-full py-2.5 pl-11 pr-4 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationCenter notifications={notifications} />

            <button
              onClick={() => setIsGameOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white text-xs font-semibold transition"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Turbo Game</span>
            </button>

            {/* Post Ad Button */}
            <button
              onClick={() => setIsPostAdOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#202533] border border-gray-700 hover:border-red-500 text-gray-200 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Sell Your Gear</span>
              <span className="sm:hidden">Sell</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-[#1b1f29] border border-gray-700 hover:border-red-500 transition group"
            >
              <ShoppingBag className="w-5 h-5 text-gray-200 group-hover:text-red-400 transition" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              )}
            </button>

            {/* Admin Lock Button */}
            <button
              onClick={() => setIsAdminOpen(true)}
              title="Admin Portal"
              className="p-2.5 rounded-full bg-[#1b1f29] border border-gray-700 hover:border-yellow-500 hover:text-yellow-400 text-gray-400 transition"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1b1f29] border border-gray-700 rounded-full py-2 pl-10 pr-4 text-xs text-gray-100 placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </header>

      {/* 3. HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#141720] to-[#0f1115] border-b border-gray-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Engineered for Perfection & Pure Performance</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Next-Gen Gear. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-yellow-400">
                Premium Performance.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              Genuine gadgets, authentic classified ads, fast nationwide delivery across Bangladesh, and cash on delivery or secure bKash checkout.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('catalog');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-sm text-white shadow-lg shadow-red-600/30 transition transform hover:-translate-y-0.5"
              >
                Explore Collection
              </button>
              <button
                onClick={() => setIsGameOpen(true)}
                className="px-5 py-3 rounded-xl bg-[#1d222e] hover:bg-[#262c3c] border border-gray-700 font-bold text-sm text-yellow-300 flex items-center gap-2 transition"
              >
                <Gamepad2 className="w-4 h-4" />
                Play Turbo Race (৳30 Win)
              </button>
            </div>
          </div>

          {/* Quick Perks Badge Cards */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="bg-[#171b24] border border-gray-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Fast BD Delivery</h4>
                <p className="text-[11px] text-gray-400">Dhaka & Nationwide</p>
              </div>
            </div>
            <div className="bg-[#171b24] border border-gray-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">100% Authentic</h4>
                <p className="text-[11px] text-gray-400">Guaranteed Brand QC</p>
              </div>
            </div>
            <div className="bg-[#171b24] border border-gray-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Direct Support</h4>
                <p className="text-[11px] text-gray-400">01310588979 (bKash/Call)</p>
              </div>
            </div>
            <div className="bg-[#171b24] border border-gray-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Promo Discounts</h4>
                <p className="text-[11px] text-gray-400">Use: ilovegentouch</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MAIN PRODUCT CATALOG & FILTER BAR */}
      <main id="catalog" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Category Navigation Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-[#181c26] text-gray-300 hover:bg-[#202533] border border-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              Showing {selectedCategory === 'Classified Ads' ? userAds.length : filteredProducts.length} items
            </span>
          </div>
        </div>

        {/* Content Section: Classified Ads OR Store Products */}
        {selectedCategory === 'Classified Ads' ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Verified Classified Ads</h2>
                <p className="text-xs text-gray-400">Community posted tech & gear across Bangladesh.</p>
              </div>
              <button
                onClick={() => setIsPostAdOpen(true)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Post Your Ad (৳10)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {userAds.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-[#151922] border border-gray-800 rounded-2xl overflow-hidden hover:border-red-500/50 transition flex flex-col justify-between p-4 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40">
                      <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded">
                        {ad.condition}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-red-400 uppercase font-mono tracking-wider font-bold">
                        {ad.category}
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-2 mt-1">{ad.title}</h3>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{ad.description}</p>
                  </div>

                  <div className="border-t border-gray-800 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400">Asking Price</span>
                      <p className="text-base font-black text-red-400">৳{ad.price.toLocaleString()}</p>
                    </div>
                    <a
                      href={`tel:${ad.sellerPhone}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition"
                    >
                      Call: {ad.sellerPhone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Store Products Grid */
          <div>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-[#141720] rounded-2xl border border-gray-800/80 space-y-3">
                <Search className="w-10 h-10 text-gray-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No products found</h3>
                <p className="text-xs text-gray-400">Try changing your search terms or category filter.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All Products');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onQuickView={handleQuickView}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 5. FOOTER */}
      <footer className="bg-[#11131a] border-t border-gray-800/80 text-gray-400 text-xs mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="text-white font-black text-base tracking-wider">GEN-TOUCH</span>
            <p className="text-gray-400 leading-relaxed">
              Bangladesh’s premier destination for high-performance gadgets, luxury tech accessories, and verified classified gear.
            </p>
            <p className="text-[11px] text-gray-500">
              Admin & bKash Merchant: <strong className="text-gray-300">01310588979</strong>
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 text-sm">Product Categories</h4>
            <ul className="space-y-2">
              <li><a href="#catalog" onClick={() => setSelectedCategory('Electronics & Gadgets')} className="hover:text-red-400 transition">Electronics & Gadgets</a></li>
              <li><a href="#catalog" onClick={() => setSelectedCategory('Fashion & Lifestyle')} className="hover:text-red-400 transition">Fashion & Lifestyle</a></li>
              <li><a href="#catalog" onClick={() => setSelectedCategory('Home & Kitchen')} className="hover:text-red-400 transition">Home & Kitchen</a></li>
              <li><a href="#catalog" onClick={() => setSelectedCategory('Classified Ads')} className="hover:text-red-400 transition">Classified Ads Portal</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 text-sm">Customer Care</h4>
            <ul className="space-y-2">
              <li>Cash on Delivery (All 64 Districts)</li>
              <li>7-Day Replacement Guarantee</li>
              <li>bKash & Nagad Payment Verification</li>
              <li>Track Active Order Status</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 text-sm">Secret Coupons & Rewards</h4>
            <p className="text-gray-400 mb-2">
              Apply promo code <span className="text-red-400 font-mono font-bold">ilovegentouch</span> in the cart for instant ৳10 discount!
            </p>
            <button
              onClick={() => setIsGameOpen(true)}
              className="mt-2 w-full py-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white font-bold transition flex items-center justify-center gap-2"
            >
              <Gamepad2 className="w-4 h-4" /> Play Game For ৳30 Off
            </button>
          </div>
        </div>

        <div className="border-t border-gray-800/80 py-4 text-center text-gray-500 text-[11px]">
          © {new Date().getFullYear()} GEN-TOUCH Bangladesh. All rights reserved. Engineered for Performance.
        </div>
      </footer>

      {/* 6. MODALS & DRAWERS */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        onCheckoutComplete={handleCheckoutComplete}
        bkashNumber="01310588979"
      />

      {selectedProduct && (
        <ProductDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onAddToCart={handleAddToCart}
          isWishlisted={wishlist.includes(selectedProduct.id)}
          onToggleWishlist={handleToggleWishlist}
        />
      )}

      <UserAdModal
        isOpen={isPostAdOpen}
        onClose={() => setIsPostAdOpen(false)}
        onSubmitAd={handleSubmitAd}
        bkashNumber="01310588979"
      />

      <TurboRaceGame
        isOpen={isGameOpen}
        onClose={() => setIsGameOpen(false)}
        onWinDiscount={(amount) => {
          const promoCode = `turbowin-${amount}`;
          setAppliedCoupon({
            code: promoCode,
            discountType: 'fixed',
            discountAmount: amount,
            description: `Turbo Champion ${amount}TK Off`,
          });
          setIsCartOpen(true);
        }}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        userAds={userAds}
        orders={orders}
        onAddProduct={handleAddProduct}
        onDeleteProduct={(id) => setProducts((prev) => prev.filter((p) => p.id !== id))}
        onUpdateOrderStatus={(id, status) =>
          setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
        }
        onDeleteAd={(id) => setUserAds((prev) => prev.filter((a) => a.id !== id))}
      />
    </div>
  );
}
