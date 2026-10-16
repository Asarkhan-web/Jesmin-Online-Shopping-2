import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Truck,
  ArrowRight,
  Share2,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { CartItem, CustomerInfo, StoreSettings } from '../types.ts';
import { formatCurrency } from '../utils/receipt.ts';

interface CustomerCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  settings: StoreSettings;
  onChangeQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (
    customerDetails: CustomerInfo,
    deliveryMethod: 'whatsapp' | 'cod'
  ) => void;
}

export const CustomerCartDrawer: React.FC<CustomerCartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  settings,
  onChangeQty,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details'>('cart');

  if (!isOpen) return null;

  const FREE_DELIVERY_THRESHOLD = 5000;
  const STANDARD_DELIVERY_FEE = 450;

  const rawSubtotal = cart.reduce((sum, item) => {
    const unitPrice =
      item.product.specialPrice && item.product.specialPrice > 0
        ? item.product.specialPrice
        : item.product.price;
    return sum + unitPrice * item.qty;
  }, 0);

  const isFreeDelivery = rawSubtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = rawSubtotal > 0 ? (isFreeDelivery ? 0 : STANDARD_DELIVERY_FEE) : 0;
  const grandTotal = rawSubtotal + deliveryFee;
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const amountNeededForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - rawSubtotal);

  const handleProceedToDetails = () => {
    if (cart.length === 0) return;
    setCheckoutStep('details');
  };

  const handleSubmitOrder = (method: 'whatsapp' | 'cod') => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('தயவுசெய்து உங்கள் பெயர், தொலைபேசி எண் மற்றும் டெலிவரி முகவரியை உள்ளிடவும் (Please enter your name, phone and address).');
      return;
    }

    onPlaceOrder(
      {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
      },
      method
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {settings.language === 'ta' ? 'உங்கள் கூடை (Shopping Cart)' : 'Shopping Bag'}
              </h3>
              <p className="text-xs text-slate-400">
                {totalItems} {settings.language === 'ta' ? 'பொருட்கள்' : 'items'} in your cart
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Bar */}
        {cart.length > 0 && (
          <div className="px-4 py-2 bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100 text-xs">
            {isFreeDelivery ? (
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>வாழ்த்துக்கள்! உங்கள் ஆர்டருக்கு இலவச டெலிவரி (Free Island-wide Delivery Unlocked!)</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-teal-950 text-[11px]">
                  <span>Free Delivery Threshold:</span>
                  <span className="font-bold text-teal-700">
                    Add {formatCurrency(amountNeededForFree, settings.currencySymbol)} more for Free Shipping!
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (rawSubtotal / FREE_DELIVERY_THRESHOLD) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-1" />
              <p className="font-bold text-sm text-slate-700">உங்கள் கூடை காலியாக உள்ளது</p>
              <p className="text-xs text-slate-400 mt-1">Your cart is currently empty</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs"
              >
                <span>பொருட்களைப் பார்க்க (Explore Store)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : checkoutStep === 'cart' ? (
            /* Step 1: Cart Items List */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Selected Items ({cart.length})</span>
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-rose-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              </div>

              <div className="space-y-2">
                {cart.map((item) => {
                  const unitPrice =
                    item.product.specialPrice && item.product.specialPrice > 0
                      ? item.product.specialPrice
                      : item.product.price;
                  const itemTotal = unitPrice * item.qty;

                  return (
                    <div
                      key={item.product.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                    >
                      {/* Image / Fallback */}
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-200 bg-white shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-teal-100/70 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.product.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      {/* Product Name & Pricing */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-800 truncate">
                          {settings.language === 'ta' && item.product.nameTa
                            ? item.product.nameTa
                            : item.product.name}
                        </h4>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {formatCurrency(unitPrice, settings.currencySymbol)} × {item.qty}
                        </div>
                        <div className="text-xs font-bold text-emerald-700 font-mono">
                          = {formatCurrency(itemTotal, settings.currencySymbol)}
                        </div>
                      </div>

                      {/* Qty Controls */}
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onChangeQty(item.product.id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-slate-800 font-mono">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onChangeQty(item.product.id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal:</span>
                  <span className="font-mono font-bold">
                    {formatCurrency(rawSubtotal, settings.currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Island-wide:</span>
                  <span className="font-mono font-bold">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase">Free Delivery</span>
                    ) : (
                      formatCurrency(deliveryFee, settings.currencySymbol)
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-200">
                  <span>Estimated Total:</span>
                  <span className="font-mono text-emerald-700 text-base">
                    {formatCurrency(grandTotal, settings.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Step 2: Customer Shipping Details */
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>டெலிவரி விபரம் (Delivery Information)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="text-xs font-bold text-teal-700 hover:underline"
                >
                  ← Edit Items
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>உங்கள் பெயர் (Your Full Name) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohamed Asar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>WhatsApp / தொலைபேசி எண் (Phone Number) *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +94 77 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>முழுமையான முகவரி / நகரம் (Delivery Address & City) *</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. No. 124, Main Street, Kalmunai"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    கூடுதல் குறிப்புகள் (Delivery Notes / Landmark)
                  </label>
                  <input
                    type="text"
                    placeholder="Optional: Near Clock Tower / Call before arrival"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Trust Box */}
              <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/80 text-[11px] text-teal-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>100% Cash on Delivery Guarantee</span>
                </div>
                <p className="text-teal-800/90 leading-relaxed">
                  You only pay cash when the courier rider delivers your package at your doorstep.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        {cart.length > 0 && (
          <div className="p-4 bg-white border-t border-slate-200 space-y-2">
            {checkoutStep === 'cart' ? (
              <button
                type="button"
                onClick={handleProceedToDetails}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>{settings.language === 'ta' ? 'ஆர்டர் செய்யத் தொடர்க (Proceed to Order)' : 'Proceed to Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-2">
                {/* Option 1: WhatsApp Instant Order */}
                <button
                  type="button"
                  onClick={() => handleSubmitOrder('whatsapp')}
                  className="w-full py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                  title="Direct WhatsApp order with auto-filled message"
                >
                  <Share2 className="w-4 h-4" />
                  <span>வாட்ஸ்அப் மூலம் உடனடியாக ஆர்டர் செய் (WhatsApp Order)</span>
                </button>

                {/* Option 2: Cash on Delivery Direct Booking */}
                <button
                  type="button"
                  onClick={() => handleSubmitOrder('cod')}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                  title="Place online order with Cash on Delivery"
                >
                  <Truck className="w-4 h-4 text-teal-400" />
                  <span>பொருளைப் பெற்றதும் பணம் செலுத்துங்கள் (Place COD Order)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
