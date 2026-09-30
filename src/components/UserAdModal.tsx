import React, { useState } from 'react';
import { X, Upload, Video, Image as ImageIcon, CheckCircle, AlertCircle, Copy, Check, ShieldCheck, Sparkles, Plus } from 'lucide-react';
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
  
  // একাধিক ছবি হ্যান্ডলিং (৩-৪টি ছবি আপলোড সুবিধা)
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
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

  // ৩-৪টি ছবি আপলোড করার হ্যান্ডলার
  const handleImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      setErrorMsg('সর্বোচ্চ ৪-৫টি ছবি আপলোড করা যাবে।');
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('প্রতিটি ছবির সাইজ ৫ মেগাবাইটের (5MB) কম হতে হবে');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrlImage = () => {
    if (!imageUrlInput.trim()) return;
    if (images.length >= 5) {
      setErrorMsg('সর্বোচ্চ ৪-৫টি ছবি যোগ করা যাবে।');
      return;
    }
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setErrorMsg('ভিডিও সাইজ ২০ মেগাবাইট (20MB) এর কম হতে হবে');
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

    if (!title.trim() || !price || (!isAdmin && !sellerName.trim()) || (!isAdmin && !sellerPhone.trim()) || !description.trim()) {
      setErrorMsg('অনুগ্রহ করে তারকা (*) চিহ্নিত সকল প্রয়োজনীয় তথ্য পূরণ করুন');
      return;
    }

    if (images.length === 0) {
      setErrorMsg('কমপক্ষে একটি ছবি যোগ করুন');
      return;
    }

    if (!isAdmin && (!feeSenderNumber.trim() || !feeTrxId.trim())) {
      setErrorMsg('বিকাশ সেন্ড মানি করে প্রেরক নম্বর ও TrxID প্রদান করুন');
      return;
    }

    const primaryImage = images[0];

    // IF ADMIN: Add directly to All Products catalog
    if (isAdmin && onAddProduct) {
      const parsedPrice = parseFloat(price) || 0;
      const parsedOriginal = parseFloat(originalPrice) || parsedPrice;
      const featureList = features.split('\n').map(f => f.trim()).filter(Boolean);

      const newProduct: Product = {
        id: `gt-prod-${Date.now()}`,
        name: title.trim(),
        price: parsedPrice,
        originalPrice: parsedOriginal > parsedPrice ? parsedOriginal : undefined,
        category,
        image: primaryImage,
        images: images,
        videoUrl: videoUrl || undefined,
        description: description.trim(),
        features: featureList.length > 0 ? featureList : ['100% Original Brand New', 'Warranty Included', 'Fast Delivery'],
        badge: badge || 'Hot',
        stock: 50,
        rating: 5.0,
        reviewsCount: 1,
        source: 'admin'
      };

      onAddProduct(newProduct);
      setIsSubmitted(true);
      return;
    }

    // IF USER: Create Classified Member Ad
    const newAd: UserAd = {
      id: `ad-${Date.now()}`,
      title: title.trim(),
      category,
      price: parseFloat(price) || 0,
      sellerName: sellerName.trim(),
      sellerPhone: sellerPhone.trim(),
      sellerLocation: sellerLocation.trim() || 'Bangladesh',
      description: description.trim(),
      imageUrl: primaryImage,
      images: images,
      videoUrl: videoUrl || undefined,
      feeAmount,
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
    setCategory('Electronics & Gadgets');
    setPrice('');
    setOriginalPrice('');
    setSellerName(isAdmin ? 'GEN-TOUCH Official' : '');
    setSellerPhone(isAdmin ? '01310588979' : '');
    setSellerLocation(isAdmin ? 'Dhaka, Bangladesh' : '');
    setDescription('');
    setImages([]);
    setImageUrlInput('');
    setVideoUrl('');
    setFeatures('');
    setFeeSenderNumber('');
    setFeeTrxId('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0b0c10] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${isAdmin ? 'border-emerald-900/40 bg-emerald-950/20' : 'border-gray-800 bg-[#0f1117]'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${isAdmin ? 'bg-emerald-600 shadow-emerald-600/30' : 'bg-red-600 shadow-red-600/30'}`}>
              {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg">
                  {isAdmin ? 'অফিসিয়াল প্রোডাক্ট আপলোড (All Products)' : 'বিজ্ঞাপন পোস্ট করুন (Member Ads)'}
                </h3>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Admin / Moderator (Free)
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {isAdmin 
                  ? 'আপনার প্রোডাক্টটি সরাসরি মূল ওয়েবসাইটে (All Products) সবার জন্য লাইভ হবে' 
                  : 'কমিউনিটি মেম্বারদের জন্য বাই/সেল ক্লাসিফায়েড বিজ্ঞাপন'}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${isAdmin ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-600/20 text-red-500 border border-red-500/40'}`}>
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {isAdmin ? 'প্রোডাক্টটি সফলভাবে মূল শপে যুক্ত হয়েছে!' : 'বিজ্ঞাপন সাবমিট সফল হয়েছে!'}
              </h3>
              <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
                {isAdmin ? (
                  <>
                    আপনার নতুন প্রোডাক্টটি সরাসরি <strong>All Products</strong> ও ক্যাটাগরি পেজে লাইভ যুক্ত হয়ে গেছে। গ্রাহকরা এখন এটি অর্ডার করতে পারবেন।
                  </>
                ) : (
                  <>
                    আপনার বিজ্ঞাপন এবং bKash পেমেন্ট TrxID (<strong>{feeTrxId}</strong>) অ্যাডমিন যাচাই করবেন। ভেরিফিকেশনের পর এটি দ্রুত লাইভ হবে।
                  </>
                )}
              </p>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="mt-4 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-red-600/30"
              >
                ঠিক আছে, বন্ধ করুন
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isAdmin && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>আপনি এডমিন হিসেবে লগইন আছেন। কোনো ফি ছাড়াই এই প্রোডাক্টটি সরাসরি <strong>All Products</strong>-এ যাবে।</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl flex items-center gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  প্রোডাক্টের নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Wireless RGB Mechanical Gaming Keyboard"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#12141a] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white placeholder-gray-500 outline-none"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    ক্যাটাগরি *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 bg-[#12141a] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none"
                  >
                    <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Smart Living">Smart Living</option>
                    <option value="Premium Collectibles">Premium Collectibles</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    বিক্রয় মূল্য (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="যেমন: 3500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#12141a] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white placeholder-gray-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Admin Extra Pricing Fields */}
              {isAdmin && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      পূর্বের মূল্য / ডিসকাউন্ট মূল্য (৳)
                    </label>
                    <input
                      type="number"
                      placeholder="যেমন: 4200"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-[#12141a] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white placeholder-gray-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      ব্যাজ (Badge)
                    </label>
                    <select
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full px-3 py-2 bg-[#12141a] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none"
                    >
                      <option value="Hot">Hot</option>
                      <option value="Sale">Sale</option>
                      <option value="Trending">Trending</option>
                      <option value="Official">Official</option>
                      <option value="Exclusive">Exclusive</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Seller Information (For Members) */}
              {!isAdmin && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      আপনার নাম *
                    </label>
                    <input
                      type="text"
                      required={!isAdmin}
                      placeholder="পুরো নাম"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#12141a] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      মোবাইল নম্বর *
                    </label>
                    <input
                      type="tel"
                      required={!isAdmin}
                      placeholder="01XXXXXXXXX"
                      value={sellerPhone}
                      onChange={(e) => setSellerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#12141a] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      লোকেশন / এলাকা *
                    </label>
                    <input
                      type="text"
                      required={!isAdmin}
                      placeholder="যেমন: মিরপুর, ঢাকা"
                      value={sellerLocation}
                      onChange={(e) => setSellerLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-[#12141a] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  বিস্তারিত বিবরণ *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="প্রোডাক্টের কন্ডিশন, স্পেসিফিকেশন ও বিস্তারিত বর্ণনা লিখুন..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#12141a] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white placeholder-gray-500 outline-none resize-none"
                />
              </div>

              {/* Admin Bullet Features */}
              {isAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    মূল বৈশিষ্ট্যসমূহ (প্রতি লাইনে একটি)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="100% Original Brand New&#10;1 Year Warranty&#10;Fast Home Delivery"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    className="w-full px-3 py-2 bg-[#12141a] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white placeholder-gray-500 outline-none font-mono resize-none text-[11px]"
                  />
                </div>
              )}

              {/* Multiple Images and Media Upload */}
              <div className="p-3 bg-[#12141a] border border-gray-800 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-red-400">
                        <ImageIcon className="w-3.5 h-3.5" />
                        ছবির লিংক বা ফাইল আপলোড (৩-৪টি ছবি) *
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {images.length}/5 টি ছবি
                      </span>
                    </label>

                    {/* Image URL Input with Add Button */}
                    <div className="flex gap-1.5 mb-2">
                      <input
                        type="text"
                        placeholder="ছবির সরাসরি লিংক (URL) পেস্ট করুন"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white placeholder-gray-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddUrlImage}
                        className="px-3 py-2 bg-red-600/30 hover:bg-red-600 text-red-400 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> যোগ
                      </button>
                    </div>

                    {/* Multiple File Upload Button */}
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-[#12141a] hover:bg-[#1a1e27] border border-dashed border-gray-700 hover:border-gray-500 rounded-xl cursor-pointer text-xs text-gray-300 transition">
                      <Upload className="w-3.5 h-3.5 text-gray-400" />
                      <span>গ্যালারি থেকে ৩-৪টি ছবি বেছে নিন</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageFiles}
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

                {/* Multiple Images Preview Thumbnails */}
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-800/60 mt-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-800 group shadow-md">
                        <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/80 px-1 rounded text-[9px] text-gray-300 font-bold">
                          {idx === 0 ? 'Main' : `#${idx + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/80 rounded-full text-white hover:text-red-400 transition"
                          title="মুছে ফেলুন"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
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
