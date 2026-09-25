import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const addToWishlist = useCartStore((state) => state.addToWishlist);
  const removeFromWishlist = useCartStore((state) => state.removeFromWishlist);
  const isInWishlist = useCartStore((state) => state.isInWishlist(product.id));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error('This item is currently out of stock');
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0],
      stock: product.stock,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images[0],
        stock: product.stock,
        addedAt: new Date().toISOString(),
      });
      toast.success('Added to wishlist');
    }
  };

  return (
    <div className="group relative bg-[#13161c] border border-neutral-800/90 hover:border-red-600/80 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-red-950/20 flex flex-col justify-between">
      
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full bg-[#0d0f12] overflow-hidden">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
            loading="lazy"
          />
        </Link>

        {/* Discount Badge */}
        {product.discountPercentage && (
          <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider">
            {product.discountPercentage}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all ${
            isInWishlist
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-black/60 text-neutral-300 hover:text-red-400 hover:bg-black/80'
          }`}
          title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-white' : ''}`} />
        </button>

        {/* Out of Stock Overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
            <span className="bg-neutral-900 border border-neutral-700 text-neutral-300 font-bold text-xs px-3 py-1 rounded-md uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
            <span className="uppercase font-semibold tracking-wider text-red-500/90 text-[10px]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-medium">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-neutral-500">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-semibold text-xs sm:text-sm text-neutral-100 group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Add to Cart Button */}
        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="text-sm sm:text-base font-black text-white">
              ৳{product.price.toLocaleString()}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-[11px] text-neutral-500 line-through">
                ৳{product.originalPrice.toLocaleString()}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="p-2 sm:px-3 sm:py-2 bg-neutral-800 hover:bg-red-600 disabled:bg-neutral-800/40 text-neutral-200 hover:text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Add to Cart"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-red-400 group-hover/btn:text-white" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

    </div>
  );
};