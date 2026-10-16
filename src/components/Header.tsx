import React, { useRef } from 'react';
import {
  Store,
  BarChart3,
  Package,
  Settings,
  ShoppingBag,
  ImagePlus,
  Award,
  Globe,
  Terminal,
  Truck,
  Edit3,
} from 'lucide-react';
import { AppMode, StoreSettings } from '../types.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface HeaderProps {
  settings: StoreSettings;
  appMode: AppMode;
  onToggleAppMode: (mode: AppMode) => void;
  cartCount: number;
  cartTotal: number;
  onOpenReport: () => void;
  onOpenProducts: () => void;
  onOpenLoyalty?: () => void;
  onOpenSettings: () => void;
  onOpenOrderTracker: () => void;
  onOpenCustomerCart: () => void;
  onToggleMobileCart: () => void;
  onUpdateLogo: (logoUrl: string) => void;
  isMobileCartOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  appMode,
  onToggleAppMode,
  cartCount,
  cartTotal,
  onOpenReport,
  onOpenProducts,
  onOpenLoyalty,
  onOpenSettings,
  onOpenOrderTracker,
  onOpenCustomerCart,
  onToggleMobileCart,
  onUpdateLogo,
  isMobileCartOpen,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#11998e] to-[#38ef7d] text-white shadow-md">
      {/* Hidden file input for logo upload */}
      <input
        type="file"
        ref={logoInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleLogoFileChange}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Zone 1: Store Brand, Logo & Mode Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {settings.logoUrl ? (
            <div className="relative group w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-white/20 border border-white/30 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-xs">
              <img
                src={settings.logoUrl}
                alt="Store Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                title="Change Logo"
              >
                <ImagePlus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-xs shrink-0">
              <Store className="w-5 h-5" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1
                onClick={onOpenSettings}
                className="font-black text-sm sm:text-base lg:text-lg tracking-tight leading-tight text-white whitespace-nowrap cursor-pointer hover:underline flex items-center gap-1"
                title="Click to edit Store Name & Header"
              >
                <span>{settings.storeName}</span>
              </h1>

              {/* Mode indicator pill */}
              <span
                className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  appMode === 'website'
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'bg-slate-900/40 text-teal-200 border border-teal-300/30'
                }`}
              >
                {appMode === 'website' ? 'Online Store' : 'POS Terminal'}
              </span>
            </div>
            <p
              onClick={onOpenSettings}
              className="text-[10px] sm:text-[11px] text-white/90 font-medium truncate max-w-[170px] sm:max-w-none cursor-pointer hover:text-white"
              title="Click to edit store tagline or WhatsApp number"
            >
              {settings.phone ? `WhatsApp: ${settings.phone}` : settings.tagline}
            </p>
          </div>
        </div>

        {/* Zone 2: Primary App Mode Switcher (Website vs POS App) */}
        <div className="flex items-center bg-black/20 p-1 rounded-2xl border border-white/20 backdrop-blur-md">
          <button
            type="button"
            onClick={() => onToggleAppMode('website')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 ${
              appMode === 'website'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-white/90 hover:text-white hover:bg-white/10'
            }`}
            title="Switch to Online Shopping Storefront"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{settings.language === 'ta' ? 'இணைய கடை' : 'Website'}</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleAppMode('pos')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 ${
              appMode === 'pos'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-white/90 hover:text-white hover:bg-white/10'
            }`}
            title="Switch to Merchant POS Billing Terminal"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{settings.language === 'ta' ? 'பில்லிங் ஆப்' : 'POS App'}</span>
          </button>
        </div>

        {/* Zone 3: Navigation buttons & Install App */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          {/* PWA Install App Button */}
          <PWAInstallButton />

          {/* If in Website Mode: Track Order & Cart Trigger */}
          {appMode === 'website' ? (
            <>
              <button
                type="button"
                onClick={onOpenOrderTracker}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-semibold backdrop-blur-xs transition-all whitespace-nowrap"
                title="Track My Order (ஆர்டர் கண்காணிப்பு)"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Track Order</span>
              </button>

              <button
                type="button"
                onClick={onOpenCustomerCart}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/60 active:scale-95 text-white font-extrabold text-xs shadow-xs transition-all"
                title="View Online Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden xs:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            /* If in POS Mode: Sales Reports, Products, Loyalty, Settings */
            <>
              {/* Sales Report (விற்பனை அறிக்கை) */}
              <button
                type="button"
                onClick={onOpenReport}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-semibold backdrop-blur-xs transition-all whitespace-nowrap"
                title="விற்பனை அறிக்கை (Sales Analytics)"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {settings.language === 'ta' ? 'அறிக்கை' : 'Reports'}
                </span>
              </button>

              {/* Manage Products (பொருட்கள் பட்டியல்) */}
              <button
                type="button"
                onClick={onOpenProducts}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-semibold backdrop-blur-xs transition-all whitespace-nowrap"
                title="பொருட்கள் மேலாண்மை (Inventory)"
              >
                <Package className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {settings.language === 'ta' ? 'பொருட்கள்' : 'Products'}
                </span>
              </button>

              {/* Loyalty Club (வாடிக்கையாளர் புள்ளிகள்) */}
              {onOpenLoyalty && (
                <button
                  type="button"
                  onClick={onOpenLoyalty}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-400/25 hover:bg-amber-400/35 border border-amber-300/40 active:scale-95 text-xs font-bold text-amber-100 hover:text-white backdrop-blur-xs transition-all whitespace-nowrap"
                  title="வாடிக்கையாளர் விசுவாசப் புள்ளிகள் (Customer Loyalty)"
                >
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>{settings.language === 'ta' ? 'புள்ளிகள்' : 'Loyalty'}</span>
                </button>
              )}

              {/* Mobile Cart Trigger in POS Mode */}
              <div className="lg:hidden shrink-0">
                <button
                  type="button"
                  onClick={onToggleMobileCart}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all ${
                    isMobileCartOpen
                      ? 'bg-white text-teal-800'
                      : 'bg-slate-900/40 hover:bg-slate-900/60 text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {cartCount > 0 ? (
                    <span>
                      {settings.currencySymbol} {Math.round(cartTotal)}
                    </span>
                  ) : (
                    <span>POS</span>
                  )}
                  {cartCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Settings Modal Trigger */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-white backdrop-blur-xs transition-all shrink-0"
            title="கடை அமைப்புகள் (Settings & Customization)"
          >
            <Settings className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </header>
  );
};
