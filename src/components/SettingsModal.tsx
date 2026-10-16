import React, { useRef, useState } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  X,
  ImagePlus,
  RotateCcw,
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Sparkles,
  Edit3,
} from 'lucide-react';
import { StoreSettings, Product, SaleRecord, CustomerProfile, BackupData } from '../types.ts';

interface SettingsModalProps {
  settings: StoreSettings;
  setSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  products: Product[];
  sales: SaleRecord[];
  customers: CustomerProfile[];
  isOpen: boolean;
  onClose: () => void;
  onRestoreBackup: (backup: BackupData) => void;
  onResetAllData?: () => void;
  onNotify: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  setSettings,
  products,
  sales,
  customers,
  isOpen,
  onClose,
  onRestoreBackup,
  onResetAllData,
  onNotify,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'store' | 'backup' | 'receipt'>('store');

  if (!isOpen) return null;

  const handleSave = () => {
    onNotify(
      settings.language === 'ta'
        ? 'அமைப்புகள் மற்றும் தலைப்பு சேமிக்கப்பட்டது (Settings saved)!'
        : 'Store settings & header saved!',
      'success'
    );
    onClose();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSettings((prev) => ({ ...prev, logoUrl: event.target?.result as string }));
          onNotify(
            settings.language === 'ta' ? 'லோகோ மாற்றப்பட்டது (Logo updated)!' : 'Logo updated!',
            'success'
          );
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Data Backup Export (பேக்கப் பதிவிறக்கு)
  const handleExportBackup = () => {
    try {
      const backupData: BackupData = {
        version: '1.2.0',
        exportedAt: new Date().toISOString(),
        timestamp: Date.now(),
        settings,
        products,
        sales,
        customers,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `jesmin_pos_backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      onNotify(
        settings.language === 'ta'
          ? 'முழு தரவு பேக்கப் பதிவிறக்கம் செய்யப்பட்டது (Backup Downloaded)!'
          : 'Full data backup downloaded successfully!',
        'success'
      );
    } catch (err) {
      onNotify('பேக்கப் பதிவிறக்குவதில் பிழை ஏற்பட்டது', 'error');
    }
  };

  // Data Backup Restore (பேக்கப் ஏற்று)
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as BackupData;

        if (!parsed || (!parsed.products && !parsed.sales && !parsed.settings)) {
          throw new Error('Invalid backup file');
        }

        const confirmMsg =
          settings.language === 'ta'
            ? `பேக்கப் மீட்டெடுக்கவா?\n- தயாரிப்புகள்: ${parsed.products?.length || 0}\n- விற்பனைகள்: ${parsed.sales?.length || 0}\n- வாடிக்கையாளர்கள்: ${parsed.customers?.length || 0}`
            : `Restore backup with ${parsed.products?.length || 0} products, ${parsed.sales?.length || 0} sales, and ${parsed.customers?.length || 0} customers?`;

        if (window.confirm(confirmMsg)) {
          onRestoreBackup(parsed);
          onNotify(
            settings.language === 'ta'
              ? 'தரவு வெற்றிகரமாக மீட்டெடுக்கப்பட்டது (Data Restored)!'
              : 'Data restored successfully from backup!',
            'success'
          );
          onClose();
        }
      } catch (err) {
        onNotify('செல்லுபடியற்ற பேக்கப் கோப்பு (Invalid backup file)', 'error');
      }
    };
    reader.readAsText(file);
    // reset input
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/65 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <input
          type="file"
          ref={logoInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleLogoUpload}
        />

        <input
          type="file"
          ref={backupInputRef}
          accept=".json"
          className="hidden"
          onChange={handleImportBackup}
        />

        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-bold text-base leading-tight">
                {settings.language === 'ta'
                  ? 'கடை & தலைப்பு அமைப்புகள் (Header & Settings)'
                  : 'Store Customization & Settings'}
              </h3>
              <p className="text-xs text-slate-400">
                Header name, customization, logos, and data backup
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

        {/* Tabs: Store Details, Backup & Restore, Receipt Settings */}
        <div className="px-5 pt-3 pb-2 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'store'
                ? 'bg-white text-teal-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{settings.language === 'ta' ? 'தலைப்பு & கடை' : 'Header & Store'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'backup'
                ? 'bg-white text-teal-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span>{settings.language === 'ta' ? 'பேக்கப் & ரீஸ்டோர்' : 'Backup & Restore'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('receipt')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'receipt'
                ? 'bg-white text-teal-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{settings.language === 'ta' ? 'ரசீது அமைப்புகள்' : 'Receipt & Points'}</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs bg-slate-50">
          {activeTab === 'store' && (
            <>
              {/* Store Logo Section */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {settings.language === 'ta' ? 'கடையின் லோகோ (Store Logo)' : 'Store Logo'}
                </label>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt="Logo"
                      className="w-12 h-12 object-contain rounded-lg border bg-white"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-xs">
                      No Logo
                    </div>
                  )}
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>{settings.logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                    </button>
                  </div>
                  {settings.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, logoUrl: undefined }))}
                      className="text-xs text-rose-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Header / Store Name (English) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {settings.language === 'ta'
                    ? 'தலைப்பு பெயர் / கடையின் பெயர் (Store Header Name) *'
                    : 'Store Header Name (Title) *'}
                </label>
                <input
                  type="text"
                  required
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  placeholder="e.g. Jesmin Online Shopping"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Store Name (Tamil) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  கடையின் தமிழ் பெயர் (Store Tamil Title)
                </label>
                <input
                  type="text"
                  value={settings.storeNameTa || ''}
                  onChange={(e) => setSettings({ ...settings, storeNameTa: e.target.value })}
                  placeholder="எ.கா. ஜெஸ்மின் ஆன்லைன் ஷாப்பிங்"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Tagline / Subtitle */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {settings.language === 'ta' ? 'குறிப்புரை / கொள்கை (Tagline / Subtitle)' : 'Tagline / Policy Note'}
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  placeholder="e.g. Fast islandwide delivery · No refund on used electronics"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {settings.language === 'ta' ? 'தொடர்பு / வாட்ஸ்அப் எண் (Phone / WhatsApp)' : 'Phone / WhatsApp'}
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="e.g. +94 77 123 4567"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Store Physical Address */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {settings.language === 'ta' ? 'கடை முகவரி (Store Location / Address)' : 'Store Location / Address'}
                </label>
                <input
                  type="text"
                  value={settings.address || ''}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  placeholder="e.g. 124 Main Street, Kalmunai, Sri Lanka"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Currency & Language */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {settings.language === 'ta' ? 'நாணயக் குறியீடு (Currency)' : 'Currency'}
                  </label>
                  <input
                    type="text"
                    value={settings.currencySymbol}
                    onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {settings.language === 'ta' ? 'மொழி (Language)' : 'Language'}
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value as StoreSettings['language'] })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="bilingual">Bilingual (தமிழ் + English)</option>
                    <option value="ta">தமிழ் மட்டும் (Tamil Only)</option>
                    <option value="en">English Only</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-start gap-3">
                <Database className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-teal-950 text-xs sm:text-sm">
                    {settings.language === 'ta'
                      ? 'முழு தரவு சேமிப்பு & மீட்டெடுப்பு (Backup & Restore)'
                      : 'Full POS Database Backup & Restore'}
                  </h4>
                  <p className="text-[11px] text-teal-800 mt-0.5">
                    Save all catalog products (with buy and sale prices), sales records, customer profiles with loyalty points, and store settings in a single portable JSON file.
                  </p>
                </div>
              </div>

              {/* Current Database Summary */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Current Database Stats:
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-base font-extrabold text-slate-800 font-mono block">
                      {products.length}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Products</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-base font-extrabold text-teal-700 font-mono block">
                      {sales.length}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Past Sales</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-base font-extrabold text-amber-700 font-mono block">
                      {customers.length}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Customers</span>
                  </div>
                </div>
              </div>

              {/* Backup Action 1: Export */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Download className="w-4 h-4 text-teal-600" />
                  <span>1. பேக்கப் பதிவிறக்கு (Download Backup JSON)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Export complete data backup to your computer or phone for safekeeping.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98] transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup File (.json)</span>
                </button>
              </div>

              {/* Backup Action 2: Restore */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>2. பேக்கப் மீட்டெடு (Restore from Backup File)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Upload a previously saved `.json` file to restore products, sales history, and customer points.
                </p>
                <button
                  type="button"
                  onClick={() => backupInputRef.current?.click()}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98] transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload & Restore Backup (.json)</span>
                </button>
              </div>

              {/* Backup Action 3: Reset to Demo */}
              {onResetAllData && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-rose-700 block text-xs">
                      தொடக்க நிலைக்கு மீட்டமை (Reset to Demo)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Reset all catalog products and customers back to default sample data.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('எல்லா தரவுகளையும் ஆரம்ப நிலைக்கு மாற்றவா? (Reset to demo data?)')) {
                        onResetAllData();
                        onNotify('தொடக்க நிலைக்கு மீட்டமைக்கப்பட்டது', 'info');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-rose-300 hover:bg-rose-50 text-rose-700 font-semibold text-xs transition-colors shrink-0"
                  >
                    Reset All
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'receipt' && (
            <div className="space-y-4">
              {/* Receipt Header & Footer Custom Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ரசீது தலைப்புக் குறிப்பு (Receipt Welcome Note)
                </label>
                <input
                  type="text"
                  value={settings.receiptHeaderNote || ''}
                  onChange={(e) => setSettings({ ...settings, receiptHeaderNote: e.target.value })}
                  placeholder="e.g. Welcome to Jesmin Online Shopping!"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ரசீது இறுதிக் குறிப்பு (Receipt Thank You Note)
                </label>
                <input
                  type="text"
                  value={settings.receiptFooterNote || ''}
                  onChange={(e) => setSettings({ ...settings, receiptFooterNote: e.target.value })}
                  placeholder="e.g. நன்றி! மீண்டும் வருக! Thank you!"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Thermal Width Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  அச்சுப் பொறி அளவு (Thermal Receipt Width)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, thermalWidth: '58mm' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      settings.thermalWidth === '58mm'
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    58mm (Small Thermal)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, thermalWidth: '80mm' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      settings.thermalWidth === '80mm'
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    80mm (Standard POS)
                  </button>
                </div>
              </div>

              {/* Loyalty Club Ratio */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    புள்ளிகள் விகிதம் (Points per 100 Rs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.pointsPer100Rs || 1}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        pointsPer100Rs: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    1 புள்ளியின் மதிப்பு (1 Point Value in Rs.)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.pointValueInRs || 1}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        pointValueInRs: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Sound Toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-teal-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="font-semibold text-slate-700">
                    {settings.language === 'ta' ? 'தொடு ஒலி (POS Sound Effects)' : 'Sound Effects'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.soundEnabled ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex justify-between items-center">
          <span className="text-[11px] text-slate-500">
            {activeTab === 'store'
              ? 'Changes take effect immediately'
              : activeTab === 'backup'
              ? 'Backups are stored locally'
              : 'Applies to receipts & customer points'}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100"
            >
              {settings.language === 'ta' ? 'ரத்து' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 shadow-xs"
            >
              {settings.language === 'ta' ? 'சேமி' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
