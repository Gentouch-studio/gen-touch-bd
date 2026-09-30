import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, Lock, AlertTriangle, 
  Package, ShoppingBag, Megaphone, Check, Video, MessageCircle, Search, Filter,
  Tag, Plus, Trash2, CheckCircle2, Clock, XCircle, RefreshCw, Eye, Sparkles,
  Layers
} from 'lucide-react';
import { Order, OrderStatus, UserAd, CouponItem } from '../types';
import { productService } from '../services/productService';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  userAds: UserAd[];
  onUpdateAdStatus: (adId: string, status: 'approved' | 'rejected') => void;
  onDeleteAd?: (adId: string) => void;
  isAuthenticated: boolean;
  onAuthenticate: (code: string) => boolean;
  onLogout: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateOrderStatus,
  userAds,
  onUpdateAdStatus,
  onDeleteAd,
  isAuthenticated,
  onAuthenticate,
  onLogout,
}) => {
  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  
  // TABS: orders, coupons, ads, manage_posts
  const [activeTab, setActiveTab] = useState<'orders' | 'coupons' | 'ads' | 'manage_posts'>('orders');
  const [adFilter, setAdFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [orderFilter, setOrderFilter] = useState<'all' | 'Pending Approval' | 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled'>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Coupon state
  const [coupons, setCoupons] = useState<CouponItem[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_coupons');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      { id: 'c1', code: 'TOUCH10', discountPercent: 10, description: '১০% ওয়েলকাম ছাড় (প্রথম অর্ডারে)', isActive: true },
      { id: 'c2', code: 'PRO20', discountPercent: 20, description: 'স্পেশাল গেম উইনার ২০% ছাড়', isActive: true },
      { id: 'c3', code: 'VIP15', discountPercent: 15, description: 'রেগুলার কাস্টমার ১৫% ছাড়', isActive: true },
    ];
  });

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // Role tracking
  const [adminRole, setAdminRole] = useState<'admin' | 'moderator'>('admin');

  // Live All Posts/Products Management
  const [uploadedPosts, setUploadedPosts] = useState<any[]>([]);
  const [postSearch, setPostSearch] = useState('');
  const [isRefreshingPosts, setIsRefreshingPosts] = useState(false);
  const [postDeleteSuccess, setPostDeleteSuccess] = useState('');

  // Load custom/uploaded posts from Cloud & LocalStorage
  const loadLivePosts = async () => {
    setIsRefreshingPosts(true);
    try {
      const liveItems = await productService.getAllProducts();
      setUploadedPosts(liveItems || []);
    } catch (e) {
      console.error(e);
      try {
        const local = localStorage.getItem('gentouch_products');
        if (local) setUploadedPosts(JSON.parse(local));
      } catch {
        // ignore
      }
    } finally {
      setIsRefreshingPosts(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadLivePosts();
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem('gentouch_coupons', JSON.stringify(coupons));
    } catch {
      // ignore
    }
  }, [coupons]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onAuthenticate(secretCodeInput);
    if (!success) {
      setAuthError('ভুল সিক্রেট কোড! সঠিক অ্যাডমিন বা মডারেটর কোড দিন।');
    } else {
      setAuthError('');
      setSecretCodeInput('');
      const trimmed = secretCodeInput.trim();
      if (trimmed === 'Hunter#1122') {
        setAdminRole('moderator');
      } else {
        setAdminRole('admin');
      }
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponDiscount) return;
    const item: CouponItem = {
      id: `c_${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      discountPercent: Number(newCouponDiscount),
      description: newCouponDesc.trim() || `${newCouponDiscount}% স্পেশাল ডিসকাউন্ট`,
      isActive: true,
    };
    setCoupons(prev => [item, ...prev]);
    setNewCouponCode('');
    setNewCouponDiscount('');
    setNewCouponDesc('');
  };

  const handleToggleCoupon = (id: string) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const handleDeleteCoupon = (id: string) => {
    if (adminRole === 'moderator') {
      alert('মডারেটরদের কুপন ডিলিট করার পারমিশন নেই। শুধুমাত্র এডমিন ডিলিট করতে পারেন।');
      return;
    }
    if (confirm('আপনি কি এই কুপনটি মুছে ফেলতে চান?')) {
      setCoupons(prev => prev.filter(c => c.id !== id));
    }
  };

  // মেম্বার এডস সরাসরি ডিলিট করা
  const handleDeleteAd = async (adId: string, adTitle: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${adTitle}" বিজ্ঞাপনটি ওয়েবসাইট থেকে স্থায়ীভাবে ডিলিট করতে চান?`)) {
      try {
        await productService.deleteProductOrAd(adId);
      } catch (err) {
        console.error(err);
      }
      if (onDeleteAd) {
        onDeleteAd(adId);
      }
      setPostDeleteSuccess(`"${adTitle}" বিজ্ঞাপনটি সফলভাবে ডিলিট করা হয়েছে!`);
      setTimeout(() => setPostDeleteSuccess(''), 4000);
    }
  };

  // ডেটাবেস থেকে স্থায়ীভাবে পোস্ট/প্রোডাক্ট ডিলিট (মোবাইল ও পিসিতে সিঙ্ক হবে)
  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে আপনি "${postTitle}" পোস্টটি ওয়েবসাইট ও ডেটাবেস থেকে স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      try {
        await productService.deleteProductOrAd(postId);
        
        const updated = uploadedPosts.filter(p => p.id !== postId);
        setUploadedPosts(updated);
        try {
          localStorage.setItem('gentouch_products', JSON.stringify(updated));
          localStorage.setItem('gen_touch_custom_products', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
        } catch {
          // ignore
        }
        if (onDeleteAd) {
          onDeleteAd(postId);
        }
        setPostDeleteSuccess(`"${postTitle}" পোস্টটি সফলভাবে ডিলিট করা হয়েছে!`);
        setTimeout(() => setPostDeleteSuccess(''), 4000);
      } catch (err) {
        console.error(err);
        alert('ডিলিট করার সময় সমস্যা হয়েছে, দয়া করে আবার চেষ্টা করুন।');
      }
    }
  };

  const filteredUploadedPosts = uploadedPosts.filter((p) => {
    const q = postSearch.toLowerCase();
    const title = (p.name || p.title || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();
    return title.includes(q) || cat.includes(q);
  });

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    const matchesSearch = 
      order.customer.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.customer.phone.includes(orderSearch) ||
      (order.paymentTrxId && order.paymentTrxId.toLowerCase().includes(orderSearch.toLowerCase())) ||
      order.id.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredAds = userAds.filter((ad) => {
    if (adFilter === 'all') return true;
    return ad.status === adFilter;
  });

  const pendingAdsCount = userAds.filter(a => a.status === 'pending').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Pending Approval').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-[#0b0c10] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#0f1117]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg">GEN-TOUCH Management Console</h3>
                {isAuthenticated && (
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${
                    adminRole === 'admin' 
                      ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  }`}>
                    {adminRole === 'admin' ? 'Super Admin' : 'Staff Moderator'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">Order verification, Member Ads, and Live Product Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not Authenticated Screen */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 flex-1">
            <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500">
              <Lock className="w-8 h-8" />
            </div>
            <div className="max-w-sm">
              <h4 className="text-lg font-bold text-white mb-1">অ্যাডমিন অ্যাক্সেস প্রয়োজন</h4>
              <p className="text-xs text-gray-400">ম্যানেজমেন্ট কনসোলে প্রবেশের জন্য আপনার সিক্রেট কোডটি প্রদান করুন।</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="w-full max-w-sm space-y-4">
              <div>
                <input
                  type="password"
                  value={secretCodeInput}
                  onChange={(e) => setSecretCodeInput(e.target.value)}
                  placeholder="অ্যাডমিন সিক্রেট কোড লিখুন"
                  className="w-full px-4 py-3 bg-[#12141a] border border-gray-800 focus:border-red-600 rounded-xl text-sm text-white placeholder-gray-500 text-center tracking-widest outline-none"
                  autoFocus
                />
                {authError && (
                  <p className="text-xs text-red-400 mt-2">{authError}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-red-600/30"
              >
                প্রবেশ করুন
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Top Bar Navigation */}
            <div className="flex flex-wrap items-center justify-between border-b border-gray-800 px-6 py-2.5 bg-[#0f1117] gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === 'orders' 
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>কাস্টমার অর্ডার ({pendingOrdersCount})</span>
                </button>
                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === 'coupons' 
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>ডিসকাউন্ট কুপন ({coupons.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('ads')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === 'ads' 
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>মেম্বার এডস ({pendingAdsCount} পেন্ডিং)</span>
                </button>
                <button
                  onClick={() => setActiveTab('manage_posts')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === 'manage_posts' 
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>প্রোডাক্ট ডিলিট / লাইভ ম্যানেজ ({uploadedPosts.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">User: <strong className="text-white">{adminRole === 'admin' ? 'Super Admin' : 'Staff Moderator'}</strong></span>
                <button
                  onClick={onLogout}
                  className="px-2.5 py-1 text-gray-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition"
                >
                  লগআউট
                </button>
              </div>
            </div>

            {/* Notification message */}
            {postDeleteSuccess && (
              <div className="px-6 py-2 bg-emerald-950/80 border-b border-emerald-800/60 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
                <span>{postDeleteSuccess}</span>
                <button onClick={() => setPostDeleteSuccess('')} className="text-emerald-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* TAB 1: ORDERS */}
            {activeTab === 'orders' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-[#12141a]">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5" /> Filter:
                    </span>
                    {(['all', 'Pending Approval', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderFilter(st)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                          orderFilter === st 
                            ? 'bg-red-600 text-white' 
                            : 'bg-[#161920] text-gray-400 hover:text-white'
                        }`}
                      >
                        {st === 'all' ? `All (${orders.length})` : st}
                      </button>
                    ))}
                  </div>
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search Phone, TrxID, ID..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#161920] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white placeholder-gray-500 outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div className="p-4 overflow-y-auto space-y-3 flex-1">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-xs">কোনো অর্ডার পাওয়া যায়নি।</div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div key={order.id} className="p-4 bg-[#12141a] border border-gray-800/80 rounded-2xl space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-red-500">{order.id}</span>
                            <span className="text-[11px] text-gray-400">{order.createdAt}</span>
                          </div>
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            order.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                            order.status === 'Confirmed' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                            order.status === 'Cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                            'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          }`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-400 block text-[11px]">কাস্টমার তথ্য:</span>
                            <p className="font-bold text-white">{order.customer.name}</p>
                            <p className="text-emerald-400 font-mono">ফোন: {order.customer.phone}</p>
                            <p className="text-gray-300 text-[11px] mt-0.5">ঠিকানা: {order.customer.address}, {order.customer.district}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[11px]">পেমেন্ট ও মূল্য:</span>
                            <p className="font-bold text-white">মোট মূল্য: <span className="text-red-500 font-mono">৳{order.total}</span></p>
                            <p className="text-gray-300">মেথড: {order.paymentMethod.toUpperCase()}</p>
                            {order.paymentTrxId && (
                              <p className="text-emerald-400 font-mono text-[11px]">TrxID: {order.paymentTrxId} ({order.paymentNumber})</p>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-gray-400">স্ট্যাটাস পরিবর্তন:</span>
                          <div className="flex gap-1.5 flex-wrap">
                            {(['Pending Approval', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as const).map((st) => (
                              <button
                                key={st}
                                onClick={() => onUpdateOrderStatus(order.id, st)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                                  order.status === st ? 'bg-red-600 text-white' : 'bg-[#181a22] text-gray-400 hover:text-white'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: COUPONS */}
            {activeTab === 'coupons' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <form onSubmit={handleCreateCoupon} className="p-4 bg-[#12141a] border border-gray-800 rounded-2xl space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-red-500" /> নতুন ডিসকাউন্ট কুপন তৈরি করুন
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="কুপন কোড (যেমন: EID50)"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      className="px-3 py-2 bg-[#161920] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white uppercase font-mono outline-none"
                    />
                    <input
                      type="number"
                      placeholder="ডিসকাউন্ট শতাংশ (%)"
                      value={newCouponDiscount}
                      onChange={(e) => setNewCouponDiscount(e.target.value)}
                      className="px-3 py-2 bg-[#161920] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white font-mono outline-none"
                    />
                    <input
                      type="text"
                      placeholder="বিবরণ / শর্ত (যেমন: ঈদ স্পেশাল ছাড়)"
                      value={newCouponDesc}
                      onChange={(e) => setNewCouponDesc(e.target.value)}
                      className="px-3 py-2 bg-[#161920] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition"
                  >
                    কুপন যুক্ত করুন
                  </button>
                </form>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400">সক্রিয় কুপনসমূহ ({coupons.length}):</h4>
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="p-3.5 bg-[#12141a] border border-gray-800 rounded-2xl flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-red-600/20 text-red-400 border border-red-600/40 rounded-lg text-xs font-mono font-bold">
                            {coupon.code}
                          </span>
                          <span className="text-xs font-bold text-white">{coupon.discountPercent}% ছাড়</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">{coupon.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleCoupon(coupon.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                            coupon.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {coupon.isActive ? 'সক্রিয়' : 'বন্ধ'}
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: USER ADS */}
            {activeTab === 'ads' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex items-center gap-2 bg-[#12141a] text-xs">
                  <button
                    onClick={() => setAdFilter('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      adFilter === 'all' ? 'bg-red-600 text-white' : 'bg-[#161920] text-gray-400'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setAdFilter('pending')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      adFilter === 'pending' ? 'bg-red-600 text-white' : 'bg-[#161920] text-gray-400'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setAdFilter('approved')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      adFilter === 'approved' ? 'bg-red-600 text-white' : 'bg-[#161920] text-gray-400'
                    }`}
                  >
                    Approved
                  </button>
                </div>

                <div className="p-4 overflow-y-auto space-y-3 flex-1">
                  {filteredAds.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-xs">কোনো মেম্বার বিজ্ঞাপন নেই।</div>
                  ) : (
                    filteredAds.map((ad) => (
                      <div key={ad.id} className="p-4 bg-[#12141a] border border-gray-800 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={ad.imageUrl} alt={ad.title} className="w-16 h-16 rounded-xl object-cover border border-gray-800 shrink-0" />
                          <div>
                            <h4 className="text-sm font-bold text-white">{ad.title}</h4>
                            <p className="text-xs text-gray-400 mt-0.5">
                              <span className="text-red-500 font-mono font-bold">৳{ad.price}</span> | {ad.category}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-1">
                              বিক্রেতা: <span className="text-gray-300 font-semibold">{ad.sellerName} ({ad.sellerPhone})</span>
                            </p>
                            <p className="text-[11px] text-emerald-400 font-mono">
                              ফি: ৳{ad.feeAmount} | bKash TrxID: {ad.feeTrxId} ({ad.feeSenderNumber})
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                          {ad.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => onUpdateAdStatus(ad.id, 'approved')}
                                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle2 className="w-4 h-4" /> অনুমোদন করুন
                              </button>
                              <button
                                onClick={() => onUpdateAdStatus(ad.id, 'rejected')}
                                className="w-full sm:w-auto px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                              >
                                <XCircle className="w-4 h-4" /> বাতিল
                              </button>
                            </>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              Approved
                            </span>
                          )}

                          {/* ডিলিট বাটন */}
                          <button
                            onClick={() => handleDeleteAd(ad.id, ad.title)}
                            className="w-full sm:w-auto px-3 py-1.5 bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-800/40 rounded-xl text-xs transition flex items-center justify-center gap-1"
                            title="বিজ্ঞাপনটি মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> ডিলিট
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: MANAGE & DELETE POSTS / PRODUCTS */}
            {activeTab === 'manage_posts' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-2.5 bg-[#12141a] border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-gray-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>এখান থেকে পোস্ট ডিলিট করলে কম্পিউটার ও মোবাইল উভয় জায়গা থেকেই তাৎক্ষণিকভাবে মুছে যাবে।</span>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="নাম বা ক্যাটাগরি দিয়ে খুঁজুন..."
                      value={postSearch}
                      onChange={(e) => setPostSearch(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 bg-[#161920] border border-gray-800 focus:border-red-600 rounded-lg text-xs text-white outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2" />
                  </div>
                </div>

                <div className="p-4 overflow-y-auto space-y-3 flex-1">
                  {filteredUploadedPosts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-xs">কোনো পোস্ট পাওয়া যায়নি।</div>
                  ) : (
                    filteredUploadedPosts.map((post) => {
                      const postTitle = post.name || post.title || 'Untitled Product';
                      const postPrice = post.price || 0;
                      const postImg = post.image || post.imageUrl || '';
                      const postType = post.source === 'admin' ? 'অফিসিয়াল প্রোডাক্ট' : 'মেম্বার এডস';

                      return (
                        <div key={post.id} className="p-3 bg-[#12141a] border border-gray-800 rounded-xl flex items-center justify-between gap-3 hover:border-gray-700 transition">
                          <div className="flex items-center gap-3">
                            {postImg ? (
                              <img src={postImg} alt={postTitle} className="w-12 h-12 rounded-lg object-cover border border-gray-800 shrink-0" />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500 text-xs">No Img</div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-white">{postTitle}</h4>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                  post.source === 'admin' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {postType}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                <span className="text-red-500 font-mono font-bold">৳{postPrice}</span> | {post.category || 'General'}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeletePost(post.id, postTitle)}
                            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1 border border-red-600/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> ডিলিট করুন
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};
