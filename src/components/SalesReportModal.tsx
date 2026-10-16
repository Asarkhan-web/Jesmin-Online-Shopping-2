import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Download,
  Trash2,
  Calendar,
  X,
  Search,
  ExternalLink,
  CreditCard,
  Banknote,
  Truck,
  Building,
  ShoppingCart,
  CheckCircle2,
  CornerDownLeft,
  Clock,
  FileSpreadsheet,
} from 'lucide-react';
import { SaleRecord, StoreSettings, Product } from '../types.ts';
import { formatCurrency, exportSalesToCSV, exportItemizedAccountingCSV } from '../utils/receipt.ts';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

interface SalesReportModalProps {
  sales: SaleRecord[];
  products?: Product[];
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
  onSelectSaleForReceipt: (sale: SaleRecord) => void;
  onSelectSaleForDeliveryInvoice?: (sale: SaleRecord) => void;
  onQuickReorder: (sale: SaleRecord) => void;
  onMarkSalePaid?: (saleId: string) => void;
  onProcessReturn?: (saleId: string) => void;
  onNotify?: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const SalesReportModal: React.FC<SalesReportModalProps> = ({
  sales,
  products = [],
  settings,
  isOpen,
  onClose,
  onClearHistory,
  onSelectSaleForReceipt,
  onSelectSaleForDeliveryInvoice,
  onQuickReorder,
  onMarkSalePaid,
  onProcessReturn,
  onNotify,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  // Filter sales based on period and search query
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toLocaleDateString();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return sales.filter((s) => {
      // Period filter
      if (filterPeriod === 'today') {
        const saleDateStr = new Date(s.timestamp).toLocaleDateString();
        if (saleDateStr !== todayStr) return false;
      } else if (filterPeriod === 'week') {
        if (s.timestamp < sevenDaysAgo.getTime()) return false;
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchInvoice = s.invoiceNo.toLowerCase().includes(q);
        const matchCust = s.customer?.name?.toLowerCase().includes(q);
        const matchPhone = s.customer?.phone?.toLowerCase().includes(q);
        const matchItem = s.items.some((it) => it.name.toLowerCase().includes(q));
        if (!matchInvoice && !matchCust && !matchPhone && !matchItem) return false;
      }

      return true;
    });
  }, [sales, filterPeriod, searchQuery]);

  // Aggregate Metrics (ignoring or subtracting returns)
  const metrics = useMemo(() => {
    const totalRev = filteredSales.reduce((acc, s) => {
      if (s.paymentStatus === 'returned') return acc;
      return acc + s.grandTotal;
    }, 0);

    const totalCount = filteredSales.length;
    const totalItems = filteredSales.reduce(
      (acc, s) => acc + s.items.reduce((sum, it) => sum + it.qty, 0),
      0
    );
    const avgOrder = totalCount > 0 ? totalRev / totalCount : 0;

    // Map product buy prices for profit margin calculations
    const costMap = new Map<string, number>();
    products.forEach((p) => {
      if (p.buyPrice !== undefined && p.buyPrice > 0) {
        costMap.set(p.id, p.buyPrice);
      }
    });

    let totalCost = 0;
    filteredSales.forEach((s) => {
      if (s.paymentStatus === 'returned') return;
      s.items.forEach((it) => {
        const itemCost = it.buyPrice ?? costMap.get(it.id) ?? Math.round(it.price * 0.65);
        totalCost += itemCost * it.qty;
      });
    });

    const grossProfit = Math.max(0, totalRev - totalCost);
    const profitMargin = totalRev > 0 ? (grossProfit / totalRev) * 100 : 0;

    // Current Stock Inventory Valuation
    const totalStockUnits = products.reduce((acc, p) => acc + (p.stockQty ?? 0), 0);
    const totalStockCostVal = products.reduce(
      (acc, p) => acc + (p.buyPrice ?? Math.round(p.price * 0.65)) * (p.stockQty ?? 0),
      0
    );
    const totalStockRetailVal = products.reduce((acc, p) => acc + p.price * (p.stockQty ?? 0), 0);

    // Breakdown by payment
    const byCash = filteredSales
      .filter((s) => s.paymentMethod === 'cash')
      .reduce((acc, s) => acc + s.grandTotal, 0);
    const byCard = filteredSales
      .filter((s) => s.paymentMethod === 'card')
      .reduce((acc, s) => acc + s.grandTotal, 0);
    const byCod = filteredSales
      .filter((s) => s.paymentMethod === 'cod')
      .reduce((acc, s) => acc + s.grandTotal, 0);
    const byBank = filteredSales
      .filter((s) => s.paymentMethod === 'bank_transfer')
      .reduce((acc, s) => acc + s.grandTotal, 0);

    return {
      totalRev,
      totalCount,
      totalItems,
      avgOrder,
      totalCost,
      grossProfit,
      profitMargin,
      totalStockUnits,
      totalStockCostVal,
      totalStockRetailVal,
      byCash,
      byCard,
      byCod,
      byBank,
    };
  }, [filteredSales, products]);

  // 7-day revenue trend data for Recharts Bar Chart
  const last7DaysData = useMemo(() => {
    const days: {
      dateKey: string;
      label: string;
      shortDate: string;
      revenue: number;
      orders: number;
      units: number;
    }[] = [];

    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString();
      const isToday = i === 0;
      const dayName = isToday
        ? settings.language === 'ta' ? 'இன்று' : 'Today'
        : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayMonth = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Match sales where calendar date matches and not returned
      const daySales = sales.filter((s) => {
        if (s.paymentStatus === 'returned') return false;
        const sDate = new Date(s.timestamp).toLocaleDateString();
        return sDate === dateStr;
      });

      const dayRevenue = daySales.reduce((sum, s) => sum + s.grandTotal, 0);
      const dayUnits = daySales.reduce(
        (sum, s) => sum + s.items.reduce((acc, it) => acc + it.qty, 0),
        0
      );

      days.push({
        dateKey: dateStr,
        label: `${dayName} (${dayMonth})`,
        shortDate: isToday ? `${dayName}` : `${dayName} ${d.getDate()}`,
        revenue: dayRevenue,
        orders: daySales.length,
        units: dayUnits,
      });
    }

    return days;
  }, [sales, settings.language]);

  const total7DaysRev = useMemo(() => {
    return last7DaysData.reduce((acc, d) => acc + d.revenue, 0);
  }, [last7DaysData]);

  const handleExportSummary = () => {
    const targetSales = filteredSales.length > 0 ? filteredSales : sales;
    const ok = exportSalesToCSV(targetSales, 'jesmin_sales_accounting');
    if (ok && onNotify) {
      onNotify(
        settings.language === 'ta'
          ? `${targetSales.length} விற்பனைப் பதிவுகள் CSV ஆக பதிவிறக்கப்பட்டது!`
          : `${targetSales.length} sales records exported to CSV for accounting!`,
        'success'
      );
    }
  };

  const handleExportItemized = () => {
    const targetSales = filteredSales.length > 0 ? filteredSales : sales;
    const ok = exportItemizedAccountingCSV(targetSales);
    if (ok && onNotify) {
      onNotify(
        settings.language === 'ta'
          ? 'பொருட்கள் வாரியான விரிவான கணக்கு CSV பதிவிறக்கப்பட்டது!'
          : 'Detailed itemized accounting CSV exported!',
        'success'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {settings.language === 'ta'
                  ? 'விற்பனை அறிக்கை (Sales Analytics)'
                  : 'Sales Analytics & Accounting Reports'}
              </h3>
              <p className="text-xs text-slate-400">
                {settings.storeName} · {filteredSales.length} {settings.language === 'ta' ? 'பில்கள்' : 'invoices'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Summary CSV Button */}
            <button
              type="button"
              disabled={sales.length === 0}
              onClick={handleExportSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
              title="Download CSV report for accounting & spreadsheets"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{settings.language === 'ta' ? 'CSV அறிக்கை' : 'Export CSV'}</span>
            </button>

            {/* Download Itemized Ledger Button */}
            <button
              type="button"
              disabled={sales.length === 0}
              onClick={handleExportItemized}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-lg text-xs font-medium transition-colors"
              title="Export item-by-item accounting audit CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
              <span>{settings.language === 'ta' ? 'விரிவான கணக்கு' : 'Itemized Ledger'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
          {/* Controls: Filter Period + Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
              <button
                type="button"
                onClick={() => setFilterPeriod('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filterPeriod === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {settings.language === 'ta' ? 'அனைத்தும் (All)' : 'All Time'}
              </button>
              <button
                type="button"
                onClick={() => setFilterPeriod('today')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filterPeriod === 'today'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {settings.language === 'ta' ? 'இன்று (Today)' : 'Today'}
              </button>
              <button
                type="button"
                onClick={() => setFilterPeriod('week')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filterPeriod === 'week'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {settings.language === 'ta' ? '7 நாட்கள் (7 Days)' : 'Last 7 Days'}
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={settings.language === 'ta' ? 'பில் / வாடிக்கையாளர் தேடுக...' : 'Search invoice, customer...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Metric Stats Cards: Revenue, Buy Cost, Gross Profit, Orders */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                {settings.language === 'ta' ? 'மொத்த வருமானம்' : 'Total Sales Revenue'}
              </span>
              <div className="text-xl sm:text-2xl font-bold text-teal-700 tabular-nums">
                {formatCurrency(metrics.totalRev, settings.currencySymbol)}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {metrics.totalCount} {settings.language === 'ta' ? 'பில்கள்' : 'invoices'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                {settings.language === 'ta' ? 'வாங்கிய விலை (Total Cost)' : 'Total Cost of Goods'}
              </span>
              <div className="text-xl sm:text-2xl font-bold text-slate-700 tabular-nums">
                {formatCurrency(metrics.totalCost, settings.currencySymbol)}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {metrics.totalItems} {settings.language === 'ta' ? 'பொருட்கள் விற்றது' : 'units sold'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-2xs bg-gradient-to-br from-emerald-50/50 to-white">
              <span className="text-[11px] font-semibold text-emerald-800 block mb-1">
                {settings.language === 'ta' ? 'மொத்த லாபம் (Gross Profit)' : 'Gross Profit'}
              </span>
              <div className="text-xl sm:text-2xl font-bold text-emerald-700 tabular-nums">
                +{formatCurrency(metrics.grossProfit, settings.currencySymbol)}
              </div>
              <span className="text-[10px] text-emerald-700 font-bold">
                {metrics.profitMargin.toFixed(1)}% {settings.language === 'ta' ? 'லாப விகிதம்' : 'profit margin'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                {settings.language === 'ta' ? 'சராசரி பில் மதிப்பு' : 'Avg Order Value'}
              </span>
              <div className="text-xl sm:text-2xl font-bold text-slate-800 tabular-nums">
                {formatCurrency(metrics.avgOrder, settings.currencySymbol)}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Per checkout
              </span>
            </div>
          </div>

          {/* Current In-Stock Inventory Valuation Bar */}
          {products.length > 0 && (
            <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-teal-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-teal-200 leading-tight">
                    {settings.language === 'ta'
                      ? 'இருப்பு பொருட்கள் மதிப்பு (Stock Valuation)'
                      : 'Catalog Stock Inventory Valuation'}
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    {metrics.totalStockUnits} {settings.language === 'ta' ? 'பொருட்கள் இருப்பில் உள்ளன' : 'total items in stock'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">
                    {settings.language === 'ta' ? 'வாங்கிய மதிப்பு:' : 'Cost Value (Buy):'}
                  </span>
                  <span className="font-bold text-slate-200">
                    {formatCurrency(metrics.totalStockCostVal, settings.currencySymbol)}
                  </span>
                </div>
                <div className="border-l border-slate-700 pl-4">
                  <span className="text-[10px] text-slate-400 block font-sans">
                    {settings.language === 'ta' ? 'விற்பனை மதிப்பு:' : 'Retail Value (Sale):'}
                  </span>
                  <span className="font-bold text-emerald-400">
                    {formatCurrency(metrics.totalStockRetailVal, settings.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Last 7 Days Daily Revenue Trend Bar Chart Card (Recharts) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800 leading-tight">
                    {settings.language === 'ta'
                      ? 'கடந்த 7 நாட்களின் தினசரி வருவாய் (7 Days Revenue Trend)'
                      : 'Last 7 Days Daily Revenue Trend'}
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {settings.language === 'ta' ? 'விற்பனை வரலாற்று வரைபடம்' : 'Daily revenue performance chart'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] text-slate-500 font-medium">
                  {settings.language === 'ta' ? '7 நாட்கள் மொத்தம்:' : '7-Day Total:'}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-teal-700 tabular-nums px-2 py-0.5 rounded-lg bg-teal-50 border border-teal-200">
                  {formatCurrency(total7DaysRev, settings.currencySymbol)}
                </span>
              </div>
            </div>

            {/* Recharts Responsive Container */}
            <div className="w-full h-56 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="shortDate"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`)}
                    width={38}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 space-y-1.5 z-50">
                            <p className="font-bold text-teal-400 text-xs border-b border-slate-800 pb-1">
                              {d.label}
                            </p>
                            <div className="flex justify-between gap-4 text-slate-300 text-[11px]">
                              <span>Revenue:</span>
                              <span className="font-bold text-emerald-400 tabular-nums">
                                {formatCurrency(d.revenue, settings.currencySymbol)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4 text-slate-400 text-[11px]">
                              <span>Orders:</span>
                              <span className="font-semibold text-white tabular-nums">{d.orders}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-slate-400 text-[11px]">
                              <span>Units Sold:</span>
                              <span className="font-semibold text-white tabular-nums">{d.units}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={42}
                  >
                    {last7DaysData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === last7DaysData.length - 1 ? '#0d9488' : '#14b8a6'}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Method Breakdown Strip */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              {settings.language === 'ta' ? 'பணம் செலுத்திய விதம் (Payment Breakdown)' : 'Payment Method Breakdown'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-500 block">Cash (பணம்)</span>
                  <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(metrics.byCash, settings.currencySymbol)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-500 block">COD</span>
                  <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(metrics.byCod, settings.currencySymbol)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <CreditCard className="w-4 h-4 text-sky-600 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-500 block">Card (அட்டை)</span>
                  <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(metrics.byCard, settings.currencySymbol)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Building className="w-4 h-4 text-purple-600 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-500 block">Bank (வங்கி)</span>
                  <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(metrics.byBank, settings.currencySymbol)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-slate-800">
                {settings.language === 'ta' ? 'விற்பனைப் பதிவுகள் (Sales History)' : 'Sales Invoices'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {filteredSales.length} {settings.language === 'ta' ? 'பதிவுகள்' : 'records'}
              </span>
            </div>

            {filteredSales.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                <p className="text-sm font-medium text-slate-600">
                  {settings.language === 'ta' ? 'எந்த விற்பனைப் பதிவும் கிடைக்கவில்லை' : 'No sales records found'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {settings.language === 'ta' ? 'பொருட்களை பில் செய்து சேமிக்கவும்' : 'Completed sales will appear here'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">INVOICE</th>
                      <th className="py-2.5 px-3">DATE</th>
                      <th className="py-2.5 px-3">CUSTOMER</th>
                      <th className="py-2.5 px-3">ITEMS</th>
                      <th className="py-2.5 px-3">STATUS</th>
                      <th className="py-2.5 px-3 text-right">TOTAL</th>
                      <th className="py-2.5 px-3 text-center">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-teal-50/30 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                          #{sale.invoiceNo}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {sale.date}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-slate-800">
                            {sale.customer?.name || '-'}
                          </span>
                          {sale.customer?.phone && (
                            <span className="block text-[10px] text-slate-400">
                              {sale.customer.phone}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {sale.items.reduce((s, it) => s + it.qty, 0)} items
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              sale.paymentStatus === 'returned'
                                ? 'bg-rose-100 text-rose-800'
                                : sale.paymentStatus === 'pending' || sale.paymentMethod === 'pay_later'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {sale.paymentStatus === 'returned'
                              ? 'RETURNED'
                              : sale.paymentStatus === 'pending' || sale.paymentMethod === 'pay_later'
                              ? 'PENDING'
                              : 'PAID'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                          {formatCurrency(sale.grandTotal, settings.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            {/* Product Paid Button if order is pending */}
                            {(sale.paymentStatus === 'pending' || sale.paymentMethod === 'pay_later') && onMarkSalePaid && (
                              <button
                                type="button"
                                onClick={() => onMarkSalePaid(sale.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-2 py-1 rounded-md shadow-2xs transition-all"
                                title="Mark this invoice as Paid"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{settings.language === 'ta' ? 'பணம் பெறப்பட்டது' : 'Paid'}</span>
                              </button>
                            )}

                            {/* Return / Refund button */}
                            {sale.paymentStatus !== 'returned' && onProcessReturn && (
                              <button
                                type="button"
                                onClick={() => onProcessReturn(sale.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 active:scale-95 px-2 py-1 rounded-md border border-rose-200 transition-all"
                                title="Process Return / Refund for this invoice"
                              >
                                <CornerDownLeft className="w-3 h-3" />
                                <span>{settings.language === 'ta' ? 'திருப்புதல்' : 'Return'}</span>
                              </button>
                            )}

                            {/* Quick Reorder button */}
                            <button
                              type="button"
                              onClick={() => onQuickReorder(sale)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-95 px-2.5 py-1 rounded-md shadow-2xs transition-all"
                              title={settings.language === 'ta' ? 'கார்ட்டில் பொருட்களை நகலெடுக்க' : 'Copy items into active cart'}
                            >
                              <ShoppingCart className="w-3 h-3" />
                              <span>{settings.language === 'ta' ? 'மறுஆர்டர்' : 'Reorder'}</span>
                            </button>

                            {/* View Bill button */}
                            <button
                              type="button"
                              onClick={() => onSelectSaleForReceipt(sale)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:scale-95 px-2 py-1 rounded-md transition-colors"
                              title={settings.language === 'ta' ? 'ரசீது பார்க்க' : 'View receipt'}
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>{settings.language === 'ta' ? 'ரசீது' : 'Bill'}</span>
                            </button>

                            {/* Delivery Invoice Slip Button */}
                            {onSelectSaleForDeliveryInvoice && (
                              <button
                                type="button"
                                onClick={() => onSelectSaleForDeliveryInvoice(sale)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 active:scale-95 px-2 py-1 rounded-md transition-colors"
                                title="Print Delivery Waybill / Slip"
                              >
                                <Truck className="w-3 h-3 text-teal-700" />
                                <span>{settings.language === 'ta' ? 'டெலிவரி' : 'Delivery'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Clear History, CSV Export & Close */}
        <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            {!confirmClear ? (
              sales.length > 0 && (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1.5 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{settings.language === 'ta' ? 'பதிவுகளை அழிக்க (Clear History)' : 'Clear History'}</span>
                </button>
              )
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-700 font-semibold">
                  {settings.language === 'ta' ? 'நிச்சயமாக அழிக்கவா?' : 'Confirm delete all?'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClearHistory();
                    setConfirmClear(false);
                  }}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-md"
                >
                  {settings.language === 'ta' ? 'ஆம், அழி' : 'Yes, Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-md"
                >
                  {settings.language === 'ta' ? 'ரத்து' : 'Cancel'}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Download Summary CSV in footer */}
            <button
              type="button"
              disabled={sales.length === 0}
              onClick={handleExportSummary}
              className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-300 disabled:opacity-50 text-teal-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>{settings.language === 'ta' ? `CSV பதிவிறக்கு (${filteredSales.length})` : `Download CSV (${filteredSales.length})`}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
            >
              {settings.language === 'ta' ? 'மூடு (Close)' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
