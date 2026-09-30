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
    availableColors: ['Matte Obsidian', 'Silver Frost', 'Midnight Blue'],
    reviews: [
      { id: 'r1', author: 'Siam Ahmed', rating: 5, date: '2 days ago', comment: 'Sound stage is unbelievable! Bass is super punchy.' },
      { id: 'r2', author: 'Farhan Kabir', rating: 5, date: '1 week ago', comment: 'ANC works exceptionally well in Dhaka traffic noise.' }
    ]
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
    availableColors: ['Space Gray', 'Starlight Silver', 'Phantom Black'],
    reviews: [
      { id: 'r3', author: 'Nafis Chowdhury', rating: 5, date: 'Yesterday', comment: 'Battery easily lasts 5-6 days. Screen is vibrant under direct sunlight.' }
    ]
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
    availableColors: ['Carbon Black', 'Retro White', 'Cyber Punk'],
    reviews: [
      { id: 'r4', author: 'Shakil Anwar', rating: 5, date: '3 days ago', comment: 'The typing sound profile is deep and creamy! Best value keyboard in BD.' }
    ]
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
    availableColors: ['Stealth Gray', 'Glacier White'],
    reviews: [
      { id: 'r5', author: 'Mahmudul Hasan', rating: 5, date: '5 days ago', comment: 'Video stability is top notch. Smooth GPS hover.' }
    ]
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
    availableColors: ['Gunmetal Grey', 'Gold Amber', 'Obsidian Black'],
    reviews: []
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
    badge: undefined,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80',
    ],
    description: 'Conical stainless steel burr mechanism offering 31 grind adjustments from ultra-fine espresso to coarse French press consistency.',
    features: ['Stainless Conical Burrs', '31 Precise Grind Settings', 'One-Touch Timer Control', 'Anti-Static Grind Chamber'],
    availableColors: ['Matte Black', 'Brushed Steel'],
    reviews: []
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
    availableColors: ['Titanium Gray', 'Deep Blue', 'Arctic White'],
    reviews: []
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
    badge: undefined,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    ],
    description: 'Scandinavian warm LED ambient illumination with integrated pen docks, smartphone wireless charging pad, and touch stepless dimming.',
    features: ['3 Color Temperatures', 'Touch Stepless Dimming', 'Wireless Phone Dock', 'Solid Oak Wood Base'],
    availableColors: ['Natural Oak', 'Dark Walnut'],
    reviews: []
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
    status: 'approved',
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
    status: 'approved',
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter(p => p && typeof p.price === 'number');
          if (valid.length > 0) return valid;
        }
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
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('gentouch_admin_auth') === 'true';
  });

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
        customerName: 'Tanzim Taj',
        phone: '01310588979',
        address: 'GEN-TOUCH HQ, Dhaka',
        district: 'Dhaka',
        deliveryArea: 'inside_dhaka',
        paymentMethod: 'bkash',
        paymentOption: 'partial_delivery',
        bkashTxId: '9K8J7H6G5F',
        subtotal: 3499,
        deliveryCharge: 70,
        discountAmount: 10,
        total: 3559,
        status: 'Delivered',
        createdAt: '2025-05-14',
        items: [
          {
            id: 'gt-01',
            name: 'AcousticPro ANC Active Noise Cancelling Headset',
            price: 3499,
            quantity: 1,
            color: 'Matte Obsidian',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
          },
        ]
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
      {
        id: '2',
        title: '🏎️ Turbo Race Arcade Open!',
        message: 'Play the speed challenge now to unlock ৳30 instant checkout coupons!',
        timestamp: '1 hour ago',
        read: false,
        type: 'game',
      }
    ];
  });

  // Active Coupon
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
        // filter out any corrupt products without valid prices
        const validLive = liveItems.filter(p => p && typeof p.price === 'number');
        if (validLive.length > 0) {
          setProducts(validLive);
          try {
            localStorage.setItem('gentouch_products', JSON.stringify(validLive));
          } catch {
            // ignore
          }
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
      console.warn('LocalStorage limit exceeded:', e);
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
    if (activeCoupon) {
      localStorage.setItem('gentouch_active_coupon', JSON.stringify(activeCoupon));
    } else {
      localStorage.removeItem('gentouch_active_coupon');
    }
  }, [activeCoupon]);

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

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleCheckoutSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setActiveCoupon(null);

    // Notify user
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: '📦 Order Placed Successfully!',
      message: `Your order #${newOrder.id} of ৳${(newOrder.total || 0).toLocaleString()} has been placed. We will contact you soon.`,
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
      type: 'admin',
    };
    setNotifications((prev) => [adNotif, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleUpdateAdStatus = (adId: string, status: 'approved' | 'rejected') => {
    setUserAds(prev => prev.map(a => a.id === adId ? { ...a, status } : a));
  };

  const handleDeleteAd = (adId: string) => {
    setUserAds(prev => prev.filter(a => a.id !== adId));
  };

  const handleAddReview = (productId: string, review: ProductReview) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const reviews = p.reviews ? [review, ...p.reviews] : [review];
        const newRating = +(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
        return {
          ...p,
          reviews,
          rating: newRating,
          ratingCount: reviews.length
        };
      }
      return p;
    }));
  };

  // Filter products safely
  const categories = ['All Products', 'Electronics & Gadgets', 'Fashion & Lifestyle', 'Home & Kitchen'];

  const safeProducts = (products && products.length > 0) ? products : INITIAL_PRODUCTS;
  const filteredProducts = safeProducts.filter((product) => {
    if (!product) return false;
    const matchesCategory =
      selectedCategory === 'All Products' || product.category === selectedCategory;
    const matchesSearch =
      (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotalCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0e1015] text-gray-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      
      {/* Top Banner Notice */}
      <div className="bg-red-700 text-white text-xs font-semibold py-1.5 px-4 shadow-md overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold">
              GEN-TOUCH ONLINE SHOPPING BD
            </span>
            <span className="hidden sm:inline text-white/90">
              ⚡ Use secret coupon <strong className="text-yellow-300 font-mono font-bold">ilovegentouch</strong> for ৳10 OFF! | Play Turbo Race to win up to
            </span>
            <button 
              onClick={() => setIsGameOpen(true)}
              className="text-yellow-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              🎮 Play Game
            </button>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold">
            <button
              onClick={() => setIsPostAdOpen(true)}
              className="hover:text-yellow-300 transition flex items-center gap-1 cursor-pointer"
            >
              + Post Ad (৳10)
            </button>
          </div>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-30 bg-[#12141a]/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo with Real Car Icon & Subtitle */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-3 group">
              <div className="relative w-14 h-10 flex items-center justify-center">
                <svg viewBox="0 0 160 80" className="w-full h-full drop-shadow-[0_2px_8px_rgba(239,68,68,0.5)]">
                  <path d="M15 50 C30 50, 45 42, 60 30 C75 18, 95 18, 115 25 C135 32, 145 42, 150 48 C140 52, 130 52, 120 52 C115 42, 105 42, 100 52 C70 52, 60 52, 50 52 C45 42, 35 42, 30 52 Z" fill="#b91c1c" />
                  <path d="M55 32 C65 24, 85 24, 105 28 L110 38 L50 38 Z" fill="#1e293b" opacity="0.8" />
                  <circle cx="35" cy="52" r="9" fill="#0f172a" stroke="#ef4444" strokeWidth="2.5" />
                  <circle cx="110" cy="52" r="9" fill="#0f172a" stroke="#ef4444" strokeWidth="2.5" />
                  <path d="M25 45 C40 38, 120 38, 135 45" stroke="#f87171" strokeWidth="2" fill="none" />
                  <text x="80" y="47" fill="#ffffff" fontSize="12" fontWeight="900" fontStyle="italic" textAnchor="middle">GEN-Touch</text>
                </svg>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1">
                  GEN<span className="text-red-600">-TOUCH</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold block -mt-1">
                  ONLINE SHOPPING BD
                </span>
              </div>
            </a>
          </div>

          {/* Search Input Box */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search acoustics, mechanical keyboards, dash cams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#181a20] border border-gray-700/80 rounded-full py-2 pl-10 pr-4 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Post Ad Button */}
            <button
              onClick={() => setIsPostAdOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 transition transform hover:scale-105 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Ad</span>
            </button>

            {/* Notification Bell with Badge */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2.5 rounded-xl bg-[#181a20] border border-gray-800 hover:border-red-500 text-gray-300 transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* User Account / Orders Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="p-2.5 rounded-xl bg-[#181a20] border border-gray-800 hover:border-red-500 text-gray-300 transition cursor-pointer"
              title="Customer Login / Order Track"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Cart Button with Count Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition transform hover:scale-105 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              <span className="bg-black/30 px-1.5 py-0.5 rounded-full text-[10px] font-mono">
                {cartTotalCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181a20] border border-gray-700 rounded-full py-1.5 pl-9 pr-4 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </header>

      {/* Hero Section Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#161820] to-[#0e1015] py-16 border-b border-gray-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.18),transparent_55%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Premium Tech & Classifieds BD</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
              GEN-TOUCH <span className="text-red-600">Online Shopping</span> <br />
              <span className="text-red-500">BD</span>
            </h1>

            <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl">
              Discover authentic audiophile acoustic gear, high-grade mechanical keyboards, 4K automotive dash cams, and verified community classifieds.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => {
                  const el = document.getElementById('products-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsGameOpen(true)}
                className="px-5 py-3 rounded-xl bg-[#1b1e27] hover:bg-[#222632] border border-gray-700/80 text-yellow-300 font-bold text-sm transition flex items-center gap-2 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Play Turbo Race (Win ৳30)</span>
              </button>

              <button
                onClick={() => setIsPostAdOpen(true)}
                className="px-5 py-3 rounded-xl bg-[#1b1e27] hover:bg-[#222632] border border-gray-700/80 text-gray-200 font-bold text-sm transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-red-500" />
                <span>Sell Your Item (৳10)</span>
              </button>
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
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
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

      <UserAdModal
        isOpen={isPostAdOpen}
        onClose={() => setIsPostAdOpen(false)}
        onSubmitAd={handleSubmitAd}
        onAddProduct={handleAddProduct}
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
