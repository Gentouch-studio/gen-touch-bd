import React, { useState } from 'react';
import { 
  X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, 
  CheckCircle2, AlertCircle, Copy, Check, ShieldCheck, MessageCircle,
  Clock, PhoneCall, RefreshCw
} from 'lucide-react';
import { CartItem, Order, OrderItem, PaymentMethod } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onToggleSelectItem: (productId: string) => void;
  onSelectAllItems: (selected: boolean) => void;
  onPlaceOrder: (order: Order) => void;
  gameCouponCode?: string;
  onClearGameCoupon?: () => void;
  bkashNumber?: string;
  whatsappNumber?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onToggleSelectItem,
  onSelectAllItems,
  onPlaceOrder,
  gameCouponCode = '',
  onClearGameCoupon,
  bkashNumber = '01310588979',
  whatsappNumber = '01310588979',
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');

  // Coupon
  const [couponInput, setCouponInput] = useState(gameCouponCode);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Checkout Form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [district, setDistrict] = useState<'Dhaka City' | 'Outside Dhaka'>('Dhaka City');
  const [fullAddress, setFullAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentOption, setPaymentOption] = useState<'delivery_charge_advance' | 'full_payment'>('delivery_charge_advance');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedBkash, setCopiedBkash] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  React.useEffect(() => {
    if (gameCouponCode && !appliedCoupon) {
      setCouponInput(gameCouponCode);
      applyCoupon(gameCouponCode);
    }
  }, [gameCouponCode]);

  // Pre-fill logged-in customer info if available
  React.useEffect(() => {
    try {
      const savedUser = localStorage.getItem('gentouch_current_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.name && !fullName) setFullName(u.name);
        if (u.phone && !phone) setPhone(u.phone);
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedItems = items.filter((item) => item.selectedForCheckout);
  const allSelected = items.length > 0 && items.every((i) => i.selectedForCheckout);

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Delivery charge: Dhaka City = 80, Outside Dhaka = 120
  const deliveryCharge = selectedItems.length > 0 ? (district === 'Dhaka City' ? 80 : 120) : 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, subtotal + deliveryCharge - discountAmount);

  // Advance delivery fee required via bKash
  const advanceRequired = paymentOption === 'full_payment' ? grandTotal : deliveryCharge;
  const dueOnDelivery = grandTotal - advanceRequired;

  const applyCoupon = (codeToApply?: string) => {
    const rawCode = (codeToApply || couponInput).trim();
    const code = rawCode.toLowerCase();
    setCouponError('');

    if (!code) return;

    // Permanent default coupon: ilovegentouch = ৳10 off
    if (code === 'ilovegentouch') {
      setAppliedCoupon({ code: 'ilovegentouch', discount: 10 });
      return;
    }

    // Check dynamic coupons created by admin in localStorage
    try {
      const savedCoupons = localStorage.getItem('gentouch_coupons');
      if (savedCoupons) {
        const couponList = JSON.parse(savedCoupons);
        const match = couponList.find(
          (c: any) => c.code.toLowerCase() === code && c.isActive
        );
        if (match) {
          setAppliedCoupon({ code: match.code, discount: match.discountAmount });
          return;
        }
      }
    } catch {
      // ignore
    }

    // Game reward coupons (e.g. GTGAME50-XXXX)
    const upper = rawCode.toUpperCase();
    if (upper.startsWith('GTGAME')) {
      const match = upper.match(/GTGAME(\d+)-/);
      if (match && match[1]) {
        const discountVal = parseInt(match[1], 10);
        setAppliedCoupon({ code: upper, discount: discountVal });
        return;
      }
    }

    setCouponError('কুপন কোডটি সঠিক নয়। ট্রাই করুন "ilovegentouch" (৳১০ ছাড়)');
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    if (onClearGameCoupon) onClearGameCoupon();
  };

  const handleProceedToCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setCouponError('অর্ডার করতে কার্ট থেকে অন্তত ১টি পণ্য টিক দিন।');
      return;
    }
    setStep('checkout');
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (selectedItems.length === 0) {
      setCheckoutError('আপনার কার্ট থেকে অন্তত ১টি পণ্য নির্বাচন করুন।');
      setStep('cart');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !fullAddress.trim()) {
      setCheckoutError('অনুগ্রহ করে আপনার নাম, ১১ ডিজিটের ফোন নম্বর এবং সম্পূর্ণ ঠিকানা দিন।');
      return;
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
      setCheckoutError('ফোন নম্বরটি অবশ্যই ১১ ডিজিটের হতে হবে এবং 01 দিয়ে শুরু হতে হবে।');
      return;
    }

    // Direct COD is disabled - Advance delivery charge bKash TrxID is strictly required
    if (!senderPhone.trim() || !trxId.trim()) {
      setCheckoutError(
        `অর্ডার নিশ্চিত করতে অগ্রিম ডেলিভারি চার্জ (৳${advanceRequired}) বিকাশ করে সেন্ডার নম্বর ও TrxID প্রদান করুন।`
      );
      return;
    }

    const cleanSender = senderPhone.trim().replace(/[^0-9]/g, '');
    if (cleanSender.length !== 11 || !cleanSender.startsWith('01')) {
      setCheckoutError('অনুগ্রহ করে সঠিক ১১ ডিজিটের বিকাশ সেন্ডার নম্বর দিন (01 দিয়ে শুরু)।');
      return;
    }

    if (trxId.trim().length < 5) {
      setCheckoutError('অনুগ্রহ করে সঠিক বিকাশ Transaction ID (TrxID) লিখুন।');
      return;
    }

    const orderItems: OrderItem[] = selectedItems.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image,
    }));

    const orderId = `GT-${Date.now().toString().slice(-6)}`;

    // Try to attach logged-in customer ID
    let currentCustId: string | undefined = undefined;
    try {
      const savedUser = localStorage.getItem('gentouch_current_user');
      if (savedUser) {
        currentCustId = JSON.parse(savedUser).id;
      }
    } catch {
      // ignore
    }

    const newOrder: Order = {
      id: orderId,
      customerId: currentCustId,
      items: orderItems,
      subtotal,
      deliveryCharge,
      discount: discountAmount,
      total: grandTotal,
      couponApplied: appliedCoupon?.code,
      customer: {
        fullName: fullName.trim(),
        phone: cleanPhone,
        altPhone: altPhone.trim() || undefined,
        district,
        fullAddress: fullAddress.trim(),
        notes: notes.trim() || undefined,
      },
      paymentMethod: 'bkash',
      advanceAmountRequired: advanceRequired,
      advancePaymentDetails: {
        method: 'bkash',
        senderNumber: cleanSender,
        transactionId: trxId.trim().toUpperCase(),
        verified: false,
      },
      paymentDetails: {
        senderNumber: cleanSender,
        transactionId: trxId.trim().toUpperCase(),
      },
      status: 'Pending Approval',
      isApprovedByAdmin: false,
      createdAt: new Date().toISOString(),
    };

    onPlaceOrder(newOrder);
    setPlacedOrder(newOrder);
    setStep('success');

    // Auto open WhatsApp with complete receipt
    sendWhatsAppReceipt(newOrder);
  };

  const copyBkashNumber = () => {
    navigator.clipboard.writeText(bkashNumber);
    setCopiedBkash(true);
    setTimeout(() => setCopiedBkash(false), 2000);
  };

  const sendWhatsAppReceipt = (orderToSend: Order) => {
    const rawWa = whatsappNumber.replace(/[^0-9]/g, '');
    const cleanWaNumber = rawWa.startsWith('880') ? rawWa : rawWa.startsWith('0') ? `88${rawWa}` : `880${rawWa}`;

    const itemsSummary = orderToSend.items
      .map((item, idx) => `${idx + 1}. ${item.name} (x${item.quantity}) - ৳${(item.price * item.quantity).toLocaleString()}`)
      .join('\n');

    const advancePaid = paymentOption === 'full_payment' ? orderToSend.total : orderToSend.deliveryCharge;
    const remainingDue = orderToSend.total - advancePaid;

    const message = `🛍️ *NEW ORDER - GEN-TOUCH BD*\n` +
      `-----------------------------------------\n` +
      `🆔 *Order ID:* ${orderToSend.id}\n` +
      `⏳ *Status:* অপেক্ষা করুন (অ্যাপ্রুভাল পেন্ডিং)\n` +
      `📅 *Date:* ${new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' })}\n\n` +
      `👤 *Customer Info:*\n` +
      `• Name: ${orderToSend.customer.fullName}\n` +
      `• Phone: ${orderToSend.customer.phone}\n` +
      (orderToSend.customer.altPhone ? `• Alt Phone: ${orderToSend.customer.altPhone}\n` : '') +
      `• District: ${orderToSend.customer.district} (অগ্রিম ডেলিভারি ফি: ৳${orderToSend.deliveryCharge})\n` +
      `• Address: ${orderToSend.customer.fullAddress}\n` +
      (orderToSend.customer.notes ? `• Note: ${orderToSend.customer.notes}\n` : '') +
      `\n📦 *Order Items:*\n${itemsSummary}\n\n` +
      `💰 *Billing Summary:*\n` +
      `• Subtotal: ৳${orderToSend.subtotal.toLocaleString()}\n` +
      `• Delivery Charge: ৳${orderToSend.deliveryCharge}\n` +
      (orderToSend.discount ? `• Discount: -৳${orderToSend.discount}\n` : '') +
      `• *Total Price:* ৳${orderToSend.total.toLocaleString()}\n\n` +
      `💳 *bKash Payment Verification:*\n` +
      `• Paid Amount (Advance): ৳${advancePaid.toLocaleString()}\n` +
      `• Sender Number: ${orderToSend.paymentDetails?.senderNumber}\n` +
      `• TrxID: ${orderToSend.paymentDetails?.transactionId}\n` +
      `• *Cash on Delivery Remaining:* ৳${remainingDue.toLocaleString()}\n` +
      `-----------------------------------------\n` +
      `_দয়া করে পেমেন্ট যাচাই করে অর্ডারটি কনফার্ম করুন। ধন্যবাদ!_`;

    const encodedMsg = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodedMsg}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#161920] border-l border-gray-800 text-white flex flex-col h-full shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#12141a]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-base tracking-wide">
              {step === 'cart' && `শপিং কার্ট (${items.length})`}
              {step === 'checkout' && 'চেকআউট ও পেমেন্ট'}
              {step === 'success' && 'অর্ডার গ্রহণ সম্পন্ন!'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg transition"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CART ITEMS & SELECTION */}
        {step === 'cart' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                <ShoppingBag className="w-16 h-16 text-gray-700 mb-3 stroke-[1.5]" />
                <h4 className="text-base font-bold text-white mb-1">আপনার কার্ট খালি রয়েছে</h4>
                <p className="text-xs max-w-xs mb-4 text-gray-400">
                  আমাদের ট্রেন্ডি ও প্রিমিয়াম গ্যাজেটগুলো দেখতে শপিং শুরু করুন।
                </p>
                <button
                  onClick={onClose}
                  className="py-2.5 px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  শপিংয়ে ফিরে যান
                </button>
              </div>
            ) : (
              <>
                {/* Select All Bar */}
                <div className="flex items-center justify-between px-6 py-2.5 bg-[#101217] border-b border-gray-800/80 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => onSelectAllItems(e.target.checked)}
                      className="w-4 h-4 rounded text-red-600 accent-red-600 cursor-pointer"
                    />
                    <span className="font-semibold text-gray-300">
                      সব সিলেক্ট করুন ({selectedItems.length}/{items.length})
                    </span>
                  </label>
                  <span className="text-[11px] text-gray-400">
                    শুধুমাত্র টিক দেওয়া পণ্যের অর্ডার হবে
                  </span>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition ${
                        item.selectedForCheckout
                          ? 'bg-[#12151d] border-red-900/50 shadow-sm'
                          : 'bg-[#101217]/50 border-gray-800/60 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.selectedForCheckout}
                        onChange={() => onToggleSelectItem(item.product.id)}
                        className="w-4 h-4 rounded text-red-600 accent-red-600 cursor-pointer shrink-0 ml-1"
                      />

                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover bg-[#0d0e12] shrink-0 border border-gray-800"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate mb-1">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-red-500">
                            ৳{item.product.price.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            মোট: ৳{(item.product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-[#0d0e12] border border-gray-800 rounded-lg overflow-hidden">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                              className="px-2 py-0.5 text-gray-400 hover:text-white transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 py-0.5 text-xs font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-gray-400 hover:text-white transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1 text-gray-500 hover:text-red-400 transition"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon & Summary Footer */}
                <div className="p-5 border-t border-gray-800 bg-[#12141a] space-y-3">
                  <div>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300">
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-emerald-400" />
                          <span>কুপন <strong>{appliedCoupon.code}</strong> (৳{appliedCoupon.discount} ছাড়)</span>
                        </div>
                        <button onClick={removeCoupon} className="text-gray-400 hover:text-white text-xs">
                          বাতিল করুন
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="কুপন কোড (যেমন: ilovegentouch)"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          className="flex-1 px-3 py-2 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white placeholder-gray-500 outline-none uppercase font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => applyCoupon()}
                          className="px-4 py-2 bg-[#1e222d] hover:bg-[#272c3b] text-white text-xs font-bold rounded-xl border border-gray-700 transition"
                        >
                          এপ্লাই
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-[11px] text-red-400 mt-1">{couponError}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>নির্বাচিত পণ্যের মূল্য:</span>
                      <span className="font-semibold text-white">৳{subtotal.toLocaleString()}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400 font-semibold">
                        <span>কুপন ছাড়:</span>
                        <span>-৳{discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-gray-800">
                      <span>সাবটোটাল (ডেলিভারি চার্জ ছাড়া):</span>
                      <span className="text-red-500">৳{Math.max(0, subtotal - discountAmount).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    disabled={selectedItems.length === 0}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
                      selectedItems.length > 0
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    অর্ডার করতে এগিয়ে যান ({selectedItems.length} টি সিলেক্টেড) <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 2: CHECKOUT FORM */}
        {step === 'checkout' && (
          <form onSubmit={handleSubmitOrder} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mb-1 transition"
              >
                ← কার্টে ফিরে যান
              </button>

              {checkoutError && (
                <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  {checkoutError}
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  ১. ডেলিভারি তথ্য (Delivery Details)
                </h4>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">পূর্ণ নাম (Full Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="আপনার নাম লিখুন"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">ফোন নম্বর (১১ ডিজিট, 01 শুরু) *</label>
                    <input
                      type="tel"
                      required
                      maxLength={11}
                      placeholder="01XXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">বিকল্প ফোন (Alternative)</label>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX (Optional)"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">ডেলিভারি এলাকা (Delivery Area) *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value as 'Dhaka City' | 'Outside Dhaka')}
                    className="w-full px-3 py-2 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none"
                  >
                    <option value="Dhaka City">ঢাকা সিটির ভেতরে — ৳৮০ অগ্রিম ডেলিভারি চার্জ</option>
                    <option value="Outside Dhaka">ঢাকা সিটির বাইরে — ৳১২০ অগ্রিম ডেলিভারি চার্জ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">সম্পূর্ণ ডেলিভারি ঠিকানা (Full Address) *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="বাড়ি নং, রোড নং, এলাকা/থানা, জেলা..."
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">বিশেষ নোট / নির্দেশনা (Optional)</label>
                  <input
                    type="text"
                    placeholder="ডেলিভারিম্যান এর জন্য কোনো নির্দেশনা থাকলে লিখুন"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* PAYMENT SECTION - DIRECT COD DISABLED, ADVANCE DELIVERY CHARGE BKASH MANDATORY */}
              <div className="space-y-3 pt-2 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    ২. পেমেন্ট ভেরিফিকেশন (Payment)
                  </h4>
                  <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full font-bold">
                    অগ্রিম ডেলিভারি চার্জ বাধ্যতামূলক
                  </span>
                </div>

                <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-[11px] text-amber-200/90 leading-relaxed">
                  ⚠️ <strong>জরুরি নিয়ম:</strong> ফেইক অর্ডার রোধে ডাইরেক্ট ক্যাশ অন ডেলিভারি বন্ধ রাখা হয়েছে। অর্ডার নিশ্চিত করতে ডেলিভারি চার্জ (<strong>৳{deliveryCharge}</strong>) বিকাশ করে TrxID ও নম্বর নিচে দিতে হবে। অ্যাডমিন ট্রানজেকশন যাচাই করে অর্ডার অ্যাপ্রুভ করবেন। বাকি <strong>৳{grandTotal - advanceRequired}</strong> টাকা পণ্য হাতে পেয়ে ক্যাশ অন ডেলিভারিতে পরিশোধ করবেন।
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentOption('delivery_charge_advance')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      paymentOption === 'delivery_charge_advance'
                        ? 'bg-pink-950/40 border-pink-500 text-white'
                        : 'bg-[#101217] border-gray-800 text-gray-400'
                    }`}
                  >
                    <span className="text-pink-400">শুধু ডেলিভারি চার্জ (৳{deliveryCharge})</span>
                    <span className="text-[10px] font-normal text-gray-400">বাকি টাকা হাতে পেয়ে দিবেন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentOption('full_payment')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      paymentOption === 'full_payment'
                        ? 'bg-pink-950/40 border-pink-500 text-white'
                        : 'bg-[#101217] border-gray-800 text-gray-400'
                    }`}
                  >
                    <span className="text-pink-400">সম্পূর্ণ টাকা বিকাশ (৳{grandTotal})</span>
                    <span className="text-[10px] font-normal text-gray-400">ফুল পেইড অর্ডার</span>
                  </button>
                </div>

                {/* bKash instructions & Inputs */}
                <div className="p-3.5 bg-[#101217] border border-pink-900/40 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center justify-between bg-[#161920] p-2.5 rounded-xl border border-gray-800">
                    <div>
                      <span className="text-[10px] text-gray-400 block">bKash Personal (Send Money):</span>
                      <span className="font-mono text-pink-400 font-bold text-sm tracking-wider">{bkashNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={copyBkashNumber}
                      className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-1 text-[11px] transition"
                    >
                      {copiedBkash ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">কপি হয়েছে</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>কপি করুন</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-[11px] text-gray-300 space-y-0.5">
                    <p>👉 বিকাশ অ্যাপ থেকে উপরের নম্বরে <strong className="text-pink-400 font-bold">৳{advanceRequired}</strong> টাকা সেন্ড মানি করুন।</p>
                    <p>👉 সেন্ড মানি সফল হলে নিচের বক্সে যে নম্বর থেকে পাঠিয়েছেন এবং TrxID দিন:</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">যে নম্বর থেকে বিকাশ করেছেন *</label>
                      <input
                        type="tel"
                        required
                        maxLength={11}
                        placeholder="01XXXXXXXXX"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-[#161920] border border-gray-800 focus:border-pink-500 rounded-xl text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">bKash TrxID (ট্রানজেকশন আইডি) *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: BL9X91K2"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        className="w-full px-3 py-2 bg-[#161920] border border-gray-800 focus:border-pink-500 rounded-xl text-xs text-white outline-none uppercase font-mono font-bold tracking-wider"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total breakdown and Order Button */}
            <div className="p-5 border-t border-gray-800 bg-[#12141a] space-y-2.5">
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>নির্বাচিত পণ্যের মূল্য ({selectedItems.length}টি):</span>
                  <span className="text-white">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ ({district === 'Dhaka City' ? 'ঢাকা সিটি' : 'ঢাকার বাইরে'}):</span>
                  <span className="text-white">৳{deliveryCharge}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>কুপন ছাড়:</span>
                    <span>-৳{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-semibold text-pink-400 pt-1 border-t border-gray-800">
                  <span>বিকাশে অগ্রিম প্রদেয়:</span>
                  <span>৳{advanceRequired.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-1">
                  <span>সর্বমোট মূল্য:</span>
                  <span className="text-red-500">৳{grandTotal.toLocaleString()}</span>
                </div>
                {dueOnDelivery > 0 && (
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>ডেলিভারির সময় ক্যাশ অন ডেলিভারি বাকি:</span>
                    <span className="text-gray-300 font-bold">৳{dueOnDelivery.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> অর্ডার নিশ্চিত করুন (TrxID সহ)
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: ORDER SUCCESS WITH WAITING CARD & HELPLINE */}
        {step === 'success' && placedOrder && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in zoom-in-95 overflow-y-auto custom-scrollbar">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 animate-pulse">
              <Clock className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 bg-amber-950/80 border border-amber-800 text-amber-400 text-xs font-bold rounded-full inline-block mb-1">
                ⏳ পেন্ডিং অ্যাপ্রুভাল
              </span>
              <h4 className="text-lg font-black text-white">
                অর্ডারটি অ্যাপ্রুভ হওয়ার অপেক্ষা করুন
              </h4>
              <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed">
                আপনার অগ্রিম বিকাশ পেমেন্ট ও TrxID যাচাই করার পর অ্যাডমিন কর্তৃক অর্ডারটি অ্যাপ্রুভ করা হবে।
              </p>
            </div>

            {/* Helpline Notice Card */}
            <div className="w-full p-4 bg-gradient-to-r from-emerald-950/40 via-[#101217] to-[#101217] border border-emerald-800/60 rounded-2xl text-left space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <PhoneCall className="w-4 h-4" />
                <span>যেকোনো প্রয়োজনে আমাদের হেল্পলাইন:</span>
              </div>
              <p className="text-sm font-black font-mono text-white tracking-wider">
                {whatsappNumber} <span className="text-xs font-normal text-emerald-400">(WhatsApp)</span>
              </p>
              <p className="text-[11px] text-gray-400">
                অর্ডার সম্পর্কে জানতে বা দ্রুত কনফার্মেশনের জন্য সরাসরি হোয়াটসঅ্যাপে মেসেজ দিন।
              </p>
            </div>

            {/* Order Details Summary */}
            <div className="w-full bg-[#101217] border border-gray-800 rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">অর্ডার আইডি:</span>
                <span className="font-mono text-red-400 font-bold">{placedOrder.id}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">কাস্টমার নাম:</span>
                <span className="font-bold text-white">{placedOrder.customer.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">মোবাইল নম্বর:</span>
                <span className="font-mono text-white">{placedOrder.customer.phone}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">বিকাশ TrxID:</span>
                <span className="font-mono font-bold text-pink-400">{placedOrder.paymentDetails?.transactionId}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">সর্বমোট মূল্য:</span>
                <span className="font-bold text-white">৳{placedOrder.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ক্যাশ অন ডেলিভারি বাকি:</span>
                <span className="font-bold text-emerald-400">
                  ৳{(placedOrder.total - (paymentOption === 'full_payment' ? placedOrder.total : placedOrder.deliveryCharge)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2 pt-2">
              <button
                type="button"
                onClick={() => sendWhatsAppReceipt(placedOrder)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4" /> হোয়াটসঅ্যাপে রসিদ পাঠান ({whatsappNumber})
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('cart');
                  onClose();
                }}
                className="w-full py-2.5 px-6 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-800/60 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> আরও অর্ডার করুন (Continue Shopping)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};