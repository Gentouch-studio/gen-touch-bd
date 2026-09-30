import React, { useState, useEffect } from 'react';
import { 
  X, Shield, Lock, Package, ShoppingBag, Eye, 
  CheckCircle, Clock, Check, Trash2, Filter, AlertCircle, RefreshCw
} from 'lucide-react';
import { Order, UserAd, OrderStatus, Product } from '../types';
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
  const [activeTab, setActiveTab] = useState<'orders' | 'ads' | 'posts'>('orders');
  const [adminCode, setAdminCode] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Filters & Search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [adFilter, setAdFilter] = useState<string>('all');
  const [postSearch, setPostSearch] = useState('');

  // Live products uploaded directly by admin or synced
  const [uploadedPosts, setUploadedPosts] = useState<Product[]>([]);
  const [isRefreshingPosts, setIsRefreshingPosts] = useState(false);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadLiveProducts();
    }
  }, [isOpen, isAuthenticated]);

  const loadLiveProducts = async () => {
    setIsRefreshingPosts(true);
    try {
      const items = await productService.getProducts();
      setUploadedPosts(items);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshingPosts(false);
    }
  };

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onAuthenticate(adminCode);
    if (!success) {
      setLoginError(true);
    } else {
      setLoginError(false);
      setAdminCode('');
    }
  };

  // If Not Authenticated, show Admin Login Pin Box
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="relative w-full max-w-md bg-[#0f1115] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <button 
            onClick={onClose}
            className="absolute right-5 top-5 p-2 text-gray-400 hover:text-white rounded-full bg-gray-900 border border-gray-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-3 mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 shadow-lg shadow-red-600/20">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Admin Console</h2>
            <p className="text-xs text-gray-400">Enter your secure master passkey to manage GEN-TOUCH orders & ads</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type="password"
                  value={adminCode}
                  onChange={(e) => {
                    setAdminCode(e.target.value);
                    setLoginError(false);
                  }}
                  placeholder="Master Passkey (e.g. Hunter#11220)"
                  className="w-full pl-11 pr-4 py-3 bg-[#161920] border border-gray-800 focus:border-red-600 rounded-2xl text-sm text-white placeholder-gray-500 outline-none transition font-mono"
                  autoFocus
                />
                <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-3.5" />
              </div>
              {loginError && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> Invalid Passkey. Access Denied.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition hover:scale-[1.02] active:scale-95"
            >
              Verify & Enter Console
            </button>
          </form>

          <p className="text-[11px] text-gray-500 text-center mt-6">
            Protected by GEN-TOUCH CyberShield Multi-Factor Defense.
          </p>
        </div>
      </div>
    );
  }

  // Delete Ad permanently
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

  // Delete Product
  const handleDeleteProductClick = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productService.deleteProduct(productId);
      setUploadedPosts(prev => prev.filter(p => p.id !== productId));
      if (onDeleteAd) {
        onDeleteAd(productId);
      }
    } catch (e) {
      console.error(e);
      alert('ডিলিট করার সময় সমস্যা হয়েছে, দয়া করে আবার চেষ্টা করুন।');
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
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800 bg-[#101218]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/30 flex items-center justify-center text-red-500">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>GEN-TOUCH Admin Console</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  AUTHENTICATED
                </span>
              </h2>
              <p className="text-xs text-gray-400">Order verification, Member Ads approvals & Catalog moderation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs text-gray-300 font-semibold transition"
            >
              Logout
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-xl bg-gray-900 border border-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-4 border-b border-gray-800/80 bg-[#0e1017]">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition border-b-2 ${
              activeTab === 'orders'
                ? 'border-red-600 text-white bg-[#141620]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-red-500" />
            <span>Customer Orders</span>
            {pendingOrdersCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-[10px] font-mono text-white">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition border-b-2 ${
              activeTab === 'ads'
                ? 'border-red-600 text-white bg-[#141620]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Eye className="w-4 h-4 text-amber-500" />
            <span>Member Classified Ads</span>
            {pendingAdsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-mono text-black font-black">
                {pendingAdsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition border-b-2 ${
              activeTab === 'posts'
                ? 'border-red-600 text-white bg-[#141620]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Package className="w-4 h-4 text-blue-500" />
            <span>Direct Product Catalog</span>
            <span className="px-1.5 py-0.5 rounded-full bg-gray-800 text-[10px] font-mono text-gray-300">
              {uploadedPosts.length}
            </span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-[#0b0c10]">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between pb-2">
                <input
                  type="text"
                  placeholder="অর্ডার আইডি, কাস্টমার নাম, ফোন বা TrxID খুঁজুন..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="px-3.5 py-2 bg-[#12141c] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 outline-none w-full sm:w-80 focus:border-red-600"
                />

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {(['all', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                        orderFilter === st
                          ? 'bg-red-600 text-white'
                          : 'bg-[#141620] text-gray-400 hover:text-white border border-gray-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-[#0f1118] border border-gray-800/80 rounded-2xl p-6">
                  <ShoppingBag className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm font-semibold">কোনো অর্ডার পাওয়া যায়নি</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl bg-[#11131b] border border-gray-800 hover:border-gray-700 transition space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm">{order.id}</span>
                          <span className="text-xs text-gray-400">• {order.createdAt}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            order.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                            order.status === 'Confirmed' || order.status === 'Shipped' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            order.status === 'Cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}>
                            {order.status}
                          </span>

                          {/* Quick status dropdown */}
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-[#181b26] border border-gray-700 text-xs text-white rounded-xl px-2 py-1 outline-none focus:border-red-600"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Customer Info & Payment */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-[#161922] p-3 rounded-xl border border-gray-800/80">
                          <span className="text-gray-400 block text-[10px] font-bold uppercase mb-1">কাস্টমার তথ্য</span>
                          <p className="font-bold text-white">{order.customer?.name || 'Customer'}</p>
                          <p className="text-emerald-400 font-mono">ফোন: {order.customer?.phone || 'N/A'}</p>
                          <p className="text-gray-300 text-[11px] mt-0.5">ঠিকানা: {order.customer?.address || ''}, {order.customer?.district || ''}</p>
                        </div>

                        <div className="bg-[#161922] p-3 rounded-xl border border-gray-800/80">
                          <span className="text-gray-400 block text-[10px] font-bold uppercase mb-1">পেমেন্ট ভেরিফিকেশন</span>
                          <p className="font-bold text-white">মেথড: {order.paymentMethod}</p>
                          <p className="text-amber-400 font-mono">TrxID: {order.paymentTrxId || 'Cash on Delivery'}</p>
                          {order.paymentNumber && (
                            <p className="text-gray-300 font-mono text-[11px]">প্রেরক: {order.paymentNumber}</p>
                          )}
                        </div>

                        <div className="bg-[#161922] p-3 rounded-xl border border-gray-800/80 sm:col-span-2 md:col-span-1">
                          <span className="text-gray-400 block text-[10px] font-bold uppercase mb-1">টোটাল বিলিং</span>
                          <p className="text-lg font-black text-red-500 font-mono">৳{order.total}</p>
                          <p className="text-gray-400 text-[11px]">{order.items?.length || 0} টি প্রোডাক্ট আইটেম</p>
                        </div>
                      </div>

                      {/* Ordered Items summary */}
                      <div className="bg-[#0f1118] p-2.5 rounded-xl border border-gray-800/60">
                        <span className="text-gray-400 block text-[10px] font-bold uppercase mb-1.5">আইটেম লিস্ট:</span>
                        <div className="space-y-1">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs text-gray-300">
                              <span className="truncate max-w-xs">{item.product?.name || 'Item'} × {item.quantity}</span>
                              <span className="font-mono text-gray-400">৳{(item.product?.price || 0) * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: USER CLASSIFIED ADS */}
          {activeTab === 'ads' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-xs text-gray-400 font-semibold">
                  মেম্বারদের সাবমিট করা বিজ্ঞাপন অনুমোদন ও ম্যানেজমেন্ট ({filteredAds.length} টি)
                </h3>

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
                <div className="text-center py-16 bg-[#0f1118] border border-gray-800/80 rounded-2xl p-6">
                  <Eye className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm font-semibold">কোনো বিজ্ঞাপন পাওয়া যায়নি</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAds.map((ad) => (
                    <div
                      key={ad.id}
                      className="p-4 rounded-2xl bg-[#11131b] border border-gray-800 hover:border-gray-700 transition flex flex-col md:flex-row gap-4 justify-between"
                    >
                      <div className="flex gap-4">
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          className="w-24 h-24 rounded-xl object-cover border border-gray-800 shrink-0 bg-black/40"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400';
                          }}
                        />

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              ad.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                              ad.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }`}>
                              {ad.status}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">{ad.category}</span>
                          </div>

                          <h4 className="text-sm font-bold text-white">{ad.title}</h4>
                          <p className="text-red-400 font-black text-sm font-mono">মূল্য: ৳{ad.price}</p>
                          <p className="text-xs text-gray-400">বিক্রেতা: <span className="text-gray-200 font-medium">{ad.sellerName}</span> ({ad.sellerPhone})</p>
                          <p className="text-[11px] text-gray-500">লোকেশন: {ad.sellerLocation}</p>
                          
                          <div className="mt-2 p-2 rounded bg-black/40 border border-gray-800 text-[11px] text-gray-300 font-mono inline-block">
                            ফি: ৳{ad.feeAmount} | TrxID: <span className="text-amber-400 font-bold">{ad.feeTrxId}</span> (নম্বর: {ad.feeSenderNumber})
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex md:flex-col justify-end gap-2 shrink-0">
                        {ad.status !== 'approved' && (
                          <button
                            onClick={() => onUpdateAdStatus(ad.id, 'approved')}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}

                        {ad.status !== 'rejected' && (
                          <button
                            onClick={() => onUpdateAdStatus(ad.id, 'rejected')}
                            className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-red-950 text-gray-300 hover:text-red-400 border border-gray-700 text-xs font-bold flex items-center gap-1.5 transition"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        )}

                        {/* পার্মানেন্ট ডিলিট বাটন */}
                        <button
                          onClick={() => handleDeleteAdClick(ad.id)}
                          className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/40 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
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

          {/* TAB 3: DIRECT PRODUCT CATALOG */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between pb-2">
                <input
                  type="text"
                  placeholder="প্রোডাক্ট নাম বা ক্যাটাগরি দিয়ে সার্চ করুন..."
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  className="px-3.5 py-2 bg-[#12141c] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 outline-none w-full sm:w-80 focus:border-red-600"
                />

                <button
                  onClick={loadLiveProducts}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161922] hover:bg-[#202430] border border-gray-800 text-xs text-gray-300 font-semibold transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingPosts ? 'animate-spin' : ''}`} />
                  <span>রিফ্রেশ ক্যাটালগ</span>
                </button>
              </div>

              {filteredUploadedPosts.length === 0 ? (
                <div className="text-center py-16 bg-[#0f1118] border border-gray-800/80 rounded-2xl p-6">
                  <Package className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm font-semibold">কোনো প্রোডাক্ট খুঁজে পাওয়া যায়নি</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredUploadedPosts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-[#11131b] border border-gray-800 hover:border-gray-700 transition flex flex-col justify-between space-y-2"
                    >
                      <div className="flex gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-16 h-16 rounded-xl object-cover bg-black/40 shrink-0 border border-gray-800"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
                          }}
                        />
                        <div className="overflow-hidden">
                          <span className="text-[10px] text-gray-400 font-mono block truncate">{p.category}</span>
                          <h4 className="text-xs font-bold text-white truncate" title={p.name}>{p.name}</h4>
                          <p className="text-sm font-mono font-black text-red-500 mt-1">৳{p.price}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 font-mono">ID: {p.id.slice(0, 10)}</span>
                        <button
                          onClick={() => handleDeleteProductClick(p.id)}
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
      </div>
    </div>
  );
};
