import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, WishlistItem, Coupon } from '@/types';

interface CartState {
  items: CartItem[];
  wishlist: WishlistItem[];
  appliedCoupon: Coupon | null;
  deliveryCharge: number;

  // Cart Actions
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (productId: string, selectedVariations?: Record<string, string>) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariations?: Record<string, string>) => void;
  clearCart: () => void;

  // Wishlist Actions
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  moveToCart: (productId: string) => void;

  // Coupon & Price calculations
  applyCoupon: (coupon: Coupon) => boolean;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotalAmount: () => number;
  getTotalItemsCount: () => number;
}

// Helper to check if two variation objects match
function variationsMatch(
  v1?: Record<string, string>,
  v2?: Record<string, string>
): boolean {
  if (!v1 && !v2) return true;
  if (!v1 || !v2) return false;
  const keys1 = Object.keys(v1);
  const keys2 = Object.keys(v2);
  if (keys1.length !== keys2.length) return false;
  return keys1.every((key) => v1[key] === v2[key]);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      appliedCoupon: null,
      deliveryCharge: 60, // Default 60 BDT inside city, adjustable at checkout

      addToCart: (newItem) => {
        set((state) => {
          const quantityToAdd = newItem.quantity || 1;
          const existingIndex = state.items.findIndex(
            (item) =>
              item.productId === newItem.productId &&
              variationsMatch(item.selectedVariations, newItem.selectedVariations)
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const currentItem = updatedItems[existingIndex];
            const newQuantity = Math.min(currentItem.quantity + quantityToAdd, currentItem.stock);
            updatedItems[existingIndex] = {
              ...currentItem,
              quantity: newQuantity,
            };
            return { items: updatedItems };
          }

          return {
            items: [
              ...state.items,
              {
                ...newItem,
                quantity: Math.min(quantityToAdd, newItem.stock),
              },
            ],
          };
        });
      },

      removeFromCart: (productId, selectedVariations) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.productId === productId &&
                variationsMatch(item.selectedVariations, selectedVariations)
              )
          ),
        }));
      },

      updateQuantity: (productId, quantity, selectedVariations) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, selectedVariations);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (
              item.productId === productId &&
              variationsMatch(item.selectedVariations, selectedVariations)
            ) {
              return {
                ...item,
                quantity: Math.min(quantity, item.stock),
              };
            }
            return item;
          }),
        }));
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: null });
      },

      // Wishlist Handlers
      addToWishlist: (item) => {
        set((state) => {
          if (state.wishlist.some((w) => w.productId === item.productId)) {
            return state;
          }
          return { wishlist: [...state.wishlist, item] };
        });
      },

      removeFromWishlist: (productId) => {
        set((state) => ({
          wishlist: state.wishlist.filter((w) => w.productId !== productId),
        }));
      },

      isInWishlist: (productId) => {
        return get().wishlist.some((w) => w.productId === productId);
      },

      moveToCart: (productId) => {
        const wishlistItem = get().wishlist.find((w) => w.productId === productId);
        if (wishlistItem) {
          get().addToCart({
            productId: wishlistItem.productId,
            name: wishlistItem.name,
            price: wishlistItem.price,
            originalPrice: wishlistItem.originalPrice,
            image: wishlistItem.image,
            stock: wishlistItem.stock,
            quantity: 1,
          });
          get().removeFromWishlist(productId);
        }
      },

      // Coupon logic
      applyCoupon: (coupon) => {
        const subtotal = get().getSubtotal();
        if (subtotal < coupon.minOrderAmount) {
          return false;
        }
        set({ appliedCoupon: coupon });
        return true;
      },

      removeCoupon: () => {
        set({ appliedCoupon: null });
      },

      // Calculations
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getDiscountAmount: () => {
        const { appliedCoupon } = get();
        if (!appliedCoupon) return 0;
        const subtotal = get().getSubtotal();

        if (subtotal < appliedCoupon.minOrderAmount) {
          return 0;
        }

        let discount = 0;
        if (appliedCoupon.discountType === 'percentage') {
          discount = (subtotal * appliedCoupon.discountValue) / 100;
          if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
            discount = appliedCoupon.maxDiscount;
          }
        } else {
          discount = appliedCoupon.discountValue;
        }

        return Math.min(discount, subtotal);
      },

      getTotalAmount: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        const delivery = subtotal > 0 ? get().deliveryCharge : 0;
        return Math.max(0, subtotal - discount + delivery);
      },

      getTotalItemsCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'gen-touch-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);