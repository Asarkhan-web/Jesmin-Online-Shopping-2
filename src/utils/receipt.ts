import { SaleRecord, StoreSettings } from '../types.ts';

export function formatCurrency(amount: number, symbol: string = 'Rs.'): string {
  const formatted = Math.abs(amount).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-${symbol} ${formatted}` : `${symbol} ${formatted}`;
}

export function generateInvoiceNo(existingCount: number = 0): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const seq = String((existingCount % 9999) + 1).padStart(4, '0');
  return `JOS-${yyyy}${mm}${dd}-${seq}`;
}

export function generateWhatsAppMessage(sale: SaleRecord, settings: StoreSettings): string {
  const lines: string[] = [];

  lines.push(`🛍️ *${settings.storeName.toUpperCase()}*`);
  if (settings.tagline) {
    lines.push(`_${settings.tagline}_`);
  }
  lines.push(`────────────────────────`);
  lines.push(`📄 *Invoice / பில்:* #${sale.invoiceNo}`);
  lines.push(`📅 *Date:* ${sale.date}`);
  if (sale.customer?.name) {
    lines.push(`👤 *Customer:* ${sale.customer.name}`);
  }
  if (sale.customer?.phone) {
    lines.push(`📞 *Phone:* ${sale.customer.phone}`);
  }
  if (sale.customer?.address) {
    lines.push(`📍 *Delivery Address:* ${sale.customer.address}`);
  }
  lines.push(`────────────────────────`);
  lines.push(`*ITEMS / பொருட்கள்:*`);

  sale.items.forEach((item, index) => {
    lines.push(
      `${index + 1}. *${item.name}* ${item.isReturn ? '(RETURN)' : ''}`
    );
    lines.push(
      `   ${item.qty} × ${formatCurrency(item.price, settings.currencySymbol)} = *${item.isReturn ? '-' : ''}${formatCurrency(item.subtotal, settings.currencySymbol)}*`
    );
  });

  lines.push(`────────────────────────`);
  lines.push(`Subtotal: ${formatCurrency(sale.subtotal, settings.currencySymbol)}`);
  if (sale.discount > 0) {
    lines.push(`Discount / தள்ளுபடி: -${formatCurrency(sale.discount, settings.currencySymbol)}`);
  }
  if (sale.deliveryFee > 0) {
    lines.push(`Delivery Fee / டெலிவரி: +${formatCurrency(sale.deliveryFee, settings.currencySymbol)}`);
  }
  lines.push(`💰 *Grand Total / மொத்தம்: ${formatCurrency(sale.grandTotal, settings.currencySymbol)}*`);
  lines.push(`────────────────────────`);

  const paymentLabels: Record<string, string> = {
    cash: 'Cash (பணம்)',
    card: 'Card (அட்டை)',
    bank_transfer: 'Bank Transfer (வங்கி)',
    cod: 'Cash on Delivery (COD)',
    pay_later: 'Pay Later / Credit (கடன்)',
  };

  lines.push(`Payment Method: *${paymentLabels[sale.paymentMethod] || sale.paymentMethod}*`);
  lines.push(`Payment Status: *${(sale.paymentStatus || 'paid').toUpperCase()}*`);

  if (sale.paymentMethod === 'cash' && sale.cashReceived > 0) {
    lines.push(`Cash Received: ${formatCurrency(sale.cashReceived, settings.currencySymbol)}`);
    if (sale.balanceGiven >= 0) {
      lines.push(`Balance Returned: ${formatCurrency(sale.balanceGiven, settings.currencySymbol)}`);
    }
  }

  if (sale.pointsEarned !== undefined || sale.customerPointsBalance !== undefined) {
    lines.push(`────────────────────────`);
    if (sale.pointsEarned && sale.pointsEarned > 0) {
      lines.push(`🎁 *Loyalty Points Earned / புள்ளிகள்:* +${sale.pointsEarned} pts`);
    }
    if (sale.pointsRedeemed && sale.pointsRedeemed > 0) {
      lines.push(`💎 *Points Redeemed:* -${sale.pointsRedeemed} pts`);
    }
    if (sale.customerPointsBalance !== undefined) {
      lines.push(`⭐ *Total Loyalty Balance:* ${sale.customerPointsBalance} pts`);
    }
  }

  lines.push(`────────────────────────`);
  lines.push(`🙏 நன்றி! மீண்டும் வருக! (Thank you for shopping with us!)`);
  if (settings.phone) {
    lines.push(`📞 Contact/WhatsApp: ${settings.phone}`);
  }

  return encodeURIComponent(lines.join('\n'));
}

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exports complete sales transaction history to a CSV spreadsheet
 * Formatted specifically for external accounting software (Excel, Google Sheets, Tally, QuickBooks)
 */
export function exportSalesToCSV(sales: SaleRecord[], filenamePrefix = 'jesmin_accounting_sales'): boolean {
  if (sales.length === 0) return false;

  const headers = [
    'Invoice No',
    'Date & Time',
    'Customer Name',
    'Customer Phone',
    'Delivery Address',
    'Items Summary',
    'Total Units',
    'Subtotal (Rs)',
    'Discount (Rs)',
    'Delivery Fee (Rs)',
    'Net Grand Total (Rs)',
    'Payment Method',
    'Payment Status',
    'Cash Received (Rs)',
    'Change Given (Rs)',
    'Transaction Type',
  ];

  const rows = sales.map((s) => {
    const itemsSummary = s.items
      .map((i) => `${i.qty}x ${i.name} (Rs. ${i.price.toFixed(2)})${i.isReturn ? ' [RETURN]' : ''}`)
      .join('; ');
    const totalUnits = s.items.reduce((sum, i) => sum + i.qty, 0);
    const transType = s.isReturnRecord || s.paymentStatus === 'returned' ? 'Return / Refund' : 'Standard Sale';

    return [
      escapeCSV(s.invoiceNo),
      escapeCSV(s.date),
      escapeCSV(s.customer?.name || 'Walk-in Customer'),
      escapeCSV(s.customer?.phone || ''),
      escapeCSV(s.customer?.address || ''),
      escapeCSV(itemsSummary),
      escapeCSV(totalUnits),
      escapeCSV(s.subtotal.toFixed(2)),
      escapeCSV(s.discount.toFixed(2)),
      escapeCSV(s.deliveryFee.toFixed(2)),
      escapeCSV(s.grandTotal.toFixed(2)),
      escapeCSV(s.paymentMethod.toUpperCase()),
      escapeCSV((s.paymentStatus || 'paid').toUpperCase()),
      escapeCSV((s.cashReceived || 0).toFixed(2)),
      escapeCSV((s.balanceGiven || 0).toFixed(2)),
      escapeCSV(transType),
    ].join(',');
  });

  // UTF-8 BOM prefix (\uFEFF) ensures Excel and external tools display symbols & Tamil text properly
  const csvString = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Exports line-by-line itemized sales ledger for detailed inventory accounting & COGS audit
 */
export function exportItemizedAccountingCSV(sales: SaleRecord[]): boolean {
  if (sales.length === 0) return false;

  const headers = [
    'Invoice No',
    'Date & Time',
    'Customer Name',
    'Customer Phone',
    'Product ID',
    'Item Name',
    'Regular Price (Rs)',
    'Sold Unit Price (Rs)',
    'Quantity',
    'Line Subtotal (Rs)',
    'Line Type',
    'Payment Method',
    'Payment Status',
  ];

  const rows: string[] = [];

  sales.forEach((s) => {
    s.items.forEach((item) => {
      rows.push(
        [
          escapeCSV(s.invoiceNo),
          escapeCSV(s.date),
          escapeCSV(s.customer?.name || 'Walk-in Customer'),
          escapeCSV(s.customer?.phone || ''),
          escapeCSV(item.id),
          escapeCSV(item.name),
          escapeCSV((item.regularPrice || item.price).toFixed(2)),
          escapeCSV(item.price.toFixed(2)),
          escapeCSV(item.qty),
          escapeCSV(item.subtotal.toFixed(2)),
          escapeCSV(item.isReturn ? 'RETURN' : 'SALE'),
          escapeCSV(s.paymentMethod.toUpperCase()),
          escapeCSV((s.paymentStatus || 'paid').toUpperCase()),
        ].join(',')
      );
    });
  });

  const csvString = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `jesmin_itemized_accounting_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
