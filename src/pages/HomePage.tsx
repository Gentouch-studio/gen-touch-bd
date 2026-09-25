import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones, 
  Zap, 
  Flame, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '@/data/initialData';
import { ProductCard } from '@/components/product/ProductCard';

export const HomePage: React.FC = () => {
  // Load custom products if added via admin, else fallback to initial
  const [products] = useState(() => {
    const saved = localStorage.getItem('gen_touch_custom_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const featuredProducts = products.filter((p: any) => p.isFeatured || p.rating >= 4.7);
  const flashSaleProducts = products.slice(0, 4);

  return (
    <div className="space-y-10 pb-16 bg-[#0a0c0f] text-neutral-100 min-h-screen">
      
      {/* 1. Supercar Luxury Racing Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#11141a] via-[#0d0f14] to-[#0a0c0f] border-b border-neutral-800">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-neutral-700/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/80 border border-red-700/60 text-red-400 text-xs font-bold tracking-wide">
                <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
                <span>GEN-TOUCH EXCLUSIVE • PERFORMANCE MEETS LUXURY</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Engineered for <br />
                <span className="bg-gradient-to-r from-red-500 via-rose-400 to-neutral-200 bg-clip-text text-transparent">
                  Peak Performance
                </span>
              </h1>

              <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover high-end lifestyle gadgets, premium audio acoustics, automotive accessories, 
                and modern essentials with nationwide expedited delivery.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all hover:gap-3 active:scale-95"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/category/electronics"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 font-bold text-sm border border-neutral-700/80 hover:border-neutral-500 transition-all"
                >
                  <span>Smart Tech & Audio</span>
                </Link>
              </div>

              {/* Tagline Badge */}
              <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-center lg:justify-start gap-6 text-xs text-neutral-400">
                <div><strong className="text-white font-bold">100%</strong> Authentic</div>
                <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                <div><strong className="text-white font-bold">Official</strong> Warranty</div>
                <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                <div><strong className="text-white font-bold">Express</strong> Shipping</div>
              </div>
            </div>

            {/* Right Column: Hero Showcase Visual */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-4/3 rounded-2xl overflow-hidden border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 p-2 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                  alt="AcousticPro High Performance"
                  className="w-full h-full object-cover rounded-xl brightness-90 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-neutral-950/85 backdrop-blur-md p-3.5 rounded-xl border border-neutral-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Top Rated Gear</span>
                    <h4 className="text-xs sm:text-sm font-bold text-white">AcousticPro Wireless ANC</h4>
                  </div>
                  <span className="text-sm font-black text-red-500">৳3,499</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Brand Trust Guarantee Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <div className="flex items-center gap-3 p-2">
            <div className="p-2.5 rounded-xl bg-neutral-800 text-red-500 border border-neutral-700">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Fast Nationwide Delivery</div>
              <div className="text-[11px] text-neutral-400">Safe doorstep delivery</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="p-2.5 rounded-xl bg-neutral-800 text-red-500 border border-neutral-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">100% Genuine Quality</div>
              <div className="text-[11px] text-neutral-400">Original brand warranty</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="p-2.5 rounded-xl bg-neutral-800 text-red-500 border border-neutral-700">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">7-Day Easy Return</div>
              <div className="text-[11px] text-neutral-400">Hassle-free replacement</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="p-2.5 rounded-xl bg-neutral-800 text-red-500 border border-neutral-700">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Priority Support</div>
              <div className="text-[11px] text-neutral-400">Dedicated assistance</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Shop By Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>Shop by Category</span>
            </h2>
            <p className="text-xs text-neutral-400">Explore premium collections curated for you</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1">
            <span>All Categories</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {INITIAL_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 p-4 transition-all hover:border-red-600 hover:-translate-y-1"
            >
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-neutral-950 mb-3">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-red-400 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured High-Performance Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-500 fill-red-500" />
              <span>Trending & Top Picks</span>
            </h2>
            <p className="text-xs text-neutral-400">Customer favorites and best-selling tech</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1">
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredProducts.map((prod: any) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 5. Promotional Speed Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-red-950 via-neutral-900 to-neutral-950 border border-red-900/60 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-wider text-red-400">Limited Period Offer</span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Get 10% Extra OFF on Your First Order!
            </h3>
            <p className="text-xs text-neutral-300">
              Use promo code <span className="bg-red-900/80 text-red-200 px-2 py-0.5 rounded font-mono font-bold">GENTOUCH10</span> during checkout.
            </p>
          </div>

          <Link
            to="/products"
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-colors shadow-md active:scale-95 shrink-0"
          >
            Claim Discount Now
          </Link>
        </div>
      </section>

    </div>
  );
};