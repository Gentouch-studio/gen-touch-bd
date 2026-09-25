import React from 'react';
import { ShieldCheck, Truck, Clock, Lock, MessageCircle, Gamepad2, Award } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenGame: () => void;
  onOpenPostAd: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onOpenGame,
  onOpenPostAd,
}) => {
  return (
    <footer className="mt-20 border-t border-gray-800 bg-[#0d0f14] text-white">
      {/* Guarantees Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Fast Nationwide Delivery</h4>
              <p className="text-[11px] text-gray-400">24-48 Hours Express Dispatch</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">100% Authentic Tech</h4>
              <p className="text-[11px] text-gray-400">Official Brand Warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">7 Days Replacement</h4>
              <p className="text-[11px] text-gray-400">Hassle-Free Return Policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Verified User Ads</h4>
              <p className="text-[11px] text-gray-400">Safe Community Marketplace</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
                GT
              </span>
              <span className="text-lg font-black tracking-wider text-white">
                GEN-<span className="text-red-500">TOUCH</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              GEN-TOUCH Online Shopping BD — Leading provider of high-performance acoustics, gaming gear, automotive tech, and electronics in Bangladesh.
            </p>
            <div className="pt-1">
              <span className="text-[11px] text-gray-500 block">Customer Care Hotline:</span>
              <a href="tel:01310588979" className="text-sm font-bold text-red-400 font-mono hover:underline">
                01310-588979
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">
              Explore Store
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button onClick={onOpenGame} className="hover:text-red-400 flex items-center gap-1.5 transition">
                  <Gamepad2 className="w-3.5 h-3.5 text-yellow-400" /> Play Turbo Race (Win ৳30)
                </button>
              </li>
              <li>
                <button onClick={onOpenPostAd} className="hover:text-red-400 flex items-center gap-1.5 transition">
                  <span>+ Sell Gear / Post User Ad</span>
                </button>
              </li>
              <li><a href="#products" className="hover:text-white transition">All Products & Gadgets</a></li>
              <li><a href="#products" className="hover:text-white transition">Hot Deals & Discounts</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">
              Help & Support
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a
                  href="https://wa.me/8801310588979"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-1.5 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" /> Live WhatsApp Support
                </a>
              </li>
              <li><span>Delivery inside Dhaka: ৳60</span></li>
              <li><span>Delivery outside Dhaka: ৳120</span></li>
              <li><span>bKash Send Money: 01310588979</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">
              Authorized Portal
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              Only authorized moderators & store managers can access the order processing system.
            </p>
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14161e] hover:bg-red-600 text-gray-300 hover:text-white border border-gray-800 hover:border-red-600 text-xs font-semibold transition"
            >
              <Lock className="w-3.5 h-3.5 text-red-500 group-hover:text-white" />
              <span>Login as Admin</span>
            </button>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} GEN-TOUCH Online Shopping BD. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span className="text-emerald-500 font-mono">100% Secure SSL Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
};