import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X, 
  ShieldCheck, 
  ChevronDown,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/contexts/AuthContext';
import { INITIAL_CATEGORIES } from '@/data/initialData';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = useCartStore((state) => state.getTotalItemsCount());
  const wishlistCount = useCartStore((state) => state.wishlist.length);
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const adminOverride = localStorage.getItem('gen_touch_admin_override');
  const hasAdminAccess = isAdmin || !!adminOverride;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d0f12] text-white shadow-xl border-b border-neutral-800">
      
      {/* 1. Top Announcement Strip */}
      <div className="bg-gradient-to-r from-neutral-950 via-red-950 to-neutral-950 text-neutral-300 text-[11px] font-medium border-b border-red-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span className="text-neutral-200 font-semibold tracking-wide">
              Free Express Delivery on orders over ৳1,500
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {hasAdminAccess && (
              <Link 
                to="/admin" 
                className="flex items-center gap-1 text-red-400 hover:text-red-300 font-bold bg-red-950/60 border border-red-800/60 px-2.5 py-0.5 rounded-md"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                <span>Admin Panel</span>
              </Link>
            )}
            <Link to="/legal/shipping" className="hover:text-white transition-colors">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Mobile Menu Hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-400 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo with Silver "GEN" & Red "TOUCH" */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <img 
              src="/logo.png" 
              alt="GEN-TOUCH" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.endsWith('logo.jpeg')) {
                  target.src = '/logo.jpeg';
                }
              }}
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex items-center">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-slate-200 drop-shadow-[0_1px_2px_rgba(255,255,255,0.2)]">
                GEN
              </span>
              <span className="text-xl sm:text-2xl font-black tracking-wider text-red-600 drop-shadow-[0_1px_8px_rgba(220,38,38,0.5)]">
                -TOUCH
              </span>
            </div>
          </Link>

          {/* Search Bar - Center */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative hidden md:block">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search automotive accessories, gadgets, lifestyle tech..."
                className="w-full bg-[#16191f] text-neutral-100 placeholder-neutral-500 text-xs sm:text-sm pl-4 pr-12 py-2.5 rounded-xl border border-neutral-700/80 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1.5 p-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg transition-all shadow-md active:scale-95"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Wishlist */}
            <Link 
              to="/wishlist" 
              className="relative p-2 text-neutral-400 hover:text-red-400 transition-colors rounded-lg hover:bg-neutral-800/60"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#0d0f12]">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <Link 
              to="/cart" 
              className="relative p-2 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-800/60"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#0d0f12]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Login */}
            {currentUser || adminOverride ? (
              <div className="relative group">
                <button className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-neutral-900 border border-neutral-700/70 hover:border-red-600 text-neutral-200 text-xs font-bold transition-colors">
                  <User className="w-4 h-4 text-red-500" />
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {userProfile?.displayName || 'Admin'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>
                <div className="absolute right-0 mt-1 w-44 bg-[#16191f] border border-neutral-800 rounded-xl shadow-2xl py-1 hidden group-hover:block text-xs z-50">
                  {hasAdminAccess && (
                    <Link to="/admin" className="block px-4 py-2 hover:bg-neutral-800 text-red-400 font-bold">
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      localStorage.removeItem('gen_touch_admin_override');
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-neutral-800 text-neutral-400 hover:text-red-400"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-[#16191f] text-neutral-100 placeholder-neutral-500 text-xs pl-3 pr-10 py-2 rounded-lg border border-neutral-700 outline-none focus:border-red-600"
            />
            <button type="submit" className="absolute right-1 p-1.5 text-red-500">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* 3. Category Strip (Desktop) */}
      <div className="border-t border-neutral-800/80 bg-[#12141a] hidden lg:block text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <nav className="flex items-center space-x-1">
            <Link 
              to="/products"
              className="py-2.5 px-3 text-neutral-300 hover:text-white hover:bg-neutral-800/70 font-bold transition-colors flex items-center gap-1.5 border-b-2 border-transparent hover:border-red-600"
            >
              <Menu className="w-3.5 h-3.5 text-red-500" />
              <span>All Products</span>
            </Link>

            {INITIAL_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="py-2.5 px-3 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/40 font-medium transition-colors border-b-2 border-transparent hover:border-red-500"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Official Support Number */}
          <a 
            href="tel:01310588979"
            className="flex items-center gap-2 text-neutral-400 hover:text-white text-xs font-semibold transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-500" />
            <span>Support: <strong className="text-white font-mono tracking-wide">01310588979</strong></span>
          </a>
        </div>
      </div>

      {/* 4. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-800 bg-[#12141a] p-4 space-y-3">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Categories
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded bg-neutral-900 text-neutral-200 font-semibold border border-neutral-800 hover:border-red-600"
            >
              All Products
            </Link>
            {INITIAL_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-red-600"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
            <span>Customer Helpline:</span>
            <a href="tel:01310588979" className="font-bold text-red-400 font-mono">01310588979</a>
          </div>
        </div>
      )}

    </header>
  );
};