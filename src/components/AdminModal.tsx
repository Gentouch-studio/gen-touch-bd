import React, { useState, useEffect } from 'react';
import { 
  X, Check, Trash2, ShoppingBag, Eye, Lock, ShieldCheck, 
  Search, RefreshCw, Tag, AlertTriangle, ExternalLink, Plus
} from 'lucide-react';
import type { Order, UserAd, OrderStatus, Product } from '../types';
import { productService } from '../services/productService';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  userAds: UserAd[];
  onUpdateAdStatus: (adId: string, status: 'approved' | 'rejected') => void;
  onDeleteAd?: (adId: string) => void;
  isAuthenticated: boolean;
  onAuthenticate: (code: string) => boolean;
  onLogout: () => void;
}

interface Coupon {
  id: string;
  code: string;
  discountAmount: number;
  minSpend: number;
  isActive: boolean;
  usageCount: number;
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
  const [adminCode, setAdminCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'ads' | 'products' | 'coupons'>('orders');
  const [adminRole, setAdminRole] = useState<'admin' | 'staff'>('admin');

  // Filter States
  const [orderFilter, setOrderFilter] = useState<'all' | 'Pending Approval' | 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [adFilter, setAdFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [postSearch, setPostSearch] = useState('');

  // Live Products directly from Firestore + Local
  const [uploadedPosts, setUploadedPosts] = useState<Product[]>([]);
  const [isRefreshingPosts, setIsRefreshingPosts] = useState(false);
  const [postDeleteSuccess, setPostDeleteSuccess] = useState('');

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('gentouch_coupons');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      { id: 'c1', code: 'ilovegentouch', discountAmount: 10, minSpend: 100, isActive: true, usageCount: 42 },
      { id: 'c2', code: 'TURBO30', discountAmount: 30, minSpend: 500, isActive: true, usageCount: 18 }
    ];
  });
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('20');
  const [newCouponMinSpend, setNewCouponMinSpend] = useState('200');

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadUploadedPosts();
    }
  }, [isOpen, isAuthenticated]);

  const loadUploadedPosts = async () => {
    setIsRefreshingPosts(true);
    try {
      const cloudProds = await productService.getProducts();
      setUploadedPosts(cloudProds);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshingPosts(false);
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const newC: Coupon = {
      id: `cp-${Date.now()}`,
      code: newCouponCode.trim().toLowerCase(),
      discountAmount: Number(newCouponDiscount) || 10,
      minSpend: Number(newCouponMinSpend) || 0,
      isActive: true,
      usageCount: 0
    };
    const updated = [newC, ...coupons];
    setCoupons(updated);
    localStorage.setItem('gentouch_coupons', JSON.stringify(updated));
    setNewCouponCode('');
  };

  const handleToggleCoupon = (id: string) => {
    const updated = coupons.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c);
    setCoupons(updated);
    localStorage.setItem('gentouch_coupons', JSON.stringify(updated));
  };

  const handleDeleteCoupon = (id: string) => {
    const updated = coupons.filter(c => c.id !== id);
    setCoupons(updated);
    localStorage.setItem('gentouch_coupons', JSON.stringify(updated));
  };

  if (!isOpen) return null;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = adminCode.trim();
    if (cleanCode === 'Hunter#11220' || cleanCode === 'Hunter#1122' || cleanCode === 'Hunter#1212') {
      const success = onAuthenticate(cleanCode);
      if (success) {
        setAdminRole(cleanCode === 'Hunter#11220' ? 'admin' : 'staff');
        setAuthError('');
        setAdminCode('');
        loadUploadedPosts();
      } else {
        setAuthError('অথেন্টিকেশন ব্যর্থ হয়েছে!');
      }
    } else {
      setAuthError('ভুল সিক্রেট কোড! প্রবেশাধিকার নেই।');
    }
  };

  // Permanently delete user ad
  const handleDeleteAdClick = async (adId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this member ad?')) {
      return;
    }

    try {
      await productService.deleteUserAd(adId);
      if (onDeleteAd) {
        onDeleteAd(adId);
      }
    } catch (e) {
      console.error(e);
      if (onDeleteAd) {
        onDeleteAd(adId);
      }
    }
  };

  // Permanently delete catalog product
  const handleDeleteUploadedPost = async (postId: string, postTitle: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${postTitle}" পোস্টটি স্থায়ীভাবে মুছে ফেলতে চান? এটি স্টোর থেকে রিমুভ হয়ে যাবে।`)) {
      try {
        await productService.deleteProduct(postId);
        setUploadedPosts(prev => prev.filter(p => p.id !== postId));
        
        try {
          const localSaved = localStorage.getItem('gen_touch_custom_products');
          const parsed = localSaved ? JSON.parse(localSaved) : [];
          const updated = parsed.filter((p: any) => p.id !== postId);
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

  const filteredUploadedPosts = (uploadedPosts || []).filter((p) => {
    if (!p) return false;
    const q = (postSearch || '').toLowerCase().trim();
    if (!q) return true;
    const title = (p.name || (p as any).title || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();
    return title.includes(q) || cat.includes(q);
  });

  // Safe Guarded Orders Filter - prevents any crash
  const filteredOrders = (orders || []).filter((order) => {
    if (!order) return false;
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    const q = (orderSearch || '').toLowerCase().trim();
    if (!q) return matchesFilter;
    const custName = (order.customer?.name || '').toLowerCase();
    const custPhone = (order.customer?.phone || '');
    const trx = (order.paymentTrxId || '').toLowerCase();
    const ordId = (order.id || '').toLowerCase();
    const matchesSearch = 
      custName.includes(q) ||
      custPhone.includes(q) ||
      trx.includes(q) ||
      ordId.includes(q);
    return matchesFilter && matchesSearch;
  });

  const filteredAds = (userAds || []).filter((ad) => {
    if (!ad) return false;
    if (adFilter === 'all') return true;
    return ad.status === adFilter;
  });

  const pendingAdsCount = (userAds || []).filter(a => a?.status === 'pending').length;
  const pendingOrdersCount = (orders || []).filter(o => o?.status === 'Pending' || (o?.status as string) === 'Pending Approval').length;

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
            
            <div className="max-w-sm space-y-1">
              <h4 className="text-xl font-bold text-white">অ্যাডমিন অ্যাক্সেস লকড</h4>
              <p className="text-xs text-gray-400">
                এই ড্যাশবোর্ডটি শুধুমাত্র GEN-TOUCH এর অনুমোদিত ম্যানেজমেন্ট ও সাপোর্ট টিমের জন্য সংরক্ষিত।
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="w-full max-w-sm space-y-3">
              <div>
                <input
                  type="password"
                  value={adminCode}
                  onChange={(e) => {
                    setAdminCode(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="অ্যাডমিন সিক্রেট কোড লিখুন..."
                  className="w-full px-4 py-3 bg-[#161922] border border-gray-700 focus:border-red-600 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition text-center font-mono tracking-widest"
                  autoFocus
                />
                {authError && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{authError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-red-600/20 active:scale-95"
              >
                আনলক ও ভেরিফাই করুন
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <>
            {/* Navigation Tabs - Exactly matching Screenshot 2 */}
            <div className="px-6 py-3 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-[#0d0f15]">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    activeTab === 'orders'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>কাস্টমার অর্ডার ({pendingOrdersCount})</span>
                </button>

                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    activeTab === 'coupons'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>ডিসকাউন্ট কুপন ({coupons.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('ads')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    activeTab === 'ads'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>মেম্বার এডস ({pendingAdsCount} পেন্ডিং)</span>
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    activeTab === 'products'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>প্রোডাক্ট ডিলিট / লাইভ ম্যানেজ ({uploadedPosts.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-mono">
                  User: <strong className="text-white">Super Admin</strong>
                </span>
                <button
                  onClick={onLogout}
                  className="text-xs font-bold text-gray-400 hover:text-red-400 transition"
                >
                  লগআউট
                </button>
              </div>
            </div>

            {/* Notification alert banner */}
            {postDeleteSuccess && (
              <div className="bg-emerald-600/20 border-b border-emerald-600/40 px-6 py-2 text-xs text-emerald-300 font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                {postDeleteSuccess}
              </div>
            )}

            {/* Tab Contents */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">
              {/* TAB 1: ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {/* Order Filter & Search Toolbar */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                      <span className="text-xs text-gray-400 mr-1 font-semibold flex items-center gap-1">
                        Filter:
                      </span>
                      {(['all', 'Pending Approval', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setOrderFilter(st)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                            orderFilter === st
                              ? 'bg-red-600 text-white shadow'
                              : 'bg-[#141620] text-gray-400 hover:text-white border border-gray-800'
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
                        className="w-full pl-8 pr-3 py-1.5 bg-[#141620] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-red-600"
                      />
                      <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  {/* Orders List */}
                  {filteredOrders.length === 0 ? (
                    <div className="py-16 text-center text-gray-500 bg-[#12141c] rounded-2xl border border-gray-800">
                      <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-xs">কোনো অর্ডার পাওয়া যায়নি।</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="bg-[#12141c] border border-gray-800/80 rounded-2xl p-4 sm:p-5 space-y-3 hover:border-gray-700 transition"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-red-500">{ord.id}</span>
                              <span className="text-xs text-gray-400 font-mono">{ord.createdAt}</span>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                              ord.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                              ord.status === 'Confirmed' || ord.status === 'Shipped' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
                              ord.status === 'Cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}>
                              {ord.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-gray-400 block font-semibold mb-1">কাস্টমার তথ্য:</span>
                              <p className="text-emerald-400 font-mono">ফোন: {ord.customer?.phone || 'N/A'}</p>
                              <p className="text-gray-300">ঠিকানা: {ord.customer?.address || ''}, {ord.customer?.district || ''}</p>
                            </div>

                            <div>
                              <span className="text-gray-400 block font-semibold mb-1">পেমেন্ট ও মূল্য:</span>
                              <p className="text-sm font-black text-white font-mono">
                                মোট মূল্য: <span className="text-red-500 font-bold">৳{ord.total}</span>
                              </p>
                              <p className="text-gray-400 uppercase font-mono">
                                মেথড: <span className="text-white font-bold">{ord.paymentMethod}</span>
                              </p>
                              {ord.paymentTrxId && (
                                <p className="text-amber-400 font-mono text-[11px]">TrxID: {ord.paymentTrxId}</p>
                              )}
                            </div>
                          </div>

                          {/* Quick Change Status Buttons */}
                          <div className="pt-2 border-t border-gray-800/60 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs text-gray-400">স্ট্যাটাস পরিবর্তন:</span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {(['Pending Approval', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as const).map((s) => (
                                <button
                                  key={s}
                                  onClick={() => onUpdateOrderStatus(ord.id, s as OrderStatus)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                                    ord.status === s
                                      ? 'bg-red-600 text-white'
                                      : 'bg-[#181b26] text-gray-400 hover:text-white border border-gray-700'
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: COUPONS */}
              {activeTab === 'coupons' && (
                <div className="space-y-4">
                  {/* Create New Coupon Form */}
                  <form onSubmit={handleCreateCoupon} className="bg-[#12141c] border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[160px]">
                      <label className="block text-[11px] text-gray-400 font-bold mb-1">কুপন কোড (যেমন: VIP50)</label>
                      <input
                        type="text"
                        placeholder="কুপন কোড লিখুন"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        className="w-full px-3 py-2 bg-[#181b26] border border-gray-700 rounded-xl text-xs text-white uppercase outline-none focus:border-red-600 font-mono"
                      />
                    </div>

                    <div className="w-32">
                      <label className="block text-[11px] text-gray-400 font-bold mb-1">ছাড়ের পরিমাণ (৳)</label>
                      <input
                        type="number"
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(e.target.value)}
                        className="w-full px-3 py-2 bg-[#181b26] border border-gray-700 rounded-xl text-xs text-white outline-none focus:border-red-600 font-mono"
                      />
                    </div>

                    <div className="w-36">
                      <label className="block text-[11px] text-gray-400 font-bold mb-1">সর্বনিম্ন অর্ডার (৳)</label>
                      <input
                        type="number"
                        value={newCouponMinSpend}
                        onChange={(e) => setNewCouponMinSpend(e.target.value)}
                        className="w-full px-3 py-2 bg-[#181b26] border border-gray-700 rounded-xl text-xs text-white outline-none focus:border-red-600 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" /> কুপন তৈরি করুন
                    </button>
                  </form>

                  {/* Coupons List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {coupons.map((c) => (
                      <div
                        key={c.id}
                        className="bg-[#12141c] border border-gray-800 rounded-2xl p-4 flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-yellow-400 uppercase tracking-wider">{c.code}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${c.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-gray-800 text-gray-500'}`}>
                              {c.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-300">
                            ছাড়: <strong className="text-white font-mono">৳{c.discountAmount}</strong> (মিনিমাম খরচ: ৳{c.minSpend})
                          </p>
                          <p className="text-[10px] text-gray-500">ব্যবহৃত হয়েছে: {c.usageCount} বার</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleCoupon(c.id)}
                            className="px-2.5 py-1 bg-[#181b26] hover:bg-gray-700 border border-gray-700 text-xs text-gray-300 rounded-lg transition"
                          >
                            {c.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(c.id)}
                            className="p-1.5 text-red-400 hover:bg-red-950/40 rounded-lg transition"
                            title="কুপন মুছুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: MEMBER ADS */}
              {activeTab === 'ads' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-semibold">বিজ্ঞাপন ফিল্টার করুন:</span>
                    <div className="flex items-center gap-1.5">
                      {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setAdFilter(st)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition ${
                            adFilter === st
                              ? 'bg-amber-500 text-black font-bold'
                              : 'bg-[#141620] text-gray-400 hover:text-white border border-gray-800'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredAds.length === 0 ? (
                    <div className="py-16 text-center text-gray-500 bg-[#12141c] rounded-2xl border border-gray-800">
                      <Eye className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-xs">কোনো মেম্বার বিজ্ঞাপন পাওয়া যায়নি।</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAds.map((ad) => (
                        <div
                          key={ad.id}
                          className="bg-[#12141c] border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start"
                        >
                          <div className="flex gap-3">
                            <img
                              src={ad.imageUrl}
                              alt={ad.title}
                              className="w-20 h-20 rounded-xl object-cover border border-gray-800 bg-black/40 shrink-0"
                            />
                            <div className="space-y-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                ad.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                ad.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                'bg-amber-500/20 text-amber-400'
                              }`}>
                                {ad.status}
                              </span>
                              <h4 className="text-xs font-bold text-white mt-1">{ad.title}</h4>
                              <p className="text-sm font-black text-red-500 font-mono">৳{ad.price}</p>
                              <p className="text-[11px] text-gray-400">
                                বিক্রেতা: <span className="text-white">{ad.sellerName}</span> ({ad.sellerPhone}) • {ad.sellerLocation}
                              </p>
                              <p className="text-[10px] text-gray-500 font-mono">
                                ফি: ৳{ad.feeAmount} | TrxID: {ad.feeTrxId} (নম্বর: {ad.feeSenderNumber})
                              </p>
                            </div>
                          </div>

                          <div className="flex sm:flex-col gap-2 shrink-0 self-end sm:self-auto">
                            {ad.status !== 'approved' && (
                              <button
                                onClick={() => onUpdateAdStatus(ad.id, 'approved')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>
                            )}
                            {ad.status !== 'rejected' && (
                              <button
                                onClick={() => onUpdateAdStatus(ad.id, 'rejected')}
                                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-xl transition flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteAdClick(ad.id)}
                              className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/40 text-xs font-bold rounded-xl transition flex items-center gap-1"
                              title="স্থায়ীভাবে বিজ্ঞাপন মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: LIVE PRODUCT DELETE / MANAGE */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
                    <div className="relative w-full sm:w-80">
                      <input
                        type="text"
                        placeholder="প্রোডাক্ট নাম দিয়ে খুঁজুন..."
                        value={postSearch}
                        onChange={(e) => setPostSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-[#12141c] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-red-600"
                      />
                      <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
                    </div>

                    <button
                      onClick={loadUploadedPosts}
                      className="px-3 py-2 bg-[#161922] hover:bg-[#202430] border border-gray-800 text-xs text-gray-300 font-semibold rounded-xl transition flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingPosts ? 'animate-spin' : ''}`} />
                      রিফ্রেশ ক্যাটালগ
                    </button>
                  </div>

                  {filteredUploadedPosts.length === 0 ? (
                    <div className="py-16 text-center text-gray-500 bg-[#12141c] rounded-2xl border border-gray-800">
                      <RefreshCw className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-xs">কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredUploadedPosts.map((p) => (
                        <div
                          key={p.id}
                          className="bg-[#12141c] border border-gray-800 rounded-2xl p-3.5 flex flex-col justify-between space-y-2 hover:border-gray-700 transition"
                        >
                          <div className="flex gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-16 h-16 rounded-xl object-cover bg-black/40 shrink-0 border border-gray-800"
                            />
                            <div className="overflow-hidden">
                              <span className="text-[10px] text-gray-400 font-mono block truncate">{p.category}</span>
                              <h4 className="text-xs font-bold text-white truncate" title={p.name}>{p.name}</h4>
                              <p className="text-sm font-mono font-black text-red-500 mt-1">৳{p.price}</p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-mono">ID: {p.id.slice(0, 8)}</span>
                            <button
                              onClick={() => handleDeleteUploadedPost(p.id, p.name)}
                              className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30 text-[11px] font-bold flex items-center gap-1 transition"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminModal;
