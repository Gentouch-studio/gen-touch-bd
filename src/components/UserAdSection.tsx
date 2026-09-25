import React, { useState } from 'react';
import { Megaphone, Phone, MapPin, Video, X, Sparkles } from 'lucide-react';
import { UserAd } from '../types';

interface UserAdSectionProps {
  ads: UserAd[];
  onOpenPostAd: () => void;
}

export const UserAdSection: React.FC<UserAdSectionProps> = ({
  ads,
  onOpenPostAd,
}) => {
  const approvedAds = ads.filter((a) => a.status === 'approved');
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);

  if (approvedAds.length === 0) return null;

  return (
    <section className="my-10">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              Community Classifieds & Member Ads <Sparkles className="w-4 h-4 text-yellow-400" />
            </h2>
            <p className="text-xs text-gray-400">
              Verified gear, gadgets & pre-owned tech sold directly by verified users
            </p>
          </div>
        </div>

        <button
          onClick={onOpenPostAd}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
        >
          <span>+ Post Your Ad</span>
          <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-mono">৳10/20</span>
        </button>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {approvedAds.map((ad) => (
          <div
            key={ad.id}
            className="group relative bg-[#161920] border border-gray-800/80 hover:border-red-600/50 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {/* Image / Video Preview */}
            <div className="relative aspect-video w-full overflow-hidden bg-[#101217]">
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {ad.feeAmount === 20 && (
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-600 text-white rounded-md shadow-md">
                  Featured
                </span>
              )}

              {ad.videoUrl && (
                <button
                  onClick={() => setActiveVideoModal(ad.videoUrl || null)}
                  className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-black/80 hover:bg-black text-white text-[11px] font-bold rounded-lg border border-red-600/50 flex items-center gap-1.5 backdrop-blur-sm transition"
                >
                  <Video className="w-3.5 h-3.5 text-red-500 animate-pulse" /> 15s Video
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
                  <span className="uppercase tracking-wider font-semibold">{ad.category}</span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <MapPin className="w-3 h-3 text-red-500" /> {ad.sellerLocation}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">
                  {ad.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                  {ad.description}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between mt-auto">
                <div>
                  <span className="text-[10px] text-gray-500 block">Asking Price:</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    ৳{ad.price.toLocaleString()}
                  </span>
                </div>

                <a
                  href={`tel:${ad.sellerPhone}`}
                  className="px-3 py-1.5 bg-[#101217] hover:bg-red-600 hover:text-white text-gray-200 text-xs font-bold rounded-xl border border-gray-800 hover:border-red-600 transition flex items-center gap-1.5 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5 text-red-500 group-hover:text-white" />
                  <span>Call Seller</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Lightbox Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#161920] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl p-2">
            <button
              onClick={() => setActiveVideoModal(null)}
              className="absolute top-4 right-4 z-10 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
            <video
              src={activeVideoModal}
              controls
              autoPlay
              className="w-full h-80 object-contain rounded-2xl bg-black"
            />
          </div>
        </div>
      )}
    </section>
  );
};