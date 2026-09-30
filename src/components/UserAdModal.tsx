import React, { useState } from 'react';
import { X, Upload, Video, Image as ImageIcon, CheckCircle, AlertCircle, Copy, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { UserAd, Product, ProductCategory } from '../types';

interface UserAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitAd: (ad: UserAd) => void;
  onAddProduct?: (product: Product) => void;
  isAdmin?: boolean;
  bkashNumber?: string;
}

export const UserAdModal: React.FC<UserAdModalProps> = ({
  isOpen,
  onClose,
  onSubmitAd,
  onAddProduct,
  isAdmin = false,
  bkashNumber = '01310588979',
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Electronics & Gadgets');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [sellerName, setSellerName] = useState(isAdmin ? 'GEN-TOUCH Official' : '');
  const [sellerPhone, setSellerPhone] = useState(isAdmin ? '01310588979' : '');
  const [sellerLocation, setSellerLocation] = useState(isAdmin ? 'Dhaka, Bangladesh' : '');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [features, setFeatures] = useState('');
  const [badge, setBadge] = useState('Hot');
  const [feeAmount, setFeeAmount] = useState<10 | 20>(10);
  const [feeSenderNumber, setFeeSenderNumber] = useState('');
  const [feeTrxId, setFeeTrxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('ছবির সাইজ ৫ মেগাবাইটের (5MB) কম হতে হবে');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setErrorMsg('ভিডিও সাইজ ২০ মেগাবাইটের কম (ছোট ক্লিপ) হতে হবে');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyBkash = () => {
    navigator.clipboard.writeText(bkashNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !price) {
      setErrorMsg('দয়া করে প্রোডাক্টের নাম ও দাম পূরণ করুন।');
      return;
    }

    if (!imageUrl) {
      setErrorMsg('দয়া করে প্রোডাক্টের একটি স্পষ্ট ছবি যুক্ত করুন।');
      return;
    }

    // ১. এডমিন / মডারেটর পোস্ট করছেন -> সরাসরি All Products এ যুক্ত হবে (টাকা লাগবে না)
    if (isAdmin) {
      const parsedPrice = parseFloat(price) || 0;
      const parsedOriginal = parseFloat(originalPrice) || Math.round(parsedPrice * 1.25);
      
      const featureList = features
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const newProduct: Product = {
        id: `gt-custom-${Date.now()}`,
        name: title.trim(),
        category,
        price: parsedPrice,
        originalPrice: parsedOriginal,
        rating: 5.0,
        ratingCount: 1,
        inStock: true,
        stockCount: 25,
        badge: badge || 'New Arrival',
        image: imageUrl,
        videoUrl: videoUrl || undefined,
        description: description.trim() || 'GEN-TOUCH Official authentic product.',
        features: featureList.length > 0 ? featureList : ['100% Original Authentic Product', 'Official Warranty Support', 'Express Fast Delivery'],
        reviews: [],
      };

      if (onAddProduct) {
        onAddProduct(newProduct);
      }
      setIsSubmitted(true);
      return;
    }

    // ২. সাধারণ মেম্বার পোস্ট করছেন -> বিকাশ ফি ও ভেরিফিকেশন লাগবে
    if (!sellerName.trim() || !sellerPhone.trim() || !sellerLocation.trim()) {
      setErrorMsg('দয়া করে বিক্রেতার নাম, মোবাইল নম্বর এবং লোকেশন পূরণ করুন।');
      return;
    }

    if (!feeSenderNumber.trim() || !feeTrxId.trim()) {
      setErrorMsg(`লিস্টিং ফি হিসেবে ৳${feeAmount} বিকাশে সেন্ড মানি করে মোবাইল নম্বর ও TrxID প্রদান করুন।`);
      return;
    }

    const newAd: UserAd = {
      id: `AD-${Date.now()}`,
      title: title.trim(),
      category,
      price: parseFloat(price) || 0,
      sellerName: sellerName.trim(),
      sellerPhone: sellerPhone.trim(),
      sellerLocation: sellerLocation.trim(),
      description: description.trim(),
      imageUrl,
      videoUrl: videoUrl || undefined,
      feeAmount,
      feePaymentMethod: 'bkash',
      feeSenderNumber: feeSenderNumber.trim(),
      feeTrxId: feeTrxId.trim().toUpperCase(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    onSubmitAd(newAd);
    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setTitle('');
    setPrice('');
    setOriginalPrice('');
    setDescription('');
    setImageUrl('');
    setVideoUrl('');
    setFeatures('');
    setFeeSenderNumber('');
    setFeeTrxId('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[#161920] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#12141a]">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-lg ${
              isAdmin 
                ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400' 
                : 'bg-red-600/20 border border-red-600/40 text-red-500'
            }`}>
              {isAdmin ? <ShieldCheck className="w-5 h-5" /> : '+'}
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide flex items-center gap-2">
                {isAdmin ? 'অফিসিয়াল প্রোডাক্ট আপলোড (All Products)' : 'বিজ্ঞাপন পোস্ট করুন (Member Ads)'}
                {isAdmin && (
                  <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full font-bold">
                    Admin / Moderator (Free)
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-400">
                {isAdmin 
                  ? 'আপনার প্রোডাক্ট সরাসরি মূল ওয়েবসাইটে (All Products) সবার জন্য লাইভ হবে' 
                  : 'কমিউনিটি মেম্বারদের জন্য বাই/সেল ক্লাসিফায়েড বিজ্ঞাপন'}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          {isSubmitted ? (
            <div className="py-8 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-1">
                  {isAdmin ? 'প্রোডাক্ট সফলভাবে যুক্ত হয়েছে!' : 'বিজ্ঞাপন জমা হয়েছে!'}
                </h4>
                <p className="text-sm text-gray-400 max-w-md">
                  {isAdmin
                    ? 'আপনার নতুন প্রোডাক্টটি সরাসরি GEN-TOUCH এর মূল শপে (All Products) লাইভ হয়ে গেছে এবং ডেটাবেসে সেভ হয়েছে।'
                    : `ধন্যবাদ! আপনার বিজ্ঞাপন এবং ৳${feeAmount} বিকাশ ভেরিফিকেশন (TrxID: ${feeTrxId}) আমাদের কাছে পৌঁছেছে।`}
                </p>
              </div>

              {!isAdmin && (
                <div className="p-4 bg-[#101318] border border-gray-800 rounded-2xl text-xs text-gray-300 max-w-md leading-relaxed">
                  📢 এডমিন ভেরিফাই করার পর আপনার বিজ্ঞাপনটি Community Classifieds সেকশনে লাইভ হবে।
                </div>
              )}

              <button
                onClick={handleResetAndClose}
                className="w-full max-w-xs py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition"
              >
                ঠিক আছে
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  {errorMsg}
                </div>
              )}

              {/* Admin Special Notification */}
              {isAdmin && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-700/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>আপনি এডমিন হিসেবে লগইন আছেন। কোনো ফি ছাড়াই এই প্রোডাক্টটি সরাসরি <strong>All Products</strong>-এ যাবে।</span>
                </div>
              )}

              {/* Product Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    প্রোডাক্টের নাম *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: Wireless RGB Mechanical Gaming Keyboard"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    ক্যাটাগরি *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3.5 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-sm text-white outline-none transition"
                  >
                    <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                    <option value="Automotive Tech">Automotive Tech</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Beauty & Health">Beauty & Health</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    বিক্রয় মূল্য (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="যেমন: 3500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition"
                  />
                </div>

                {isAdmin && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        পূর্বের মূল্য / ডিসকাউন্ট মূল্য (৳)
                      </label>
                      <input
                        type="number"
                        placeholder="যেমন: 4200"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        ব্যাজ (Badge)
                      </label>
                      <select
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-sm text-white outline-none transition"
                      >
                        <option value="Hot">Hot</option>
                        <option value="Top Rated">Top Rated</option>
                        <option value="Official">Official</option>
                        <option value="Best Seller">Best Seller</option>
                        <option value="Limited Edition">Limited Edition</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Contact Info (Only for Member Ads) */}
              {!isAdmin && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      আপনার নাম *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="পুরো নাম"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      মোবাইল নম্বর *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={sellerPhone}
                      onChange={(e) => setSellerPhone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      লোকেশন / এলাকা *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: মিরপুর, ঢাকা"
                      value={sellerLocation}
                      onChange={(e) => setSellerLocation(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  বিস্তারিত বিবরণ
                </label>
                <textarea
                  rows={3}
                  placeholder="প্রোডাক্টের কন্ডিশন, স্পেসিফিকেশন ও বিস্তারিত বর্ণনা লিখুন..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition custom-scrollbar"
                />
              </div>

              {/* Features (Only for Admin) */}
              {isAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    মূল বৈশিষ্ট্যসমূহ (প্রতি লাইনে একটি)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="100% Original Brand New&#10;1 Year Warranty&#10;Fast Home Delivery"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition"
                  />
                </div>
              )}

              {/* Media Upload */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-red-500" />
                      ছবির লিংক বা ফাইল আপলোড *
                    </label>
                    <input
                      type="text"
                      placeholder="ছবির সরাসরি লিংক (URL) পেস্ট করুন"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white placeholder-gray-500 outline-none mb-2"
                    />
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-[#12141a] hover:bg-[#1a1e27] border border-dashed border-gray-700 hover:border-gray-500 rounded-xl cursor-pointer text-xs text-gray-300 transition">
                      <Upload className="w-3.5 h-3.5 text-gray-400" />
                      <span>ডিভাইস থেকে ছবি আপলোড</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFile}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-cyan-400" />
                      ভিডিও ক্লিপ (অপশনাল)
                    </label>
                    <input
                      type="text"
                      placeholder="ভিডিওর লিংক (যেমন: mp4 url)"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white placeholder-gray-500 outline-none mb-2"
                    />
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-[#12141a] hover:bg-[#1a1e27] border border-dashed border-gray-700 hover:border-gray-500 rounded-xl cursor-pointer text-xs text-gray-300 transition">
                      <Upload className="w-3.5 h-3.5 text-gray-400" />
                      <span>ভিডিও আপলোড (max 20MB)</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {imageUrl && (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-800">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Listing Fee Section (ONLY FOR NORMAL MEMBERS - FREE FOR ADMIN) */}
              {!isAdmin && (
                <div className="p-4 bg-[#101217] border border-red-950/60 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>বিজ্ঞাপন লিস্টিং ফি</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600 text-white font-black">
                          bKash
                        </span>
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        বিজ্ঞাপনটি ওয়েবসাইটে দেখানোর জন্য বিকাশ সেন্ড মানি করুন
                      </p>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFeeAmount(10)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          feeAmount === 10
                            ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                            : 'bg-[#161920] text-gray-400 border border-gray-800'
                        }`}
                      >
                        ৳১০ (স্ট্যান্ডার্ড)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeeAmount(20)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          feeAmount === 20
                            ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                            : 'bg-[#161920] text-gray-400 border border-gray-800'
                        }`}
                      >
                        ৳২০ (ভিডিও সহ)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#161920] border border-gray-800 rounded-xl text-xs">
                    <span className="text-gray-400">
                      bKash Personal: <strong className="text-white font-mono">{bkashNumber}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={copyBkash}
                      className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 font-semibold"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy Number'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                        যে বিকাশ নম্বর থেকে টাকা পাঠিয়েছেন *
                      </label>
                      <input
                        type="tel"
                        required={!isAdmin}
                        placeholder="01XXXXXXXXX"
                        value={feeSenderNumber}
                        onChange={(e) => setFeeSenderNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-[#12141a] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white placeholder-gray-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                        bKash TrxID (ট্রানজেকশন আইডি) *
                      </label>
                      <input
                        type="text"
                        required={!isAdmin}
                        placeholder="যেমন: BL899X21"
                        value={feeTrxId}
                        onChange={(e) => setFeeTrxId(e.target.value)}
                        className="w-full px-3 py-2 bg-[#12141a] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white placeholder-gray-500 font-mono uppercase outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-3.5 font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg ${
                  isAdmin 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30' 
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                }`}
              >
                {isAdmin ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    মূল শপে প্রোডাক্ট প্রকাশ করুন (ফ্রি)
                  </>
                ) : (
                  `৳${feeAmount} ফি দিয়ে বিজ্ঞাপন প্রকাশ করুন`
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
