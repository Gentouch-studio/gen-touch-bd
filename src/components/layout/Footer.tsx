import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Headphones, Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import { INITIAL_CATEGORIES } from '@/data/initialData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#080a0d] text-neutral-400 border-t border-neutral-800 text-xs mt-auto">
      
      {/* 1. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <img 
                src="/logo.png" 
                alt="GEN-TOUCH" 
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-wider text-white">
                  GEN<span className="text-red-600">-TOUCH</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-red-500 font-bold -mt-0.5">
                  DRIVEN BY GEN. PERFECTED BY TOUCH.
                </span>
              </div>
            </Link>

            <p className="text-neutral-400 leading-relaxed max-w-sm">
              Your premier destination for performance-engineered electronics, smart audio, 
              automotive essentials, and modern lifestyle products in Bangladesh.
            </p>

            <div className="space-y-2 pt-1 text-neutral-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>Banani, Dhaka - 1213, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span>Support: +880 1700-000000 (10 AM - 10 PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <span>support@gentouch.com</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs border-l-2 border-red-600 pl-2">
              Collections
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              {INITIAL_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs border-l-2 border-red-600 pl-2">
              Customer Care
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/legal/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/shipping" className="hover:text-white transition-colors">
                  Shipping & Delivery Info
                </Link>
              </li>
              <li>
                <Link to="/legal/return" className="hover:text-white transition-colors">
                  Refund & Return Policy
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  My Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment & Trust */}
          <div className="space-y-3">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs border-l-2 border-red-600 pl-2">
              Accepted Payments
            </h4>
            <p className="text-[11px] text-neutral-400">
              Safe & secure transactions via multiple trusted payment gateways.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded font-bold text-white text-[10px]">
                Cash On Delivery
              </span>
              <span className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded font-bold text-pink-500 text-[10px]">
                bKash
              </span>
              <span className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded font-bold text-orange-500 text-[10px]">
                Nagad
              </span>
              <span className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded font-bold text-blue-400 text-[10px]">
                Visa / MasterCard
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Bottom Copyright Strip */}
      <div className="border-t border-neutral-800/80 bg-[#050608] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <p className="text-neutral-500">
            © {new Date().getFullYear()} <strong className="text-neutral-300">GEN-TOUCH</strong>. All rights reserved.
          </p>
          <p className="text-neutral-500 flex items-center gap-1">
            <span>Crafted with</span>
            <span className="text-red-500 font-bold">Performance & Style</span>
          </p>
        </div>
      </div>

    </footer>
  );
};