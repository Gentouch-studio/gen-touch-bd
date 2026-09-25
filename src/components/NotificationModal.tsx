import React from 'react';
import { X, Bell, Gamepad2, Megaphone, ShoppingBag, ShieldCheck, CheckCheck } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onActionClick: (target?: string) => void;
  isAdmin: boolean;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onActionClick,
  isAdmin,
}) => {
  if (!isOpen) return null;

  // Filter based on user/admin role
  const visibleNotifications = notifications.filter(
    (n) => n.forRole === 'all' || (isAdmin ? n.forRole === 'admin' : n.forRole === 'user')
  );

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'game':
        return <Gamepad2 className="w-4 h-4 text-yellow-400" />;
      case 'ad_promo':
        return <Megaphone className="w-4 h-4 text-red-500" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md bg-[#161920] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white max-h-[85vh] mt-12 sm:mt-14">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-[#12141a]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">Notification Center</h3>
              <p className="text-[11px] text-gray-400">
                {visibleNotifications.filter(n => !n.read).length} Unread alerts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 transition px-2 py-1 rounded bg-[#101217] border border-gray-800"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> Read All
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-3 overflow-y-auto space-y-2.5 custom-scrollbar">
          {visibleNotifications.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-gray-400">
              <Bell className="w-8 h-8 text-gray-600 mb-2" />
              <p className="text-xs">No notifications yet!</p>
            </div>
          ) : (
            visibleNotifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition ${
                  item.read
                    ? 'bg-[#101217]/60 border-gray-800/60 opacity-75'
                    : 'bg-[#12151d] border-red-900/40 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-black/40 border border-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed mb-2">
                      {item.message}
                    </p>

                    {item.linkTarget && (
                      <button
                        onClick={() => {
                          onActionClick(item.linkTarget);
                          onClose();
                        }}
                        className="text-[11px] font-bold text-red-400 hover:text-red-300 underline underline-offset-2 transition cursor-pointer"
                      >
                        {item.linkTarget === 'game' && '🎮 Play Turbo Race & Claim Coupon →'}
                        {item.linkTarget === 'ad_post' && '📢 Post Your Ad Now →'}
                        {item.linkTarget === 'admin' && '🛡️ Open Admin Panel →'}
                        {item.linkTarget === 'store' && '🛍️ Explore Collection →'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};