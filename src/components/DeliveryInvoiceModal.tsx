import React from 'react';
import { Truck, Printer, Share2, X, Phone, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { SaleRecord, StoreSettings } from '../types.ts';
import { formatCurrency } from '../utils/receipt.ts';

interface DeliveryInvoiceModalProps {
  sale: SaleRecord | null;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onNotify: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const DeliveryInvoiceModal: React.FC<DeliveryInvoiceModalProps> = ({
  sale,
  settings,
  isOpen,
  onClose,
  onNotify,
}) => {
  if (!isOpen || !sale) return null;

  const isCOD = sale.paymentMethod === 'cod' || sale.paymentStatus === 'pending';
  const customer = sale.customer;

  const handlePrintOnly = () => {
    // Print window
    window.print();
    onNotify(
      settings.language === 'ta'
        ? 'டெலிவரி இன்வாய்ஸ் அச்சிடப்படுகிறது...'
        : 'Printing Delivery Invoice...',
      'info'
    );
  };

  const handleWhatsAppShare = () => {
    const phone = customer?.phone ? customer.phone.replace(/[^0-9]/g, '') : '';
    const itemsText = sale.items.map((it) => `• ${it.qty}x ${it.name}`).join('%0A');
    const codText = isCOD
      ? `*CASH TO COLLECT (COD):* ${formatCurrency(sale.grandTotal, settings.currencySymbol)}`
      : `*PAYMENT STATUS:* PAID IN ADVANCE (%E2%9C%85 DO NOT COLLECT CASH)`;

    const text = `*${encodeURIComponent(settings.storeName)} - DELIVERY INVOICE*%0A` +
      `--------------------------------%0A` +
      `*Invoice #:* ${sale.invoiceNo}%0A` +
      `*Date:* ${sale.date}%0A%0A` +
      `*CUSTOMER DETAILS:*%0A` +
      `*Name:* ${encodeURIComponent(customer?.name || 'Customer')}%0A` +
      `*Phone:* ${encodeURIComponent(customer?.phone || 'N/A')}%0A` +
      `*Address:* ${encodeURIComponent(customer?.address || 'N/A')}%0A%0A` +
      `*PACKAGE ITEMS:*%0A${itemsText}%0A%0A` +
      `*Delivery Fee:* ${formatCurrency(sale.deliveryFee, settings.currencySymbol)}%0A` +
      `*Total Order:* ${formatCurrency(sale.grandTotal, settings.currencySymbol)}%0A` +
      `${codText}%0A` +
      `--------------------------------%0A` +
      `*Rider Note:* Please inspect parcel upon delivery. Thank you!`;

    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onNotify('WhatsApp Delivery Slip திறக்கப்படுகிறது...', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {settings.language === 'ta'
                  ? 'டெலிவரி இன்வாய்ஸ் மட்டும் (Delivery Invoice Only)'
                  : 'Delivery Invoice / Waybill Only'}
              </h3>
              <p className="text-[11px] text-teal-200/80">
                Courier & Rider Delivery Slip · #{sale.invoiceNo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintOnly}
              className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{settings.language === 'ta' ? 'அச்சிடு (Print Only)' : 'Print Only'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Delivery Invoice Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex justify-center">
          <div
            id="delivery-invoice-print-area"
            className="w-full max-w-[680px] bg-white rounded-xl border border-slate-300 shadow-sm p-6 text-slate-800"
          >
            {/* Store & Waybill Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b-2 border-slate-900 gap-3">
              <div className="flex items-center gap-3">
                {settings.logoUrl && (
                  <img
                    src={settings.logoUrl}
                    alt="Store Logo"
                    className="w-12 h-12 object-contain rounded-lg border bg-white"
                  />
                )}
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                    {settings.storeName}
                  </h1>
                  {settings.storeNameTa && (
                    <p className="text-xs text-slate-600 font-semibold">{settings.storeNameTa}</p>
                  )}
                  <p className="text-xs text-slate-500 font-medium">
                    {settings.phone ? `Phone / WhatsApp: ${settings.phone}` : settings.tagline}
                  </p>
                  {settings.address && (
                    <p className="text-xs text-slate-400">{settings.address}</p>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-lg w-full sm:w-auto border sm:border-0 border-slate-200">
                <span className="inline-block px-2.5 py-1 bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider rounded-md mb-1">
                  DELIVERY WAYBILL
                </span>
                <p className="font-mono font-bold text-sm text-slate-900">
                  INV: #{sale.invoiceNo}
                </p>
                <p className="text-xs text-slate-500">Date: {sale.date}</p>
              </div>
            </div>

            {/* Recipient Destination Box */}
            <div className="mt-4 p-3.5 rounded-xl border-2 border-dashed border-teal-500/70 bg-teal-50/40">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-teal-900 mb-2">
                <MapPin className="w-3.5 h-3.5 text-teal-700" />
                <span>DELIVERY DESTINATION / பெறுநர் விபரம்</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Customer Name</span>
                  <p className="text-sm font-bold text-slate-900">
                    {customer?.name || 'Valued Customer / வாடிக்கையாளர்'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Contact Phone</span>
                  <p className="text-sm font-bold font-mono text-slate-900 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-teal-700" />
                    <span>{customer?.phone || 'No phone provided'}</span>
                  </p>
                </div>

                <div className="sm:col-span-2 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Delivery Address</span>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed bg-white/80 p-2 rounded-lg border border-teal-200">
                    {customer?.address || 'Self pickup or address pending / முகவரி இல்லை'}
                  </p>
                </div>
              </div>
            </div>

            {/* Package Contents Table */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Package Contents / பொட்டல விவரம் ({sale.items.length} items)
              </h4>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Item Description</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Unit Price</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sale.items.map((it, idx) => (
                      <tr key={it.id || idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {it.name}
                          {it.isReturn && (
                            <span className="ml-1 text-[10px] text-rose-600 font-bold">(Return)</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center font-bold">{it.qty}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600">
                          {formatCurrency(it.price, settings.currencySymbol)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(it.subtotal, settings.currencySymbol)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary & Cash Collection Box */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
              {/* Cash Collection Banner */}
              <div
                className={`p-3.5 rounded-xl border-2 flex flex-col justify-between ${
                  isCOD
                    ? 'border-amber-500 bg-amber-50/80 text-amber-950'
                    : 'border-emerald-500 bg-emerald-50/80 text-emerald-950'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-black text-xs uppercase mb-1">
                    {isCOD ? (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>{isCOD ? 'CASH ON DELIVERY (COD)' : 'PREPAID ORDER'}</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-600">
                    {isCOD
                      ? 'Rider must collect exact amount before handing over parcel'
                      : 'Payment received via Bank / Online. Do NOT collect money from customer!'}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-baseline justify-between">
                  <span className="text-xs font-bold uppercase">
                    {isCOD ? 'Collect from Customer:' : 'Amount Paid:'}
                  </span>
                  <span className="text-lg font-black font-mono">
                    {formatCurrency(sale.grandTotal, settings.currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Order Cost Breakdown */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatCurrency(sale.subtotal, settings.currencySymbol)}</span>
                </div>
                {sale.discount > 0 && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>Discount:</span>
                    <span className="font-mono">-{formatCurrency(sale.discount, settings.currencySymbol)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge:</span>
                  <span className="font-mono">
                    {sale.deliveryFee > 0
                      ? formatCurrency(sale.deliveryFee, settings.currencySymbol)
                      : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Total Due:</span>
                  <span className="font-mono">{formatCurrency(sale.grandTotal, settings.currencySymbol)}</span>
                </div>
              </div>
            </div>

            {/* Courier Dispatch Signatures */}
            <div className="mt-5 pt-4 border-t border-slate-300 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-6">
                  Dispatched By / Courier Rider:
                </p>
                <div className="border-b border-slate-400 pb-0.5"></div>
                <p className="text-[10px] text-slate-400 mt-1">Name & Signature</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-6">
                  Received By / Customer Signature:
                </p>
                <div className="border-b border-slate-400 pb-0.5"></div>
                <p className="text-[10px] text-slate-400 mt-1">Date & Time Received</p>
              </div>
            </div>

            <div className="mt-4 text-center text-[10px] text-slate-400">
              {settings.storeName} · Delivery Slip & Waybill · Printed via Jesmin POS
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp Rider</span>
            </button>

            <button
              type="button"
              onClick={handlePrintOnly}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>{settings.language === 'ta' ? 'டெலிவரி பில் அச்சிடு' : 'Print Delivery Slip'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
