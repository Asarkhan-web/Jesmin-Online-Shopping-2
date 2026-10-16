import React, { useState, useRef } from 'react';
import { Package, Plus, Trash2, Edit3, RotateCcw, X, Check, ImagePlus, Tag } from 'lucide-react';
import { Product, StoreSettings } from '../types.ts';
import { CATEGORIES } from '../data/defaultProducts.ts';
import { formatCurrency } from '../utils/receipt.ts';

interface ProductManagerModalProps {
  products: Product[];
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (newProd: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onResetProducts: () => void;
  onNotify: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const AVAILABLE_ICONS = [
  'Speaker',
  'Headphones',
  'Utensils',
  'Lightbulb',
  'CloudRain',
  'Sparkles',
  'Watch',
  'Fan',
  'Package',
];

export const ProductManagerModal: React.FC<ProductManagerModalProps> = ({
  products,
  settings,
  isOpen,
  onClose,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetProducts,
  onNotify,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // New product form fields
  const [name, setName] = useState('');
  const [nameTa, setNameTa] = useState('');
  const [price, setPrice] = useState(''); // Sale price (விற்பனை விலை)
  const [buyPrice, setBuyPrice] = useState(''); // Buy / Cost price (வாங்கிய விலை)
  const [stockQty, setStockQty] = useState('20'); // Stock on hand (இருப்பு எண்ணிக்கை)
  const [specialPrice, setSpecialPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1] || 'General');
  const [iconName, setIconName] = useState('Package');
  const [image, setImage] = useState('');

  // Edit fields
  const [editPrice, setEditPrice] = useState('');
  const [editBuyPrice, setEditBuyPrice] = useState('');
  const [editStockQty, setEditStockQty] = useState('');
  const [editSpecialPrice, setEditSpecialPrice] = useState('');
  const [editName, setEditName] = useState('');
  const [editNameTa, setEditNameTa] = useState('');
  const [editImage, setEditImage] = useState('');

  const newImageInputRef = useRef<HTMLInputElement>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleStartEdit = (prod: Product) => {
    setEditingId(prod.id);
    setEditName(prod.name);
    setEditNameTa(prod.nameTa || '');
    setEditPrice(prod.price.toString());
    setEditBuyPrice(prod.buyPrice !== undefined ? prod.buyPrice.toString() : '');
    setEditStockQty(prod.stockQty !== undefined ? prod.stockQty.toString() : '0');
    setEditSpecialPrice(prod.specialPrice ? prod.specialPrice.toString() : '');
    setEditImage(prod.image || '');
  };

  const handleSaveEdit = (prod: Product) => {
    const numericPrice = parseFloat(editPrice);
    const numericBuyPrice = editBuyPrice ? parseFloat(editBuyPrice) : undefined;
    const numericStockQty = editStockQty !== '' ? parseInt(editStockQty) : undefined;
    const numericSpecialPrice = editSpecialPrice ? parseFloat(editSpecialPrice) : undefined;

    if (!editName.trim() || isNaN(numericPrice) || numericPrice <= 0) {
      onNotify('செல்லுபடியான பெயர் மற்றும் விற்பனை விலையை உள்ளிடவும்', 'error');
      return;
    }

    onUpdateProduct({
      ...prod,
      name: editName.trim(),
      nameTa: editNameTa.trim() || undefined,
      price: numericPrice,
      buyPrice: numericBuyPrice && numericBuyPrice >= 0 ? numericBuyPrice : undefined,
      stockQty: numericStockQty !== undefined && numericStockQty >= 0 ? numericStockQty : 0,
      specialPrice: numericSpecialPrice && numericSpecialPrice > 0 ? numericSpecialPrice : undefined,
      image: editImage.trim() || undefined,
    });
    setEditingId(null);
    onNotify('பொருள் புதுப்பிக்கப்பட்டது (Product updated)!', 'success');
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = parseFloat(price);
    const numericBuyPrice = buyPrice ? parseFloat(buyPrice) : undefined;
    const numericStockQty = stockQty !== '' ? parseInt(stockQty) : 20;
    const numericSpecialPrice = specialPrice ? parseFloat(specialPrice) : undefined;

    if (!name.trim() || isNaN(numericPrice) || numericPrice <= 0) {
      onNotify('பொருளின் பெயர் மற்றும் விற்பனை விலையை உள்ளிடவும்', 'error');
      return;
    }

    onAddProduct({
      name: name.trim(),
      nameTa: nameTa.trim() || undefined,
      price: numericPrice,
      buyPrice: numericBuyPrice && numericBuyPrice >= 0 ? numericBuyPrice : undefined,
      stockQty: numericStockQty !== undefined && numericStockQty >= 0 ? numericStockQty : 20,
      specialPrice: numericSpecialPrice && numericSpecialPrice > 0 ? numericSpecialPrice : undefined,
      category,
      iconName,
      image: image.trim() || undefined,
      inStock: (numericStockQty ?? 1) > 0,
    });

    setName('');
    setNameTa('');
    setPrice('');
    setBuyPrice('');
    setStockQty('20');
    setSpecialPrice('');
    setImage('');
    setIsAdding(false);
    onNotify('புதிய பொருள் சேர்க்கப்பட்டது (Product added)!', 'success');
  };

  const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Hidden inputs */}
        <input
          type="file"
          ref={newImageInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleNewImageUpload}
        />
        <input
          type="file"
          ref={editImageInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleEditImageUpload}
        />

        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-bold text-base">
                {settings.language === 'ta'
                  ? 'பொருட்கள் மேலாண்மை (Inventory & Products)'
                  : 'Manage Store Products'}
              </h3>
              <p className="text-xs text-slate-400">
                {products.length} {settings.language === 'ta' ? 'தயாரிப்புகள்' : 'products in catalog'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAdding ? 'ரத்து' : settings.language === 'ta' ? 'புதிய பொருள்' : 'Add Item'}</span>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
          {/* Add Product Form */}
          {isAdding && (
            <form
              onSubmit={handleCreateProduct}
              className="p-4 bg-white rounded-2xl border border-teal-200 shadow-sm space-y-3"
            >
              <h4 className="font-bold text-xs uppercase tracking-wider text-teal-800">
                {settings.language === 'ta' ? 'புதிய பொருளைச் சேர்க்கவும்' : 'Add New Product'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    English Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wireless Keyboard"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    தமிழ் பெயர் (Tamil Name)
                  </label>
                  <input
                    type="text"
                    placeholder="எ.கா. கம்பியில்லா விசைப்பலகை"
                    value={nameTa}
                    onChange={(e) => setNameTa(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    விற்பனை விலை (Sale Price) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 2800"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    வாங்கிய விலை / அடக்கம் (Buy / Cost Price)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 1800"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    இருப்பு எண்ணிக்கை (Stock in Hand)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 20"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-amber-700 mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>சிறப்பு விலை (Special Price / Discount)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="Optional (e.g. 2500)"
                    value={specialPrice}
                    onChange={(e) => setSpecialPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-amber-50/50 border border-amber-200 rounded-lg text-xs font-bold text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Profit Margin Preview if both price and buyPrice are provided */}
                {parseFloat(price) > 0 && parseFloat(buyPrice) > 0 && (
                  <div className="sm:col-span-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between text-emerald-900">
                    <span className="font-semibold">
                      லாப விகிதம் (Estimated Profit per Unit):
                    </span>
                    <span className="font-mono font-bold">
                      {formatCurrency(
                        (parseFloat(specialPrice) || parseFloat(price)) - parseFloat(buyPrice),
                        settings.currencySymbol
                      )}{' '}
                      (
                      {(
                        (((parseFloat(specialPrice) || parseFloat(price)) - parseFloat(buyPrice)) /
                          (parseFloat(specialPrice) || parseFloat(price))) *
                        100
                      ).toFixed(1)}
                      % Margin)
                    </span>
                  </div>
                )}

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    பிரிவு (Category)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Image input & Upload Button */}
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    படம் / புகைப்படம் (Product Image)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Image URL or upload..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => newImageInputRef.current?.click()}
                      className="px-2.5 py-2 bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  </div>
                  {image && (
                    <div className="mt-2 flex items-center gap-2">
                      <img src={image} alt="Preview" className="w-10 h-10 object-cover rounded-md border" />
                      <span className="text-[11px] text-emerald-600 font-semibold">Image loaded</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1 text-xs">
                  சின்னம் (Icon Fallback)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIconName(ic)}
                      className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors ${
                        iconName === ic
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  {settings.language === 'ta' ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
                >
                  {settings.language === 'ta' ? 'சேமி' : 'Save Product'}
                </button>
              </div>
            </form>
          )}

          {/* Search Products Bar */}
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              placeholder={settings.language === 'ta' ? 'பொருட்கள் தேடுக (Search catalog)...' : 'Search catalog products...'}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full max-w-sm px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
            />
            <span className="text-xs text-slate-500 font-medium shrink-0">
              {products.filter((p) => {
                const q = searchFilter.toLowerCase();
                return p.name.toLowerCase().includes(q) || (p.nameTa && p.nameTa.toLowerCase().includes(q)) || p.category.toLowerCase().includes(q);
              }).length} items
            </span>
          </div>

          {/* Product List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {products
                .filter((p) => {
                  const q = searchFilter.toLowerCase();
                  return (
                    p.name.toLowerCase().includes(q) ||
                    (p.nameTa && p.nameTa.toLowerCase().includes(q)) ||
                    p.category.toLowerCase().includes(q)
                  );
                })
                .map((p) => {
                  const isEditing = editingId === p.id;
                  const effectiveSell = p.specialPrice && p.specialPrice > 0 ? p.specialPrice : p.price;
                  const unitProfit = p.buyPrice !== undefined ? effectiveSell - p.buyPrice : undefined;

                  return (
                    <div
                      key={p.id}
                      className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                    >
                      {isEditing ? (
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Name</span>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Name"
                              className="w-full px-2 py-1 bg-white border border-teal-400 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Sale Price</span>
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              placeholder="Sale Price"
                              className="w-full px-2 py-1 bg-white border border-teal-400 rounded-lg text-xs font-bold text-emerald-700"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Buy / Cost</span>
                            <input
                              type="number"
                              value={editBuyPrice}
                              onChange={(e) => setEditBuyPrice(e.target.value)}
                              placeholder="Buy Price"
                              className="w-full px-2 py-1 bg-white border border-teal-400 rounded-lg text-xs font-semibold text-slate-700"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Stock Qty</span>
                            <input
                              type="number"
                              value={editStockQty}
                              onChange={(e) => setEditStockQty(e.target.value)}
                              placeholder="Stock Qty"
                              className="w-full px-2 py-1 bg-white border border-teal-400 rounded-lg text-xs font-bold text-slate-800"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-amber-700 block">Special Price</span>
                            <input
                              type="number"
                              value={editSpecialPrice}
                              onChange={(e) => setEditSpecialPrice(e.target.value)}
                              placeholder="Special Price"
                              className="w-full px-2 py-1 bg-amber-50 border border-amber-400 rounded-lg text-xs font-bold text-amber-900"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-11 h-11 object-cover rounded-lg border shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 font-bold text-xs">
                              {p.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-slate-800 truncate">
                                {p.name}
                              </h4>
                              <span className="text-[11px] text-slate-400">·</span>
                              <span className="text-[11px] text-slate-500 truncate">
                                {p.category}
                              </span>
                            </div>
                            {p.nameTa && (
                              <p className="text-xs text-slate-500 font-medium truncate">{p.nameTa}</p>
                            )}

                            {/* Stock & Cost indicators */}
                            <div className="flex items-center gap-2 mt-1 text-[11px] flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold ${
                                  (p.stockQty ?? 0) <= (p.minStockAlert || 5)
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {settings.language === 'ta' ? 'இருப்பு:' : 'Stock:'} {p.stockQty ?? 0} pcs
                              </span>

                              {p.buyPrice !== undefined && p.buyPrice > 0 && (
                                <span className="text-slate-500">
                                  {settings.language === 'ta' ? 'வாங்கிய விலை:' : 'Cost:'}{' '}
                                  <strong className="font-mono text-slate-700">
                                    {formatCurrency(p.buyPrice, settings.currencySymbol)}
                                  </strong>
                                </span>
                              )}

                              {unitProfit !== undefined && (
                                <span className="text-emerald-700 font-medium">
                                  {settings.language === 'ta' ? 'லாபம்:' : 'Profit:'}{' '}
                                  <strong className="font-mono">
                                    +{formatCurrency(unitProfit, settings.currencySymbol)}
                                  </strong>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        {!isEditing && (
                          <div className="text-right">
                            <div className="font-bold text-sm text-emerald-700 tabular-nums">
                              {formatCurrency(p.specialPrice || p.price, settings.currencySymbol)}
                            </div>
                            {p.specialPrice && p.specialPrice < p.price ? (
                              <div className="text-[10px] text-slate-400 line-through tabular-nums">
                                Reg: {formatCurrency(p.price, settings.currencySymbol)}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400">Selling Price</span>
                            )}
                          </div>
                        )}

                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(p)}
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(p)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-teal-700 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteProduct(p.id);
                                onNotify('பொருள் நீக்கப்பட்டது', 'info');
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onResetProducts();
              onNotify('ஆரம்பப் பொருட்கள் மீட்டமைக்கப்பட்டது', 'info');
            }}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{settings.language === 'ta' ? 'இயல்புநிலைக்கு மாற்று (Reset Default)' : 'Reset Default Catalog'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
          >
            {settings.language === 'ta' ? 'முடிந்தது' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
