import React, { useRef } from 'react';
import {
  Speaker,
  Headphones,
  Utensils,
  Lightbulb,
  CloudRain,
  Sparkles,
  Watch,
  Fan,
  Package,
  Plus,
  Image as ImageIcon,
  Tag,
  CornerDownLeft,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { Product, StoreSettings } from '../types.ts';
import { formatCurrency } from '../utils/receipt.ts';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  settings: StoreSettings;
  onAddToCart: (product: Product, isReturn?: boolean) => void;
  onUpdateProductImage?: (productId: string, imageUrl: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Speaker,
  Headphones,
  Utensils,
  Lightbulb,
  CloudRain,
  Sparkles,
  Watch,
  Fan,
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  settings,
  onAddToCart,
  onUpdateProductImage,
}) => {
  const IconComponent = ICON_MAP[product.iconName] || Package;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectivePrice =
    product.specialPrice && product.specialPrice > 0 ? product.specialPrice : product.price;
  const hasSpecialPrice = product.specialPrice && product.specialPrice < product.price;
  const discountAmount = hasSpecialPrice ? product.price - product.specialPrice! : 0;

  // Low Stock evaluation (< threshold, default 5 units)
  const stockThreshold = product.minStockAlert ?? settings.defaultStockAlertThreshold ?? 5;
  const stockQty = product.stockQty ?? 0;
  const isOutOfStock = product.stockQty !== undefined && stockQty <= 0;
  const isLowStock = product.stockQty !== undefined && stockQty > 0 && stockQty < stockThreshold;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateProductImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateProductImage(product.id, event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      onClick={() => onAddToCart(product, false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onAddToCart(product, false);
        }
      }}
      className={`group relative flex flex-col justify-between p-3 sm:p-3.5 rounded-2xl bg-white border transition-all duration-150 cursor-pointer text-left select-none active:scale-[0.98] ${
        isOutOfStock
          ? 'border-rose-400 bg-rose-50/20 shadow-2xs'
          : isLowStock
          ? 'border-amber-400/90 bg-amber-50/25 shadow-xs ring-1 ring-amber-400/30 hover:border-amber-500'
          : quantityInCart > 0
          ? 'border-teal-500/80 shadow-sm ring-1 ring-teal-500/20 bg-teal-50/15'
          : 'border-slate-200/90 shadow-2xs hover:border-teal-400 hover:shadow-md'
      }`}
    >
      {/* Hidden File Input for Image upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* Badges container */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10 flex-wrap justify-end">
        {/* Prominent Low Stock Warning Badge */}
        {isOutOfStock ? (
          <span
            className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-600 text-white shadow-xs flex items-center gap-0.5 animate-pulse"
            title="Out of stock! Please restock immediately."
          >
            <AlertCircle className="w-2.5 h-2.5" />
            <span>{settings.language === 'ta' ? 'இருப்பில்லை' : 'Out of Stock'}</span>
          </span>
        ) : isLowStock ? (
          <span
            className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-500 text-white border border-amber-600/50 shadow-xs flex items-center gap-0.5 animate-pulse"
            title={`Low stock alert: Only ${stockQty} items left (Threshold: < ${stockThreshold})`}
          >
            <AlertTriangle className="w-2.5 h-2.5 fill-white text-amber-500" />
            <span>{settings.language === 'ta' ? `குறைவு: ${stockQty}` : `Low Stock: ${stockQty}`}</span>
          </span>
        ) : product.stockQty !== undefined ? (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs"
            title={`Stock in hand: ${product.stockQty}`}
          >
            <span>{settings.language === 'ta' ? `இருப்பு: ${product.stockQty}` : `Stock: ${product.stockQty}`}</span>
          </span>
        ) : null}

        {/* Special Price Badge */}
        {hasSpecialPrice && (
          <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-2xs flex items-center gap-0.5">
            <Tag className="w-2.5 h-2.5" />
            <span>-{formatCurrency(discountAmount, settings.currencySymbol)}</span>
          </span>
        )}

        {/* Active Quantity Badge in Cart */}
        {quantityInCart > 0 && (
          <div className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
            {quantityInCart}
          </div>
        )}
      </div>

      <div>
        {/* Product Visual & Category */}
        <div className="flex items-center gap-2.5 mb-2">
          {product.image ? (
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200/90 bg-slate-100 shrink-0 group-hover:scale-105 transition-transform">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
              isLowStock
                ? 'bg-amber-100/70 border-amber-300 text-amber-800'
                : 'bg-gradient-to-br from-teal-50 to-emerald-100/70 border-teal-200/60 text-teal-700'
            }`}>
              <IconComponent className="w-6 h-6" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-slate-500 font-medium truncate block">
              {product.category}
            </span>
            {/* Quick Add / Change Image button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="text-[10px] text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1 mt-0.5 hover:underline"
              title="Add / Change product image"
            >
              <ImageIcon className="w-3 h-3 text-teal-600" />
              <span>{product.image ? 'Change Photo' : '+ Photo'}</span>
            </button>
          </div>
        </div>

        {/* Product Title */}
        <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 mb-0.5">
          {settings.language === 'ta' && product.nameTa ? product.nameTa : product.name}
        </h3>

        {/* Tamil Subtitle if in bilingual mode */}
        {settings.language === 'bilingual' && product.nameTa && (
          <p className="text-xs text-slate-600 font-medium mb-1.5 truncate">
            {product.nameTa}
          </p>
        )}
      </div>

      {/* Price & Action row */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
        <div>
          {/* Sale Price (விற்பனை விலை) */}
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="font-extrabold text-base text-emerald-700 tracking-tight">
              {formatCurrency(effectivePrice, settings.currencySymbol)}
            </span>
            {hasSpecialPrice && (
              <span className="text-xs text-slate-400 line-through tabular-nums">
                {formatCurrency(product.price, settings.currencySymbol)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Buy / Cost Price (வாங்கிய விலை) */}
            {product.buyPrice !== undefined && product.buyPrice > 0 && (
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded" title="Cost / Buy Price">
                {settings.language === 'ta' ? 'அடக்கம்:' : 'Buy:'} {formatCurrency(product.buyPrice, settings.currencySymbol)}
              </span>
            )}
            {isLowStock && (
              <span className="text-[10px] text-amber-700 font-extrabold flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" />
                <span>Reorder</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Return button: add item as return/refund */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, true);
            }}
            className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center transition-all active:scale-90"
            title={settings.language === 'ta' ? 'திருப்பி ஒப்படைக்க (Return)' : 'Return item'}
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>

          {/* Add to Cart button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, false);
            }}
            className="w-8 h-8 rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-2xs active:scale-90 transition-all"
            aria-label={`Add ${product.name} to cart`}
            title={settings.language === 'ta' ? 'பில்லில் சேர்க்க' : 'Add to bill'}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
