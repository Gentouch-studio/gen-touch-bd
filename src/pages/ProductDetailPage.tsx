import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Truck, 
  ShieldCheck, 
  RefreshCcw, 
  Plus, 
  Minus, 
  Check, 
  Share2, 
  ArrowLeft 
} from 'lucide-react';
import { INITIAL_PRODUCTS } from '@/data/initialData';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Find product by slug or id
  const product = INITIAL_PRODUCTS.find((p) => p.slug === slug || p.id === slug) || INITIAL_PRODUCTS[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.variations?.forEach((v) => {
      if (v.options.length > 0) {
        initial[v.name] = v.options[0];
      }
    });
    return initial;
  });

  const addToCart = useCartStore((state) => state.addToCart);
  const addToWishlist = useCartStore((state) => state.addToWishlist);
  const removeFromWishlist = useCartStore((state) => state.removeFromWishlist);
  const isInWishlist = useCartStore((state) => state.isInWishlist(product.id));

  const handleVariationSelect = (variationName: string, option: string) => {
    setSelectedVariations((prev) => ({
      ...prev,
      [variationName]: option,
    }));
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[selectedImageIndex] || product.images[0] || '',
      stock: product.stock,
      quantity,
      selectedVariations,
    });
    toast.success(`Added ${quantity} item(s) to Cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-emerald-700">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-emerald-700">Products</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white border border-gray-200 rounded-2xl p-4 sm:p-8">
        
        {/* Left: Product Images Gallery (5 Cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="relative pt-[100%] rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {product.discountPercentage && (
              <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                -{product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails Row */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx ? 'border-emerald-600 ring-2 ring-emerald-100' : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Buying Options & Specifications (7 Cols) */}
        <div className="md:col-span-7 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                {product.category}
              </span>
              <button
                onClick={handleShare}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
                title="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
              {product.name}
            </h1>

            {/* Rating Stars & Reviews */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="ml-1 font-bold text-gray-800">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">{product.reviewCount} Ratings & Reviews</span>
              <span className="text-gray-300">|</span>
              <span className="text-emerald-700 font-medium">SKU: {product.sku}</span>
            </div>
          </div>

          {/* Price Box */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-baseline gap-3">
            <span className="text-3xl font-black text-emerald-900">
              ৳{product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
            {product.discountPercentage && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                Save ৳{(product.originalPrice! - product.price).toLocaleString()}
              </span>
            )}
          </div>

          {/* Variations (Colors / Sizes) */}
          {product.variations?.map((v) => (
            <div key={v.id} className="space-y-2">
              <span className="text-xs font-bold text-gray-700">
                Select {v.name}: <strong className="text-emerald-700">{selectedVariations[v.name]}</strong>
              </span>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleVariationSelect(v.name, opt)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-all ${
                      selectedVariations[v.name] === opt
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity Selection & Stock info */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700">Quantity</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-gray-600 hover:text-emerald-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 text-sm font-bold text-gray-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 text-gray-600 hover:text-emerald-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs text-gray-500">
                {product.stock > 0 ? (
                  <span className="text-emerald-600 font-medium">In Stock ({product.stock} units available)</span>
                ) : (
                  <span className="text-red-600 font-bold">Out of Stock</span>
                )}
              </span>
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full sm:flex-1 py-3 px-6 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="w-full sm:flex-1 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors shadow-xs"
            >
              Buy Now (Cash on Delivery)
            </button>

            <button
              onClick={() => {
                if (isInWishlist) {
                  removeFromWishlist(product.id);
                  toast('Removed from Wishlist', { icon: '💔' });
                } else {
                  addToWishlist({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    image: product.images[0] || '',
                    stock: product.stock,
                    addedAt: new Date().toISOString(),
                  });
                  toast.success('Saved to Wishlist!');
                }
              }}
              className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
              title="Wishlist"
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-center text-xs text-gray-600">
            <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Fast Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Authentic</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg">
              <RefreshCcw className="w-4 h-4 text-emerald-600" />
              <span>7-Day Return</span>
            </div>
          </div>
        </div>

      </div>

      {/* Description & Technical Specifications */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Product Description</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
        </div>

        {product.specifications.length > 0 && (
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.specifications.map((spec, i) => (
                <div key={i} className="flex justify-between p-2.5 bg-gray-50 rounded-lg text-xs">
                  <span className="text-gray-500 font-medium">{spec.key}</span>
                  <span className="text-gray-800 font-semibold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};