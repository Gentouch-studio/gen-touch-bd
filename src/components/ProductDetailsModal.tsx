import React, { useState } from 'react';
import { 
  X, Star, ShieldCheck, CheckCircle2, ShoppingBag, 
  Truck, ArrowRight, Camera, AlertCircle 
} from 'lucide-react';
import { Product, ProductReview, Order } from '../types';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  allOrders: Order[];
  onAddReview: (productId: string, review: ProductReview) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  allOrders,
  onAddReview,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');

  // Review Form States
  const [reviewOrderPhone, setReviewOrderPhone] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewCustomerName, setReviewCustomerName] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  if (!isOpen || !product) return null;

  const currentImage = selectedImage || product.image;
  const gallery = product.galleryImages || [product.image];

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');

    if (!reviewCustomerName.trim() || !reviewOrderPhone.trim() || !reviewComment.trim()) {
      setReviewError('Please fill in your name, order phone number, and review comment.');
      return;
    }

    const cleanPhone = reviewOrderPhone.trim();

    // Check delivered orders matching phone and product
    const deliveredOrder = allOrders.find(
      (ord) =>
        ord.customer.phone.includes(cleanPhone) &&
        ord.items.some((item) => item.productId === product.id) &&
        ord.status === 'Delivered'
    );

    if (!deliveredOrder) {
      setReviewError(
        'Verification Failed: Only verified customers who ordered and received delivery of this product can submit a review.'
      );
      return;
    }

    const newReview: ProductReview = {
      id: `REV-${Date.now()}`,
      productId: product.id,
      orderId: deliveredOrder.id,
      customerName: reviewCustomerName.trim(),
      customerPhone: cleanPhone,
      rating: reviewRating,
      comment: reviewComment.trim(),
      photos: reviewPhotos.length > 0 ? reviewPhotos : undefined,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      verifiedBuyer: true,
    };

    onAddReview(product.id, newReview);
    setReviewSuccess(true);
    setReviewComment('');
    setReviewPhotos([]);
    setTimeout(() => {
      setReviewSuccess(false);
    }, 4000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setReviewError('Photo size should be less than 4MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewPhotos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const reviews = product.reviews || [];
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : product.rating.toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#161920] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white my-6 max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#12141a]">
          <span className="text-xs font-bold uppercase tracking-wider text-red-500">
            {product.category}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gallery View */}
            <div className="space-y-4">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#101217] border border-gray-800 shadow-inner">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 px-3 py-1 text-xs font-black uppercase tracking-wider bg-red-600 text-white rounded-lg shadow-md">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {gallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                        currentImage === img
                          ? 'border-red-600 shadow-md'
                          : 'border-gray-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta & Actions */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white leading-snug mb-3">
                  {product.name}
                </h1>

                {/* Rating Bar */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(Number(avgRating))
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-white">{avgRating}</span>
                  <span className="text-xs text-gray-400">({reviews.length || product.ratingCount} reviews)</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> 100% Authentic
                  </span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 p-4 bg-[#101217] rounded-2xl border border-gray-800/80 mb-5">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    ৳{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-base text-gray-500 line-through">
                      ৳{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs px-2 py-1 rounded bg-red-950/50 text-red-400 font-bold ml-auto">
                    Save ৳{(product.originalPrice - product.price).toLocaleString()}
                  </span>
                </div>

                {/* Highlights */}
                <div className="space-y-2 mb-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Key Features:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-300">
                    {product.features?.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Quantity & Order Buttons */}
              <div className="space-y-3 pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-300">Quantity:</span>
                  <div className="flex items-center bg-[#101217] border border-gray-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-gray-300 hover:text-white hover:bg-gray-800 transition"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 font-bold text-xs text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-1.5 text-gray-300 hover:text-white hover:bg-gray-800 transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onAddToCart(product, quantity)}
                    className="py-3 px-4 bg-[#1e222d] hover:bg-[#252a38] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-gray-700"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </button>
                  <button
                    onClick={() => onBuyNow(product, quantity)}
                    className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
                  >
                    Buy Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-red-500" /> Fast Delivery (24-48 Hours)
                  </span>
                  <span>Cash on Delivery Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs: Description vs Reviews */}
          <div className="pt-6 border-t border-gray-800">
            <div className="flex items-center gap-4 border-b border-gray-800 pb-3 mb-5">
              <button
                onClick={() => setActiveTab('overview')}
                className={`text-sm font-bold pb-1 transition border-b-2 ${
                  activeTab === 'overview'
                    ? 'text-red-500 border-red-500'
                    : 'text-gray-400 border-transparent hover:text-gray-200'
                }`}
              >
                Product Description
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`text-sm font-bold pb-1 transition border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'text-red-500 border-red-500'
                    : 'text-gray-400 border-transparent hover:text-gray-200'
                }`}
              >
                Customer Reviews & Ratings ({reviews.length})
              </button>
            </div>

            {activeTab === 'overview' ? (
              <div className="text-xs sm:text-sm text-gray-300 leading-relaxed space-y-3">
                <p>{product.description}</p>
                <div className="p-4 bg-[#101217] rounded-2xl border border-gray-800 text-xs text-gray-400 space-y-1.5">
                  <p className="font-semibold text-white">Genuine Product Guarantee:</p>
                  <p>All GEN-TOUCH products are backed by 100% manufacturer warranty and tested for high acoustic, thermal, and electronic durability.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Submit Review Form (Verified Buyers Only) */}
                <div className="p-5 bg-[#101217] border border-gray-800 rounded-2xl">
                  <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Write a Verified Customer Review
                  </h4>
                  <p className="text-[11px] text-gray-400 mb-4">
                    Note: To maintain authenticity, reviews can only be posted by customers who have purchased and received this product.
                  </p>

                  {reviewSuccess && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Thank you! Your verified review and photo have been published!
                    </div>
                  )}

                  {reviewError && (
                    <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      {reviewError}
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Tanvir Ahmed"
                          value={reviewCustomerName}
                          onChange={(e) => setReviewCustomerName(e.target.value)}
                          className="w-full px-3 py-2 bg-[#161920] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">
                          Phone Number used for Order *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="01XXXXXXXXX"
                          value={reviewOrderPhone}
                          onChange={(e) => setReviewOrderPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-[#161920] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Star Select */}
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Rating *</label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="p-1 text-amber-400 hover:scale-110 transition"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs text-gray-400 ml-2">
                          {reviewRating === 5 && 'Outstanding! (5/5)'}
                          {reviewRating === 4 && 'Very Good (4/5)'}
                          {reviewRating === 3 && 'Average (3/5)'}
                          {reviewRating <= 2 && 'Needs Improvement'}
                        </span>
                      </div>
                    </div>

                    {/* Review Text */}
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Your Experience / Review *</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Write about build quality, sound, performance, or packaging..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full px-3 py-2 bg-[#161920] border border-gray-800 focus:border-red-600 rounded-xl text-xs text-white outline-none resize-none"
                      />
                    </div>

                    {/* Photo Upload */}
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">
                        Upload Product Photos in Hand (Optional)
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {reviewPhotos.map((p, idx) => (
                          <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-700">
                            <img src={p} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setReviewPhotos(reviewPhotos.filter((_, i) => i !== idx))}
                              className="absolute top-0 right-0 bg-black/80 text-white p-0.5 rounded-bl"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <label className="cursor-pointer w-14 h-14 rounded-lg border border-dashed border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition">
                          <Camera className="w-4 h-4 mb-0.5" />
                          <span className="text-[9px]">Add</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow"
                    >
                      Submit Verified Review
                    </button>
                  </form>
                </div>

                {/* Existing Reviews List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Customer Feedbacks ({reviews.length})
                  </h4>

                  {reviews.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 bg-[#101217] rounded-2xl border border-gray-800">
                      <p className="text-xs">No reviews yet for this product. Be the first verified buyer to review!</p>
                    </div>
                  ) : (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 bg-[#101217] border border-gray-800 rounded-2xl space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{rev.customerName}</span>
                            {rev.verifiedBuyer && (
                              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/40">
                                <ShieldCheck className="w-3 h-3" /> Verified Purchase
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500">{rev.createdAt}</span>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-700'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Comment */}
                        <p className="text-xs text-gray-300 leading-relaxed">{rev.comment}</p>

                        {/* Review Photos */}
                        {rev.photos && rev.photos.length > 0 && (
                          <div className="flex items-center gap-2 pt-1">
                            {rev.photos.map((ph, pi) => (
                              <a
                                key={pi}
                                href={ph}
                                target="_blank"
                                rel="noreferrer"
                                className="w-16 h-16 rounded-xl overflow-hidden border border-gray-700 block hover:opacity-90"
                              >
                                <img src={ph} alt="Review attachment" className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};