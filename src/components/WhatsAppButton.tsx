import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = '8801310588979',
  defaultMessage = 'Hello GEN-TOUCH! I want to know more about your products.',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Quick Chat Popup Tooltip */}
      {isOpen && (
        <div className="mb-3 w-72 bg-[#161920] border border-gray-800 rounded-2xl shadow-2xl p-4 text-white animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800/80 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-sm text-gray-200">GEN-TOUCH Support</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Close WhatsApp prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mb-3">
            Hi! Need help with an order, product warranty, or fast delivery? Chat directly with us on WhatsApp!
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            Start WhatsApp Chat
          </a>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-[0_8px_25px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Contact on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#0f1115]"></span>
        </span>
        <MessageCircle className="w-7 h-7" />
        
        {/* Hover Label */}
        <span className="absolute right-16 px-3 py-1.5 bg-[#161920] text-gray-200 text-xs font-semibold rounded-lg shadow-xl border border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Live WhatsApp Support
        </span>
      </button>
    </div>
  );
};