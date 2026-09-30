import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { WishlistModal } from './components/WishlistModal';
import { WarrantyModal } from './components/WarrantyModal';
import { AdminModal } from './components/AdminModal';
import { PostAdModal } from './components/PostAdModal';
import { CommunityAdsModal } from './components/CommunityAdsModal';
import { SupportModal } from './components/SupportModal';
import { TurboRacerGame } from './components/TurboRacerGame';
import { NotificationCenter } from './components/NotificationCenter';
import { initialProducts } from './data/products';
import { 
  Product, CartItem, Order, CustomerInfo, 
  UserAd, OrderStatus, NotificationItem, GameCoupon 
} from './types';
import { productService } from './services/productService';
import { 
  Shield, Truck, Award, Headphones, ArrowRight, 
  Sparkles, CheckCircle, Zap, Gamepad2, Megaphone,
  ShoppingBag, Facebook, Send, ShieldAlert,
  Flame, TrendingUp, Cpu, HeartHandshake, Eye
} from 'lucide-react';

export function App() {
  // Products state (persisted locally & synced with Firestore)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback to initial
    }
    return initialProducts;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All Products');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_cart');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Wishlist state
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_wishlist');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Modal open states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [isWarrantyOpen, setIsWarrantyOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPostAdOpen, setIsPostAdOpen] = useState(false);
  const [isCommunityAdsOpen, setIsCommunityAdsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'GT-902144',
        items: [
          {
            product: initialProducts[0] || {
              id: 'p1',
              name: 'Cyberpunk TWS Earbuds',
              price: 3499,
              category: 'Audio',
              image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
              description: 'Noise cancelling earbuds',
              rating: 4.8,
              reviews: 120,
              inStock: true
            },
            quantity: 1,
            selectedColor: 'Stealth Black'
          }
        ],
        customer: {
          name: 'Customer',
          phone: '01711223344',
          address: '',
          district: 'Dhaka City'
        },
        deliveryMethod: 'inside_dhaka',
        paymentMethod: 'bkash',
        paymentNumber: '01711223344',
        paymentTrxId: 'Cash on Delivery',
        deliveryFee: 80,
        discount: 0,
        subtotal: 3499,
        total: 3579,
        status: 'Delivered',
        createdAt: '2026-09-17T10:30:00.000Z'
      }
    ];
  });
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Community user ads state
  const [userAds, setUserAds] = useState<UserAd[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_user_ads');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'ad-sample-1',
        title: 'Apple AirPods Pro 2nd Gen (Type-C) - 9 Months Warranty',
        description: 'Used for only 3 months. Mint condition, 100% original. Apple Care active till Dec 2026. Comes with box & all accessories.',
        price: 18500,
        originalPrice: 28500,
        category: 'Audio & Acoustics',
        condition: 'like-new',
        imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500',
        sellerName: 'Tanvir Hossain',
        sellerPhone: '01711002233',
        sellerLocation: 'Dhanmondi, Dhaka',
        feePaid: true,
        feeAmount: 50,
        feeTrxId: 'BK9928172901',
        feeSenderNumber: '01711002233',
        status: 'approved',
        createdAt: '2026-09-28T14:20:00.000Z',
      }
    ];
  });

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: '⚡ 100% Genuine Tech Guarantee',
      message: 'Shop authentic gadgets with our official 1-year replacement warranty.',
      type: 'promo',
      timestamp: 'Just now',
      read: false,
      forRole: 'user',
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

  // Persistent storage updates - Safe with Quota Catch
  useEffect(() => {
    try {
      localStorage.setItem('gentouch_products', JSON.stringify(products));
    } catch (e) {
      console.warn('LocalStorage limit exceeded, preserving memory state:', e);
    }
  }, [products]);

  useEffect(() => {
    localStorage.setItem('gentouch_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('gentouch_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('gentouch_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('gentouch_user_ads', JSON.stringify(userAds));
  }, [userAds]);

  useEffect(() => {
    sessionStorage.setItem('gentouch_is_admin', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  // Handlers for cart
  const handleAddToCart = (product: Product, quantity = 1, selectedColor?: string) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.selectedColor === selectedColor);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.selectedColor === selectedColor
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedColor }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number, selectedColor?: string) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId, selectedColor);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId && item.selectedColor === selectedColor
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string, selectedColor?: string) => {
    setCartItems(prev => prev.filter(item => !(item.product.id === productId && item.selectedColor === selectedColor)));
  };

  // Handlers for wishlist
  const handleToggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  // Handle Checkout & Order submission
  const handlePlaceOrder = (customer: CustomerInfo, paymentMethod: string, paymentNumber?: string, paymentTrxId?: string, paymentType?: string) => {
    const deliveryFee = customer.district.toLowerCase().includes('dhaka') ? 80 : 130;
    const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const discount = activeCoupon ? activeCoupon.discountAmount : 0;
    const total = Math.max(0, subtotal + deliveryFee - discount);

    const newOrder: Order = {
      id: `GT-${Math.floor(100000 + Math.random() * 900000)}`,
      items: [...cartItems],
      customer,
      deliveryMethod: customer.district.toLowerCase().includes('dhaka') ? 'inside_dhaka' : 'outside_dhaka',
      paymentMethod,
      paymentNumber,
      paymentTrxId,
      deliveryFee,
      discount,
      subtotal,
      total,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
    setCartItems([]);
    setIsCheckoutOpen(false);
    setIsSuccessOpen(true);

    // Add admin notification
    setNotifications(prev => [
      {
        id: `notif-ord-${Date.now()}`,
        title: `🛒 নতুন অর্ডার প্রাপ্ত হয়েছে! (#${newOrder.id})`,
        message: `${customer.name} (${customer.phone}) ৳${total} টাকার অর্ডার দিয়েছেন।`,
        type: 'order',
        timestamp: 'Just now',
        read: false,
        forRole: 'admin',
      },
      ...prev
    ]);
  };

  // Handle status update from Admin
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(ord => ord.id === orderId ? { ...ord, status } : ord));
  };

  // Handle ad status from Admin
  const handleUpdateAdStatus = (adId: string, status: 'approved' | 'rejected') => {
    setUserAds(prev => prev.map(ad => ad.id === adId ? { ...ad, status } : ad));
  };

  // Delete ad from Admin
  const handleDeleteAd = (adId: string) => {
    setUserAds(prev => prev.filter(ad => ad.id !== adId));
  };

  // User posts an ad
  const handlePostAd = (adData: Omit<UserAd, 'id' | 'status' | 'createdAt'>) => {
    const newAd: UserAd = {
      ...adData,
      id: `ad-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setUserAds(prev => [newAd, ...prev]);
    setIsPostAdOpen(false);

    // Cloud firestore save
    productService.saveUserAd(newAd);

    // Notify admin
    setNotifications(prev => [
      {
        id: `notif-ad-${Date.now()}`,
        title: `📢 নতুন মেম্বার বিজ্ঞাপন রিভিউয়ের অপেক্ষায়!`,
        message: `${adData.sellerName} "${adData.title}" পোস্ট করেছেন। ট্রানজেকশন: ${adData.feeTrxId}`,
        type: 'ad',
        timestamp: 'Just now',
        read: false,
        forRole: 'admin'
      },
      ...prev
    ]);

    alert('আপনার বিজ্ঞাপনটি সফলভাবে জমা দেওয়া হয়েছে! এডমিন ট্রানজেকশন ভেরিফাই করে শীঘ্রই অনুমোদন করবেন।');
  };

  // Filter products by category & search query
  const filteredProducts = products.filter(product => {
    if (!product || typeof product !== 'object') return false;
    const prodCat = String(product.category || '');
    const matchesCategory = selectedCategory === 'All Products' || prodCat === selectedCategory;
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return matchesCategory;

    const prodName = String(product.name || '').toLowerCase();
    const prodDesc = String(product.description || '').toLowerCase();
    const prodCategoryLower = prodCat.toLowerCase();

    const matchesSearch = 
      prodName.includes(q) ||
      prodDesc.includes(q) ||
      prodCategoryLower.includes(q);

    return matchesCategory && matchesSearch;
  });

  const categories = [
    'All Products',
    'Electronics',
    'Audio & Acoustics',
    'Automotive & Motor Tech',
    'Smart Gear & Wearables',
    'Lifestyle Essentials'
  ];

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-gray-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Floating / Fixed Navbar */}
      <Navbar
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenTrackOrder={() => setIsTrackOpen(true)}
        onOpenWarranty={() => setIsWarrantyOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenPostAd={() => setIsPostAdOpen(true)}
        onOpenCommunityAds={() => setIsCommunityAdsOpen(true)}
        onOpenGame={() => setIsGameOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAdmin={isAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Banner Section */}
        <Hero
          onShopNow={() => {
            document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onExploreAds={() => setIsCommunityAdsOpen(true)}
          onPlayGame={() => setIsGameOpen(true)}
        />

        {/* Feature Highlights Grid */}
        <section className="py-12 border-y border-gray-800/80 bg-[#0e1017]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-900/40 border border-gray-800/60">
                <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500 shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">১০০% অথেনটিক</h4>
                  <p className="text-xs text-gray-400">১ বছর অফিসিয়াল রিপ্লেসমেন্ট</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-900/40 border border-gray-800/60">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-500 shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">সুপারফাস্ট ডেলিভারি</h4>
                  <p className="text-xs text-gray-400">ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-900/40 border border-gray-800/60">
                <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center text-amber-500 shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">প্রিমিয়াম কোয়ালিটি</h4>
                  <p className="text-xs text-gray-400">পরীক্ষিত শীর্ষ ব্র্যান্ডের গ্যাজেট</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-900/40 border border-gray-800/60">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-500 shrink-0">
                  <Headphones className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">২৪/৭ কাস্টমার কেয়ার</h4>
                  <p className="text-xs text-gray-400">লাইভ চ্যাট ও সার্বক্ষণিক সাপোর্ট</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Feature Banners: Turbo Racer & Member Ads Banner */}
        <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Turbo Racer Game Banner */}
            <div 
              onClick={() => setIsGameOpen(true)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/60 via-red-900/30 to-[#12141c] border border-red-800/40 p-6 sm:p-8 flex items-center justify-between transition-all hover:border-red-600 hover:shadow-2xl hover:shadow-red-600/20 hover:scale-[1.01]"
            >
              <div className="space-y-2 max-w-sm">
                <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-600/40 text-[11px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 animate-pulse" /> স্পোর্টস কার গেম চ্যালেঞ্জ
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight">টার্বো রেসার খেলুন, জিতুন ৳৩০ ডিসকাউন্ট!</h3>
                <p className="text-xs text-gray-300">
                  গাড়ি ড্রাইভ করে হাই স্কোর তুলুন এবং চেকআউটে ব্যবহারের জন্য তাৎক্ষণিক কুপন আনলক করুন।
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-red-500 group-hover:text-red-400 group-hover:translate-x-1 transition-transform">
                    গেম শুরু করুন <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex w-24 h-24 rounded-2xl bg-red-600/10 border border-red-600/30 items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <Flame className="w-12 h-12" />
              </div>
            </div>

            {/* Member Classified Ads Banner */}
            <div 
              onClick={() => setIsCommunityAdsOpen(true)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/50 via-zinc-900/80 to-[#12141c] border border-amber-800/40 p-6 sm:p-8 flex items-center justify-between transition-all hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-500/20 hover:scale-[1.01]"
            >
              <div className="space-y-2 max-w-sm">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5" /> মেম্বার ক্লাসিফাইড মার্কেটপ্লেস
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight">আপনার পুরোনো প্রিমিয়াম গ্যাজেট বিক্রি করুন</h3>
                <p className="text-xs text-gray-300">
                  মাত্র ৳৫০ অ্যাড ফি প্রদান করে সারা বাংলাদেশের টেক লাভারদের কাছে সরাসরি বিজ্ঞাপন দিন।
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 group-hover:text-amber-300 group-hover:translate-x-1 transition-transform">
                    মার্কেটপ্লেস দেখুন <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex w-24 h-24 rounded-2xl bg-amber-500/10 border border-amber-500/30 items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Eye className="w-12 h-12" />
              </div>
            </div>
          </div>
        </section>

        {/* Product Catalog Section */}
        <section id="products-section" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-red-500 font-mono text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" /> অফিশিয়াল কালেকশন
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                প্রিমিয়াম গ্যাজেট ক্যাটালগ
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                      : 'bg-[#141620] text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-[#0f1117] rounded-3xl border border-gray-800">
              <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
              <p className="text-xs text-gray-400 mt-1">অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজুন বা ফিল্টার পরিবর্তন করুন।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={() => setSelectedProduct(product)}
                  onAddToCart={(prod) => handleAddToCart(prod, 1)}
                  onToggleWishlist={() => handleToggleWishlist(product)}
                  isWishlisted={wishlist.some(p => p.id === product.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Global Footer */}
      <footer className="bg-[#0b0c10] border-t border-gray-800 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center font-black text-white text-base">
                  GT
                </div>
                <span className="text-lg font-black tracking-wider text-white">GEN-TOUCH</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                বাংলাদেশে প্রিমিয়াম টেক ও লাইফস্টাইল গ্যাজেটের অগ্রদূত। বিশ্বমানের কোয়ালিটি ও অফিসিয়াল ওয়ারেন্টির নিশ্চয়তা।
              </p>
              <div className="flex items-center gap-3">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-700 transition"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a 
                  href="https://t.me" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-700 transition"
                >
                  <Send className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">কুইক লিংকস</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><button onClick={() => setIsTrackOpen(true)} className="hover:text-red-400 transition">অর্ডার ট্র্যাকিং</button></li>
                <li><button onClick={() => setIsWarrantyOpen(true)} className="hover:text-red-400 transition">ওয়ারেন্টি ক্লেইম পলিসি</button></li>
                <li><button onClick={() => setIsCommunityAdsOpen(true)} className="hover:text-red-400 transition">মেম্বার ক্লাসিফাইড বিজ্ঞাপন</button></li>
                <li><button onClick={() => setIsGameOpen(true)} className="hover:text-red-400 transition">টার্বো রেসার গেম (কুপন)</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">কাস্টমার সাপোর্ট</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>হটলাইন: <strong className="text-white font-mono">01711223344</strong></li>
                <li>ইমেইল: <strong className="text-white">support@gen-touch.com</strong></li>
                <li>হেড অফিস: লেভেল ৪, হাই-টেক প্লাজা, ঢাকা</li>
                <li><button onClick={() => setIsSupportOpen(true)} className="text-red-400 hover:underline">২৪/৭ লাইভ সাপোর্ট ফর্ম</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">নিরাপদ পেমেন্ট পার্টনার</h4>
              <p className="text-xs text-gray-400 mb-3">
                বিকাশ, নগদ, রকেট ও সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা।
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono font-bold">
                <span className="px-2.5 py-1 rounded bg-[#161922] border border-gray-800 text-pink-400">bKash</span>
                <span className="px-2.5 py-1 rounded bg-[#161922] border border-gray-800 text-orange-400">Nagad</span>
                <span className="px-2.5 py-1 rounded bg-[#161922] border border-gray-800 text-purple-400">Rocket</span>
                <span className="px-2.5 py-1 rounded bg-[#161922] border border-gray-800 text-emerald-400">COD</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} GEN-TOUCH Bangladesh. All rights reserved.</p>
            <p className="font-mono text-[11px]">Designed & Engineered for Peak Performance</p>
          </div>
        </div>
      </footer>

      {/* Floating Notification Center for Alerts & Status */}
      <NotificationCenter
        notifications={notifications}
        onClear={() => setNotifications([])}
        onMarkAsRead={(id) => {
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        }}
        isAdmin={isAdmin}
      />

      {/* Modals Container */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={wishlist.some(p => p.id === selectedProduct.id)}
        />
      )}

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={(id) => setWishlist(prev => prev.filter(p => p.id !== id))}
        onAddToCart={(prod) => handleAddToCart(prod, 1)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onPlaceOrder={handlePlaceOrder}
        activeCoupon={activeCoupon}
      />

      {lastPlacedOrder && (
        <OrderSuccessModal
          isOpen={isSuccessOpen}
          onClose={() => setIsSuccessOpen(false)}
          order={lastPlacedOrder}
          onOpenTrackOrder={() => {
            setIsSuccessOpen(false);
            setIsTrackOpen(true);
          }}
        />
      )}

      <TrackOrderModal
        isOpen={isTrackOpen}
        onClose={() => setIsTrackOpen(false)}
        orders={orders}
      />

      <WarrantyModal
        isOpen={isWarrantyOpen}
        onClose={() => setIsWarrantyOpen(false)}
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
        onAuthenticate={(code) => {
          if (code === 'Hunter#11220' || code === 'Hunter#1122' || code === 'Hunter#1212') {
            setIsAdmin(true);
            return true;
          }
          return false;
        }}
        onLogout={() => {
          setIsAdmin(false);
          sessionStorage.removeItem('gentouch_is_admin');
        }}
      />

      <PostAdModal
        isOpen={isPostAdOpen}
        onClose={() => setIsPostAdOpen(false)}
        onSubmitAd={handlePostAd}
      />

      <CommunityAdsModal
        isOpen={isCommunityAdsOpen}
        onClose={() => setIsCommunityAdsOpen(false)}
        ads={userAds}
        onOpenPostAd={() => {
          setIsCommunityAdsOpen(false);
          setIsPostAdOpen(true);
        }}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      <TurboRacerGame
        isOpen={isGameOpen}
        onClose={() => setIsGameOpen(false)}
        onWinCoupon={(coupon) => {
          setActiveCoupon(coupon);
          localStorage.setItem('gentouch_active_coupon', JSON.stringify(coupon));
          setNotifications(prev => [
            {
              id: `notif-c-${Date.now()}`,
              title: `🎉 ৳${coupon.discountAmount} ডিসকাউন্ট কুপন সক্রিয় হয়েছে!`,
              message: `চেকআউটে "${coupon.code}" কুপনটি স্বয়ংক্রিয়ভাবে ডিসকাউন্ট প্রযোজ্য করবে।`,
              type: 'promo',
              timestamp: 'Just now',
              read: false,
              forRole: 'user',
            },
            ...prev
          ]);
        }}
      />
    </div>
  );
}

export default App;
