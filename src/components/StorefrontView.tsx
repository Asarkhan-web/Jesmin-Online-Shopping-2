import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Truck,
  ShieldCheck,
  Star,
  Share2,
  Phone,
  Tag,
  Eye,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Headphones,
  Utensils,
  Lightbulb,
  CloudRain,
  Watch,
  Fan,
  Package,
  Clock,
  MapPin,
} from 'lucide-react';
import { Product, StoreSettings } from '../types.ts';
import { CATEGORIES } from '../data/defaultProducts.ts';
import { formatCurrency } from '../utils/receipt.ts';

interface StorefrontViewProps {
  products: Product[];
  settings: StoreSettings;
  cartCount: number;
  onAddToCart: (product: Product) => void;
  onOpenProductDetail: (product: Product) => void;
  onDirectWhatsAppOrder: (product: Product) => void;
  onOpenCustomerCart: () => void;
  onOpenOrderTracker: () => void;
  onSwitchToPOS: () => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  All: Sparkles,
  'Electronics & Audio': Headphones,
  'Home & Kitchen': Utensils,
  'Lighting & Decor': Lightbulb,
  'Rainwear & Outdoor': CloudRain,
  'Beauty & Cosmetics': Sparkles,
};

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  products,
  settings,
  cartCount,
  onAddToCart,
  onOpenProductDetail,
  onDirectWhatsAppOrder,
  onOpenCustomerCart,
  onOpenOrderTracker,
  onSwitchToPOS,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSlide, setActiveSlide] = useState<number>(0);

  const HERO_SLIDES = [
    {
      title: 'Cash on Delivery Available Island-wide',
      titleTa: 'இலங்கை முழுவதும் வீட்டிற்கே டெலிவரி மற்றும் பணம் செலுத்தும் வசதி (COD)',
      subtitle: 'Fast 1-3 days door-to-door courier delivery in all districts of Sri Lanka.',
      badge: '🚚 FAST ISLAND-WIDE DELIVERY',
      gradient: 'from-teal-800 via-teal-900 to-slate-900',
      accentColor: 'text-teal-300',
    },
    {
      title: 'Special Mega Discounts on Audio & Smart Watches',
      titleTa: 'ஆடியோ மற்றும் ஸ்மார்ட் வாட்ச்களுக்கு பிரத்யேக தள்ளுபடிகள்!',
      subtitle: 'Enjoy up to 30% off on premium earbuds, speaker bags, and smart bands.',
      badge: '⚡ TODAY’S HOT DEALS',
      gradient: 'from-emerald-800 via-teal-900 to-slate-950',
      accentColor: 'text-amber-300',
    },
    {
      title: 'Instant Order Placement via WhatsApp',
      titleTa: 'வாட்ஸ்அப் மூலம் உடனடியாக உங்கள் ஆர்டரை பதிவு செய்யலாம்!',
      subtitle: 'Send your delivery address and receive package tracking updates directly.',
      badge: '📞 DIRECT WHATSAPP ORDER',
      gradient: 'from-slate-900 via-teal-950 to-emerald-950',
      accentColor: 'text-emerald-300',
    },
  ];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchEn = p.name.toLowerCase().includes(q);
        const matchTa = p.nameTa?.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        return matchEn || matchTa || matchCat || matchDesc;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Featured Hot Deals
  const featuredProducts = useMemo(() => {
    return products.filter((p) => p.isFeatured || (p.specialPrice && p.specialPrice < p.price));
  }, [products]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* 1. Hero Promotional Banner & Slider */}
      <section className="relative overflow-hidden rounded-3xl shadow-lg border border-slate-200">
        <div
          className={`relative p-6 sm:p-10 lg:p-12 text-white bg-gradient-to-r ${HERO_SLIDES[activeSlide].gradient} transition-all duration-500`}
        >
          {/* Subtle background glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3.5">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-[11px] sm:text-xs font-black tracking-wider uppercase backdrop-blur-xs">
              {HERO_SLIDES[activeSlide].badge}
            </span>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              {HERO_SLIDES[activeSlide].title}
            </h1>

            <p className={`text-sm sm:text-base font-semibold ${HERO_SLIDES[activeSlide].accentColor}`}>
              {HERO_SLIDES[activeSlide].titleTa}
            </p>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {HERO_SLIDES[activeSlide].subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenCustomerCart}
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Cart & Order ({cartCount})</span>
              </button>

              <button
                type="button"
                onClick={onOpenOrderTracker}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-2 backdrop-blur-xs transition-all"
              >
                <Truck className="w-4 h-4 text-teal-300" />
                <span>Track My Order / நிலை அறிய</span>
              </button>
            </div>
          </div>

          {/* Slider indicators */}
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-1.5 z-10">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  activeSlide === idx ? 'w-6 bg-teal-400' : 'w-2 bg-white/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Customer Trust Highlights Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/70 text-teal-700 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Island-wide COD</h4>
            <p className="text-[11px] text-slate-500">Pay cash upon delivery</p>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Quality Verified</h4>
            <p className="text-[11px] text-slate-500">100% Brand Inspected</p>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-700 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">7-Day Exchange</h4>
            <p className="text-[11px] text-slate-500">Easy replacement policy</p>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200/70 text-sky-700 flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">WhatsApp Support</h4>
            <p className="text-[11px] text-slate-500">{settings.phone}</p>
          </div>
        </div>
      </section>

      {/* 3. Featured Hot Deals Carousel / Grid */}
      {featuredProducts.length > 0 && selectedCategory === 'All' && !searchQuery && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 rounded-full bg-amber-500" />
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {settings.language === 'ta' ? 'சிறப்பு தள்ளுபடி சலுகைகள் (Today’s Hot Deals)' : 'Today’s Hot Deals & Offers'}
                </h2>
                <p className="text-xs text-slate-500">Limited stock promotions with instant discounts</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
              {featuredProducts.length} Deals Live
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {featuredProducts.slice(0, 4).map((p) => {
              const effectivePrice = p.specialPrice && p.specialPrice > 0 ? p.specialPrice : p.price;
              const discount = p.specialPrice ? p.price - p.specialPrice : 0;

              return (
                <div
                  key={`feat-${p.id}`}
                  className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/40 via-white to-teal-50/20 border border-amber-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between text-left group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black uppercase flex items-center gap-1 shadow-2xs">
                        <Tag className="w-3 h-3" />
                        <span>Save {formatCurrency(discount, settings.currencySymbol)}</span>
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        <span>{p.rating || 4.8}</span>
                      </div>
                    </div>

                    {/* Image / Fallback */}
                    <div
                      onClick={() => onOpenProductDetail(p)}
                      className="relative h-32 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center cursor-pointer mb-2.5"
                    >
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="max-h-full max-w-full object-contain p-2 group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-teal-600 group-hover:scale-105 transition-transform" />
                      )}
                    </div>

                    <h3
                      onClick={() => onOpenProductDetail(p)}
                      className="font-bold text-sm text-slate-900 line-clamp-1 hover:text-teal-700 cursor-pointer"
                    >
                      {p.name}
                    </h3>
                    {p.nameTa && (
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {p.nameTa}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5 font-mono">
                        <span className="font-extrabold text-base text-emerald-700">
                          {formatCurrency(effectivePrice, settings.currencySymbol)}
                        </span>
                        {p.specialPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatCurrency(p.price, settings.currencySymbol)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenProductDetail(p)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onAddToCart(p)}
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-all"
                        title="Add to Cart"
                      >
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Filter, Search & Full Catalog Showcase */}
      <section className="space-y-4">
        {/* Search & Category Pills Container */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3.5">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={
                  settings.language === 'ta'
                    ? 'பொருட்களைத் தேடுக (M804, Earbuds, Rack, Light, Watch...)'
                    : 'Search products by name, category, or features...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Track & Switch to POS */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenOrderTracker}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                title="Track your order delivery status"
              >
                <Truck className="w-3.5 h-3.5 text-teal-700" />
                <span className="hidden xs:inline">Track Order</span>
              </button>

              <button
                type="button"
                onClick={onSwitchToPOS}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Switch to Store Merchant POS Terminal"
              >
                <span>Staff POS App</span>
                <ArrowRight className="w-3 h-3 text-teal-400" />
              </button>
            </div>
          </div>

          {/* Category Chips with Icons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const IconComp = CATEGORY_ICONS[cat] || Package;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-teal-700'}`} />
                  <span>
                    {cat === 'All'
                      ? settings.language === 'ta'
                        ? 'அனைத்தும் (All Products)'
                        : 'All Products'
                      : cat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
            <h3 className="text-base font-bold text-slate-800">
              {settings.language === 'ta' ? 'பொருட்கள் எதுவும் கிடைக்கவில்லை' : 'No matching products found'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or reset category filter to see all items.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const effectivePrice =
                product.specialPrice && product.specialPrice > 0
                  ? product.specialPrice
                  : product.price;
              const hasSpecialPrice = product.specialPrice && product.specialPrice < product.price;
              const discount = hasSpecialPrice ? product.price - product.specialPrice! : 0;

              return (
                <div
                  key={product.id}
                  className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-teal-400/80 transition-all flex flex-col justify-between overflow-hidden group text-left"
                >
                  <div>
                    {/* Visual & Badges */}
                    <div
                      onClick={() => onOpenProductDetail(product)}
                      className="relative h-44 bg-slate-50 flex items-center justify-center p-4 cursor-pointer overflow-hidden border-b border-slate-100"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-teal-100/70 border border-teal-200 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Package className="w-8 h-8" />
                        </div>
                      )}

                      {/* Special Discount badge */}
                      {hasSpecialPrice && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-amber-500 text-white text-[10px] font-black uppercase shadow-xs flex items-center gap-0.5">
                          <Tag className="w-3 h-3" />
                          <span>-{formatCurrency(discount, settings.currencySymbol)}</span>
                        </span>
                      )}

                      {/* Stock badge */}
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-700 border border-slate-200 shadow-2xs">
                        Stock: {product.stockQty ?? 20}
                      </span>
                    </div>

                    {/* Product Metadata */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-teal-700 truncate">{product.category}</span>
                        <div className="flex items-center gap-1 font-bold text-slate-700 shrink-0">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                          <span>{product.rating || 4.8}</span>
                        </div>
                      </div>

                      <h3
                        onClick={() => onOpenProductDetail(product)}
                        className="font-bold text-sm text-slate-900 leading-snug line-clamp-2 hover:text-teal-700 cursor-pointer"
                      >
                        {settings.language === 'ta' && product.nameTa ? product.nameTa : product.name}
                      </h3>

                      {settings.language === 'bilingual' && product.nameTa && (
                        <p className="text-xs text-slate-500 font-medium truncate">
                          {product.nameTa}
                        </p>
                      )}

                      {/* Features pills */}
                      {product.features && product.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {product.features.slice(0, 2).map((feat, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium truncate max-w-[140px]"
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Order Actions */}
                  <div className="p-4 pt-0 space-y-2.5">
                    <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="font-extrabold text-base sm:text-lg text-emerald-700 font-mono">
                          {formatCurrency(effectivePrice, settings.currencySymbol)}
                        </span>
                        {hasSpecialPrice && (
                          <span className="text-xs text-slate-400 line-through ml-1.5 font-mono">
                            {formatCurrency(product.price, settings.currencySymbol)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">COD Available</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {/* Add to Cart */}
                      <button
                        type="button"
                        onClick={() => onAddToCart(product)}
                        className="py-2.5 px-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-2xs transition-all"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>

                      {/* Direct WhatsApp Order */}
                      <button
                        type="button"
                        onClick={() => onDirectWhatsAppOrder(product)}
                        className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-2xs transition-all"
                        title="Direct order on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Online Storefront Footer */}
      <footer className="mt-12 rounded-3xl bg-slate-900 text-white p-6 sm:p-10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-800">
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-white mb-2">
              {settings.storeName}
            </h3>
            {settings.storeNameTa && (
              <p className="text-xs text-teal-300 font-semibold mb-2">{settings.storeNameTa}</p>
            )}
            <p className="text-xs text-slate-400 leading-relaxed">
              {settings.tagline} · Providing reliable, high-quality audio equipment, home utilities, rainwear, and electronics with Island-wide Cash on Delivery.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">
              Contact & Order Hotline
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>WhatsApp / Hotline: <strong>{settings.phone}</strong></span>
              </p>
              {settings.address && (
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>{settings.address}</span>
                </p>
              )}
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>Orders Open 24/7 · Same-Day Dispatch</span>
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">
              Store Quick Links
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              <button
                type="button"
                onClick={onOpenOrderTracker}
                className="text-left text-slate-300 hover:text-white hover:underline flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5 text-teal-400" />
                <span>Track Delivery Order / ஆர்டர் நிலை</span>
              </button>
              <button
                type="button"
                onClick={onOpenCustomerCart}
                className="text-left text-slate-300 hover:text-white hover:underline flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-teal-400" />
                <span>Shopping Cart & Checkout ({cartCount})</span>
              </button>
              <button
                type="button"
                onClick={onSwitchToPOS}
                className="text-left text-teal-300 hover:text-teal-200 font-bold flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Staff POS & Billing Terminal / கடை பில்லிங்</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
          <p>Sri Lanka Island-Wide Cash On Delivery (COD) Partner Network</p>
        </div>
      </footer>
    </div>
  );
};
