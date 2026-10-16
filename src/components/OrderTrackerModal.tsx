import React, { useState } from 'react';
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  X,
  Phone,
  Calendar,
  AlertCircle,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { SaleRecord, StoreSettings } from '../types.ts';
import { formatCurrency } from '../utils/receipt.ts';

interface OrderTrackerModalProps {
  sales: SaleRecord[];
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onSelectSaleForReceipt?: (sale: SaleRecord) => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  sales,
  settings,
  isOpen,
  onClose,
  onSelectSaleForReceipt,
}) => {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();
  const matchedOrders = sales.filter((s) => {
    if (!trimmed) return false;
    const matchInv = s.invoiceNo.toLowerCase().includes(trimmed);
    const matchPhone = s.customer?.phone ? s.customer.phone.replace(/[^0-9]/g, '').includes(trimmed.replace(/[^0-9]/g, '')) : false;
    const matchName = s.customer?.name?.toLowerCase().includes(trimmed);
    return matchInv || matchPhone || matchName;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {settings.language === 'ta' ? 'ஆர்டர் கண்காணிப்பு (Track Order Status)' : 'Track Order Status'}
              </h3>
              <p className="text-xs text-slate-400">
                Enter your Invoice # or WhatsApp Phone Number
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={
                  settings.language === 'ta'
                    ? 'பில் எண் (#JOS...) அல்லது போன் எண் (+94...)'
                    : 'Search by Invoice No (#JOS...) or Phone number'
                }
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearched(true);
                }}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Orders Results */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-100">
          {!searched && matchedOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Package className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-sm font-bold text-slate-700">ஆர்டரைத் தேடுக (Track Your Order)</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Type your invoice number (e.g. JOS-...) or mobile phone number to check delivery and dispatch status.
              </p>
            </div>
          ) : matchedOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-rose-300 stroke-1" />
              <p className="text-sm font-bold text-slate-700">எந்த ஆர்டரும் கிடைக்கவில்லை</p>
              <p className="text-xs text-slate-400 mt-1">
                No orders matched "{query}". Please check the invoice number or phone number entered.
              </p>
            </div>
          ) : (
            matchedOrders.map((sale) => {
              const isPaid = sale.paymentStatus === 'paid';
              const isCOD = sale.paymentMethod === 'cod' || sale.paymentStatus === 'pending';

              return (
                <div
                  key={sale.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
                >
                  {/* Status & Invoice No */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-mono font-bold text-sm text-slate-900">
                        #{sale.invoiceNo}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-2 block sm:inline">
                        {sale.date}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : sale.paymentStatus === 'returned'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isPaid ? 'PAID / செலுத்தப்பட்டது' : 'PENDING COD / பணம் பெறப்படவேண்டும்'}
                    </span>
                  </div>

                  {/* Order Timeline Visual */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-bold">
                      <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-teal-600" />
                      <span>1. Order Confirmed</span>
                    </div>
                    <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-bold">
                      <Truck className="w-4 h-4 mx-auto mb-1 text-teal-600" />
                      <span>2. Dispatched with Rider</span>
                    </div>
                    <div className={`p-2 rounded-xl border font-bold ${
                      isPaid
                        ? 'bg-teal-50 border-teal-200 text-teal-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <Package className="w-4 h-4 mx-auto mb-1" />
                      <span>3. Delivered</span>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-600 block text-[11px] uppercase">
                      Items Ordered:
                    </span>
                    {sale.items.map((it, i) => (
                      <div key={i} className="flex justify-between text-slate-700">
                        <span>
                          {it.qty}× {it.name}
                        </span>
                        <span className="font-mono font-bold">
                          {formatCurrency(it.subtotal, settings.currencySymbol)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Customer details & Total */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1 text-xs">
                    <div>
                      {sale.customer?.name && (
                        <p className="font-bold text-slate-800">{sale.customer.name}</p>
                      )}
                      {sale.customer?.address && (
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">
                          {sale.customer.address}
                        </p>
                      )}
                    </div>

                    <div className="text-right w-full sm:w-auto">
                      <span className="text-[10px] text-slate-400 uppercase block">Total Due:</span>
                      <span className="text-base font-black text-teal-700 font-mono">
                        {formatCurrency(sale.grandTotal, settings.currencySymbol)}
                      </span>
                    </div>
                  </div>

                  {onSelectSaleForReceipt && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectSaleForReceipt(sale);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Official Digital Receipt / Bill</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            For support or delivery inquiries, call <strong>{settings.phone}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
