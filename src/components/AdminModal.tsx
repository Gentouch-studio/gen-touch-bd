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
  isAuthenticated,
  onAuthenticate,
  onLogout,
}) => {
  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  
  // TABS: orders, coupons, ads, manage_posts
  const [activeTab, setActiveTab] = useState<'orders' | 'coupons' | 'ads' | 'manage_posts'>('orders');
  const [adFilter, setAdFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [orderFilter, setOrderFilter] = useState<'all' | 'Pending Approval' | 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled'>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Role tracking
  const [adminRole, setAdminRole] = useState<'admin' | 'moderator'>('admin');

  // Coupon state
  const [coupons, setCoupons] = useState<CouponItem[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_coupons');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'coup-1',
        code: 'ilovegentouch',
        discountAmount: 10,
        description: 'অফিসিয়াল স্থায়ী কুপন (৳১০ ছাড়)',
        isActive: true,
      },
    ];
  });

  // Manage Uploaded Posts & Products State
  const [uploadedPosts, setUploadedPosts] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_products');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [postSearch, setPostSearch] = useState('');
  const [postDeleteSuccess, setPostDeleteSuccess] = useState('');

  // রিয়েলটাইমে ডেটাবেস থেকে প্রোডাক্ট রিফ্রেশ রাখা
  useEffect(() => {
    const unsubscribe = productService.subscribeToProducts((products) => {
      setUploadedPosts(products);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('gentouch_coupons', JSON.stringify(coupons));
    } catch {
      // ignore
    }
  }, [coupons]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const code = secretCodeInput.trim();

    if (code === 'Hunter#11220' || code === 'Hunter#1122') {
      setAdminRole('admin');
      onAuthenticate('Hunter#1122');
      setSecretCodeInput('');
    } else if (code === 'Hunter#1212') {
      setAdminRole('moderator');
      onAuthenticate('Hunter#1122');
      setSecretCodeInput('');
    } else {
      const success = onAuthenticate(code);
      if (!success) {
        setAuthError('ভুল পাসওয়ার্ড। দয়া করে সঠিক সিক্রেট কোড প্রদান করুন।');
      } else {
        setSecretCodeInput('');
      }
    }
  };

  // কুপন যোগ ও মুছে ফেলার লজিক
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponDiscount) return;

    const newCoup: CouponItem = {
      id: `coup-${Date.now()}`,
      code: newCouponCode.trim().toLowerCase(),
      discountAmount: Number(newCouponDiscount),
      description: newCouponDesc.trim() || `৳${newCouponDiscount} ছাড়`,
      isActive: true,
    };

    setCoupons((prev) => [newCoup, ...prev]);
    setNewCouponCode('');
    setNewCouponDiscount('');
    setNewCouponDesc('');
  };

  const handleDeleteCoupon = (id: string) => {
    if (adminRole === 'moderator') {
      alert('মডারেটরের কুপন ডিলিট করার অনুমতি নেই। শুধুমাত্র এডমিন ডিলিট করতে পারবেন।');
      return;
    }
    if (confirm('আপনি কি এই কুপনটি মুছে ফেলতে চান?')) {
      setCoupons(prev => prev.filter(c => c.id !== id));
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

  const filteredOrders = orders.filter((ord) => {
    const matchesFilter = orderFilter === 'all' 
      ? true 
      : orderFilter === 'Pending Approval'
      ? ord.status === 'Pending Approval' || ord.status === 'Pending'
      : ord.status === orderFilter;

    const matchesSearch = 
      ord.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customer.phone.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customer.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (ord.paymentDetails?.transactionId && ord.paymentDetails.transactionId.toLowerCase().includes(orderSearch.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const filteredAds = userAds.filter((ad) => {
    if (adFilter === 'all') return true;
    return ad.status === adFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-[#161920] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#12141a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide flex items-center gap-2">
                GEN-TOUCH Management Console
                {isAuthenticated && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    adminRole === 'admin' 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {adminRole === 'admin' ? 'Super Admin' : 'Moderator'}
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-400">Order verification, Member Ads, and Live Product Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not Authenticated State */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 mb-4 shadow-lg shadow-red-950/40">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold mb-2">Restricted Access Area</h4>
            <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
              দয়া করে আপনার সিক্রেট কোড প্রদান করে এডমিন অথবা মডারেটর হিসেবে প্যানেলে প্রবেশ করুন।
            </p>

            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
              <input
                type="password"
                placeholder="Enter Secret Passcode"
                value={secretCodeInput}
                onChange={(e) => setSecretCodeInput(e.target.value)}
                className="w-full px-4 py-3 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-center text-sm tracking-widest text-white outline-none transition"
                autoFocus
              />
              {authError && (
                <p className="text-xs text-red-400 flex items-center justify-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" /> {authError}
                </p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition text-sm shadow-lg shadow-red-950/50"
              >
                আনলক ও প্রবেশ করুন
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Navigation Tabs */}
            <div className="flex items-center justify-between px-6 border-b border-gray-800 bg-[#12141a]/60 overflow-x-auto">
              <div className="flex gap-4 sm:gap-8">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'orders'
                      ? 'text-red-500 border-red-500'
                      : 'text-gray-400 border-transparent hover:text-gray-200'
                  }`}
                >
                  <Package className="w-4 h-4" /> কাস্টমার অর্ডার ({orders.length})
                </button>
                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'coupons'
                      ? 'text-red-500 border-red-500'
                      : 'text-gray-400 border-transparent hover:text-gray-200'
                  }`}
                >
                  <Tag className="w-4 h-4" /> ডিসকাউন্ট কুপন ({coupons.length})
                </button>
                <button
                  onClick={() => setActiveTab('ads')}
                  className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'ads'
                      ? 'text-red-500 border-red-500'
                      : 'text-gray-400 border-transparent hover:text-gray-200'
                  }`}
                >
                  <Megaphone className="w-4 h-4" /> মেম্বার এডস ({userAds.filter(a => a.status === 'pending').length} পেন্ডিং)
                </button>
                <button
                  onClick={() => setActiveTab('manage_posts')}
                  className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'manage_posts'
                      ? 'text-red-500 border-red-500'
                      : 'text-gray-400 border-transparent hover:text-gray-200'
                  }`}
                >
                  <Layers className="w-4 h-4" /> প্রোডাক্ট ডিলিট / লাইভ ম্যানেজ ({uploadedPosts.length})
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-gray-400">
                  User: <strong className="text-emerald-400">{adminRole === 'admin' ? 'Super Admin' : 'Moderator'}</strong>
                </span>
                <button
                  onClick={onLogout}
                  className="px-2.5 py-1 text-xs text-gray-400 hover:text-red-400 border border-gray-800 rounded-lg hover:border-red-800 transition"
                >
                  লগআউট
                </button>
              </div>
            </div>

            {/* TAB 1: ORDERS */}
            {activeTab === 'orders' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-2.5 bg-[#12141a] border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
                    <span className="text-gray-400 flex items-center gap-1 shrink-0">
                      <Filter className="w-3 h-3" /> Filter:
                    </span>
                    {(['all', 'Pending Approval', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setOrderFilter(filter)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition shrink-0 ${
                          orderFilter === filter
                            ? 'bg-red-600 text-white'
                            : 'text-gray-400 hover:text-white bg-[#161920]'
                        }`}
                      >
                        {filter === 'all' ? `All (${orders.length})` : filter}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-56">
                    <input
                      type="text"
                      placeholder="Search Phone, TrxID, ID..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 bg-[#161920] border border-gray-800 focus:border-red-600 rounded-lg text-xs text-white outline-none"
                    />
                    <Search className="w-3 h-3 text-gray-500 absolute left-2 top-2.5" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">কোনো অর্ডার পাওয়া যায়নি।</p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-[#101217] border border-gray-800 rounded-2xl p-4 sm:p-5 space-y-4 hover:border-gray-700 transition"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800/80 pb-3">
                          <div>
                            <span className="text-xs font-mono font-bold text-red-500 mr-2">
                              #{order.id}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(order.createdAt).toLocaleString('bn-BD')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              order.status === 'Delivered'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : order.status === 'Cancelled'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Customer & Product details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-gray-400 font-semibold mb-1">কাস্টমার তথ্য:</p>
                            <p className="text-white font-medium">{order.customer.fullName}</p>
                            <p className="text-gray-300">ফোন: <span className="text-emerald-400 font-mono">{order.customer.phone}</span></p>
                            <p className="text-gray-300">ঠিকানা: {order.customer.fullAddress}, {order.customer.district}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-semibold mb-1">পেমেন্ট ও মূল্য:</p>
                            <p className="text-white">মোট মূল্য: <strong className="text-red-400">৳{order.total}</strong></p>
                            <p className="text-gray-300">মেথড: {order.paymentMethod.toUpperCase()}</p>
                            {order.paymentDetails?.transactionId && (
                              <p className="text-emerald-400 font-mono">
                                TrxID: {order.paymentDetails.transactionId} ({order.paymentDetails.senderNumber})
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status Change Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-800">
                          <span className="text-xs text-gray-400">স্ট্যাটাস পরিবর্তন:</span>
                          {(['Pending Approval', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => onUpdateOrderStatus(order.id, st)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                order.status === st
                                  ? 'bg-red-600 text-white'
                                  : 'bg-[#161920] text-gray-300 hover:text-white border border-gray-800'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: COUPONS */}
            {activeTab === 'coupons' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div className="bg-[#101217] border border-gray-800 rounded-2xl p-5">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-red-500" /> নতুন ডিসকাউন্ট কুপন তৈরি করুন
                  </h4>
                  <form onSubmit={handleAddCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="কুপন কোড (যেমন: EID2026)"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      className="px-3.5 py-2 bg-[#161920] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white uppercase outline-none"
                    />
                    <input
                      type="number"
                      placeholder="ডিসকাউন্ট পরিমাণ (৳)"
                      value={newCouponDiscount}
                      onChange={(e) => setNewCouponDiscount(e.target.value)}
                      className="px-3.5 py-2 bg-[#161920] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="বিবরণ (অপশনাল)"
                      value={newCouponDesc}
                      onChange={(e) => setNewCouponDesc(e.target.value)}
                      className="px-3.5 py-2 bg-[#161920] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none"
                    />
                    <button
                      type="submit"
                      className="py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition"
                    >
                      কুপন যুক্ত করুন
                    </button>
                  </form>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white">সক্রিয় কুপন তালিকা</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {coupons.map((c) => (
                      <div key={c.id} className="p-4 bg-[#101217] border border-gray-800 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-mono font-bold text-emerald-400 text-sm">{c.code.toUpperCase()}</p>
                          <p className="text-xs text-gray-400">ছাড়: ৳{c.discountAmount}</p>
                          <p className="text-[11px] text-gray-500">{c.description}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteCoupon(c.id)}
                          className="p-2 text-gray-400 hover:text-red-400 bg-red-600/10 rounded-lg transition"
                          title="কুপন ডিলিট"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MEMBER ADS */}
            {activeTab === 'ads' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-2.5 bg-[#12141a] border-b border-gray-800 flex items-center gap-2 text-xs">
                  <span className="text-gray-400">ফিল্টার:</span>
                  {(['all', 'pending', 'approved'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setAdFilter(filter)}
                      className={`px-3 py-1 rounded-lg font-semibold transition capitalize ${
                        adFilter === filter
                          ? 'bg-red-600 text-white'
                          : 'text-gray-400 hover:text-white bg-[#161920]'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {filteredAds.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                      <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">কোনো বিজ্ঞাপন পাওয়া যায়নি।</p>
                    </div>
                  ) : (
                    filteredAds.map((ad) => (
                      <div
                        key={ad.id}
                        className="bg-[#101217] border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between"
                      >
                        <div className="flex gap-4">
                          <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-20 h-20 rounded-xl object-cover border border-gray-800 shrink-0"
                          />
                          <div className="space-y-1 text-xs">
                            <h5 className="font-bold text-white text-sm">{ad.title}</h5>
                            <p className="text-red-400 font-bold">৳{ad.price} | <span className="text-gray-400">{ad.category}</span></p>
                            <p className="text-gray-300">বিক্রেতা: {ad.sellerName} ({ad.sellerPhone})</p>
                            <p className="text-emerald-400 font-mono">
                              ফি: ৳{ad.feeAmount} | bKash TrxID: {ad.feeTrxId} ({ad.feeSenderNumber})
                            </p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center justify-center gap-2 shrink-0">
                          {ad.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => onUpdateAdStatus(ad.id, 'approved')}
                                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle2 className="w-4 h-4" /> অ্যাপ্রুভ করুন
                              </button>
                              <button
                                onClick={() => onUpdateAdStatus(ad.id, 'rejected')}
                                className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/40 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                              >
                                <XCircle className="w-4 h-4" /> বাতিল
                              </button>
                            </>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              Approved
                            </span>
                          )}
                          <button
                            onClick={() => handleDeletePost(ad.id, ad.title)}
                            className="w-full px-3 py-1.5 bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-800/40 rounded-xl text-xs transition flex items-center justify-center gap-1"
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
                    <Search className="w-3 h-3 text-gray-500 absolute left-2 top-2.5" />
                  </div>
                </div>

                {postDeleteSuccess && (
                  <div className="mx-6 mt-3 p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {postDeleteSuccess}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {filteredUploadedPosts.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                      <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">কোনো পোস্ট বা প্রোডাক্ট পাওয়া যায়নি।</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {filteredUploadedPosts.map((post) => {
                        const postImage = post.images?.[0] || post.image || post.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
                        const postTitle = post.name || post.title || 'Untitled Post';
                        const postPrice = post.price || 0;

                        return (
                          <div
                            key={post.id}
                            className="bg-[#101217] border border-gray-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-gray-700 transition shadow-lg"
                          >
                            <div className="space-y-2.5">
                              <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-gray-800">
                                <img
                                  src={postImage}
                                  alt={postTitle}
                                  className="w-full h-full object-cover"
                                />
                                {post.category && (
                                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/75 text-red-400 border border-red-800/60 uppercase">
                                    {post.category}
                                  </span>
                                )}
                              </div>

                              <div>
                                <h5 className="font-bold text-sm text-white line-clamp-1">
                                  {postTitle}
                                </h5>
                                <p className="text-xs text-red-400 font-bold mt-0.5">
                                  ৳{postPrice}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeletePost(post.id, postTitle)}
                              className="w-full py-2 bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> ডেটাবেস থেকে ডিলিট
                            </button>
                          </div>
                        );
                      })}
                    </div>
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
