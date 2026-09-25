import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, Lock, AlertTriangle, 
  Package, ShoppingBag, Megaphone, Check, Video, MessageCircle, Search, Filter,
  Tag, Plus, Trash2, CheckCircle2, Clock, XCircle, RefreshCw, Eye, Sparkles,
  Layers
} from 'lucide-react';
import { Order, OrderStatus, UserAd, CouponItem } from '../types';

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
  
  // TABS: orders, coupons, ads, manage_posts (NEW)
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
        isPermanent: true,
      },
      {
        id: 'coup-2',
        code: 'WELCOME50',
        discountAmount: 50,
        description: 'ওয়েলকাম বোনাস কুপন (৳৫০ ছাড়)',
        isActive: true,
        isPermanent: false,
      },
    ];
  });

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<number | ''>('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Manage Uploaded Posts & Products State
  const [uploadedPosts, setUploadedPosts] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('gen_touch_custom_products') || localStorage.getItem('gentouch_products');
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

  // Reload products whenever tab changes to 'manage_posts'
  useEffect(() => {
    if (activeTab === 'manage_posts') {
      try {
        const saved = localStorage.getItem('gen_touch_custom_products') || localStorage.getItem('gentouch_products');
        if (saved) {
          setUploadedPosts(JSON.parse(saved));
        }
      } catch {
        // ignore
      }
    }
  }, [activeTab]);

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

    // Supports Hunter#11220 or Hunter#1122 as Admin, Hunter#1212 as Moderator
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

  const pendingAdsCount = userAds.filter((ad) => ad.status === 'pending').length;
  const pendingApprovalOrdersCount = orders.filter((o) => o.status === 'Pending Approval' || o.status === 'Pending').length;

  // Filter Orders
  const filteredOrders = orders.filter((ord) => {
    const matchesFilter = orderFilter === 'all' 
      ? true 
      : ord.status === orderFilter;

    const matchesSearch = 
      ord.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customer.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customer.phone.includes(orderSearch) ||
      (ord.paymentDetails?.transactionId && ord.paymentDetails.transactionId.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (ord.advancePaymentDetails?.transactionId && ord.advancePaymentDetails.transactionId.toLowerCase().includes(orderSearch.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // Open WhatsApp chat directly with the customer
  const handleOpenWhatsApp = (order: Order) => {
    const rawPhone = order.customer.phone.replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.startsWith('880') ? rawPhone : rawPhone.startsWith('0') ? `88${rawPhone}` : `880${rawPhone}`;
    const message = encodeURIComponent(
      `আসসালামু আলাইকুম ${order.customer.fullName},\nGEN-TOUCH BD থেকে আপনার অর্ডার (${order.id}) সম্পর্কে যোগাযোগ করছি।\nআপনার TrxID: ${order.paymentDetails?.transactionId || order.advancePaymentDetails?.transactionId || 'N/A'}।\nমোট মূল্য: ৳${order.total}।`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // Quick Approve Order
  const handleApproveOrder = (orderId: string) => {
    onUpdateOrderStatus(orderId, 'Confirmed');
  };

  // Add new coupon
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponDiscount || Number(newCouponDiscount) <= 0) {
      return;
    }

    const cleanCode = newCouponCode.trim().toLowerCase();
    const existing = coupons.find(c => c.code.toLowerCase() === cleanCode);
    if (existing) {
      alert('এই কুপন কোডটি ইতিমধ্যে রয়েছে!');
      return;
    }

    const newCoupon: CouponItem = {
      id: `coup-${Date.now()}`,
      code: cleanCode,
      discountAmount: Number(newCouponDiscount),
      description: newCouponDesc.trim() || `৳${newCouponDiscount} ছাড়ের কুপন`,
      isActive: true,
      isPermanent: false,
    };

    setCoupons(prev => [newCoupon, ...prev]);
    setNewCouponCode('');
    setNewCouponDiscount('');
    setNewCouponDesc('');
    setCouponSuccess('নতুন কুপন সফলভাবে যুক্ত করা হয়েছে!');
    setTimeout(() => setCouponSuccess(''), 3000);
  };

  const handleToggleCoupon = (id: string) => {
    setCoupons(prev =>
      prev.map(c => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleDeleteCoupon = (id: string) => {
    const target = coupons.find(c => c.id === id);
    if (target?.isPermanent) {
      alert('স্থায়ী অফিসিয়াল কুপন ডিলিট করা যাবে না।');
      return;
    }
    if (confirm('আপনি কি এই কুপনটি মুছে ফেলতে চান?')) {
      setCoupons(prev => prev.filter(c => c.id !== id));
    }
  };

  // Handler: Delete ANY Uploaded Post / Product directly from the website
  const handleDeletePost = (postId: string, postTitle: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে আপনি "${postTitle}" পোস্টটি ওয়েবসাইট থেকে স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      const updated = uploadedPosts.filter(p => p.id !== postId);
      setUploadedPosts(updated);

      try {
        localStorage.setItem('gen_touch_custom_products', JSON.stringify(updated));
        localStorage.setItem('gentouch_products', JSON.stringify(updated));
        
        // Also trigger storage event so other open components refresh
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error(err);
      }

      setPostDeleteSuccess(`"${postTitle}" পোস্টটি সফলভাবে ওয়েবসাইট থেকে ডিলিট করা হয়েছে!`);
      setTimeout(() => setPostDeleteSuccess(''), 4000);
    }
  };

  // Filtered Uploaded Posts
  const filteredUploadedPosts = uploadedPosts.filter((p) => {
    const q = postSearch.toLowerCase();
    const title = (p.name || p.title || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();
    return title.includes(q) || cat.includes(q);
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
              <h3 className="font-bold text-base tracking-wide">GEN-TOUCH Admin & Moderator Control</h3>
              <p className="text-xs text-gray-400">Order Verification, Coupon Management & Ad Approvals</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={onLogout}
                className="text-xs text-red-400 hover:text-red-300 font-semibold px-3 py-1 rounded-lg bg-red-950/40 border border-red-900/50 transition"
              >
                Logout ({adminRole === 'admin' ? 'Admin' : 'Moderator'})
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* IF NOT AUTHENTICATED: SECRET LOGIN FORM */}
        {!isAuthenticated ? (
          <div className="p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-black text-white mb-1">Restricted Access</h4>
              <p className="text-xs text-gray-400">
                অর্ডার অ্যাপ্রুভাল, বিকাশ TrxID ভেরিফিকেশন, কুপন তৈরি ও বিজ্ঞাপন যাচাই করতে আপনার সিক্রেট পাসওয়ার্ড দিন।
              </p>
            </div>

            {authError && (
              <div className="w-full p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="w-full space-y-3">
              <div>
                <input
                  type="password"
                  required
                  placeholder="অ্যাডমিন বা মডারেটর পাসওয়ার্ড দিন"
                  value={secretCodeInput}
                  onChange={(e) => setSecretCodeInput(e.target.value)}
                  className="w-full px-4 py-3 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition text-center font-mono tracking-widest"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition"
              >
                লগইন করুন (Authorize)
              </button>
            </form>

            <div className="w-full p-3 bg-[#101217] border border-gray-800/80 rounded-xl text-[11px] text-gray-400 text-left space-y-1">
              <p className="text-gray-300 font-semibold">🔒 সংরক্ষিত রোল এক্সেস:</p>
              <p>• Admin: ফুল এক্সেস (পেমেন্ট, অর্ডার অ্যাপ্রুভ, কুপন, বিজ্ঞাপন)</p>
              <p>• Moderator: অর্ডার ভেরিফিকেশন ও ট্র্যাকিং</p>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED: ADMIN DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs Header */}
            <div className="flex items-center justify-between px-6 border-b border-gray-800 bg-[#101217] overflow-x-auto">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'orders'
                      ? 'text-red-500 border-red-500'
                      : 'text-gray-400 border-transparent hover:text-gray-200'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" /> Customer Orders ({orders.length})
                  {pendingApprovalOrdersCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-600 text-white animate-pulse">
                      {pendingApprovalOrdersCount} পেন্ডিং
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'coupons'
                      ? 'text-red-500 border-red-500'
                      : 'text-gray-400 border-transparent hover:text-gray-200'
                  }`}
                >
                  <Tag className="w-4 h-4" /> কুপন কোড ম্যানেজার ({coupons.length})
                </button>

                <button
                  onClick={() => setActiveTab('ads')}
                  className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 relative whitespace-nowrap ${
                    activeTab === 'ads'
                      ? 'text-red-500 border-red-500'
                      : 'text-gray-400 border-transparent hover:text-gray-200'
                  }`}
                >
                  <Megaphone className="w-4 h-4" /> User Ads ({userAds.length})
                  {pendingAdsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white">
                      {pendingAdsCount} Pending
                    </span>
                  )}
                </button>

                {/* NEW OPTION: USER ADS ER PASE POST DLT / MANAGE TAB */}
                <button
                  onClick={() => setActiveTab('manage_posts')}
                  className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'manage_posts'
                      ? 'text-red-500 border-red-500'
                      : 'text-gray-400 border-transparent hover:text-gray-200'
                  }`}
                >
                  <Layers className="w-4 h-4" /> পোস্ট ডিলিট / ম্যানেজ ({uploadedPosts.length})
                </button>
              </div>

              <div className="text-[11px] text-gray-500 whitespace-nowrap ml-4">
                Logged in as: <strong className="text-emerald-400">{adminRole === 'admin' ? 'Super Admin' : 'Moderator'}</strong>
              </div>
            </div>

            {/* TAB 1: ORDERS WITH APPROVAL SYSTEM */}
            {activeTab === 'orders' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Order Filters & Search Bar */}
                <div className="px-6 py-2.5 bg-[#12141a] border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
                    <span className="text-gray-400 flex items-center gap-1 shrink-0">
                      <Filter className="w-3 h-3" /> Status:
                    </span>
                    {(['all', 'Pending Approval', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setOrderFilter(filter)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition shrink-0 ${
                          orderFilter === filter
                            ? 'bg-red-600 text-white'
                            : 'text-gray-400 hover:text-white bg-[#161920]'
                        }`}
                      >
                        {filter === 'all' 
                          ? `All (${orders.length})` 
                          : filter === 'Pending Approval' 
                          ? `পেন্ডিং অ্যাপ্রুভাল (${orders.filter(o => o.status === 'Pending Approval' || o.status === 'Pending').length})`
                          : filter}
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
                    filteredOrders.map((ord) => {
                      const isPending = ord.status === 'Pending Approval' || ord.status === 'Pending';
                      const sender = ord.paymentDetails?.senderNumber || ord.advancePaymentDetails?.senderNumber;
                      const transaction = ord.paymentDetails?.transactionId || ord.advancePaymentDetails?.transactionId;

                      return (
                        <div
                          key={ord.id}
                          className={`p-4 rounded-2xl border transition space-y-3 ${
                            isPending
                              ? 'bg-[#15121c] border-amber-800/60 shadow-md'
                              : 'bg-[#101217] border-gray-800'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-800/80">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-red-500">{ord.id}</span>
                              <span className="text-xs text-gray-400">
                                • {new Date(ord.createdAt).toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' })}
                              </span>
                              {isPending && (
                                <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/50 text-amber-400 text-[10px] font-bold rounded-full animate-pulse flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> যাচাই করুন
                                </span>
                              )}
                              {ord.status === 'Confirmed' && (
                                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> অনুমোদিত (Confirmed)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Quick Approve Button for Pending Orders */}
                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => handleApproveOrder(ord.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-md shadow-emerald-600/20"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve Order (অ্যাপ্রুভ)
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenWhatsApp(ord)}
                                className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-800/60 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                              </button>

                              <span className="text-xs text-gray-400">স্ট্যাটাস:</span>
                              <select
                                value={ord.status}
                                onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg border outline-none cursor-pointer ${
                                  ord.status === 'Delivered'
                                    ? 'bg-emerald-950/40 border-emerald-600 text-emerald-400'
                                    : ord.status === 'Shipped'
                                    ? 'bg-blue-950/40 border-blue-600 text-blue-400'
                                    : ord.status === 'Confirmed'
                                    ? 'bg-amber-950/40 border-amber-600 text-amber-400'
                                    : isPending
                                    ? 'bg-yellow-950/40 border-yellow-600 text-yellow-400'
                                    : 'bg-red-950/40 border-red-600 text-red-400'
                                }`}
                              >
                                <option value="Pending Approval">Pending Approval</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>

                          {/* Customer Info & bKash TrxID Verification Highlight */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <p className="text-gray-400 font-medium">কাস্টমার তথ্য:</p>
                              <p className="font-bold text-white">{ord.customer.fullName}</p>
                              <p className="text-red-400 font-mono font-semibold">{ord.customer.phone}</p>
                              {ord.customer.altPhone && (
                                <p className="text-gray-400 font-mono text-[11px]">Alt: {ord.customer.altPhone}</p>
                              )}
                            </div>

                            <div>
                              <p className="text-gray-400 font-medium">ডেলিভারি ঠিকানা:</p>
                              <p className="text-gray-200 leading-relaxed">{ord.customer.fullAddress}</p>
                              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-gray-800 text-[10px] text-gray-300">
                                এলাকা: {ord.customer.district} (চার্জ: ৳{ord.deliveryCharge})
                              </span>
                              {ord.customer.notes && (
                                <p className="text-amber-300/80 text-[11px] mt-1">নোট: {ord.customer.notes}</p>
                              )}
                            </div>

                            {/* Payment & bKash TrxID Verification Box */}
                            <div className="bg-[#161920] p-3 rounded-xl border border-pink-900/50 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <p className="text-pink-400 font-bold text-[11px]">পেমেন্ট ও TrxID তথ্য:</p>
                                <span className="text-[10px] px-1.5 py-0.2 bg-pink-950 text-pink-300 border border-pink-800 rounded">
                                  bKash Send Money
                                </span>
                              </div>

                              {transaction ? (
                                <div className="text-xs space-y-1 pt-1 border-t border-gray-800">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-[11px]">TrxID:</span>
                                    <span className="font-mono text-pink-400 font-black text-sm tracking-wider">
                                      {transaction}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-[11px]">প্রেরক নম্বর:</span>
                                    <span className="font-mono text-white font-bold">
                                      {sender || 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] text-gray-400 pt-0.5">
                                    <span>অগ্রিম প্রদেয় ফি:</span>
                                    <span className="text-emerald-400 font-bold">৳{ord.deliveryCharge}</span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-red-400 text-[11px]">কোনো বিকাশ TrxID পাওয়া যায়নি</p>
                              )}
                            </div>
                          </div>

                          {/* Items Ordered */}
                          <div className="p-3 bg-[#161920] rounded-xl border border-gray-800/80 space-y-1.5 text-xs">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between items-center text-gray-300">
                                <span className="flex items-center gap-2">
                                  <img src={it.image} alt={it.name} className="w-7 h-7 rounded object-cover bg-black" />
                                  <span>{it.quantity}x {it.name}</span>
                                </span>
                                <span className="font-mono font-bold text-white">৳{(it.price * it.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                            <div className="pt-2 border-t border-gray-800 flex justify-between font-bold text-white">
                              <span className="text-gray-400">
                                সাবটোটাল: ৳{ord.subtotal.toLocaleString()} | ডেলিভারি চার্জ: ৳{ord.deliveryCharge} 
                                {ord.discount > 0 && ` | কুপন ছাড়: -৳${ord.discount}`}
                              </span>
                              <span className="text-red-400 font-mono text-sm">সর্বমোট: ৳{ord.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: COUPON CODE MANAGER */}
            {activeTab === 'coupons' && (
              <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Tag className="w-5 h-5 text-red-500" /> ডিসকাউন্ট কুপন ম্যানেজার
                    </h4>
                    <p className="text-xs text-gray-400">
                      কাস্টমারদের জন্য নতুন প্রোমো কুপন কোড তৈরি করুন অথবা সক্রিয়/নিষ্ক্রিয় করুন।
                    </p>
                  </div>
                </div>

                {couponSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {couponSuccess}
                  </div>
                )}

                {/* Create New Coupon Form */}
                <form onSubmit={handleAddCoupon} className="p-4 bg-[#101217] border border-gray-800 rounded-2xl space-y-3">
                  <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-red-500" /> নতুন কুপন যুক্ত করুন
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">কুপন কোড (যেমন: SAVE50) *</label>
                      <input
                        type="text"
                        required
                        placeholder="COUPON CODE"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 bg-[#161920] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white font-mono uppercase outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">ছাড়ের পরিমাণ (টাকায় ৳) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="যেমন: 50"
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-3 py-2 bg-[#161920] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">বিবরণ (ঐচ্ছিক)</label>
                      <input
                        type="text"
                        placeholder="যেমন: বিশেষ উৎসব ছাড়"
                        value={newCouponDesc}
                        onChange={(e) => setNewCouponDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-[#161920] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> কুপন সেভ করুন
                  </button>
                </form>

                {/* Existing Coupons List */}
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    বিদ্যমান কুপন তালিকা ({coupons.length})
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                          coupon.isActive
                            ? 'bg-[#101217] border-gray-800'
                            : 'bg-[#101217]/50 border-gray-900 opacity-60'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-red-500 tracking-wider">
                              {coupon.code}
                            </span>
                            {coupon.isPermanent && (
                              <span className="text-[10px] px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded-full font-bold">
                                অফিসিয়াল স্থায়ী
                              </span>
                            )}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                coupon.isActive
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-gray-800 text-gray-400'
                              }`}
                            >
                              {coupon.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-emerald-400">৳{coupon.discountAmount} ছাড়</p>
                          <p className="text-[11px] text-gray-400">{coupon.description || 'নিয়মিত কুপন'}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleCoupon(coupon.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                              coupon.isActive
                                ? 'bg-amber-950/40 text-amber-400 border border-amber-800/60'
                                : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/60'
                            }`}
                          >
                            {coupon.isActive ? 'বন্ধ করুন' : 'চালু করুন'}
                          </button>

                          {!coupon.isPermanent && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: USER ADVERTISEMENTS & APPROVAL */}
            {activeTab === 'ads' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-2 bg-[#12141a] border-b border-gray-800 flex items-center gap-2 text-xs">
                  <span className="text-gray-400">Filter Ads:</span>
                  <button
                    onClick={() => setAdFilter('all')}
                    className={`px-3 py-1 rounded-lg transition ${
                      adFilter === 'all' ? 'bg-red-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    All ({userAds.length})
                  </button>
                  <button
                    onClick={() => setAdFilter('pending')}
                    className={`px-3 py-1 rounded-lg transition ${
                      adFilter === 'pending' ? 'bg-red-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Pending ({pendingAdsCount})
                  </button>
                  <button
                    onClick={() => setAdFilter('approved')}
                    className={`px-3 py-1 rounded-lg transition ${
                      adFilter === 'approved' ? 'bg-red-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Approved ({userAds.filter(a => a.status === 'approved').length})
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {userAds.filter(a => adFilter === 'all' || a.status === adFilter).length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                      <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No advertisements found for this filter.</p>
                    </div>
                  ) : (
                    userAds
                      .filter(a => adFilter === 'all' || a.status === adFilter)
                      .map((ad) => (
                        <div
                          key={ad.id}
                          className="p-4 bg-[#101217] border border-gray-800 rounded-2xl space-y-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-gray-800">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-sm text-white">{ad.title}</h4>
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full border ${
                                    ad.status === 'approved'
                                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-700'
                                      : ad.status === 'rejected'
                                      ? 'bg-gray-800 text-gray-400 border-gray-700'
                                      : 'bg-yellow-950/40 text-yellow-400 border-yellow-700 animate-pulse'
                                  }`}
                                >
                                  {ad.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">
                                Category: {ad.category} • Asking Price: <strong className="text-red-400 font-mono">৳{ad.price.toLocaleString()}</strong>
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {ad.status !== 'approved' && (
                                <button
                                  onClick={() => onUpdateAdStatus(ad.id, 'approved')}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve & Publish
                                </button>
                              )}
                              {ad.status !== 'rejected' && (
                                <button
                                  onClick={() => onUpdateAdStatus(ad.id, 'rejected')}
                                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-lg transition"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-2 bg-[#161920] rounded-xl border border-gray-800">
                              <span className="text-[10px] font-semibold text-gray-400 block mb-1">Product Photo:</span>
                              <img src={ad.imageUrl} alt={ad.title} className="w-full h-36 object-cover rounded-lg" />
                            </div>

                            {ad.videoUrl && (
                              <div className="p-2 bg-[#161920] rounded-xl border border-gray-800">
                                <span className="text-[10px] font-semibold text-gray-400 block mb-1 flex items-center gap-1">
                                  <Video className="w-3.5 h-3.5 text-red-500" /> 10-15s Video Clip:
                                </span>
                                <video src={ad.videoUrl} controls className="w-full h-36 object-contain rounded-lg bg-black" />
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#161920] rounded-xl border border-gray-800 text-xs">
                            <div>
                              <p className="text-gray-400">Seller Info:</p>
                              <p className="font-bold text-white">{ad.sellerName} ({ad.sellerLocation})</p>
                              <p className="text-red-400 font-mono">{ad.sellerPhone}</p>
                              <p className="text-gray-400 mt-1 text-[11px]">{ad.description}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Listing Commission Fee:</p>
                              <p className="font-bold text-emerald-400 font-mono text-sm">
                                ৳{ad.feeAmount} bKash Verified
                              </p>
                              <p className="text-gray-300 text-[11px] mt-0.5">
                                Sender: <span className="font-mono text-white">{ad.feeSenderNumber}</span>
                              </p>
                              <p className="text-yellow-400 font-mono text-[11px] font-bold">
                                TrxID: {ad.feeTrxId}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: NEW - আপলোড করা পোস্ট ডিলিট ও ম্যানেজ (USER ADS ER PASE) */}
            {activeTab === 'manage_posts' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search & Notice Bar */}
                <div className="px-6 py-2.5 bg-[#12141a] border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-gray-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>ওয়েবসাইটে আপলোড করা যেকোনো পোস্ট বা প্রোডাক্ট এখান থেকে সরাসরি মুছে ফেলতে পারেন।</span>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="পোস্টের নাম বা ক্যাটাগরি দিয়ে খুঁজুন..."
                      value={postSearch}
                      onChange={(e) => setPostSearch(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 bg-[#161920] border border-gray-800 focus:border-red-600 rounded-lg text-xs text-white outline-none"
                    />
                    <Search className="w-3 h-3 text-gray-500 absolute left-2 top-2.5" />
                  </div>
                </div>

                {/* Delete success notification */}
                {postDeleteSuccess && (
                  <div className="mx-6 mt-3 p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {postDeleteSuccess}
                  </div>
                )}

                {/* Post List / Cards with Inside Details & Delete Button */}
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
                              {/* Post Thumbnail */}
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

                              {/* Title & Description Inside the Post */}
                              <div>
                                <h4 className="font-bold text-sm text-white line-clamp-1">{postTitle}</h4>
                                <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                                  {post.description || 'বিবরণ দেওয়া নেই।'}
                                </p>
                              </div>

                              {/* Price & Stock info */}
                              <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-800/80">
                                <div>
                                  <span className="text-[10px] text-gray-500 block">মূল্য:</span>
                                  <span className="font-bold text-red-500 font-mono text-sm">৳{postPrice.toLocaleString()}</span>
                                </div>
                                {post.stock !== undefined && (
                                  <div className="text-right">
                                    <span className="text-[10px] text-gray-500 block">স্টক:</span>
                                    <span className="text-gray-300 font-semibold">{post.stock} টি</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Direct Delete / Remove Post Action */}
                            <button
                              type="button"
                              onClick={() => handleDeletePost(post.id, postTitle)}
                              className="w-full py-2 bg-red-950/60 hover:bg-red-600 text-red-400 hover:text-white border border-red-800/60 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>পোস্টটি ডিলিট করুন (Remove Post)</span>
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