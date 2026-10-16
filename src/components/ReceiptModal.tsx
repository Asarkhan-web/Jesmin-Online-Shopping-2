import React, { useState } from 'react';
import { Printer, Share2, Copy, Check, X, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { SaleRecord, StoreSettings } from '../types.ts';
import { formatCurrency, generateWhatsAppMessage } from '../utils/receipt.ts';

interface ReceiptModalProps {
  sale: SaleRecord | null;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  onOpenDeliveryInvoice?: (sale: SaleRecord) => void;
  onStartNewSale?: () => void;
  onNotify: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  settings,
  isOpen,
  onClose,
  onPrint,
  onOpenDeliveryInvoice,
  onStartNewSale,
  onNotify,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !sale) return null;

  const paymentLabels: Record<string, string> = {
    cash: 'Cash (பணம்)',
    card: 'Card (அட்டை)',
    bank_transfer: 'Bank Transfer (வங்கி)',
    cod: 'Cash on Delivery (COD)',
    pay_later: 'Pay Later / Credit (கடன்)',
  };

  const handleCopyText = () => {
    const text = decodeURIComponent(generateWhatsAppMessage(sale, settings));
    navigator.clipboard.writeText(text);
    setCopied(true);
    onNotify('பில் விவரங்கள் நகலெடுக்கப்பட்டது (Copied to clipboard)!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppSend = () => {
    const rawMsg = generateWhatsAppMessage(sale, settings);
    const phone = sale.customer?.phone ? sale.customer.phone.replace(/[^0-9]/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${rawMsg}` : `https://wa.me/?text=${rawMsg}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onNotify('WhatsApp திறக்கப்படுகிறது...', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-teal-400" />
            <h3 className="font-semibold text-sm">
              {settings.language === 'ta' ? 'ரசீது முன்னோட்டம் (Receipt Preview)' : 'Receipt Preview'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Receipt Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex justify-center">
          <div
            id="thermal-receipt-print-area"
            className="w-full max-w-[340px] bg-white p-5 rounded-lg shadow-sm border border-slate-200 text-slate-900 font-mono text-xs leading-relaxed"
          >
            {/* Store Logo on Receipt */}
            {settings.logoUrl && (
              <div className="flex justify-center mb-2">
                <img
                  src={settings.logoUrl}
                  alt="Store Logo"
                  className="w-14 h-14 object-contain rounded-lg border border-slate-200"
                />
              </div>
            )}

            {/* Store Brand */}
            <div className="text-center pb-3 border-b border-dashed border-slate-400">
              <h2 className="text-base font-bold tracking-tight text-slate-950 uppercase font-sans">
                {settings.storeName}
              </h2>
              {settings.tagline && (
                <p className="text-[11px] text-slate-600 mt-0.5">{settings.tagline}</p>
              )}
              {settings.phone && (
                <p className="text-[11px] text-slate-700 mt-0.5">WhatsApp / Tel: {settings.phone}</p>
              )}
              <div className="mt-2 text-[10px] text-slate-500">
                <span>Inv: #{sale.invoiceNo}</span>
                <span className="mx-1">·</span>
                <span>{sale.date}</span>
              </div>
              {/* Payment Status Stamp */}
              <div className="mt-1.5">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase font-sans ${
                    sale.paymentStatus === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : sale.paymentStatus === 'returned'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {sale.paymentStatus === 'paid'
                    ? '● PAID / பணம் செலுத்தப்பட்டது'
                    : sale.paymentStatus === 'returned'
                    ? '● RETURN / REFUNDED'
                    : '● PAYMENT PENDING / கடன்'}
                </span>
              </div>
            </div>

            {/* Customer Details if present */}
            {sale.customer && (sale.customer.name || sale.customer.phone || sale.customer.address) && (
              <div className="py-2 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
                {sale.customer.name && <div>Cust: {sale.customer.name}</div>}
                {sale.customer.phone && <div>Tel: {sale.customer.phone}</div>}
                {sale.customer.address && <div className="line-clamp-2">Addr: {sale.customer.address}</div>}
              </div>
            )}

            {/* Line Items Table */}
            <div className="py-3 border-b border-dashed border-slate-400">
              <div className="flex justify-between font-bold pb-1 text-[11px] border-b border-slate-200 mb-1.5">
                <span>ITEM</span>
                <span>QTY x PRICE</span>
                <span>TOTAL</span>
              </div>
              <div className="space-y-1.5">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div className="flex-1 pr-1 truncate font-medium">
                      {item.name}
                      {item.isReturn && <span className="text-[9px] text-rose-600 ml-1">(RET)</span>}
                    </div>
                    <div className="text-center px-1 shrink-0 text-slate-600">
                      {item.qty}×{item.price}
                    </div>
                    <div className={`text-right shrink-0 font-semibold tabular-nums ${item.isReturn ? 'text-rose-600' : ''}`}>
                      {item.isReturn ? `-${item.subtotal.toFixed(2)}` : item.subtotal.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="py-2.5 space-y-1 border-b border-dashed border-slate-400 text-[11px]">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span className="tabular-nums">{formatCurrency(sale.subtotal, settings.currencySymbol)}</span>
              </div>

              {sale.discount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>DISCOUNT:</span>
                  <span className="tabular-nums">-{formatCurrency(sale.discount, settings.currencySymbol)}</span>
                </div>
              )}

              {sale.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>DELIVERY FEE:</span>
                  <span className="tabular-nums">+{formatCurrency(sale.deliveryFee, settings.currencySymbol)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-sm pt-1.5 border-t border-slate-300 text-slate-950 font-sans">
                <span>GRAND TOTAL:</span>
                <span className="tabular-nums">{formatCurrency(sale.grandTotal, settings.currencySymbol)}</span>
              </div>
            </div>

            {/* Payment & Change Info */}
            <div className="py-2 text-[11px] space-y-1 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span>PAYMENT METHOD:</span>
                <span className="font-semibold uppercase">{paymentLabels[sale.paymentMethod] || sale.paymentMethod}</span>
              </div>
              {sale.paymentMethod === 'cash' && sale.cashReceived > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>CASH TENDERED:</span>
                    <span className="tabular-nums">{formatCurrency(sale.cashReceived, settings.currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>CHANGE RETURNED:</span>
                    <span className="tabular-nums">{formatCurrency(sale.balanceGiven, settings.currencySymbol)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Loyalty Points Section on Receipt */}
            {(sale.pointsEarned !== undefined || sale.customerPointsBalance !== undefined) && (
              <div className="py-2 border-b border-dashed border-slate-300 text-[11px] space-y-1">
                <div className="font-bold flex items-center justify-between text-slate-800 font-sans text-[11px]">
                  <span>LOYALTY REWARDS / புள்ளிகள்:</span>
                  <span className="text-amber-600 font-extrabold">★ REWARD</span>
                </div>
                {sale.pointsEarned !== undefined && sale.pointsEarned > 0 && (
                  <div className="flex justify-between">
                    <span>Points Earned (இன்று):</span>
                    <span className="font-bold text-teal-800 tabular-nums">+{sale.pointsEarned} pts</span>
                  </div>
                )}
                {sale.pointsRedeemed !== undefined && sale.pointsRedeemed > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Points Redeemed (பயன்படுத்தியது):</span>
                    <span className="font-bold tabular-nums">-{sale.pointsRedeemed} pts</span>
                  </div>
                )}
                {sale.customerPointsBalance !== undefined && (
                  <div className="flex justify-between font-bold pt-0.5 border-t border-dotted border-slate-200">
                    <span>Total Points Balance:</span>
                    <span className="tabular-nums font-mono text-slate-900">{sale.customerPointsBalance} pts</span>
                  </div>
                )}
              </div>
            )}

            {/* Barcode & Thank You */}
            <div className="text-center pt-3 space-y-2">
              <div className="flex justify-center items-center gap-[2px] h-9 px-4 bg-slate-50 py-1 rounded">
                {[1, 2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1, 2, 3, 1, 2].map(
                  (weight, i) => (
                    <div
                      key={i}
                      className="bg-slate-900 h-full"
                      style={{ width: `${weight}px` }}
                    />
                  )
                )}
              </div>
              <p className="text-[10px] tracking-wider text-slate-500 font-mono">*{sale.invoiceNo}*</p>
              <p className="text-xs font-semibold text-slate-800 font-sans mt-1">
                நன்றி! மீண்டும் வருக!
              </p>
              <p className="text-[10px] text-slate-500">Thank you for your business!</p>
            </div>
          </div>
        </div>

        {/* Bottom Actions - Including "Buy Next / New Sale" */}
        <div className="p-3 bg-white border-t border-slate-200 flex flex-col gap-2">
          {/* Quick Buy Next / Start New Sale button */}
          {onStartNewSale && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartNewSale();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{settings.language === 'ta' ? 'அடுத்த பில் / புதிய விற்பனை (Buy Next)' : 'Buy Next Customer / New Sale'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onPrint}
              className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>{settings.language === 'ta' ? 'அச்சிடு (Print)' : 'Print Receipt'}</span>
            </button>

            {/* Delivery Invoice Only Button */}
            {onOpenDeliveryInvoice && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDeliveryInvoice(sale);
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                title="Print delivery waybill only"
              >
                <Truck className="w-4 h-4 text-teal-400" />
                <span>{settings.language === 'ta' ? 'டெலிவரி பில்' : 'Delivery Bill'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleWhatsAppSend}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              title="Copy Receipt Text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'நகலெடுக்கப்பட்டது' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
