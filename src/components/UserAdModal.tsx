import React, { useState } from 'react';
import { X, Upload, Video, Image as ImageIcon, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';
import { UserAd } from '../types';

interface UserAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitAd: (ad: UserAd) => void;
  bkashNumber?: string;
}

export const UserAdModal: React.FC<UserAdModalProps> = ({
  isOpen,
  onClose,
  onSubmitAd,
  bkashNumber = '01310588979',
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics & Gadgets');
  const [price, setPrice] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerLocation, setSellerLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
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
        setErrorMsg('Image size should be less than 5MB');
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
        setErrorMsg('Video must be a short clip (10-15 sec) under 20MB');
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

    if (!title.trim() || !price || !sellerName.trim() || !sellerPhone.trim() || !sellerLocation.trim()) {
      setErrorMsg('Please fill in all required product and contact details.');
      return;
    }

    if (!imageUrl) {
      setErrorMsg('Please upload at least one photo for your advertisement.');
      return;
    }

    if (!feeSenderNumber.trim() || !feeTrxId.trim()) {
      setErrorMsg(`Please provide your bKash payment phone number and TrxID for the ৳${feeAmount} listing fee.`);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[#161920] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#12141a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500 font-black text-lg">
              +
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide">Post an Advertisement</h3>
              <p className="text-xs text-gray-400">Sell gadgets, accessories or promote your gear</p>
            </div>
          </div>
          <button
            onClick={onClose}
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
                <h4 className="text-xl font-bold text-white mb-1">Ad Submitted for Review!</h4>
                <p className="text-sm text-gray-400 max-w-md">
                  Thank you! Your advertisement and ৳{feeAmount} bKash verification (TrxID: <strong className="text-white">{feeTrxId}</strong>) have been sent to our admin team.
                </p>
              </div>
              <div className="p-4 bg-[#101318] border border-gray-800 rounded-2xl text-xs text-gray-300 max-w-md leading-relaxed">
                📢 Once the admin approves your payment, your advertisement with photo and video clip will be live on the GEN-TOUCH marketplace!
              </div>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  onClose();
                }}
                className="w-full max-w-xs py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition"
              >
                Done
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

              {/* Product Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Wireless Gaming Headset (Used 2 months)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
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
                    Asking Price (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g., 2500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Seller Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Phone Number *
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
                    Location/District *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Dhaka, Mirpur"
                    value={sellerLocation}
                    onChange={(e) => setSellerLocation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Description & Condition
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe your item, accessories included, warranty details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition resize-none"
                />
              </div>

              {/* Media Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#101217] border border-dashed border-gray-700 rounded-2xl text-center flex flex-col items-center justify-center">
                  {imageUrl ? (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden group">
                      <img src={imageUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center py-2 w-full">
                      <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs font-bold text-gray-200">Upload Product Photo *</span>
                      <span className="text-[10px] text-gray-500">JPG, PNG up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFile}
                      />
                    </label>
                  )}
                </div>

                <div className="p-3 bg-[#101217] border border-dashed border-gray-700 rounded-2xl text-center flex flex-col items-center justify-center">
                  {videoUrl ? (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                      <video src={videoUrl} className="w-full h-full object-contain" controls />
                      <button
                        type="button"
                        onClick={() => setVideoUrl('')}
                        className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center py-2 w-full">
                      <Video className="w-6 h-6 text-red-400 mb-1" />
                      <span className="text-xs font-bold text-gray-200">10-15s Video Clip (Optional)</span>
                      <span className="text-[10px] text-gray-500">MP4, WebM (Short 15 sec demo)</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleVideoFile}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Commission Fee Box */}
              <div className="p-4 bg-gradient-to-br from-[#12141a] to-[#1a1415] border border-red-900/40 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-200">Select Ad Plan / Commission Fee:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFeeAmount(10)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                        feeAmount === 10
                          ? 'bg-red-600 text-white border-red-600 shadow'
                          : 'bg-[#101217] text-gray-400 border-gray-800'
                      }`}
                    >
                      ৳10 (Standard)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeeAmount(20)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                        feeAmount === 20
                          ? 'bg-red-600 text-white border-red-600 shadow'
                          : 'bg-[#101217] text-gray-400 border-gray-800'
                      }`}
                    >
                      ৳20 (Priority Top)
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#0e1014] rounded-xl border border-gray-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">bKash (Send Money):</span>
                    <strong className="font-mono text-emerald-400 font-bold">{bkashNumber}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={copyBkash}
                    className="flex items-center gap-1 text-[11px] text-gray-300 hover:text-white bg-gray-800 px-2 py-1 rounded"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <input
                      type="tel"
                      required
                      placeholder="Your bKash Number"
                      value={feeSenderNumber}
                      onChange={(e) => setFeeSenderNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-lg text-xs text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="bKash TrxID (e.g. BL99XX2)"
                      value={feeTrxId}
                      onChange={(e) => setFeeTrxId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#101217] border border-gray-800 focus:border-red-600 rounded-lg text-xs text-white placeholder-gray-500 outline-none uppercase font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/30 text-sm flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" /> Submit Ad for Admin Approval
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};