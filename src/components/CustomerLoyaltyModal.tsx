import React, { useState } from 'react';
import {
  Award,
  Search,
  UserPlus,
  Phone,
  MapPin,
  X,
  ArrowRight,
  Star,
  Trash2,
  RotateCcw,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { CustomerProfile, StoreSettings } from '../types.ts';
import { formatCurrency } from '../utils/receipt.ts';

interface CustomerLoyaltyModalProps {
  customers: CustomerProfile[];
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (cust: CustomerProfile) => void;
  onAddCustomer: (newCust: Omit<CustomerProfile, 'id' | 'createdAt' | 'ordersCount' | 'totalSpent'>) => void;
  onDeleteCustomer: (id: string) => void;
  onRestoreCustomer: (id: string) => void;
  onPermanentDeleteCustomer: (id: string) => void;
}

export const CustomerLoyaltyModal: React.FC<CustomerLoyaltyModalProps> = ({
  customers,
  settings,
  isOpen,
  onClose,
  onSelectCustomer,
  onAddCustomer,
  onDeleteCustomer,
  onRestoreCustomer,
  onPermanentDeleteCustomer,
}) => {
  const [tab, setTab] = useState<'active' | 'deleted'>('active');
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [initialPoints, setInitialPoints] = useState('0');

  if (!isOpen) return null;

  const activeCustomers = customers.filter((c) => !c.isDeleted);
  const deletedCustomers = customers.filter((c) => c.isDeleted);

  const displayedList = (tab === 'active' ? activeCustomers : deletedCustomers).filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onAddCustomer({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim() || undefined,
      points: Math.max(0, parseInt(initialPoints) || 0),
      lastVisit: 'Today',
    });

    setName('');
    setPhone('');
    setAddress('');
    setInitialPoints('0');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {settings.language === 'ta'
                  ? 'வாடிக்கையாளர்கள் & விசுவாசப் புள்ளிகள்'
                  : 'Customer Profiles & Loyalty Club'}
              </h3>
              <p className="text-xs text-slate-400">
                100 ரூபாய்க்கு {settings.pointsPer100Rs || 1} புள்ளி · {activeCustomers.length} Active Members
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isAdding ? 'ரத்து' : settings.language === 'ta' ? '+ புதியவர்' : '+ Add Customer'}</span>
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

        {/* Tab Switcher & Search Bar */}
        <div className="px-5 pt-3 pb-2 bg-slate-100 border-b border-slate-200 space-y-2.5">
          {/* Active vs Deleted tabs */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setTab('active')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  tab === 'active'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>
                  {settings.language === 'ta' ? 'செயலில் உள்ளவர்கள்' : 'Active Members'} ({activeCustomers.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTab('deleted')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  tab === 'deleted'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-rose-700'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {settings.language === 'ta' ? 'நீக்கப்பட்டவை' : 'Deleted Options'} ({deletedCustomers.length})
                </span>
              </button>
            </div>

            {tab === 'deleted' && deletedCustomers.length > 0 && (
              <span className="text-[11px] text-rose-700 font-semibold hidden sm:inline">
                Deleted profiles can be restored anytime
              </span>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={
                settings.language === 'ta'
                  ? 'வாடிக்கையாளர் பெயர் / போன் / முகவரி தேடுக...'
                  : 'Search by customer name, phone or address...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
          {/* Add Member Form */}
          {isAdding && (
            <form
              onSubmit={handleCreate}
              className="p-4 bg-white rounded-2xl border border-amber-200 shadow-sm space-y-3"
            >
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>
                  {settings.language === 'ta'
                    ? 'புதிய வாடிக்கையாளரை பதிவு செய்க'
                    : 'Register New Customer Profile'}
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohamed Rizwan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +94 77 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Delivery Address (Optional)</label>
                  <input
                    type="text"
                    placeholder="Street, City, Postal Code"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Starting Points (Bonus)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={initialPoints}
                    onChange={(e) => setInitialPoints(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
                >
                  Save Member
                </button>
              </div>
            </form>
          )}

          {/* Customer Cards List */}
          <div className="space-y-2.5">
            {displayedList.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
                {tab === 'active' ? (
                  <>
                    <Award className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                    <p className="text-sm font-semibold text-slate-700">No active members found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {search ? 'Try clearing your search query' : 'Click "+ Add Customer" to register'}
                    </p>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                    <p className="text-sm font-semibold text-slate-700">Trash is empty</p>
                    <p className="text-xs text-slate-400 mt-0.5">No deleted customer profiles</p>
                  </>
                )}
              </div>
            ) : (
              displayedList.map((cust) => (
                <div
                  key={cust.id}
                  className={`p-3.5 rounded-2xl border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    cust.isDeleted
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-white border-slate-200 hover:border-teal-400'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{cust.name}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold flex items-center gap-0.5 shrink-0">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                        <span>{cust.points} Points</span>
                      </span>

                      {cust.isDeleted && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold">
                          Deleted
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-mono font-medium">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{cust.phone}</span>
                      </span>
                      {cust.address && (
                        <span className="flex items-center gap-1 truncate max-w-[220px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{cust.address}</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {cust.ordersCount} orders · Spent {formatCurrency(cust.totalSpent, settings.currencySymbol)}
                      </span>
                    </div>
                  </div>

                  {/* Actions depending on Tab */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {tab === 'active' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCustomer(cust);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        >
                          <span>{settings.language === 'ta' ? 'கார்ட்டில் சேர்' : 'Select for Cart'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Customer Button */}
                        <button
                          type="button"
                          onClick={() => onDeleteCustomer(cust.id)}
                          className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title={settings.language === 'ta' ? 'நீக்கு (Move to trash)' : 'Delete Customer'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Restore Customer Button */}
                        <button
                          type="button"
                          onClick={() => onRestoreCustomer(cust.id)}
                          className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{settings.language === 'ta' ? 'மீட்டெடு (Restore)' : 'Restore'}</span>
                        </button>

                        {/* Permanent Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`${cust.name} சுயவிவரத்தை நிரந்தரமாக நீக்கவா? (Permanently delete?)`)) {
                              onPermanentDeleteCustomer(cust.id);
                            }
                          }}
                          className="p-1.5 rounded-xl hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Permanently remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Points Value: <strong>1 Pt = Rs. 1</strong>
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
