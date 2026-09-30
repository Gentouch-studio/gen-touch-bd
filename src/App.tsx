import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Bell, Search, User, Sparkles, 
  Gamepad2, Plus, ArrowRight, X, Heart
} from 'lucide-react';
import { 
  Product, ProductCategory, CartItem, Order, UserAd, 
  NotificationItem, GameCoupon, OrderStatus 
} from './types';
import { PRODUCTS as INITIAL_PRODUCTS } from './data/products';
import { productService } from './services/productService';
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

export const App: React.FC = () => {
  // PRODUCTS STATE (Synced with Firebase Cloud Firestore + LocalStorage fallback)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // CART & WISHLIST
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // USER ADS (Synced with Firebase Cloud Firestore)
  const [userAds, setUserAds] = useState<UserAd[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_user_ads');
      return saved ? JSON.parse(saved) : [
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
        }
      ];
    } catch {
      return [];
    }
  });

  // ORDERS
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // NOTIFICATIONS
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
    }
  ]);

  // MODALS
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isPostAdOpen, setIsPostAdOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // ADMIN AUTH
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('gentouch_is_admin') === 'true';
  });

  // GAME COUPON
  const [activeCoupon, setActiveCoupon] = useState<GameCoupon | null>(null);

  // REALTIME FIRESTORE LISTENER (Cloud Database Auto-Sync)
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

  // Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('gentouch_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save Wishlist to LocalStorage
  useEffect(() => {
    localStorage.setItem('gentouch_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Save User Ads to LocalStorage
  useEffect(() => {
    localStorage.setItem('gentouch_user_ads', JSON.stringify(userAds));
  }, [userAds]);

  // Save Orders to LocalStorage
  useEffect(() => {
    localStorage.setItem('gentouch_orders', JSON.stringify(orders));
  }, [orders]);

  // CART HANDLERS
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

  // CHECKOUT & ORDERS
  const handleCheckoutSuccess = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCartItems([]);
    setIsCartOpen(false);

    // Notify user & admin
    const newNotif: NotificationItem = {
      id: `ord-${Date.now()}`,
      title: '📦 Order Received!',
      message: `Your order #${order.id} for ৳${order.total} has been placed. We are verifying it.`,
      type: 'order',
      timestamp: 'Just now',
      read: false,
      forRole: 'user',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // ADMIN SUBMIT PRODUCT (Saves directly to Firebase + Local)
  const handleAddProduct = async (newProduct: Product) => {
    try {
      await productService.saveProduct(newProduct);
    } catch (e) {
      console.error(e);
    }
    setProducts((prev) => [newProduct, ...prev]);
  };

  // USER SUBMIT AD (Saves directly to Firebase + Local)
  const handleSubmitAd = async (newAd: UserAd) => {
    try {
      await productService.saveUserAd(newAd);
    } catch (e) {
      console.error(e);
    }
    setUserAds((prev) => [newAd, ...prev]);

    const adminNotif: NotificationItem = {
      id: `ad-notif-${Date.now()}`,
      title: '📢 New Member Ad Submitted!',
      message: `${newAd.sellerName} submitted "${newAd.title}" (Fee: ৳${newAd.feeAmount}, TrxID: ${newAd.feeTrxId}).`,
      type: 'ad',
      timestamp: 'Just now',
      read: false,
      forRole: 'admin',
    };
    setNotifications((prev) => [adminNotif, ...prev]);
  };

  // ADMIN AUTHENTICATION
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

  // মেম্বার এডস ও প্রোডাক্ট ডিলিট হ্যান্ডলার
  const handleDeleteAd = (adId: string) => {
    setUserAds((prev) => prev.filter((a) => a.id !== adId));
    setProducts((prev) => prev.filter((p) => p.id !== adId));
  };

  // FILTERED PRODUCTS
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'All Products' || prod.category === selectedCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase());
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
                </svg>
              </div>

              {/* Text fallback logo */}
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center">
                  GEN<span className="text-red-600">-</span>TOUCH
                </span>
                <span className="text-[10px] tracking-widest text-gray-400 font-bold uppercase -mt-1">
                  ONLINE SHOPPING BD
                </span>
              </div>
            </a>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xl hidden md:block mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search acoustics, mechanical keyboards, smart watches, car tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 pl-10 pr-10 bg-[#161920] border border-gray-800 rounded-full text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-2.5 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsPostAdOpen(true)}
              className="flex items-center gap-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Post Ad</span>
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
