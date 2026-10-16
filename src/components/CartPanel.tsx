import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  Printer,
  Share2,
  User,
  ShoppingBag,
  CreditCard,
  Banknote,
  Truck,
  Building,
  Receipt,
  RotateCcw,
  CheckCircle2,
  Clock,
  CornerDownLeft,
  Percent,
  Tag,
  Award,
  Star,
  Sparkles,
} from 'lucide-react';
import { CartItem, CustomerInfo, CustomerProfile, PaymentMethod, StoreSettings } from '../types.ts';
import { formatCurrency } from '../utils/receipt.ts';

interface CartPanelProps {
  cart: CartItem[];
  settings: StoreSettings;
  discount: number;
  setDiscount: (val: number) => void;
  deliveryFee: number;
  setDeliveryFee: (val: number) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (pm: PaymentMethod) => void;
  cashReceived: string;
  setCashReceived: (val: string) => void;
  customer: CustomerInfo;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerInfo>>;
  customers?: CustomerProfile[];
  onOpenLoyaltyModal?: () => void;
  onChangeQty: (productId: string, delta: number) => void;
  onToggleItemReturn: (productId: string) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCompleteSale: (
    actionType: 'print' | 'preview' | 'whatsapp' | 'delivery_invoice',
    options?: { isPayLater?: boolean; isDirectPaid?: boolean }
  ) => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({
  cart,
  settings,
  discount,
  setDiscount,
  deliveryFee,
  setDeliveryFee,
  paymentMethod,
  setPaymentMethod,
  cashReceived,
  setCashReceived,
  customer,
  setCustomer,
  customers = [],
  onOpenLoyaltyModal,
  onChangeQty,
  onToggleItemReturn,
  onRemoveItem,
  onClearCart,
  onCompleteSale,
}) => {
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  // Calculations taking returns and special prices into account
  const rawSubtotal = cart.reduce((sum, item) => {
    const unitPrice =
      item.product.specialPrice && item.product.specialPrice > 0
        ? item.product.specialPrice
        : item.product.price;
    const itemTotal = unitPrice * item.qty;
    return item.isReturn ? sum - itemTotal : sum + itemTotal;
  }, 0);

  const totalDiscount = Math.min(discount, Math.max(0, rawSubtotal));
  const grandTotal = Math.max(0, rawSubtotal - totalDiscount + deliveryFee);
  const totalItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const numericCash = parseFloat(cashReceived) || 0;
  const balance = numericCash - grandTotal;

  // Quick cash tender helper
  const handleQuickCash = (amount: number, isAddition = false) => {
    if (isAddition) {
      const current = parseFloat(cashReceived) || 0;
      setCashReceived((current + amount).toString());
    } else {
      setCashReceived(amount.toString());
    }
  };

  const handleExactCash = () => {
    setCashReceived(Math.ceil(grandTotal).toString());
  };

  // Quick Discount Handlers
  const handlePercentDiscount = (percent: number) => {
    if (rawSubtotal > 0) {
      const disc = Math.round((rawSubtotal * percent) / 100);
      setDiscount(disc);
    }
  };

  const handleFixedDiscount = (amount: number) => {
    setDiscount(amount);
  };

  // Instant 1-tap "Product Paid" action
  const handleInstantProductPaid = () => {
    setCashReceived(Math.ceil(grandTotal).toString());
    onCompleteSale('print', { isDirectPaid: true });
  };

  // "Buy After Payment / Pay Later" action
  const handleBuyAfterPayment = () => {
    setPaymentMethod('pay_later');
    onCompleteSale('preview', { isPayLater: true });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-teal-700" />
          <h2 className="font-bold text-slate-800 text-sm sm:text-base">
            {settings.language === 'ta' ? 'தற்போதைய பில் (Cart)' : 'Current Bill (Cart)'}
          </h2>
          {totalItemCount > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
              {totalItemCount} {settings.language === 'ta' ? 'பொருட்கள்' : 'items'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Customer button */}
          <button
            type="button"
            onClick={() => setShowCustomerForm(!showCustomerForm)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
              customer.name || customer.phone || showCustomerForm
                ? 'bg-teal-50 border-teal-300 text-teal-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Customer Info"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {customer.name ? customer.name.slice(0, 10) : settings.language === 'ta' ? 'வாடிக்கையாளர்' : 'Customer'}
            </span>
          </button>

          {/* Loyalty Club Button */}
          {onOpenLoyaltyModal && (
            <button
              type="button"
              onClick={onOpenLoyaltyModal}
              className={`text-xs px-2 py-1.5 rounded-lg border flex items-center gap-1 font-semibold transition-colors ${
                (customer.previousPoints !== undefined && customer.previousPoints > 0)
                  ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
              }`}
              title="வாடிக்கையாளர் விசுவாசப் புள்ளிகள் (Loyalty Points)"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {customer.previousPoints !== undefined && customer.previousPoints > 0
                  ? `${customer.previousPoints} pts`
                  : settings.language === 'ta'
                  ? 'புள்ளிகள்'
                  : 'Loyalty'}
              </span>
            </button>
          )}

          {cart.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              className="text-xs px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors flex items-center gap-1 font-medium"
              title="Clear Cart"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{settings.language === 'ta' ? 'அழி' : 'Clear'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Customer Quick Info Expandable Form with Loyalty System */}
      {showCustomerForm && (
        <div className="p-3 bg-teal-50/60 border-b border-teal-100/90 text-xs flex flex-col gap-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between font-semibold text-teal-950">
            <div className="flex items-center gap-1.5">
              <span>{settings.language === 'ta' ? 'வாடிக்கையாளர் விவரங்கள் & புள்ளிகள்' : 'Customer & Loyalty Profile'}</span>
            </div>
            <div className="flex items-center gap-2">
              {onOpenLoyaltyModal && (
                <button
                  type="button"
                  onClick={onOpenLoyaltyModal}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-100/80 hover:bg-amber-200/80 px-2 py-0.5 rounded-md border border-amber-300/80 flex items-center gap-1 transition-colors"
                >
                  <Award className="w-3 h-3 text-amber-600" />
                  <span>{settings.language === 'ta' ? 'உறுப்பினர்கள்' : 'Members'}</span>
                </button>
              )}
              {(customer.name || customer.phone || customer.address) && (
                <button
                  type="button"
                  onClick={() =>
                    setCustomer({
                      name: '',
                      phone: '',
                      address: '',
                      notes: '',
                      previousPoints: undefined,
                      pointsRedeemed: 0,
                    })
                  }
                  className="text-[11px] text-rose-600 hover:text-rose-800 font-bold px-1.5 py-0.5 rounded hover:bg-rose-50"
                  title="Clear customer from cart"
                >
                  {settings.language === 'ta' ? 'அழி' : 'Clear'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowCustomerForm(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder={settings.language === 'ta' ? 'பெயர் (Name)' : 'Customer Name'}
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium text-slate-800"
            />
            <input
              type="tel"
              placeholder={settings.language === 'ta' ? 'தொலைபேசி (+94...)' : 'Phone (+94...)'}
              value={customer.phone}
              onChange={(e) => {
                const newPhone = e.target.value;
                const matched = customers.find((c) => c.phone.trim() === newPhone.trim());
                if (matched) {
                  setCustomer({
                    ...customer,
                    phone: newPhone,
                    name: customer.name || matched.name,
                    address: customer.address || matched.address || '',
                    previousPoints: matched.points,
                  });
                } else {
                  setCustomer({ ...customer, phone: newPhone });
                }
              }}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono text-slate-800"
            />
          </div>

          <input
            type="text"
            placeholder={settings.language === 'ta' ? 'டெலிவரி முகவரி / குறிப்பு (Delivery Address)' : 'Delivery Address / Notes'}
            value={customer.address}
            onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-800"
          />

          {/* Loyalty Points Banner & Redemption */}
          <div className="p-2 rounded-xl bg-white/90 border border-amber-200/90 shadow-2xs flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>
                  {customer.previousPoints !== undefined
                    ? `Current Balance: ${customer.previousPoints} pts`
                    : 'Loyalty Reward:'}
                </span>
              </span>
              <span className="text-teal-700 font-bold">
                +{grandTotal > 0 ? Math.floor((grandTotal / 100) * (settings.pointsPer100Rs || 1)) : 0} pts earned on this bill
              </span>
            </div>

            {/* Quick Points Redemption if customer has points */}
            {customer.previousPoints !== undefined && customer.previousPoints > 0 && (
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <span className="text-[10px] text-slate-500">
                  {customer.pointsRedeemed && customer.pointsRedeemed > 0
                    ? `Redeemed ${customer.pointsRedeemed} pts (-${formatCurrency(customer.pointsRedeemed, settings.currencySymbol)})`
                    : `Redeemable up to ${customer.previousPoints} pts`}
                </span>
                <div className="flex items-center gap-1">
                  {customer.pointsRedeemed && customer.pointsRedeemed > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDiscount(Math.max(0, discount - (customer.pointsRedeemed || 0)));
                        setCustomer({ ...customer, pointsRedeemed: 0 });
                      }}
                      className="text-[10px] text-rose-700 hover:text-rose-900 underline font-medium"
                    >
                      Cancel Redemption
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const redeemAmount = Math.min(customer.previousPoints || 0, Math.max(0, Math.floor(rawSubtotal)));
                        if (redeemAmount > 0) {
                          setDiscount(discount + redeemAmount);
                          setCustomer({ ...customer, pointsRedeemed: redeemAmount });
                        }
                      }}
                      className="px-2 py-0.5 rounded-md bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-[10px] transition-all shadow-2xs"
                    >
                      Redeem Points ({customer.previousPoints} pts = -{formatCurrency(customer.previousPoints, settings.currencySymbol)})
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[140px] max-h-[300px] lg:max-h-[360px]">
        {cart.length === 0 ? (
          <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <ShoppingBag className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">
              {settings.language === 'ta' ? 'கார்ட் காலியாக உள்ளது' : 'Your cart is empty'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {settings.language === 'ta' ? 'பொருளைச் சேர்க்க கிளிக் செய்யவும்' : 'Tap any item to add to bill'}
            </p>
          </div>
        ) : (
          cart.map((item) => {
            const unitPrice =
              item.product.specialPrice && item.product.specialPrice > 0
                ? item.product.specialPrice
                : item.product.price;
            const itemTotal = unitPrice * item.qty;

            return (
              <div
                key={item.product.id}
                className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-colors ${
                  item.isReturn
                    ? 'bg-rose-50/70 border-rose-200'
                    : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Product Name, Return Tag & Unit Price */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-800 truncate">
                      {settings.language === 'ta' && item.product.nameTa
                        ? item.product.nameTa
                        : item.product.name}
                    </h4>
                    {item.isReturn && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-600 text-white shrink-0">
                        RETURN
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <span>{formatCurrency(unitPrice, settings.currencySymbol)}</span>
                    <span>×</span>
                    <span>{item.qty}</span>
                    {item.product.specialPrice && item.product.specialPrice < item.product.price && (
                      <span className="text-[10px] text-amber-600 font-semibold">(Special Price)</span>
                    )}
                  </div>
                </div>

                {/* Return toggle button */}
                <button
                  type="button"
                  onClick={() => onToggleItemReturn(item.product.id)}
                  className={`text-[10px] font-bold px-1.5 py-1 rounded-md border shrink-0 transition-colors ${
                    item.isReturn
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-slate-500 border-slate-200 hover:text-rose-600 hover:border-rose-300'
                  }`}
                  title="Toggle Return / Exchange mode for this item"
                >
                  <CornerDownLeft className="w-3 h-3 inline mr-0.5" />
                  <span>{item.isReturn ? 'Return' : 'Normal'}</span>
                </button>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 shrink-0 bg-white border border-slate-200 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => onChangeQty(item.product.id, -1)}
                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-700 active:scale-95 transition-all"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold text-slate-800 tabular-nums">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => onChangeQty(item.product.id, 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-700 active:scale-95 transition-all"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="text-right shrink-0 min-w-[65px]">
                  <div
                    className={`font-bold text-xs sm:text-sm tabular-nums ${
                      item.isReturn ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {item.isReturn ? `-${formatCurrency(itemTotal, settings.currencySymbol)}` : formatCurrency(itemTotal, settings.currencySymbol)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveItem(item.product.id)}
                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Bill Adjustments & Totals */}
      <div className="p-3.5 bg-slate-50/90 border-t border-slate-200/90 space-y-3">
        {/* Quick Discount Buttons */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <Percent className="w-3 h-3 text-teal-600" />
              <span>{settings.language === 'ta' ? 'தள்ளுபடி பட்டன்கள் (Quick Discount)' : 'Quick Discount:'}</span>
            </label>
            {discount > 0 && (
              <button
                type="button"
                onClick={() => setDiscount(0)}
                className="text-[10px] text-rose-600 hover:underline font-semibold"
              >
                Reset Discount
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {[5, 10, 15, 20].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentDiscount(pct)}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-800 text-[11px] font-bold active:scale-95 transition-all"
              >
                {pct}%
              </button>
            ))}
            {[100, 250, 500].map((flat) => (
              <button
                key={flat}
                type="button"
                onClick={() => handleFixedDiscount(flat)}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-800 text-[11px] font-bold active:scale-95 transition-all"
              >
                -{flat}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Discount & Delivery Row */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              {settings.language === 'ta' ? 'தள்ளுபடி தொகை (Rs.)' : 'Custom Discount (Rs.)'}
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={discount === 0 ? '' : discount}
              onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              {settings.language === 'ta' ? 'டெலிவரி (Delivery Fee)' : 'Delivery (COD fee)'}
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={deliveryFee === 0 ? '' : deliveryFee}
              onChange={(e) => setDeliveryFee(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Totals Breakdown */}
        <div className="space-y-1.5 pt-2 border-t border-dashed border-slate-200 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>{settings.language === 'ta' ? 'பொருட்கள் தொகை (Subtotal)' : 'Subtotal'}:</span>
            <span className="font-semibold tabular-nums">{formatCurrency(rawSubtotal, settings.currencySymbol)}</span>
          </div>

          {totalDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>{settings.language === 'ta' ? 'தள்ளுபடி (Discount)' : 'Discount'}:</span>
              <span className="font-semibold tabular-nums">-{formatCurrency(totalDiscount, settings.currencySymbol)}</span>
            </div>
          )}

          {deliveryFee > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>{settings.language === 'ta' ? 'டெலிவரி (Delivery)' : 'Delivery Fee'}:</span>
              <span className="font-semibold tabular-nums">+{formatCurrency(deliveryFee, settings.currencySymbol)}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm sm:text-base font-bold text-teal-800 pt-1.5 border-t border-slate-200">
            <span>{settings.language === 'ta' ? 'மொத்தத் தொகை (Total):' : 'Grand Total:'}</span>
            <span className="text-lg sm:text-xl font-bold text-teal-700 tabular-nums">
              {formatCurrency(grandTotal, settings.currencySymbol)}
            </span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
            {settings.language === 'ta' ? 'பணம் செலுத்தும் முறை (Payment)' : 'Payment Method'}
          </label>
          <div className="grid grid-cols-5 gap-1">
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`py-1.5 px-0.5 rounded-xl text-[10px] font-semibold flex flex-col items-center gap-1 border transition-all ${
                paymentMethod === 'cash'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>{settings.language === 'ta' ? 'பணம்' : 'Cash'}</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('cod')}
              className={`py-1.5 px-0.5 rounded-xl text-[10px] font-semibold flex flex-col items-center gap-1 border transition-all ${
                paymentMethod === 'cod'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>COD</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`py-1.5 px-0.5 rounded-xl text-[10px] font-semibold flex flex-col items-center gap-1 border transition-all ${
                paymentMethod === 'card'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{settings.language === 'ta' ? 'அட்டை' : 'Card'}</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('bank_transfer')}
              className={`py-1.5 px-0.5 rounded-xl text-[10px] font-semibold flex flex-col items-center gap-1 border transition-all ${
                paymentMethod === 'bank_transfer'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>{settings.language === 'ta' ? 'வங்கி' : 'Bank'}</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('pay_later')}
              className={`py-1.5 px-0.5 rounded-xl text-[10px] font-semibold flex flex-col items-center gap-1 border transition-all ${
                paymentMethod === 'pay_later'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Buy Now, Pay Later / Credit"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{settings.language === 'ta' ? 'கடன்' : 'Credit'}</span>
            </button>
          </div>
        </div>

        {/* Cash Tendered & Balance Calculation (when Cash is selected) */}
        {paymentMethod === 'cash' && (
          <div className="p-2.5 rounded-xl bg-white border border-teal-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-700">
                {settings.language === 'ta'
                  ? 'வாடிக்கையாளர் தந்த பணம் (Cash Received):'
                  : 'Cash Received / Tendered:'}
              </label>
              <button
                type="button"
                onClick={handleExactCash}
                className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 hover:bg-teal-100"
              >
                {settings.language === 'ta' ? 'சரியான தொகை' : 'Exact Amount'}
              </button>
            </div>

            <input
              type="number"
              placeholder="0.00"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 tabular-nums"
            />

            {/* Fast Tender Shortcut Chips */}
            <div className="flex flex-wrap gap-1">
              {[100, 500, 1000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickCash(amt, true)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-semibold tabular-nums active:scale-95 transition-all"
                >
                  +{amt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCashReceived('')}
                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md text-[11px] font-semibold active:scale-95 transition-all ml-auto"
              >
                {settings.language === 'ta' ? 'அழி' : 'Clear'}
              </button>
            </div>

            {/* Balance or Due Output */}
            <div
              className={`flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs font-bold ${
                numericCash === 0
                  ? 'text-slate-500'
                  : balance >= 0
                  ? 'text-emerald-700'
                  : 'text-rose-600'
              }`}
            >
              <span>
                {numericCash === 0
                  ? settings.language === 'ta' ? 'மீதத் தொகை:' : 'Balance to return:'
                  : balance >= 0
                  ? settings.language === 'ta' ? 'மீதத் தொகை (Balance To Give):' : 'Balance to return:'
                  : settings.language === 'ta' ? 'குறைவான தொகை (Still Due):' : 'Still due:'}
              </span>
              <span className="text-sm font-extrabold tabular-nums">
                {numericCash > 0
                  ? formatCurrency(Math.abs(balance), settings.currencySymbol)
                  : formatCurrency(0, settings.currencySymbol)}
              </span>
            </div>
          </div>
        )}

        {/* Direct Action 1: "Product Paid" Instant 1-Tap Checkout Button */}
        <button
          type="button"
          disabled={cart.length === 0}
          onClick={handleInstantProductPaid}
          className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all"
          title="Mark full payment received and complete checkout immediately"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{settings.language === 'ta' ? 'பணம் பெறப்பட்டது (Product Paid)' : 'Product Paid (Instant Checkout)'}</span>
        </button>

        {/* Primary Checkout Actions */}
        <div className="grid grid-cols-2 gap-2">
          {/* Print Thermal Receipt */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => onCompleteSale('print')}
            className="w-full py-2.5 px-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{settings.language === 'ta' ? 'பில் அச்சிடு' : 'Print Receipt'}</span>
          </button>

          {/* Delivery Invoice Print Only */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => onCompleteSale('delivery_invoice')}
            className="w-full py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all"
            title="Complete sale and print Delivery Slip only"
          >
            <Truck className="w-3.5 h-3.5 text-teal-400" />
            <span>{settings.language === 'ta' ? 'டெலிவரி பில் மட்டும்' : 'Delivery Bill Only'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Buy After Payment / Pay Later Button */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={handleBuyAfterPayment}
            className="w-full py-2 px-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all"
            title="Complete order now, payment to be made later"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{settings.language === 'ta' ? 'பின்னர் செலுத்துதல்' : 'Buy After Payment'}</span>
          </button>

          {/* WhatsApp Bill Share Button */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => onCompleteSale('whatsapp')}
            className="w-full py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-800 border border-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{settings.language === 'ta' ? 'வாட்ஸ்அப் பில்' : 'WhatsApp'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
