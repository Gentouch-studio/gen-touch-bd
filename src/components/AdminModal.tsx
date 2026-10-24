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
        
        setPostDeleteSuccess(`"${postTitle}" পোস্টটি ওয়েবসাইট ও সার্ভার থেকে স্থায়ীভাবে মুছে ফেলা হয়েছে!`);
        setTimeout(() => setPostDeleteSuccess(''), 4500);
      } catch (err) {
        console.error('Delete failed:', err);
        alert('পোস্ট ডিলিট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
      }
    }
  };

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

  const pendingAdsCount = (userAds || []).filter(a => a && a.status === 'pending').length;
  const pendingOrdersCount = (orders || []).filter(o => o && (o.status === 'Pending' || o.status === 'Pending Approval')).length;

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
              <p className="text-xs text-gray-400">
                {isAuthenticated 
                  ? 'অর্ডার ট্র্যাকিং, ডেলিভারি ভেরিফিকেশন, কুপন তৈরি ও বিজ্ঞাপনের অনুমোদন পোর্টাল' 
                  : 'শুধুমাত্র অথরাইজড অ্যাডমিন এবং স্টাফদের জন্য সংরক্ষিত'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 transition"
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
              <h4 className="text-xl font-bold text-white mb-2">অ্যাডমিন অ্যাক্সেস লকড</h4>
              <p className="text-xs text-gray-400">
                অ্যাডমিন প্যানেলে প্রবেশ করতে আপনার মাস্টার সিক্রেট পাসওয়ার্ড কোডটি দিন।
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="w-full max-w-sm space-y-3">
              <div>
                <input
                  type="password"
                  placeholder="Master Secret Code..."
                  value={secretCodeInput}
                  onChange={(e) => setSecretCodeInput(e.target.value)}
                  className="w-full py-3 px-4 bg-[#14161f] border border-gray-700 focus:border-red-600 rounded-xl text-center font-mono tracking-widest text-sm text-white placeholder-gray-500 outline-none transition"
                  autoFocus
                />
              </div>

              {authError && (
                <div className="p-2.5 bg-red-950/40 border border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/30 transition active:scale-95"
              >
                আনলক কনসোল
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Stats & Tabs Navigation */}
            <div className="px-6 py-3 border-b border-gray-800 bg-[#0d0e14] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === 'orders'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'bg-[#151722] text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>কাস্টমার অর্ডার ({pendingOrdersCount})</span>
                </button>

                <button
                  onClick={() => setActiveTab('manage_posts')}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === 'manage_posts'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'bg-[#151722] text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>সব পোস্ট ও প্রোডাক্ট ({uploadedPosts.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('ads')}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === 'ads'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'bg-[#151722] text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  <Megaphone className="w-4 h-4" />
                  <span>মেম্বার এডস ({pendingAdsCount})</span>
                </button>

                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === 'coupons'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'bg-[#151722] text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  <span>কুপন কোড ({coupons.filter(c => c.isActive).length})</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onLogout}
                  className="py-1.5 px-3 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white text-xs font-semibold rounded-lg border border-gray-800 transition"
                >
                  লগআউট
                </button>
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {postDeleteSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-600 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-pulse">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{postDeleteSuccess}</span>
                </div>
              )}
              
              {/* TAB: MANAGE ALL POSTS & PRODUCTS */}
              {activeTab === 'manage_posts' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#13151f] p-4 rounded-2xl border border-gray-800">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>সব আপলোড করা প্রোডাক্ট ও পোস্ট ম্যানেজমেন্ট</span>
                        <span className="text-xs font-normal text-gray-400">({uploadedPosts.length} আইটেম)</span>
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        যেকোনো ভুল বা অপ্রয়োজনীয় পোস্ট এখান থেকে ডিলিট করলে তা মোবাইল ও পিসি সব ব্যবহারকারীদের স্ক্রিন থেকে রিমুভ হয়ে যাবে।
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="পোস্টের নাম দিয়ে খুঁজুন..."
                          value={postSearch}
                          onChange={(e) => setPostSearch(e.target.value)}
                          className="py-1.5 pl-8 pr-3 bg-black/40 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-red-500"
                        />
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                      </div>
                      <button
                        onClick={loadLivePosts}
                        disabled={isRefreshingPosts}
                        className="py-1.5 px-3 bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                        title="সার্ভার থেকে রিফ্রেশ করুন"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingPosts ? 'animate-spin' : ''}`} />
                        <span>রিফ্রেশ</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {uploadedPosts
                      .filter(p => !postSearch || (p.name || '').toLowerCase().includes(postSearch.toLowerCase()))
                      .map((post) => (
                        <div 
                          key={post.id}
                          className="p-3.5 bg-[#14161f] border border-gray-800 rounded-2xl flex flex-col justify-between gap-3 group hover:border-gray-700 transition"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={post.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80'}
                              alt={post.name}
                              className="w-14 h-14 rounded-xl object-cover border border-gray-800 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                                {post.category || 'General'}
                              </span>
                              <h5 className="text-xs font-bold text-white truncate mt-0.5" title={post.name}>
                                {post.name}
                              </h5>
                              <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                                ৳{(post.price || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
                            <span className="text-[10px] text-gray-500 font-mono">
                              ID: {post.id}
                            </span>
                            <button
                              onClick={() => handleDeletePost(post.id, post.name)}
                              className="py-1 px-2.5 bg-red-950/40 hover:bg-red-600 border border-red-800/80 hover:border-red-600 text-red-300 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>ডিলিট পোস্ট</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 1: ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#13151f] p-4 rounded-2xl border border-gray-800">
                    <div className="flex-1 relative">
                      <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="কাস্টমার নাম, ফোন নম্বর, TrxID বা Order ID দিয়ে খুঁজুন..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-black/40 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-red-600"
                      />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto">
                      {(['all', 'Pending Approval', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setOrderFilter(st)}
                          className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                            orderFilter === st
                              ? 'bg-red-600 text-white'
                              : 'bg-black/30 text-gray-400 hover:text-white border border-gray-800'
                          }`}
                        >
                          {st === 'all' ? 'সব অর্ডার' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredOrders.length === 0 ? (
                      <div className="p-12 text-center text-gray-500 bg-[#12141c] rounded-2xl border border-gray-800">
                        <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-semibold">কোনো অর্ডার পাওয়া যায়নি।</p>
                      </div>
                    ) : (
                      filteredOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-5 bg-[#12141c] border border-gray-800 rounded-2xl space-y-4 hover:border-gray-700 transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-white">{ord.id}</span>
                                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                                  ord.status === 'Delivered'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : ord.status === 'Confirmed' || ord.status === 'Shipped'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : ord.status === 'Cancelled'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                  {ord.status}
                                </span>
                              </div>
                              <span className="text-[11px] text-gray-500">
                                তারিখ: {new Date(ord.createdAt).toLocaleDateString('bn-BD')}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                value={ord.status}
                                onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                                className="py-1 px-3 bg-black/60 border border-gray-700 rounded-xl text-xs text-white outline-none focus:border-red-600"
                              >
                                <option value="Pending Approval">Pending Approval</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>

                              <a
                                href={`https://wa.me/88${ord.customer?.phone?.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                              <span className="text-gray-400 font-semibold block">কাস্টমার তথ্য:</span>
                              <p className="text-white font-bold">{ord.customer?.name}</p>
                              <p className="text-gray-300">ফোন: <span className="font-mono text-red-400">{ord.customer?.phone}</span></p>
                              <p className="text-gray-400">ঠিকানা: {ord.customer?.address}, {ord.customer?.city}</p>
                            </div>

                            <div className="space-y-1 bg-black/30 p-3 rounded-xl border border-gray-800">
                              <span className="text-gray-400 font-semibold block">পেমেন্ট ও ভেরিফিকেশন:</span>
                              <p className="text-white">মেথড: <span className="font-bold text-amber-400 uppercase">{ord.paymentMethod}</span></p>
                              <p className="text-white">TrxID: <span className="font-mono font-bold text-emerald-400">{ord.paymentTrxId || 'N/A'}</span></p>
                              <p className="text-white font-bold text-sm mt-1">
                                সর্বমোট মূল্য: <span className="text-red-500 font-mono">৳{ord.total}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: USER CLASSIFIED ADS */}
              {activeTab === 'ads' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 bg-[#13151f] p-3 rounded-xl border border-gray-800">
                    {(['all', 'pending', 'approved'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setAdFilter(filter)}
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                          adFilter === filter
                            ? 'bg-red-600 text-white'
                            : 'bg-black/30 text-gray-400 hover:text-white border border-gray-800'
                        }`}
                      >
                        {filter === 'all' ? 'সব বিজ্ঞাপন' : filter === 'pending' ? 'পেন্ডিং ভেরিফিকেশন' : 'অনুমোদিত'}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredAds.map((ad) => (
                      <div
                        key={ad.id}
                        className="p-4 bg-[#12141c] border border-gray-800 rounded-2xl flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={ad.image}
                            alt={ad.title}
                            className="w-20 h-20 rounded-xl object-cover border border-gray-800 shrink-0"
                          />
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{ad.category}</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                ad.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {ad.status}
                              </span>
                            </div>
                            <h5 className="font-bold text-white text-xs line-clamp-1">{ad.title}</h5>
                            <p className="text-[11px] text-gray-400">বিক্রেতা: {ad.sellerName} ({ad.sellerLocation})</p>
                            <p className="text-xs font-mono font-bold text-white">৳{ad.price.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="p-2.5 bg-black/40 rounded-xl border border-gray-800/80 text-[11px] space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-400">বিজ্ঞাপন ফি (৳১০) TrxID:</span>
                            <span className="font-mono font-bold text-emerald-400">{ad.feeTrxId || 'Direct'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">কন্টাক্ট নাম্বার:</span>
                            <span className="font-mono text-white">{ad.sellerPhone}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                          {ad.status !== 'approved' && (
                            <button
                              onClick={() => onUpdateAdStatus(ad.id, 'approved')}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>অনুমোদন করুন</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAd(ad.id, ad.title)}
                            className="py-1.5 px-3 bg-red-950/40 hover:bg-red-600 border border-red-800/80 hover:border-red-600 text-red-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>মুছুন</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: COUPONS */}
              {activeTab === 'coupons' && (
                <div className="space-y-6">
                  {adminRole === 'admin' ? (
                    <div className="p-5 bg-[#13151f] border border-gray-800 rounded-2xl">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-red-500" />
                        <span>নতুন কুপন ভাউচার তৈরি করুন</span>
                      </h4>
                      <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <input
                          type="text"
                          placeholder="PROMO CODE (যেমন: SPECIAL50)"
                          value={newCouponCode}
                          onChange={(e) => setNewCouponCode(e.target.value)}
                          className="py-2 px-3 bg-black/40 border border-gray-700 rounded-xl text-xs text-white uppercase font-mono font-bold outline-none focus:border-red-600"
                        />
                        <input
                          type="number"
                          placeholder="ডিসকাউন্ট শতাংশ (%)"
                          value={newCouponDiscount}
                          onChange={(e) => setNewCouponDiscount(e.target.value)}
                          className="py-2 px-3 bg-black/40 border border-gray-700 rounded-xl text-xs text-white font-mono outline-none focus:border-red-600"
                        />
                        <input
                          type="text"
                          placeholder="বিবরণ / শর্ত..."
                          value={newCouponDesc}
                          onChange={(e) => setNewCouponDesc(e.target.value)}
                          className="py-2 px-3 bg-black/40 border border-gray-700 rounded-xl text-xs text-white outline-none focus:border-red-600"
                        />
                        <button
                          type="submit"
                          className="py-2 px-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition"
                        >
                          কুপন সেভ করুন
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl text-xs text-amber-300">
                      ℹ️ আপনি মডারেটর হিসেবে লগইন করেছেন। কুপন তৈরি বা ডিলিট করার অধিকার শুধুমাত্র সুপারের।
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                          coupon.isActive
                            ? 'bg-[#12141c] border-gray-800 hover:border-red-600/40'
                            : 'bg-black/20 border-gray-900 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-lg bg-red-600/10 border border-red-600/30 font-mono text-xs font-black text-red-400">
                            {coupon.code}
                          </span>
                          <span className="text-base font-black text-white font-mono">
                            {coupon.discountPercent}% OFF
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{coupon.description}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
                          <button
                            onClick={() => handleToggleCoupon(coupon.id)}
                            className={`text-xs font-bold ${coupon.isActive ? 'text-amber-400' : 'text-emerald-400'}`}
                          >
                            {coupon.isActive ? 'ডিঅ্যাক্টিভ করুন' : 'সক্রিয় করুন'}
                          </button>
                          {adminRole === 'admin' && (
                            <button
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              className="text-gray-500 hover:text-red-500 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
