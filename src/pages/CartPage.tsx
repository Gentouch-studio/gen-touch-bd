import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  ShoppingBag, 
  CheckCircle, 
  ShieldCheck, 
  Truck,
  Copy,
  MessageSquare,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/contexts/AuthContext';
import { INITIAL_COUPONS } from '@/data/initialData';
import { Order } from '@/types';
import toast from 'react-hot-toast';

export const CartPage: React.FC = () => {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getDiscountAmount = useCartStore((state) => state.getDiscountAmount);

  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  // Checkout Form State
  const [customerName, setCustomerName] = useState(userProfile?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  
  // Delivery Area Selection: Inside Dhaka (80 TK) vs Outside Dhaka (120 TK)
  const [deliveryArea, setDeliveryArea] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const deliveryCharge = deliveryArea === 'inside_dhaka' ? 80 : 120;

  // Payment Selection: Advance Delivery Charge Only vs Full Payment Advance
  const [bKashPaymentType, setBKashPaymentType] = useState<'delivery_only' | 'full_payment'>('delivery_only');
  const [senderBkashNumber, setSenderBkashNumber] = useState('');
  const [bkashTrxId, setBkashTrxId] = useState('');

  // Coupon State
  const [couponInput, setCouponInput] = useState('');

  // Order Success Screen State
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryCharge);

  // Amount customer must send right now via bKash
  const advancePayableNow = bKashPaymentType === 'delivery_only' ? deliveryCharge : grandTotal;
  const remainingCashOnDelivery = bKashPaymentType === 'delivery_only' ? (grandTotal - deliveryCharge) : 0;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const coupon = INITIAL_COUPONS.find(
      (c) => c.code.toUpperCase() === couponInput.trim().toUpperCase() && c.isActive
    );

    if (!coupon) {
      toast.error('Invalid coupon code');
      return;
    }

    if (subtotal < coupon.minOrderAmount) {
      toast.error(`Minimum order amount for this coupon is ৳${coupon.minOrderAmount}`);
      return;
    }

    applyCoupon(coupon);
    toast.success(`Coupon ${coupon.code} applied!`);
    setCouponInput('');
  };

  const copyBkashNumber = () => {
    navigator.clipboard.writeText('01748669897');
    toast.success('bKash Number 01748669897 copied!');
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !streetAddress.trim()) {
      toast.error('Please fill in your name, phone number, and full address');
      return;
    }

    if (!senderBkashNumber.trim() || !bkashTrxId.trim()) {
      toast.error('Please provide your sender bKash number and Transaction ID (TrxID)');
      return;
    }

    const orderNumber = `GT-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: currentUser?.uid || 'guest-shopper',
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim() || 'guest@gentouch.com',
      customerPhone: customerPhone.trim(),
      shippingAddress: {
        id: `addr-${Date.now()}`,
        fullName: customerName.trim(),
        phone: customerPhone.trim(),
        streetAddress: streetAddress.trim(),
        city: deliveryArea === 'inside_dhaka' ? 'Dhaka' : (city.trim() || 'Outside Dhaka'),
        stateDivision: deliveryArea === 'inside_dhaka' ? 'Dhaka' : 'Outside Dhaka',
        postalCode: '0000',
        isDefault: true,
      },
      items: [...items],
      subtotal,
      discountAmount,
      deliveryCharge,
      totalAmount: grandTotal,
      appliedCoupon: appliedCoupon?.code,
      paymentMethod: bKashPaymentType === 'delivery_only' 
        ? 'bKash (Delivery Charge Advance) + COD' 
        : 'bKash (Full Paid Advance)',
      paymentStatus: 'Pending Verification',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in localStorage for Admin Panel to read
    const existingOrders = JSON.parse(localStorage.getItem('gen_touch_orders') || '[]');
    localStorage.setItem('gen_touch_orders', JSON.stringify([newOrder, ...existingOrders]));

    // Store detailed payment meta for admin verification
    localStorage.setItem(`bkash_meta_${orderNumber}`, JSON.stringify({
      senderBkash: senderBkashNumber.trim(),
      trxId: bkashTrxId.trim().toUpperCase(),
      advancePaid: advancePayableNow,
      dueOnDelivery: remainingCashOnDelivery,
    }));

    clearCart();
    setPlacedOrder(newOrder);
    toast.success('Order placed successfully! Awaiting verification.');
  };

  // ----------------------------------------------------
  // SCREEN: ORDER PLACED & AWAITING APPROVAL SCREEN
  // ----------------------------------------------------
  if (placedOrder) {
    return (
      <div className="min-h-[85vh] bg-[#0a0c0f] text-neutral-100 flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full bg-[#13161c] border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 text-center shadow-2xl">
          
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-500">
            <Clock className="w-8 h-8 animate-spin" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/60">
              Awaiting Admin Approval
            </span>
            <h2 className="text-2xl font-black text-white">Order Received!</h2>
            <p className="text-xs text-neutral-400">
              Order Number: <span className="text-red-500 font-bold font-mono text-sm">{placedOrder.orderNumber}</span>
            </p>
          </div>

          {/* Verification Notice in Bengali */}
          <div className="bg-[#181b22] border border-neutral-700/70 rounded-xl p-4 text-xs text-neutral-300 text-left space-y-2">
            <p className="font-semibold text-white">
              আপনার বিকাশ ট্রানজ্যাকশন যাচাই করা হচ্ছে, অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।
            </p>
            <p className="text-neutral-400 text-[11px]">
              আপনার প্রদত্ত বিকাশ TrxID (<strong className="text-red-400">{bkashTrxId.toUpperCase()}</strong>) আমাদের অ্যাকাউন্ট টিম ভেরিফাই করার পর আপনার অর্ডারটি কনফার্ম ও শিপমেন্টের জন্য প্রস্তুত করা হবে।
            </p>
          </div>

          {/* Payment Summary */}
          <div className="grid grid-cols-2 gap-3 text-xs text-left bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
            <div>
              <span className="text-neutral-500 text-[10px] uppercase">Advance bKash Paid:</span>
              <div className="text-base font-black text-red-500">৳{advancePayableNow.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] uppercase">Due on Delivery:</span>
              <div className="text-base font-black text-white">৳{remainingCashOnDelivery.toLocaleString()}</div>
            </div>
          </div>

          {/* WhatsApp Support Button */}
          <div className="pt-2 border-t border-neutral-800 space-y-3">
            <p className="text-xs text-neutral-400">
              দ্রুত অর্ডার কনফার্ম করতে বা যেকোনো প্রয়োজনে আমাদের সাথে সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন:
            </p>
            
            <a
              href={`https://wa.me/8801310588979?text=Hello%20Gen-Touch,%20I%20have%20placed%20Order%20${placedOrder.orderNumber}.%20bKash%20TrxID:%20${bkashTrxId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-black font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <MessageSquare className="w-4 h-4 fill-black" />
              <span>Contact WhatsApp Business (01310588979)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <Link
              to="/"
              className="inline-block text-xs font-bold text-neutral-400 hover:text-white pt-2"
            >
              Back to Home
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // EMPTY CART SCREEN
  // ----------------------------------------------------
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#0a0c0f] text-neutral-100 flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">Your Shopping Cart is Empty</h2>
          <p className="text-xs text-neutral-400">
            Explore our high-performance gear, gadgets, and automotive collections.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <span>Start Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN CART & CHECKOUT PAGE
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0a0c0f] text-neutral-100 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <Link to="/products" className="text-neutral-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-white">Checkout & Order Review</h1>
          </div>
          <span className="text-xs text-neutral-400">({items.length} Items)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Shipping & bKash Payment Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Customer Details */}
            <div className="bg-[#13161c] border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-black">
                  1
                </span>
                <span>Delivery Address (Customer Details)</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-[#181b22] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 font-medium mb-1">Mobile Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="017XX-XXXXXX"
                      className="w-full bg-[#181b22] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-medium mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full bg-[#181b22] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                {/* Delivery Area Selection */}
                <div>
                  <label className="block text-neutral-400 font-medium mb-2">Select Delivery Location *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryArea('inside_dhaka')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        deliveryArea === 'inside_dhaka'
                          ? 'bg-red-950/40 border-red-600 text-white shadow-md'
                          : 'bg-[#181b22] border-neutral-700/60 text-neutral-400 hover:border-neutral-500'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>Inside Dhaka</span>
                        <span className="text-red-500 font-black">৳80</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">Regular 24-48 hrs</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryArea('outside_dhaka')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        deliveryArea === 'outside_dhaka'
                          ? 'bg-red-950/40 border-red-600 text-white shadow-md'
                          : 'bg-[#181b22] border-neutral-700/60 text-neutral-400 hover:border-neutral-500'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>Outside Dhaka</span>
                        <span className="text-red-500 font-black">৳120</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">Nationwide courier 48-72 hrs</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Detailed Street Address / Area *</label>
                  <textarea
                    rows={2}
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="House/Road no, Area name, Thana, District"
                    className="w-full bg-[#181b22] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-red-600 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: bKash Advance Payment Instructions */}
            <div className="bg-[#13161c] border border-red-900/60 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-black">
                  2
                </span>
                <span>bKash Payment (Advance Verification)</span>
              </h3>

              {/* Payment Type Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setBKashPaymentType('delivery_only')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    bKashPaymentType === 'delivery_only'
                      ? 'bg-red-950/50 border-red-600 text-white'
                      : 'bg-[#181b22] border-neutral-700 text-neutral-400'
                  }`}
                >
                  <div className="font-bold text-xs">ডেলিভারি চার্জ অগ্রিম (৳{deliveryCharge})</div>
                  <span className="text-[10px] text-neutral-400">বাকি টাকা ডেলিভারির সময় ক্যাশ অন ডেলিভারি</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBKashPaymentType('full_payment')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    bKashPaymentType === 'full_payment'
                      ? 'bg-red-950/50 border-red-600 text-white'
                      : 'bg-[#181b22] border-neutral-700 text-neutral-400'
                  }`}
                >
                  <div className="font-bold text-xs">সম্পূর্ণ টাকা একবারে পরিশোধ (৳{grandTotal.toLocaleString()})</div>
                  <span className="text-[10px] text-neutral-400">ডেলিভারির সময় কোনো টাকা দেওয়া লাগবে না</span>
                </button>
              </div>

              {/* bKash Instructions Card */}
              <div className="bg-[#181b22] border border-neutral-700 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-neutral-700/60 pb-3">
                  <div>
                    <span className="text-neutral-400 text-[11px] block">আমাদের বিকাশ পার্সোনাল নম্বর:</span>
                    <span className="text-base font-black text-white font-mono tracking-wider">
                      01748669897
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={copyBkashNumber}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center gap-1 font-bold text-xs transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-red-500" />
                    <span>Copy bKash</span>
                  </button>
                </div>

                <div className="space-y-1 text-neutral-300 text-[11px] leading-relaxed">
                  <p>১. আপনার বিকাশ অ্যাপ থেকে <strong>Send Money</strong> করুন ওপরের নম্বরে (<strong>01748669897</strong>)।</p>
                  <p>
                    ২. পাঠানোর পরিমাণ: <strong className="text-red-500 font-bold text-xs">৳{advancePayableNow.toLocaleString()}</strong> 
                    {bKashPaymentType === 'delivery_only' ? ' (ডেলিভারি চার্জ)' : ' (সম্পূর্ণ পেমেন্ট)'}
                  </p>
                  <p>৩. টাকা পাঠানোর পর এসএমএস বা অ্যাপ থেকে পাওয়া <strong>TrxID</strong> এবং আপনার বিকাশ নম্বরটি নিচে লিখুন।</p>
                </div>

                {/* Input Fields for Sender bKash and TrxID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-neutral-300 font-medium mb-1 text-[11px]">
                      আপনার বিকাশ নম্বর (যেখান থেকে পাঠিয়েছেন) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={senderBkashNumber}
                      onChange={(e) => setSenderBkashNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-[#101217] border border-neutral-600 rounded-lg px-3 py-2 text-white font-mono text-xs outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-medium mb-1 text-[11px]">
                      বিকাশ ট্রানজ্যাকশন আইডি (TrxID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={bkashTrxId}
                      onChange={(e) => setBkashTrxId(e.target.value)}
                      placeholder="e.g. BL94A8K12"
                      className="w-full bg-[#101217] border border-neutral-600 rounded-lg px-3 py-2 text-white font-mono text-xs uppercase outline-none focus:border-red-600"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Order Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black rounded-xl text-sm shadow-xl shadow-red-950/40 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Confirm Order (অর্ডার কনফার্ম করুন)</span>
              </button>

              <div className="text-center text-[11px] text-neutral-400">
                অর্ডারের পর যাচাইয়ের জন্য কিছুক্ষণ অপেক্ষা করতে হবে। যেকোনো প্রয়োজনে WhatsApp: <strong className="text-neutral-200">01310588979</strong>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Cart Items */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Cart Items List */}
            <div className="bg-[#13161c] border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="font-bold text-sm text-white border-b border-neutral-800 pb-3">
                Items in Order ({items.length})
              </h3>

              <div className="divide-y divide-neutral-800/80 max-h-80 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.productId} className="py-3 flex gap-3 items-center justify-between">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-neutral-900 border border-neutral-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-white truncate">{item.name}</h4>
                      <div className="text-[11px] text-neutral-400">
                        ৳{item.price.toLocaleString()} × {item.quantity}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 bg-neutral-800 text-neutral-300 hover:text-white rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 bg-neutral-800 text-neutral-300 hover:text-white rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-1 text-neutral-500 hover:text-rose-500 ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon Section */}
            <div className="bg-[#13161c] border border-neutral-800 rounded-2xl p-4 shadow-xl">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-red-950/40 border border-red-800/60 p-2.5 rounded-xl text-xs">
                  <div>
                    <span className="font-bold text-red-400">{appliedCoupon.code}</span> applied ({appliedCoupon.discountValue}% OFF)
                  </div>
                  <button onClick={removeCoupon} className="text-neutral-400 hover:text-white font-bold text-xs">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter Coupon (e.g. GENTOUCH10)"
                    className="flex-1 bg-[#181b22] border border-neutral-700 rounded-xl px-3 py-2 text-xs uppercase outline-none focus:border-red-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="bg-[#13161c] border border-neutral-800 rounded-2xl p-5 space-y-3 text-xs shadow-xl">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span className="font-semibold text-white">৳{subtotal.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Discount</span>
                  <span>-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-400">
                <span>Delivery Charge ({deliveryArea === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                <span className="font-semibold text-white">৳{deliveryCharge}</span>
              </div>

              <div className="border-t border-neutral-800 pt-3 flex justify-between items-center">
                <span className="font-bold text-sm text-white">Total Order Value</span>
                <span className="text-lg font-black text-white">৳{grandTotal.toLocaleString()}</span>
              </div>

              {/* Breakdown for bKash vs COD */}
              <div className="bg-[#181b22] rounded-xl p-3 space-y-1.5 border border-neutral-700/60 mt-2">
                <div className="flex justify-between text-red-400 font-bold">
                  <span>Pay Now via bKash:</span>
                  <span>৳{advancePayableNow.toLocaleString()}</span>
                </div>
                {remainingCashOnDelivery > 0 && (
                  <div className="flex justify-between text-neutral-400">
                    <span>Due on Delivery (Cash):</span>
                    <span>৳{remainingCashOnDelivery.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};