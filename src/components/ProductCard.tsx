import React from 'react';
import { Star, ShoppingBag, Eye, Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const totalReviews = product.reviews ? product.reviews.length : product.ratingCount;
  const avgRating = product.reviews && product.reviews.length > 0
    ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
    : product.rating.toFixed(1);

  return (
    <div
      className="group relative bg-[#161920] border border-gray-800/80 hover:border-red-600/50 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(220,38,38,0.18)]"
    >
      {/* Product Image & Badges */}
      <div 
        onClick={() => onViewDetails(product)}
        className="relative aspect-square w-full overflow-hidden bg-[#101217] cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110"
          loading="lazy"
        />

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-red-600 text-white rounded-md shadow-md">
            {product.badge}
          </span>
        )}

        {/* Wishlist Button */}
        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-colors ${
              isWishlisted
                ? 'bg-red-600 text-white'
                : 'bg-black/50 text-gray-300 hover:text-white hover:bg-black/80'
            }`}
            aria-label="Toggle Wishlist"
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
        )}

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161920]/90 border border-gray-700 text-white text-xs font-semibold rounded-lg shadow-lg backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-red-500" /> View Details
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              {product.category}
            </span>
            <div className="flex items-center gap-1 bg-[#101217] px-2 py-0.5 rounded-md border border-gray-800">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-gray-200">{avgRating}</span>
              <span className="text-[10px] text-gray-500">({totalReviews})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => onViewDetails(product)}
            className="text-sm font-semibold text-white line-clamp-2 hover:text-red-400 cursor-pointer transition-colors leading-snug mb-2"
          >
            {product.name}
          </h3>
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-2 border-t border-gray-800/60 mt-auto">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base font-black text-white">
              ৳{product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-500 line-through">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 ${
              product.inStock
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 active:scale-95'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};