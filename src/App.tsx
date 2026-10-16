/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  ImagePlus,
} from 'lucide-react';
import {
  AppMode,
  CartItem,
  CustomerInfo,
  CustomerProfile,
  PaymentMethod,
  PaymentStatus,
  Product,
  SaleRecord,
  StoreSettings,
  ToastMessage,
  BackupData,
} from './types.ts';
import { INITIAL_PRODUCTS, CATEGORIES } from './data/defaultProducts.ts';
import { DEFAULT_CUSTOMERS } from './data/defaultCustomers.ts';
import { playTapBeep, playSuccessChime } from './utils/audio.ts';
import { generateInvoiceNo, formatCurrency } from './utils/receipt.ts';
import { Header } from './components/Header.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { CartPanel } from './components/CartPanel.tsx';
import { ReceiptModal } from './components/ReceiptModal.tsx';
import { SalesReportModal } from './components/SalesReportModal.tsx';
import { ProductManagerModal } from './components/ProductManagerModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { CustomerLoyaltyModal } from './components/CustomerLoyaltyModal.tsx';
import { DeliveryInvoiceModal } from './components/DeliveryInvoiceModal.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CustomerCartDrawer } from './components/CustomerCartDrawer.tsx';
import { OrderTrackerModal } from './components/OrderTrackerModal.tsx';
import { StorefrontView } from './components/StorefrontView.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';
import { ToastContainer } from './components/Toast.tsx';

const STORE_LOGO_DEFAULT = '/src/assets/images/jesmin_store_logo_1792148106909.jpg';

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Jesmin Online Shopping',
  storeNameTa: 'ஜெஸ்மின் ஆன்லைன் ஷாப்பிங்',
  tagline: 'Cash on Delivery Available Island-wide',
  phone: '+94 77 123 4567',
  logoUrl: STORE_LOGO_DEFAULT,
  currencySymbol: 'Rs.',
  language: 'bilingual',
  soundEnabled: true,
  thermalWidth: '80mm',
  pointsPer100Rs: 1,
  pointValueInRs: 1,
  freeDeliveryThreshold: 5000,
};

const DEFAULT_CUSTOMER: CustomerInfo = {
  name: '',
  phone: '',
  address: '',
  notes: '',
};

export default function App() {
  // App Mode: 'website' (Customer Online Storefront) vs 'pos' (Merchant Billing App)
  const [appMode, setAppMode] = useState<AppMode>(() => {
    try {
      const saved = localStorage.getItem('jesmin_app_mode_v1');
      return saved === 'pos' ? 'pos' : 'website';
    } catch {
      return 'website';
    }
  });

  // Store Settings
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('jesmin_pos_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.logoUrl) parsed.logoUrl = STORE_LOGO_DEFAULT;
        return parsed;
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Product Catalog
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('jesmin_pos_products_v1');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Active Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('jesmin_pos_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sales History
  const [sales, setSales] = useState<SaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem('jesmin_sales');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return parsed.map((s: any, idx: number) => ({
        id: s.id || `legacy-${idx}`,
        invoiceNo: s.invoiceNo || `JOS-${String(idx + 1).padStart(4, '0')}`,
        date: s.date || new Date().toLocaleString(),
        timestamp: s.timestamp || Date.now() - idx * 3600000,
        items: s.items || [],
        subtotal: s.subtotal || s.total || 0,
        discount: s.discount || 0,
        deliveryFee: s.deliveryFee || 0,
        grandTotal: s.total || s.grandTotal || 0,
        paymentMethod: s.paymentMethod || 'cash',
        paymentStatus: s.paymentStatus || (s.paymentMethod === 'pay_later' ? 'pending' : 'paid'),
        cashReceived: s.cashReceived || s.total || 0,
        balanceGiven: s.balanceGiven || 0,
        customer: s.customer || undefined,
        isReturnRecord: s.isReturnRecord || false,
        orderOrigin: s.orderOrigin || 'pos',
      }));
    } catch {
      return [];
    }
  });

  // Cart Adjustments & Customer
  const [discount, setDiscount] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [customer, setCustomer] = useState<CustomerInfo>(DEFAULT_CUSTOMER);

  // Filters (for POS mode)
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Customer Profiles & Loyalty Club
  const [customers, setCustomers] = useState<CustomerProfile[]>(() => {
    try {
      const saved = localStorage.getItem('jesmin_pos_customers_v1');
      return saved ? JSON.parse(saved) : DEFAULT_CUSTOMERS;
    } catch {
      return DEFAULT_CUSTOMERS;
    }
  });

  // Modals & UI States
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<SaleRecord | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [productManagerOpen, setProductManagerOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [loyaltyModalOpen, setLoyaltyModalOpen] = useState(false);
  const [deliveryInvoiceOpen, setDeliveryInvoiceOpen] = useState(false);
  const [deliveryInvoiceSale, setDeliveryInvoiceSale] = useState<SaleRecord | null>(null);

  // Website Storefront specific modals
  const [customerCartOpen, setCustomerCartOpen] = useState(false);
  const [orderTrackerOpen, setOrderTrackerOpen] = useState(false);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);

  const [mobileCartView, setMobileCartView] = useState<'catalog' | 'cart'>('catalog');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: ToastMessage['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('jesmin_app_mode_v1', appMode);
    } catch (e) {
      console.error(e);
    }
  }, [appMode]);

  useEffect(() => {
    try {
      localStorage.setItem('jesmin_pos_settings_v1', JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('jesmin_pos_products_v1', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('jesmin_pos_cart_v1', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('jesmin_sales', JSON.stringify(sales));
    } catch (e) {
      console.error(e);
    }
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem('jesmin_pos_customers_v1', JSON.stringify(customers));
    } catch (e) {
      console.error(e);
    }
  }, [customers]);

  // Calculations taking returns and special promotional prices into account
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
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Cart operations
  const handleAddToCart = (product: Product, isReturn: boolean = false) => {
    playTapBeep(settings.soundEnabled);
    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) => item.product.id === product.id && Boolean(item.isReturn) === isReturn
      );
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id && Boolean(item.isReturn) === isReturn
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prevCart, { product, qty: 1, isReturn }];
    });
    addToast(
      settings.language === 'ta'
        ? `${product.name} கூடையில் சேர்க்கப்பட்டது`
        : `Added ${product.name} to cart`,
      'info'
    );
  };

  const handleToggleItemReturn = (productId: string) => {
    playTapBeep(settings.soundEnabled);
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, isReturn: !item.isReturn } : item
      )
    );
  };

  const handleChangeQty = (productId: string, delta: number) => {
    playTapBeep(settings.soundEnabled);
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const handleRemoveItem = (productId: string) => {
    playTapBeep(settings.soundEnabled);
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    playTapBeep(settings.soundEnabled);
    setCart([]);
    setDiscount(0);
    setDeliveryFee(0);
    setCashReceived('');
    setCustomer(DEFAULT_CUSTOMER);
    addToast(
      settings.language === 'ta' ? 'கார்ட் அழிக்கப்பட்டது' : 'Cart cleared',
      'info'
    );
  };

  // Start fresh sale / Buy Next action
  const handleStartNewSale = () => {
    setCart([]);
    setDiscount(0);
    setDeliveryFee(0);
    setCashReceived('');
    setCustomer(DEFAULT_CUSTOMER);
    setMobileCartView('catalog');
    addToast(
      settings.language === 'ta'
        ? 'புதிய பில் ஆரம்பிக்கப்பட்டது (Ready for next customer)'
        : 'Ready for next customer / New sale started',
      'info'
    );
  };

  // Update Store Logo
  const handleUpdateLogo = (logoUrl: string) => {
    setSettings((prev) => ({ ...prev, logoUrl }));
    addToast('கடையின் லோகோ புதுப்பிக்கப்பட்டது (Logo updated)!', 'success');
  };

  // Update Product Photo
  const handleUpdateProductImage = (productId: string, imageUrl: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, image: imageUrl } : p))
    );
    addToast('பொருளின் படம் புதுப்பிக்கப்பட்டது (Photo updated)!', 'success');
  };

  // Customer Storefront: Quick View Modal opener
  const handleOpenProductDetail = (product: Product) => {
    setSelectedProductForDetail(product);
    setProductDetailOpen(true);
  };

  // Customer Storefront: Direct 1-Click WhatsApp Order
  const handleDirectWhatsAppOrder = (product: Product) => {
    const effectivePrice =
      product.specialPrice && product.specialPrice > 0 ? product.specialPrice : product.price;
    const phone = settings.phone.replace(/[^0-9]/g, '');

    const lines = [
      `🛍️ *${settings.storeName.toUpperCase()} - ORDER INQUIRY*`,
      `Hello! I want to order this product with Cash on Delivery:`,
      `────────────────────────`,
      `📦 *Item:* ${product.name}`,
      product.nameTa ? `🏷️ *Tamil:* ${product.nameTa}` : '',
      `💰 *Price:* ${formatCurrency(effectivePrice, settings.currencySymbol)}`,
      `────────────────────────`,
      `📍 *My Delivery Name:* `,
      `📞 *My Phone:* `,
      `🏠 *Delivery Address / City:* `,
      `────────────────────────`,
      `Please confirm the order and dispatch timeline. Thank you!`,
    ].filter(Boolean);

    const rawText = encodeURIComponent(lines.join('\n'));
    const url = phone ? `https://wa.me/${phone}?text=${rawText}` : `https://wa.me/?text=${rawText}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    addToast('WhatsApp இல் ஆர்டர் செய்தி திறக்கப்படுகிறது...', 'info');
  };

  // Customer Storefront: Online Order Placement (WhatsApp or Cash on Delivery)
  const handleCustomerPlaceOrder = (
    customerDetails: CustomerInfo,
    deliveryMethod: 'whatsapp' | 'cod'
  ) => {
    if (cart.length === 0) return;

    const isFreeDelivery = rawSubtotal >= (settings.freeDeliveryThreshold || 5000);
    const orderDeliveryFee = isFreeDelivery ? 0 : 450;
    const orderGrandTotal = rawSubtotal + orderDeliveryFee;
    const invoiceNo = generateInvoiceNo(sales.length);
    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const saleRecord: SaleRecord = {
      id: `sale-online-${Date.now()}`,
      invoiceNo,
      date: dateFormatted,
      timestamp: now.getTime(),
      items: cart.map((it) => {
        const unitPrice =
          it.product.specialPrice && it.product.specialPrice > 0
            ? it.product.specialPrice
            : it.product.price;
        return {
          id: it.product.id,
          name: it.product.name,
          price: unitPrice,
          regularPrice: it.product.price,
          qty: it.qty,
          subtotal: unitPrice * it.qty,
        };
      }),
      subtotal: rawSubtotal,
      discount: 0,
      deliveryFee: orderDeliveryFee,
      grandTotal: orderGrandTotal,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      cashReceived: 0,
      balanceGiven: 0,
      customer: { ...customerDetails },
      orderOrigin: 'online_website',
    };

    // Save order
    setSales((prev) => [saleRecord, ...prev]);

    // Update customer loyalty DB if provided
    if (customerDetails.name && customerDetails.phone) {
      const phoneKey = customerDetails.phone.trim();
      setCustomers((prev) => {
        const idx = prev.findIndex((c) => c.phone.trim() === phoneKey);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            name: customerDetails.name,
            address: customerDetails.address || updated[idx].address,
            ordersCount: (updated[idx].ordersCount || 0) + 1,
            totalSpent: (updated[idx].totalSpent || 0) + orderGrandTotal,
            lastVisit: 'Today (Online Order)',
          };
          return updated;
        } else {
          return [
            {
              id: `cust-${Date.now()}`,
              name: customerDetails.name,
              phone: customerDetails.phone,
              address: customerDetails.address,
              points: Math.floor(orderGrandTotal / 100),
              ordersCount: 1,
              totalSpent: orderGrandTotal,
              createdAt: Date.now(),
              lastVisit: 'Today (Online Order)',
            },
            ...prev,
          ];
        }
      });
    }

    playSuccessChime(settings.soundEnabled);
    setCart([]);

    if (deliveryMethod === 'whatsapp') {
      // Build WhatsApp message
      const phone = settings.phone.replace(/[^0-9]/g, '');
      const itemsList = saleRecord.items
        .map((it, i) => `${i + 1}. *${it.name}* (${it.qty}x) = ${formatCurrency(it.subtotal, settings.currencySymbol)}`)
        .join('\n');

      const lines = [
        `🛍️ *${settings.storeName.toUpperCase()} - NEW ONLINE ORDER*`,
        `📄 *Order Reference:* #${invoiceNo}`,
        `────────────────────────`,
        `👤 *Customer Name:* ${customerDetails.name}`,
        `📞 *Phone:* ${customerDetails.phone}`,
        `📍 *Delivery Address:* ${customerDetails.address}`,
        customerDetails.notes ? `📝 *Notes:* ${customerDetails.notes}` : '',
        `────────────────────────`,
        `*ORDERED ITEMS:*`,
        itemsList,
        `────────────────────────`,
        `Subtotal: ${formatCurrency(rawSubtotal, settings.currencySymbol)}`,
        `Delivery Fee: ${orderDeliveryFee === 0 ? 'FREE DELIVERY' : formatCurrency(orderDeliveryFee, settings.currencySymbol)}`,
        `💰 *Amount to Pay on Delivery (COD): ${formatCurrency(orderGrandTotal, settings.currencySymbol)}*`,
        `────────────────────────`,
        `Please confirm my islandwide courier delivery. Thank you!`,
      ].filter(Boolean);

      const rawText = encodeURIComponent(lines.join('\n'));
      const url = phone ? `https://wa.me/${phone}?text=${rawText}` : `https://wa.me/?text=${rawText}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      addToast(`ஆர்டர் #${invoiceNo} பதிவு செய்யப்பட்டது! WhatsApp திறக்கப்படுகிறது...`, 'success');
    } else {
      setActiveReceiptSale(saleRecord);
      setReceiptModalOpen(true);
      addToast(
        `ஆர்டர் #${invoiceNo} வெற்றிகரமாக பதிவு செய்யப்பட்டது! (Order confirmed with Cash on Delivery)`,
        'success'
      );
    }
  };

  // Complete Sale and Checkout (from POS Mode)
  const handleCompleteSale = (
    actionType: 'print' | 'preview' | 'whatsapp' | 'delivery_invoice',
    options?: { isPayLater?: boolean; isDirectPaid?: boolean }
  ) => {
    if (cart.length === 0) {
      addToast(
        settings.language === 'ta'
          ? 'தயவுசெய்து பில்லில் பொருட்களைச் சேர்க்கவும்!'
          : 'Please add items to cart first!',
        'warning'
      );
      return;
    }

    const isPayLater = options?.isPayLater || paymentMethod === 'pay_later';
    const isDirectPaid = options?.isDirectPaid;

    const numericCash = isDirectPaid
      ? grandTotal
      : isPayLater
      ? 0
      : parseFloat(cashReceived) || 0;

    const chosenPaymentMethod: PaymentMethod = isPayLater ? 'pay_later' : paymentMethod;
    const chosenStatus: PaymentStatus = isPayLater ? 'pending' : 'paid';

    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const invoiceNo = generateInvoiceNo(sales.length);

    // Loyalty Points calculation: 1 pt per 100 Rs spent
    const pointsRate = settings.pointsPer100Rs || 1;
    const pointsEarned = grandTotal > 0 ? Math.floor((grandTotal / 100) * pointsRate) : 0;
    const pointsRedeemed = customer.pointsRedeemed || 0;

    const phoneKey = customer.phone?.trim();
    const nameKey = customer.name?.trim().toLowerCase();
    const matchedProfile = customers.find(
      (c) => (phoneKey && c.phone.trim() === phoneKey) || (nameKey && c.name.toLowerCase() === nameKey)
    );

    const prevPoints = customer.previousPoints !== undefined 
      ? customer.previousPoints 
      : (matchedProfile ? matchedProfile.points : 0);
    
    const customerPointsBalance = Math.max(0, prevPoints - pointsRedeemed + pointsEarned);

    // Update customer loyalty database if customer details are provided
    if (customer.name || customer.phone) {
      setCustomers((prev) => {
        const idx = prev.findIndex(
          (c) => (phoneKey && c.phone.trim() === phoneKey) || (nameKey && c.name.toLowerCase() === nameKey)
        );
        if (idx >= 0) {
          const updated = [...prev];
          const curr = updated[idx];
          updated[idx] = {
            ...curr,
            name: customer.name || curr.name,
            phone: customer.phone || curr.phone,
            address: customer.address || curr.address,
            points: customerPointsBalance,
            totalSpent: (curr.totalSpent || 0) + grandTotal,
            ordersCount: (curr.ordersCount || 0) + 1,
            lastVisit: 'Today',
          };
          return updated;
        } else {
          const newProfile: CustomerProfile = {
            id: `cust-${Date.now()}`,
            name: customer.name || 'Valued Member',
            phone: customer.phone || '',
            address: customer.address || undefined,
            points: customerPointsBalance,
            totalSpent: grandTotal,
            ordersCount: 1,
            createdAt: Date.now(),
            lastVisit: 'Today',
          };
          return [newProfile, ...prev];
        }
      });
    }

    const saleRecord: SaleRecord = {
      id: `sale-${Date.now()}`,
      invoiceNo,
      date: dateFormatted,
      timestamp: now.getTime(),
      items: cart.map((it) => {
        const unitPrice =
          it.product.specialPrice && it.product.specialPrice > 0
            ? it.product.specialPrice
            : it.product.price;
        return {
          id: it.product.id,
          name: it.product.name,
          price: unitPrice,
          regularPrice: it.product.price,
          qty: it.qty,
          subtotal: unitPrice * it.qty,
          isReturn: it.isReturn,
        };
      }),
      subtotal: rawSubtotal,
      discount: totalDiscount,
      deliveryFee,
      grandTotal,
      paymentMethod: chosenPaymentMethod,
      paymentStatus: chosenStatus,
      cashReceived: chosenPaymentMethod === 'cash' ? (numericCash > 0 ? numericCash : grandTotal) : isPayLater ? 0 : grandTotal,
      balanceGiven: chosenPaymentMethod === 'cash' && numericCash > 0 ? Math.max(0, numericCash - grandTotal) : 0,
      customer: customer.name || customer.phone || customer.address ? { ...customer } : undefined,
      isReturnRecord: cart.some((i) => i.isReturn),
      pointsEarned: (customer.name || customer.phone || pointsEarned > 0) ? pointsEarned : undefined,
      pointsRedeemed: pointsRedeemed > 0 ? pointsRedeemed : undefined,
      customerPointsBalance: (customer.name || customer.phone) ? customerPointsBalance : undefined,
      orderOrigin: 'pos',
    };

    // Save sale
    setSales((prev) => [saleRecord, ...prev]);
    playSuccessChime(settings.soundEnabled);

    if (actionType === 'delivery_invoice') {
      setDeliveryInvoiceSale(saleRecord);
      setDeliveryInvoiceOpen(true);
    } else {
      setActiveReceiptSale(saleRecord);
      setReceiptModalOpen(true);
      if (actionType === 'print') {
        setTimeout(() => {
          window.print();
        }, 350);
      }
    }

    // Reset current active cart
    setCart([]);
    setDiscount(0);
    setDeliveryFee(0);
    setCashReceived('');
    setCustomer(DEFAULT_CUSTOMER);

    const statusMsg = isPayLater
      ? 'கடன் பில் பதிவு செய்யப்பட்டது (Marked as Pay Later)'
      : isDirectPaid
      ? 'பணம் பெறப்பட்டு பில் முடிந்தது (Product Paid)'
      : `விற்பனை முடிந்தது! பில் #${invoiceNo}`;

    addToast(statusMsg, 'success');
  };

  // Select customer from Loyalty Club
  const handleSelectCustomer = (cust: CustomerProfile) => {
    setCustomer({
      name: cust.name,
      phone: cust.phone,
      address: cust.address || '',
      notes: '',
      previousPoints: cust.points,
      pointsRedeemed: 0,
    });
    addToast(
      settings.language === 'ta'
        ? `${cust.name} (${cust.points} புள்ளிகள்) கார்ட்டில் இணைக்கப்பட்டார்`
        : `${cust.name} (${cust.points} pts) selected for cart`,
      'info'
    );
  };

  // Add new customer in Loyalty Club
  const handleAddCustomer = (
    newCust: Omit<CustomerProfile, 'id' | 'createdAt' | 'ordersCount' | 'totalSpent'>
  ) => {
    const profile: CustomerProfile = {
      ...newCust,
      id: `cust-${Date.now()}`,
      totalSpent: 0,
      ordersCount: 0,
      createdAt: Date.now(),
      lastVisit: 'Just joined',
    };
    setCustomers((prev) => [profile, ...prev]);
    addToast(
      settings.language === 'ta'
        ? `புதிய உறுப்பினர் சேர்க்கப்பட்டார்: ${profile.name}`
        : `New loyalty member added: ${profile.name}`,
      'success'
    );
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isDeleted: true, deletedAt: Date.now() } : c))
    );
    addToast('வாடிக்கையாளர் நீக்கப்பட்டார் (Moved to trash)', 'info');
  };

  const handleRestoreCustomer = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isDeleted: false, deletedAt: undefined } : c))
    );
    addToast('வாடிக்கையாளர் மீட்டெடுக்கப்பட்டார் (Restored)', 'success');
  };

  const handlePermanentDeleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    addToast('நிரந்தரமாக அழிக்கப்பட்டது', 'info');
  };

  // Mark an existing invoice as Paid
  const handleMarkSalePaid = (saleId: string) => {
    setSales((prev) =>
      prev.map((s) => (s.id === saleId ? { ...s, paymentStatus: 'paid' as const } : s))
    );
    playSuccessChime(settings.soundEnabled);
    addToast('கட்டணம் பெறப்பட்டது என குறிக்கப்பட்டது (Marked as Paid)!', 'success');
  };

  // Process Return / Refund for an invoice
  const handleProcessReturn = (saleId: string) => {
    setSales((prev) =>
      prev.map((s) => (s.id === saleId ? { ...s, paymentStatus: 'returned' as const } : s))
    );
    addToast('பொருட்கள் திருப்பல் பதிவு செய்யப்பட்டது (Return Processed)', 'info');
  };

  // Quick Reorder: Copy items from a historical sale directly into the active cart
  const handleQuickReorder = (sale: SaleRecord) => {
    if (!sale.items || sale.items.length === 0) {
      addToast(
        settings.language === 'ta'
          ? 'இந்த பில்லில் எந்தப் பொருட்களும் இல்லை'
          : 'No items in this historical sale',
        'warning'
      );
      return;
    }

    playTapBeep(settings.soundEnabled);

    setCart((prevCart) => {
      const updatedCart = [...prevCart];

      sale.items.forEach((historicalItem) => {
        const existingIdx = updatedCart.findIndex(
          (cartItem) => cartItem.product.id === historicalItem.id
        );

        if (existingIdx >= 0) {
          updatedCart[existingIdx] = {
            ...updatedCart[existingIdx],
            qty: updatedCart[existingIdx].qty + historicalItem.qty,
          };
        } else {
          const catalogItem = products.find((p) => p.id === historicalItem.id);
          const productToAdd: Product = catalogItem || {
            id: historicalItem.id,
            name: historicalItem.name,
            price: historicalItem.regularPrice || historicalItem.price,
            specialPrice: historicalItem.price < (historicalItem.regularPrice || historicalItem.price) ? historicalItem.price : undefined,
            category: 'Reordered Items',
            iconName: 'Package',
            inStock: true,
          };

          updatedCart.push({
            product: productToAdd,
            qty: historicalItem.qty,
          });
        }
      });

      return updatedCart;
    });

    if (sale.customer) {
      setCustomer((prev) => ({
        name: prev.name || sale.customer?.name || '',
        phone: prev.phone || sale.customer?.phone || '',
        address: prev.address || sale.customer?.address || '',
        notes: prev.notes || sale.customer?.notes || '',
      }));
    }

    if (sale.deliveryFee > 0 && deliveryFee === 0) {
      setDeliveryFee(sale.deliveryFee);
    }

    setReportModalOpen(false);
    setMobileCartView('cart');

    const totalReorderedItems = sale.items.reduce((s, it) => s + it.qty, 0);
    addToast(
      settings.language === 'ta'
        ? `${totalReorderedItems} பொருட்கள் கார்ட்டில் சேர்க்கப்பட்டது (#${sale.invoiceNo})`
        : `${totalReorderedItems} items copied to cart from #${sale.invoiceNo}`,
      'success'
    );
  };

  // Product Manager Actions
  const handleAddProduct = (newProd: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    setProducts((prev) => [...prev, { ...newProd, id }]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const handleResetProducts = () => {
    setProducts(INITIAL_PRODUCTS);
  };

  const handleClearSalesHistory = () => {
    setSales([]);
    localStorage.removeItem('jesmin_sales');
    addToast(
      settings.language === 'ta'
        ? 'விற்பனைப் பதிவுகள் அனைத்தும் அழிக்கப்பட்டது'
        : 'All sales history cleared',
      'info'
    );
  };

  // Backup restore
  const handleRestoreBackup = (backup: BackupData) => {
    if (backup.settings) setSettings(backup.settings);
    if (backup.products) setProducts(backup.products);
    if (backup.sales) setSales(backup.sales);
    if (backup.customers) setCustomers(backup.customers);
  };

  // Filtered Products for POS view
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchEn = p.name.toLowerCase().includes(q);
        const matchTa = p.nameTa?.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        return matchEn || matchTa || matchCat;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Current quantity map in cart
  const cartQtyMap = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach((item) => {
      map[item.product.id] = (map[item.product.id] || 0) + item.qty;
    });
    return map;
  }, [cart]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f6] text-slate-800">
      {/* Toast Notifications container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Offline Connectivity Banner */}
      <OfflineIndicator />

      {/* Main Top Header with Mode Switcher & Navigation */}
      <Header
        settings={settings}
        appMode={appMode}
        onToggleAppMode={(mode) => {
          setAppMode(mode);
          addToast(
            mode === 'website'
              ? 'வாடிக்கையாளர் ஆன்லைன் கடை (Online Storefront Active)'
              : 'கடை பில்லிங் மற்றும் விற்பனைப் புள்ளி (Staff POS Active)',
            'info'
          );
        }}
        cartCount={cartItemCount}
        cartTotal={grandTotal}
        onOpenReport={() => setReportModalOpen(true)}
        onOpenProducts={() => setProductManagerOpen(true)}
        onOpenLoyalty={() => setLoyaltyModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenOrderTracker={() => setOrderTrackerOpen(true)}
        onOpenCustomerCart={() => setCustomerCartOpen(true)}
        onToggleMobileCart={() => setMobileCartView(mobileCartView === 'catalog' ? 'cart' : 'catalog')}
        onUpdateLogo={handleUpdateLogo}
        isMobileCartOpen={mobileCartView === 'cart'}
      />

      {/* Main Workspace Body: Switches between Website Storefront and POS Terminal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 pb-20 lg:pb-6">
        {appMode === 'website' ? (
          /* ======================================================== */
          /* MODE 1: CUSTOMER-FACING ONLINE SHOPPING STOREFRONT      */
          /* ======================================================== */
          <StorefrontView
            products={products}
            settings={settings}
            cartCount={cartItemCount}
            onAddToCart={(p) => handleAddToCart(p, false)}
            onOpenProductDetail={handleOpenProductDetail}
            onDirectWhatsAppOrder={handleDirectWhatsAppOrder}
            onOpenCustomerCart={() => setCustomerCartOpen(true)}
            onOpenOrderTracker={() => setOrderTrackerOpen(true)}
            onSwitchToPOS={() => setAppMode('pos')}
          />
        ) : (
          /* ======================================================== */
          /* MODE 2: MERCHANT / CASHIER MOBILE POS & BILLING APP    */
          /* ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT COLUMN: Product Catalog Grid */}
            <div
              className={`lg:col-span-7 xl:col-span-8 flex flex-col gap-4 ${
                mobileCartView === 'cart' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {/* Search Bar & Quick Stats bar */}
              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder={
                        settings.language === 'ta'
                          ? 'பொருட்களைத் தேடுக (M804, Earbuds, Rack, Light...)'
                          : 'Search products by name or category...'
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Status/Store banner */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium px-2 py-1 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                    <span className="text-teal-700 font-semibold">
                      {filteredProducts.length} {settings.language === 'ta' ? 'பொருட்கள்' : 'items'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{settings.tagline}</span>
                  </div>
                </div>

                {/* Category Segmented Scrollable Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all active:scale-95 ${
                        selectedCategory === cat
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                      }`}
                    >
                      {cat === 'All' ? (settings.language === 'ta' ? 'அனைத்தும் (All)' : 'All Products') : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Cards Grid */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
                  <h3 className="text-sm font-bold text-slate-700">
                    {settings.language === 'ta' ? 'பொருட்கள் எதுவும் கிடைக்கவில்லை' : 'No products found'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {settings.language === 'ta'
                      ? 'தேடல் சொல்லை மாற்றவும் அல்லது புதிய பொருளை சேர்க்கவும்'
                      : 'Try adjusting your search query or add a new product from the top menu'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="mt-3 text-xs font-semibold text-teal-700 hover:underline inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{settings.language === 'ta' ? 'வடிகட்டிகளை மீட்டமை' : 'Reset filters'}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      quantityInCart={cartQtyMap[product.id] || 0}
                      settings={settings}
                      onAddToCart={handleAddToCart}
                      onUpdateProductImage={handleUpdateProductImage}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Cart & POS Checkout Panel */}
            <div
              className={`lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 ${
                mobileCartView === 'catalog' ? 'hidden lg:block' : 'block'
              }`}
            >
              {/* Mobile Back-to-Catalog Button */}
              <div className="lg:hidden mb-3">
                <button
                  type="button"
                  onClick={() => setMobileCartView('catalog')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <span>← {settings.language === 'ta' ? 'பொருட்கள் பட்டியலுக்குச் செல்' : 'Back to Product Catalog'}</span>
                </button>
              </div>

              <CartPanel
                cart={cart}
                settings={settings}
                discount={discount}
                setDiscount={setDiscount}
                deliveryFee={deliveryFee}
                setDeliveryFee={setDeliveryFee}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                cashReceived={cashReceived}
                setCashReceived={setCashReceived}
                customer={customer}
                setCustomer={setCustomer}
                customers={customers}
                onOpenLoyaltyModal={() => setLoyaltyModalOpen(true)}
                onChangeQty={handleChangeQty}
                onToggleItemReturn={handleToggleItemReturn}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
                onCompleteSale={handleCompleteSale}
              />
            </div>
          </div>
        )}
      </main>

      {/* Floating Sticky Mobile Bottom Bar (in POS mode catalog view) */}
      {appMode === 'pos' && mobileCartView === 'catalog' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg">
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block leading-none">
                {settings.language === 'ta' ? 'மொத்தத் தொகை' : 'Current Total'}
              </span>
              <span className="text-base font-bold text-teal-800 tabular-nums">
                {formatCurrency(grandTotal, settings.currencySymbol)}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">
                ({cartItemCount} {settings.language === 'ta' ? 'பொருட்கள்' : 'items'})
              </span>
            </div>

            <button
              type="button"
              onClick={() => setMobileCartView('cart')}
              className="py-2.5 px-4 rounded-xl bg-teal-600 active:scale-95 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <span>{settings.language === 'ta' ? 'பில் பார்க்க (View Cart)' : 'View Cart'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Thermal Receipt Modal */}
      <ReceiptModal
        sale={activeReceiptSale}
        settings={settings}
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        onPrint={() => window.print()}
        onOpenDeliveryInvoice={(sale) => {
          setDeliveryInvoiceSale(sale);
          setDeliveryInvoiceOpen(true);
        }}
        onStartNewSale={handleStartNewSale}
        onNotify={addToast}
      />

      {/* 2. Delivery Invoice / Waybill Modal */}
      <DeliveryInvoiceModal
        sale={deliveryInvoiceSale}
        settings={settings}
        isOpen={deliveryInvoiceOpen}
        onClose={() => setDeliveryInvoiceOpen(false)}
        onNotify={addToast}
      />

      {/* 3. Sales Report Modal (விற்பனை அறிக்கை) */}
      <SalesReportModal
        sales={sales}
        products={products}
        settings={settings}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onClearHistory={handleClearSalesHistory}
        onSelectSaleForReceipt={(sale) => {
          setActiveReceiptSale(sale);
          setReceiptModalOpen(true);
        }}
        onSelectSaleForDeliveryInvoice={(sale) => {
          setDeliveryInvoiceSale(sale);
          setDeliveryInvoiceOpen(true);
        }}
        onQuickReorder={handleQuickReorder}
        onMarkSalePaid={handleMarkSalePaid}
        onProcessReturn={handleProcessReturn}
        onNotify={addToast}
      />

      {/* 4. Product Manager Modal (பொருட்கள் மேலாண்மை) */}
      <ProductManagerModal
        products={products}
        settings={settings}
        isOpen={productManagerOpen}
        onClose={() => setProductManagerOpen(false)}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetProducts={handleResetProducts}
        onNotify={addToast}
      />

      {/* 5. Settings Modal (அமைப்புகள்) */}
      <SettingsModal
        settings={settings}
        setSettings={setSettings}
        products={products}
        sales={sales}
        customers={customers}
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onRestoreBackup={handleRestoreBackup}
        onResetAllData={() => {
          setProducts(INITIAL_PRODUCTS);
          setCustomers(DEFAULT_CUSTOMERS);
          setSales([]);
        }}
        onNotify={addToast}
      />

      {/* 6. Customer Profiles & Loyalty Club Modal (வாடிக்கையாளர் புள்ளிகள்) */}
      <CustomerLoyaltyModal
        customers={customers}
        settings={settings}
        isOpen={loyaltyModalOpen}
        onClose={() => setLoyaltyModalOpen(false)}
        onSelectCustomer={handleSelectCustomer}
        onAddCustomer={handleAddCustomer}
        onDeleteCustomer={handleDeleteCustomer}
        onRestoreCustomer={handleRestoreCustomer}
        onPermanentDeleteCustomer={handlePermanentDeleteCustomer}
      />

      {/* 7. Website Customer Cart Drawer */}
      <CustomerCartDrawer
        isOpen={customerCartOpen}
        onClose={() => setCustomerCartOpen(false)}
        cart={cart}
        settings={settings}
        onChangeQty={handleChangeQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onPlaceOrder={handleCustomerPlaceOrder}
      />

      {/* 8. Website Customer Order Status Tracker */}
      <OrderTrackerModal
        sales={sales}
        settings={settings}
        isOpen={orderTrackerOpen}
        onClose={() => setOrderTrackerOpen(false)}
        onSelectSaleForReceipt={(sale) => {
          setActiveReceiptSale(sale);
          setReceiptModalOpen(true);
        }}
      />

      {/* 9. Product Details Quick View Modal */}
      <ProductDetailModal
        product={selectedProductForDetail}
        settings={settings}
        isOpen={productDetailOpen}
        onClose={() => {
          setProductDetailOpen(false);
          setSelectedProductForDetail(null);
        }}
        onAddToCart={(p) => handleAddToCart(p, false)}
        onDirectWhatsAppOrder={handleDirectWhatsAppOrder}
      />
    </div>
  );
}
