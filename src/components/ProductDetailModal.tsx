import React from 'react';
import {
  X,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Share2,
  CheckCircle2,
  Tag,
  Package,
} from 'lucide-react';
import { Product, StoreSettings } from '../types.ts';
import { formatCurrency } from '../utils/receipt.ts';

interface ProductDetailModalProps {
  product: Product | null;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onDirectWhatsAppOrder: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  settings,
  isOpen,
  onClose,
  onAddToCart,
  onDirectWhatsAppOrder,
}) => {
  if (!isOpen || !product) return null;

  const effectivePrice =
    product.specialPrice && product.specialPrice > 0 ? product.specialPrice : product.price;
  const hasSpecialPrice = product.specialPrice && product.specialPrice < product.price;
  const discountAmount = hasSpecialPrice ? product.price - product.specialPrice! : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-slate-900/40 hover:bg-slate-900/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Product Media Header */}
          <div className="relative h-56 sm:h-64 bg-gradient-to-br from-slate-100 to-teal-50/50 flex items-center justify-center p-6 border-b border-slate-100">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain drop-shadow-md rounded-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-teal-100/80 text-teal-700 flex items-center justify-center border border-teal-200 shadow-inner">
                <Package className="w-12 h-12" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
              <span className="px-2.5 py-1 rounded-lg bg-teal-600 text-white text-[11px] font-extrabold uppercase shadow-xs">
                {product.category}
              </span>
              {hasSpecialPrice && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-xs">
                  <Tag className="w-3 h-3" />
                  <span>Save {formatCurrency(discountAmount, settings.currencySymbol)}</span>
                </span>
              )}
            </div>
          </div>

          {/* Details Content */}
          <div className="p-5 sm:p-6 space-y-4">
            {/* Title & Tamil Subtitle */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-xs font-bold text-slate-800">{product.rating || 4.8}</span>
                </div>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-medium">
                  {product.reviewsCount || 35} Verified Customer Reviews
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>In Stock ({product.stockQty ?? 20} available)</span>
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h2>
              {product.nameTa && (
                <p className="text-sm font-semibold text-teal-800 mt-0.5">
                  {product.nameTa}
                </p>
              )}
            </div>

            {/* Pricing Section */}
            <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block uppercase">
                  {settings.language === 'ta' ? 'சிறப்பு விலை (Online Offer Price)' : 'Online Offer Price'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-700 font-mono">
                    {formatCurrency(effectivePrice, settings.currencySymbol)}
                  </span>
                  {hasSpecialPrice && (
                    <span className="text-sm text-slate-400 line-through font-mono">
                      {formatCurrency(product.price, settings.currencySymbol)}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-teal-800 bg-teal-100/90 px-2 py-0.5 rounded-full inline-block">
                  Cash on Delivery Available
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">Island-wide 1-3 days delivery</p>
              </div>
            </div>

            {/* Product Description */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                {settings.language === 'ta' ? 'தயாரிப்பு விவரம் (Description)' : 'Product Overview'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description ||
                  `${product.name} is a high-grade product from Jesmin Online Shopping, tested for durability, high performance, and quality.`}
              </p>
              {product.descriptionTa && (
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
                  {product.descriptionTa}
                </p>
              )}
            </div>

            {/* Features Bullet List */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Key Specifications / சிறப்பம்சங்கள்
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.features.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Guarantee Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-[10px] text-slate-600 font-medium">
              <div className="p-2 rounded-xl bg-slate-50 flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-teal-600" />
                <span>Fast COD Islandwide</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Quality Tested</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-teal-600" />
                <span>7-Day Return Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
          {/* Add to Cart button */}
          <button
            type="button"
            onClick={() => {
              onAddToCart(product);
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{settings.language === 'ta' ? 'கார்ட்டில் சேர் (Add to Cart)' : 'Add to Cart'}</span>
          </button>

          {/* Direct 1-Click WhatsApp Order */}
          <button
            type="button"
            onClick={() => {
              onDirectWhatsAppOrder(product);
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>{settings.language === 'ta' ? 'வாட்ஸ்அப் மூலம் ஆர்டர்' : 'Order on WhatsApp'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
