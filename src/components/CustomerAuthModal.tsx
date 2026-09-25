import React, { useState, useEffect } from 'react';
import { 
  X, User, ShoppingBag, Phone, Copy, Check, LogOut, 
  Clock, Package, CheckCircle2, AlertCircle, MessageCircle, ShieldCheck, 
  Lock, KeyRound, ArrowRight, Sparkles, Shield
} from 'lucide-react';
import { Order, OrderStatus, UserRole } from '../types';

export interface CustomerProfile {
  id: string; // e.g. GT-CUST-849201
  name: string;
  phone: string;
  role: UserRole;
  address?: string;
  joinedDate: string;
}

interface StoredAccount {
  id: string;
  name: string;
  phone: string;
  password?: string;
  role: UserRole;
  joinedDate: string;
}

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onOpenAdmin: () => void;
  whatsappNumber?: string;
  onUserLoginSuccess?: (role: UserRole) => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  orders,
  onOpenAdmin,
  whatsappNumber = '01310588979',
  onUserLoginSuccess,
}) => {
  // Current logged in user
  const [currentUser, setCurrentUser] = useState<CustomerProfile | null>(() => {
    try {
      const saved = localStorage.getItem('gentouch_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Auth Mode: 'login' | 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Input states
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('orders');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('gentouch_current_user', JSON.stringify(currentUser));
      if (onUserLoginSuccess) {
        onUserLoginSuccess(currentUser.role);
      }
    } else {
      localStorage.removeItem('gentouch_current_user');
    }
  }, [currentUser, onUserLoginSuccess]);

  if (!isOpen) return null;

  // Helper to validate BD Phone number: 11 digits and starts with 01
  const isValidBdPhone = (phone: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    return /^01[3-9]\d{8}$/.test(clean);
  };

  // Get all registered accounts from local storage
  const getRegisteredAccounts = (): StoredAccount[] => {
    try {
      const saved = localStorage.getItem('gentouch_registered_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  // Save new account to local storage
  const saveRegisteredAccount = (account: StoredAccount) => {
    const existing = getRegisteredAccounts();
    const filtered = existing.filter((a) => a.phone !== account.phone);
    filtered.push(account);
    localStorage.setItem('gentouch_registered_users', JSON.stringify(filtered));
  };

  // Handle Sign Up
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const cleanName = nameInput.trim();
    const cleanPhone = phoneInput.trim().replace(/[^0-9]/g, '');
    const cleanPass = passwordInput.trim();
    const cleanSecret = secretCodeInput.trim();

    if (!cleanName) {
      setFormError('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
      return;
    }

    if (!isValidBdPhone(cleanPhone)) {
      setFormError('ফোন নম্বরটি অবশ্যই ১১ ডিজিটের হতে হবে এবং 01 দিয়ে শুরু হতে হবে (যেমন: 017XXXXXXXX)।');
      return;
    }

    if (cleanPass.length < 4) {
      setFormError('পাসওয়ার্ড ন্যূনতম ৪ অক্ষরের হতে হবে।');
      return;
    }

    // Check if phone is already registered
    const accounts = getRegisteredAccounts();
    const alreadyExists = accounts.find((a) => a.phone === cleanPhone);
    if (alreadyExists) {
      setFormError('এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে। অনুগ্রহ করে লগইন করুন।');
      return;
    }

    // Determine Role: Admin / Moderator / Customer
    let userRole: UserRole = 'customer';
    if (cleanSecret === 'Hunter#11220' || cleanPass === 'Hunter#11220') {
      userRole = 'admin';
    } else if (cleanSecret === 'Hunter#1212' || cleanPass === 'Hunter#1212') {
      userRole = 'moderator';
    }

    // Generate unique ID
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const newId = userRole === 'admin' 
      ? `GT-ADM-${randomSuffix}`
      : userRole === 'moderator'
      ? `GT-MOD-${randomSuffix}`
      : `GT-CUST-${randomSuffix}`;

    const newAccount: StoredAccount = {
      id: newId,
      name: cleanName,
      phone: cleanPhone,
      password: cleanPass,
      role: userRole,
      joinedDate: new Date().toLocaleDateString('en-BD', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
    };

    saveRegisteredAccount(newAccount);

    const profile: CustomerProfile = {
      id: newAccount.id,
      name: newAccount.name,
      phone: newAccount.phone,
      role: newAccount.role,
      joinedDate: newAccount.joinedDate,
    };

    setCurrentUser(profile);
    setFormSuccess('আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
    setActiveTab('orders');
    setNameInput('');
    setPhoneInput('');
    setPasswordInput('');
    setSecretCodeInput('');
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const cleanPhone = phoneInput.trim().replace(/[^0-9]/g, '');
    const cleanPass = passwordInput.trim();

    if (!cleanPhone) {
      setFormError('অনুগ্রহ করে মোবাইল নম্বর লিখুন।');
      return;
    }

    if (!cleanPass) {
      setFormError('অনুগ্রহ করে পাসওয়ার্ড লিখুন।');
      return;
    }

    // Special master overrides for Admin / Moderator direct access
    if (cleanPass === 'Hunter#11220') {
      const adminProfile: CustomerProfile = {
        id: 'GT-ADM-001',
        name: 'GEN-TOUCH Admin',
        phone: cleanPhone.length === 11 ? cleanPhone : '01310588979',
        role: 'admin',
        joinedDate: 'Verified Staff',
      };
      setCurrentUser(adminProfile);
      setActiveTab('profile');
      return;
    }

    if (cleanPass === 'Hunter#1212') {
      const modProfile: CustomerProfile = {
        id: 'GT-MOD-001',
        name: 'GEN-TOUCH Moderator',
        phone: cleanPhone.length === 11 ? cleanPhone : '01310588979',
        role: 'moderator',
        joinedDate: 'Verified Staff',
      };
      setCurrentUser(modProfile);
      setActiveTab('profile');
      return;
    }

    if (!isValidBdPhone(cleanPhone)) {
      setFormError('মোবাইল নম্বরটি অবশ্যই ১১ ডিজিটের হতে হবে এবং 01 দিয়ে শুরু হতে হবে।');
      return;
    }

    const accounts = getRegisteredAccounts();
    const account = accounts.find((a) => a.phone === cleanPhone);

    if (!account) {
      setFormError('এই নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে প্রথমে সাইন আপ করুন।');
      return;
    }

    if (account.password && account.password !== cleanPass) {
      setFormError('ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।');
      return;
    }

    const profile: CustomerProfile = {
      id: account.id,
      name: account.name,
      phone: account.phone,
      role: account.role || 'customer',
      joinedDate: account.joinedDate,
    };

    setCurrentUser(profile);
    setActiveTab('orders');
    setPhoneInput('');
    setPasswordInput('');
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setFormError('');
    setFormSuccess('');
    setAuthMode('login');
    if (onUserLoginSuccess) {
      onUserLoginSuccess('customer');
    }
  };

  // Copy ID
  const handleCopyId = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Filter customer orders
  const customerOrders = currentUser
    ? orders.filter(
        (order) =>
          order.customer.phone.replace(/[^0-9]/g, '') === currentUser.phone.replace(/[^0-9]/g, '')
      )
    : [];

  const getStatusBadge = (status: OrderStatus | string) => {
    switch (status) {
      case 'Pending Approval':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800">
            ⏳ অপেক্ষা করুন (অ্যাপ্রুভাল পেন্ডিং)
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800">
            ⏳ পেন্ডিং
          </span>
        );
      case 'Confirmed':
      case 'Processing':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/80 text-blue-400 border border-blue-800">
            ⚙️ অর্ডার প্রসেসিং হচ্ছে
          </span>
        );
      case 'Shipped':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/80 text-purple-400 border border-purple-800">
            🚚 কুরিয়ারে পাঠানো হয়েছে
          </span>
        );
      case 'Delivered':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            ✅ ডেলিভারি সম্পন্ন
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950/80 text-red-400 border border-red-800">
            ❌ বাতিল করা হয়েছে
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-gray-400">
            {status}
          </span>
        );
    }
  };

  const handleContactSupport = (orderId: string) => {
    const rawWa = whatsappNumber.replace(/[^0-9]/g, '');
    const cleanWa = rawWa.startsWith('880') ? rawWa : rawWa.startsWith('0') ? `88${rawWa}` : `880${rawWa}`;
    const text = encodeURIComponent(
      `Hello GEN-TOUCH BD,\nআমি ${currentUser?.name} (ID: ${currentUser?.id}).\nআমার অর্ডার ID: ${orderId} এর বর্তমান স্ট্যাটাস জানতে চাই।`
    );
    window.open(`https://wa.me/${cleanWa}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#161920] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#12141a]">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              currentUser?.role === 'admin' 
                ? 'bg-red-600 text-white' 
                : currentUser?.role === 'moderator'
                ? 'bg-blue-600 text-white'
                : 'bg-red-600/20 text-red-500 border border-red-600/30'
            }`}>
              {currentUser?.role === 'admin' || currentUser?.role === 'moderator' ? (
                <Shield className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {currentUser ? `স্বাগতম, ${currentUser.name}` : 'কাস্টমার ও মেম্বার পোর্টাল'}
              </h3>
              <p className="text-[11px] text-gray-400">
                {currentUser 
                  ? `ID: ${currentUser.id} • ${currentUser.role === 'admin' ? 'অ্যাডমিনিস্ট্রেটর' : currentUser.role === 'moderator' ? 'মডারেটর' : 'কাস্টমার অ্যাকাউন্ট'}` 
                  : 'অর্ডার ট্র্যাকিং ও মেম্বারশিপ সুবিধা পেতে প্রবেশ করুন'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Logged in */}
        {currentUser ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Nav Tabs */}
            <div className="flex items-center border-b border-gray-800 bg-[#101217] px-6">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'orders'
                    ? 'border-red-600 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" /> আমার অর্ডারসমূহ ({customerOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'profile'
                    ? 'border-red-600 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> প্রোফাইল তথ্য
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {/* If Admin / Moderator, Show exclusive access banner */}
              {(currentUser.role === 'admin' || currentUser.role === 'moderator') && (
                <div className="p-4 bg-gradient-to-r from-red-950/80 to-black border border-red-800/80 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">
                      {currentUser.role === 'admin' ? 'অ্যাডমিন প্রিভিলেজ সক্রিয়' : 'মডারেটর প্রিভিলেজ সক্রিয়'}
                    </span>
                    <p className="text-xs font-bold text-white mt-0.5">
                      অর্ডার অ্যাপ্রুভ, TrxID চেক ও কুপন ম্যানেজ করতে ড্যাশবোর্ড খুলুন
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdmin();
                    }}
                    className="py-2 px-3.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-1.5 shrink-0 transition"
                  >
                    <Shield className="w-3.5 h-3.5" /> Admin Panel
                  </button>
                </div>
              )}

              {/* TAB 1: ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  {customerOrders.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#12141a] border border-gray-800 flex items-center justify-center mx-auto text-gray-600">
                        <ShoppingBag className="w-7 h-7" />
                      </div>
                      <h4 className="text-sm font-bold text-white">কোনো অর্ডার পাওয়া যায়নি</h4>
                      <p className="text-xs text-gray-400 max-w-xs mx-auto">
                        <strong>{currentUser.phone}</strong> নম্বর দিয়ে এখনও কোনো অর্ডার করা হয়নি।
                      </p>
                      <button
                        onClick={onClose}
                        className="py-2 px-5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        শপিং শুরু করুন
                      </button>
                    </div>
                  ) : (
                    customerOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-[#12141a] border border-gray-800 hover:border-gray-700 rounded-2xl p-4 transition space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-gray-500 block">Order ID</span>
                            <span className="font-mono text-xs font-bold text-red-400">
                              {order.id}
                            </span>
                          </div>
                          <div>{getStatusBadge(order.status)}</div>
                        </div>

                        {/* Order Items */}
                        <div className="divide-y divide-gray-800/60 pt-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 py-2">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover bg-black/40 border border-gray-800 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xs font-semibold text-gray-200 truncate">
                                  {item.name}
                                </h5>
                                <div className="text-[11px] text-gray-400 flex items-center gap-2">
                                  <span>পরিমাণ: {item.quantity}</span>
                                  <span>•</span>
                                  <span>৳{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Financial summary & details */}
                        <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <span className="text-gray-400 block text-[10px]">মোট টাকা</span>
                            <span className="font-bold text-white text-sm">৳{order.total.toLocaleString()}</span>
                            {order.advancePaymentDetails?.transactionId && (
                              <span className="text-[10px] text-pink-400 font-mono block">
                                অগ্রিম TrxID: {order.advancePaymentDetails.transactionId}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleContactSupport(order.id)}
                            className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-800/60 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> হোয়াটসঅ্যাপ হেল্পলাইন
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-[#1c202a] to-[#12141a] border border-gray-700/60 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-red-500">
                        GEN-TOUCH OFFICIAL MEMBER
                      </span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                        currentUser.role === 'admin'
                          ? 'bg-red-950 text-red-400 border-red-800'
                          : currentUser.role === 'moderator'
                          ? 'bg-blue-950 text-blue-400 border-blue-800'
                          : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      }`}>
                        {currentUser.role === 'admin' 
                          ? '👑 Admin' 
                          : currentUser.role === 'moderator' 
                          ? '🛡️ Moderator' 
                          : '✓ Verified Customer'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-white">{currentUser.name}</h4>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-gray-500" /> {currentUser.phone}
                      </p>
                    </div>

                    <div className="p-3 bg-[#0e1014] border border-gray-800 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-500 block">আপনার ইউনিক কাস্টমার আইডি</span>
                        <span className="font-mono text-sm font-bold text-red-400 tracking-wider">
                          {currentUser.id}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyId}
                        className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
                        title="কপি করুন"
                      >
                        {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex justify-between text-[11px] text-gray-400 pt-1">
                      <span>যুক্ত হয়েছেন: {currentUser.joinedDate}</span>
                      <span>মোট অর্ডার: {customerOrders.length} টি</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 px-4 bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-800/60 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" /> সাইন আউট (লগআউট করুন)
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Form for Login / Signup */
          <div className="p-6 space-y-4">
            {/* Toggle between Login and Signup */}
            <div className="grid grid-cols-2 p-1 bg-[#101217] border border-gray-800 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setFormError('');
                  setFormSuccess('');
                }}
                className={`py-2 rounded-xl transition ${
                  authMode === 'login'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                লগইন (Sign In)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setFormError('');
                  setFormSuccess('');
                }}
                className={`py-2 rounded-xl transition ${
                  authMode === 'signup'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                নতুন একাউন্ট (Sign Up)
              </button>
            </div>

            <div className="text-center space-y-0.5">
              <h4 className="text-sm font-bold text-white">
                {authMode === 'login' ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'নতুন কাস্টমার অ্যাকাউন্ট খুলুন'}
              </h4>
              <p className="text-[11px] text-gray-400">
                {authMode === 'login'
                  ? 'মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে প্রবেশ করুন'
                  : 'নাম, ১১ ডিজিটের মোবাইল নম্বর এবং নিজস্ব পাসওয়ার্ড দিয়ে একাউন্ট তৈরি করুন'}
              </p>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {formSuccess}
              </div>
            )}

            {authMode === 'signup' ? (
              /* Sign Up Form */
              <form onSubmit={handleSignUp} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">আপনার পূর্ণ নাম (Full Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: Tanjim Islam"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">
                    মোবাইল নম্বর (১১ ডিজিট, 01 দিয়ে শুরু) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    placeholder="01XXXXXXXXX"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">পাসওয়ার্ড (Password) *</label>
                  <input
                    type="password"
                    required
                    placeholder="আপনার গোপন পাসওয়ার্ড দিন"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">
                    স্টাফ / অ্যাডমিন স্পেশাল কোড (প্রযোজ্য ক্ষেত্রে)
                  </label>
                  <input
                    type="password"
                    placeholder="সাধারণ কাস্টমারদের জন্য খালি রাখুন"
                    value={secretCodeInput}
                    onChange={(e) => setSecretCodeInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#101217] border border-gray-900 focus:border-gray-700 rounded-xl text-xs text-gray-400 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 mt-2"
                >
                  <Sparkles className="w-4 h-4" /> অ্যাকাউন্ট তৈরি সম্পন্ন করুন
                </button>
              </form>
            ) : (
              /* Login Form */
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">মোবাইল নম্বর (Phone Number) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">পাসওয়ার্ড (Password) *</label>
                  <input
                    type="password"
                    required
                    placeholder="আপনার অ্যাকাউন্টের পাসওয়ার্ড লিখুন"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 mt-2"
                >
                  <KeyRound className="w-4 h-4" /> লগইন করুন
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};