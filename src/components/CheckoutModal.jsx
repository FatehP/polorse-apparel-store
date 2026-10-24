import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Smartphone,
  CreditCard,
  Banknote,
  Wallet,
  Building,
  ArrowRight,
  ArrowLeft,
  Check,
  MapPin,
  Navigation,
  Clock,
  AlertCircle,
  UserCheck,
  Sparkles,
  Edit2,
  Plus,
  Trash2,
  ChevronRight,
  Lock,
  Package
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { createOrder } from '../services/storeService';
import { checkPincodeDeliverability, autoDetectLocation } from '../services/pincodeService';
import {
  getUserAddresses,
  addOrUpdateUserAddress,
  deleteUserAddress,
  saveUserAddresses
} from '../services/authService';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  appliedCoupon,
  onOrderSuccess,
  currentUser = null,
  onOpenAuth
}) {
  if (!isOpen) return null;

  // Checkout Steps: 1: Payment Selection, 2: Address Selection, 3: Order Summary & Confirmation
  const [currentStep, setCurrentStep] = useState(1);

  // --- Payment States ---
  // Category: 'UPI', 'CARD', 'COD', 'WALLET', 'NETBANKING'
  const [paymentCategory, setPaymentCategory] = useState('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState('phonepe'); // 'phonepe', 'gpay', 'paytm', 'amazonpay', 'other'
  const [customUpiId, setCustomUpiId] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('amazonpay_wallet');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  // --- Address States ---
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    tag: 'Home',
    isPrimary: false
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState(null);

  // --- Submission & Order Completion ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Load addresses on mount and when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const userAddrs = getUserAddresses();
      if (userAddrs.length > 0) {
        setAddresses(userAddrs);
        const primary = userAddrs.find(a => a.isPrimary) || userAddrs[0];
        setSelectedAddressId(primary.id);
      } else if (currentUser.savedAddress) {
        const defaultAddr = {
          id: 'addr-primary',
          fullName: currentUser.savedAddress.fullName || currentUser.name || '',
          phone: currentUser.savedAddress.phone || currentUser.phone || '',
          addressLine: currentUser.savedAddress.addressLine || '',
          city: currentUser.savedAddress.city || 'Mumbai',
          state: currentUser.savedAddress.state || 'Maharashtra',
          pincode: currentUser.savedAddress.pincode || '400001',
          tag: 'Home',
          isPrimary: true
        };
        setAddresses([defaultAddr]);
        setSelectedAddressId(defaultAddr.id);
      } else {
        setAddressForm(prev => ({
          ...prev,
          fullName: currentUser.name || '',
          phone: currentUser.phone || ''
        }));
        setIsAddingNewAddress(true);
      }
    } else {
      // Guest demo address
      const demoGuestAddr = {
        id: 'addr-guest',
        fullName: 'Fateh Prajapati',
        phone: '9876543210',
        addressLine: 'Aura Studio 402, High Street Boulevard',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        tag: 'Home / Studio',
        isPrimary: true
      };
      setAddresses([demoGuestAddr]);
      setSelectedAddressId(demoGuestAddr.id);
    }
  }, [currentUser]);

  // Pricing calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discountAmount = Math.min(appliedCoupon.value, subtotal);
    }
  }

  const shipping = subtotal >= 1999 ? 0 : 99;
  const finalTotal = Math.max(0, subtotal - discountAmount + shipping);

  // Selected address object
  const activeAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0] || null;

  // Handle Address Form Input
  const handleAddressInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setAddressForm(prev => ({ ...prev, [name]: val }));

    if (name === 'pincode') {
      const clean = value.replace(/[^0-9]/g, '');
      if (clean.length === 6) {
        const info = await checkPincodeDeliverability(clean);
        setDeliveryStatus(info);
        if (info.isDeliverable) {
          setAddressForm(prev => ({
            ...prev,
            pincode: clean,
            city: prev.city || info.city,
            state: prev.state || info.state
          }));
        }
      } else {
        setDeliveryStatus(null);
      }
    }
  };

  const handleAutoDetectLocation = async () => {
    setIsDetecting(true);
    const loc = await autoDetectLocation();
    if (loc?.pincode) {
      setAddressForm(prev => ({
        ...prev,
        pincode: loc.pincode,
        city: loc.city || prev.city,
        state: loc.state || prev.state
      }));
      setDeliveryStatus(loc.deliveryInfo);
    }
    setIsDetecting(false);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.phone || !addressForm.addressLine || !addressForm.pincode) {
      alert('Please fill in all required address fields.');
      return;
    }

    const payload = {
      ...addressForm,
      id: editingAddressId || undefined
    };

    if (currentUser) {
      const saved = addOrUpdateUserAddress(payload);
      const updatedList = getUserAddresses();
      setAddresses(updatedList);
      if (saved) setSelectedAddressId(saved.id);
    } else {
      // Local state update for guests
      if (editingAddressId) {
        setAddresses(prev => prev.map(a => (a.id === editingAddressId ? { ...payload, id: editingAddressId } : a)));
        setSelectedAddressId(editingAddressId);
      } else {
        const newAddr = { ...payload, id: `addr-${Date.now()}` };
        setAddresses(prev => [newAddr, ...prev]);
        setSelectedAddressId(newAddr.id);
      }
    }

    setIsAddingNewAddress(false);
    setEditingAddressId(null);
    setAddressForm({
      fullName: currentUser?.name || '',
      phone: currentUser?.phone || '',
      addressLine: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
      tag: 'Home',
      isPrimary: false
    });
  };

  const handleStartEditAddress = (addr, e) => {
    e.stopPropagation();
    setEditingAddressId(addr.id);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine: addr.addressLine,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      tag: addr.tag || 'Home',
      isPrimary: Boolean(addr.isPrimary)
    });
    setIsAddingNewAddress(true);
  };

  const handleDeleteAddress = (id, e) => {
    e.stopPropagation();
    if (addresses.length <= 1) {
      alert('You must have at least one delivery address.');
      return;
    }
    if (currentUser) {
      const remaining = deleteUserAddress(id);
      setAddresses(remaining);
      if (selectedAddressId === id) {
        setSelectedAddressId(remaining[0]?.id || null);
      }
    } else {
      const remaining = addresses.filter(a => a.id !== id);
      setAddresses(remaining);
      if (selectedAddressId === id) {
        setSelectedAddressId(remaining[0]?.id || null);
      }
    }
  };

  // Get human readable payment method label
  const getPaymentMethodDisplay = () => {
    switch (paymentCategory) {
      case 'UPI':
        if (selectedUpiApp === 'phonepe') return 'PhonePe UPI';
        if (selectedUpiApp === 'gpay') return 'Google Pay UPI';
        if (selectedUpiApp === 'paytm') return 'Paytm UPI';
        if (selectedUpiApp === 'amazonpay') return 'Amazon Pay UPI';
        return `UPI ID (${customUpiId || 'VPA'})`;
      case 'CARD':
        return `Credit/Debit Card (${cardDetails.number ? '•••• ' + cardDetails.number.slice(-4) : 'Visa/Mastercard'})`;
      case 'COD':
        return 'Cash On Delivery (Cash / UPI at Doorstep)';
      case 'WALLET':
        if (selectedWallet === 'amazonpay_wallet') return 'Amazon Pay Balance';
        if (selectedWallet === 'paytm_wallet') return 'Paytm Wallet';
        return 'PhonePe Wallet';
      case 'NETBANKING':
        return `Net Banking (${selectedBank} Bank)`;
      default:
        return 'UPI';
    }
  };

  // Final Order Placement Handler
  const handlePlaceOrder = async () => {
    if (!currentUser) {
      if (onOpenAuth) {
        onOpenAuth();
      } else {
        alert('Please Sign In or Register to place your order.');
      }
      return;
    }

    if (!activeAddress) {
      alert('Please select or add a delivery address first.');
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: activeAddress.fullName,
        phone: activeAddress.phone,
        address: `${activeAddress.addressLine}, ${activeAddress.city}, ${activeAddress.state} - ${activeAddress.pincode}`,
        city: activeAddress.city,
        pincode: activeAddress.pincode,
        state: activeAddress.state,
        items: cartItems.map(item => ({
          id: item.id,
          title: item.title,
          size: item.selectedSize || 'Standard',
          color: item.selectedColor || 'Standard',
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        })),
        subtotal,
        discount: discountAmount,
        couponApplied: appliedCoupon?.code || null,
        total: finalTotal,
        paymentMethod: getPaymentMethodDisplay(),
        paymentStatus: paymentCategory === 'COD' ? 'PENDING' : 'PAID',
        orderStatus: 'Confirmed',
        createdAt: new Date().toISOString()
      };

      const newOrder = await createOrder(orderPayload);
      setCompletedOrder(newOrder);

      // Trigger high-energy celebratory confetti
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 }
      });

      if (onOrderSuccess) {
        onOrderSuccess();
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 28, 63, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-secondary)',
          border: '1.5px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          maxWidth: completedOrder ? '580px' : '820px',
          width: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* iOS Native Modal Pull Handle */}
        <div className="sheet-handle" style={{ margin: '8px auto 0 auto' }} />

        {/* Modal Top Bar & 3-Step Breadcrumbs */}
        <div
          style={{
            padding: '16px 20px 14px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {/* Top Title & Close Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: '900',
                  letterSpacing: '0.08em',
                  fontSize: '0.95rem',
                  color: 'var(--accent-navy)',
                  textTransform: 'uppercase'
                }}
              >
                POLORSE CHECKOUT
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(15, 28, 63, 0.08)',
                  color: 'var(--accent-navy)',
                  fontWeight: '700'
                }}
              >
                100% Encrypted
              </span>
            </div>

            <button
              onClick={onClose}
              style={{
                color: 'var(--text-secondary)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Close Checkout"
            >
              <X size={16} />
            </button>
          </div>

          {/* Amazon-like 3-Step Progress Bar (Only when not in Order Confirmed state) */}
          {!completedOrder && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                position: 'relative',
                padding: '4px 0'
              }}
            >
              {/* Step 1: Payment */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: currentStep >= 1 ? 'var(--accent-navy)' : 'var(--bg-secondary)',
                    color: currentStep >= 1 ? '#FAF7F2' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    flexShrink: 0
                  }}
                >
                  1
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: currentStep === 1 ? '800' : '600',
                      color: currentStep === 1 ? 'var(--accent-navy)' : 'var(--text-secondary)'
                    }}
                  >
                    Payment
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Amazon-style options
                  </span>
                </div>
              </button>

              <div
                style={{
                  height: '2px',
                  width: '24px',
                  background: currentStep >= 2 ? 'var(--accent-navy)' : 'var(--border-subtle)',
                  flexShrink: 0
                }}
              />

              {/* Step 2: Address */}
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: currentStep >= 2 ? 'var(--accent-navy)' : 'var(--bg-secondary)',
                    color: currentStep >= 2 ? '#FAF7F2' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    flexShrink: 0
                  }}
                >
                  2
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: currentStep === 2 ? '800' : '600',
                      color: currentStep === 2 ? 'var(--accent-navy)' : 'var(--text-secondary)'
                    }}
                  >
                    Address
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Primary location
                  </span>
                </div>
              </button>

              <div
                style={{
                  height: '2px',
                  width: '24px',
                  background: currentStep === 3 ? 'var(--accent-navy)' : 'var(--border-subtle)',
                  flexShrink: 0
                }}
              />

              {/* Step 3: Summary */}
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: currentStep === 3 ? 'var(--accent-navy)' : 'var(--bg-secondary)',
                    color: currentStep === 3 ? '#FAF7F2' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    flexShrink: 0
                  }}
                >
                  3
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: currentStep === 3 ? '800' : '600',
                      color: currentStep === 3 ? 'var(--accent-navy)' : 'var(--text-secondary)'
                    }}
                  >
                    Summary
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Review & Confirm
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Main Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', boxSizing: 'border-box' }}>
          {completedOrder ? (
            /* ============================================================ */
            /* ORDER CONFIRMATION VIEW                                      */
            /* ============================================================ */
            <div style={{ padding: '20px 8px', textAlign: 'center' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'rgba(5, 150, 105, 0.12)',
                  border: '2px solid var(--accent-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'var(--accent-green)'
                }}
              >
                <CheckCircle2 size={38} />
              </div>

              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(46, 125, 50, 0.12)',
                  color: 'var(--accent-green)',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '10px'
                }}
              >
                ORDER CONFIRMED & DISPATCH PREPPED
              </span>

              <h2
                style={{
                  fontSize: '1.6rem',
                  color: 'var(--text-primary)',
                  fontWeight: '800',
                  fontFamily: 'var(--font-display)',
                  margin: '4px 0'
                }}
              >
                Thank You, {completedOrder.customerName}!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto' }}>
                Your limited Polorse drop is being prepped. Order ID:{' '}
                <strong style={{ color: 'var(--accent-navy)' }}>{completedOrder.id}</strong>
              </p>

              {/* Order Summary Cards */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px',
                  marginTop: '20px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Delivery Address */}
                <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>
                    Delivery Destination
                  </span>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: '600', marginTop: '4px' }}>
                    {completedOrder.address}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Phone: {completedOrder.phone}
                  </div>
                </div>

                {/* Payment Method */}
                <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>
                    Payment Summary
                  </span>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: '700', marginTop: '4px' }}>
                    {completedOrder.paymentMethod}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-green)', fontWeight: '600' }}>
                    Status: {completedOrder.paymentStatus} • Amount Paid: ₹{completedOrder.total.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>
                    Items in Order ({completedOrder.items?.length || 0})
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {completedOrder.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              style={{ width: '38px', height: '44px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                          )}
                          <div>
                            <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                              {item.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn-primary"
                style={{
                  width: '100%',
                  marginTop: '22px',
                  padding: '14px',
                  fontWeight: '800',
                  fontSize: '0.92rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>Continue Shopping Polorse Collection</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            /* ============================================================ */
            /* MULTI-STEP CHECKOUT WIZARD                                   */
            /* ============================================================ */
            <div>
              {/* Member Auth Prompt Banner if not logged in */}
              {!currentUser && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '12px 16px',
                    background: 'rgba(194, 26, 44, 0.06)',
                    border: '1.5px solid rgba(194, 26, 44, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '18px',
                    fontSize: '0.84rem',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={20} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', color: 'var(--accent-navy)', fontSize: '0.88rem' }}>
                        Sign In Recommended for Express Ordering
                      </strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                        Log in with OTP to access your saved addresses & live doorstep tracking.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    style={{
                      background: 'var(--accent-navy)',
                      color: '#FAF7F2',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    Sign In / Register
                  </button>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 1: PAYMENT SELECTION (Just Like Amazon)             */}
              {/* ======================================================== */}
              {currentStep === 1 && (
                <div>
                  <div style={{ marginBottom: '18px' }}>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        color: 'var(--text-primary)',
                        margin: 0
                      }}
                    >
                      Select Payment Method
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Choose your preferred payment mode. Encrypted with 256-bit bank-grade security.
                    </p>
                  </div>

                  {/* Payment Methods Accordion List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* OPTION 1: UPI (Recommended) */}
                    <div
                      onClick={() => setPaymentCategory('UPI')}
                      style={{
                        border: paymentCategory === 'UPI' ? '2px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                        background: paymentCategory === 'UPI' ? 'rgba(15, 28, 63, 0.02)' : 'var(--bg-card)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="radio"
                            name="paymentCategory"
                            checked={paymentCategory === 'UPI'}
                            onChange={() => setPaymentCategory('UPI')}
                            style={{ accentColor: 'var(--accent-navy)', width: '18px', height: '18px' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Smartphone size={18} style={{ color: 'var(--accent-navy)' }} />
                              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                UPI (Instant & Zero Surcharge)
                              </strong>
                              <span
                                style={{
                                  background: 'rgba(5, 150, 105, 0.12)',
                                  color: 'var(--accent-green)',
                                  fontSize: '0.7rem',
                                  fontWeight: '800',
                                  padding: '2px 6px',
                                  borderRadius: 'var(--radius-sm)'
                                }}
                              >
                                POPULAR
                              </span>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              Pay via PhonePe, Google Pay, Paytm, Amazon Pay or any UPI app
                            </span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-navy)' }}>
                          ₹{finalTotal.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Expanded UPI App Selector */}
                      {paymentCategory === 'UPI' && (
                        <div
                          style={{
                            marginTop: '14px',
                            paddingTop: '14px',
                            borderTop: '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            Choose UPI App:
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                            {/* PhonePe */}
                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 12px',
                                borderRadius: 'var(--radius-md)',
                                border: selectedUpiApp === 'phonepe' ? '1.5px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                                background: selectedUpiApp === 'phonepe' ? 'rgba(15, 28, 63, 0.05)' : 'var(--bg-primary)',
                                cursor: 'pointer',
                                fontSize: '0.84rem',
                                fontWeight: '700',
                                color: 'var(--text-primary)'
                              }}
                            >
                              <input
                                type="radio"
                                name="upiApp"
                                checked={selectedUpiApp === 'phonepe'}
                                onChange={() => setSelectedUpiApp('phonepe')}
                                style={{ accentColor: 'var(--accent-navy)' }}
                              />
                              <span>PhonePe</span>
                            </label>

                            {/* Google Pay */}
                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 12px',
                                borderRadius: 'var(--radius-md)',
                                border: selectedUpiApp === 'gpay' ? '1.5px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                                background: selectedUpiApp === 'gpay' ? 'rgba(15, 28, 63, 0.05)' : 'var(--bg-primary)',
                                cursor: 'pointer',
                                fontSize: '0.84rem',
                                fontWeight: '700',
                                color: 'var(--text-primary)'
                              }}
                            >
                              <input
                                type="radio"
                                name="upiApp"
                                checked={selectedUpiApp === 'gpay'}
                                onChange={() => setSelectedUpiApp('gpay')}
                                style={{ accentColor: 'var(--accent-navy)' }}
                              />
                              <span>Google Pay</span>
                            </label>

                            {/* Paytm */}
                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 12px',
                                borderRadius: 'var(--radius-md)',
                                border: selectedUpiApp === 'paytm' ? '1.5px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                                background: selectedUpiApp === 'paytm' ? 'rgba(15, 28, 63, 0.05)' : 'var(--bg-primary)',
                                cursor: 'pointer',
                                fontSize: '0.84rem',
                                fontWeight: '700',
                                color: 'var(--text-primary)'
                              }}
                            >
                              <input
                                type="radio"
                                name="upiApp"
                                checked={selectedUpiApp === 'paytm'}
                                onChange={() => setSelectedUpiApp('paytm')}
                                style={{ accentColor: 'var(--accent-navy)' }}
                              />
                              <span>Paytm UPI</span>
                            </label>

                            {/* Amazon Pay */}
                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 12px',
                                borderRadius: 'var(--radius-md)',
                                border: selectedUpiApp === 'amazonpay' ? '1.5px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                                background: selectedUpiApp === 'amazonpay' ? 'rgba(15, 28, 63, 0.05)' : 'var(--bg-primary)',
                                cursor: 'pointer',
                                fontSize: '0.84rem',
                                fontWeight: '700',
                                color: 'var(--text-primary)'
                              }}
                            >
                              <input
                                type="radio"
                                name="upiApp"
                                checked={selectedUpiApp === 'amazonpay'}
                                onChange={() => setSelectedUpiApp('amazonpay')}
                                style={{ accentColor: 'var(--accent-navy)' }}
                              />
                              <span>Amazon Pay</span>
                            </label>

                            {/* Other UPI ID */}
                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 12px',
                                borderRadius: 'var(--radius-md)',
                                border: selectedUpiApp === 'other' ? '1.5px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                                background: selectedUpiApp === 'other' ? 'rgba(15, 28, 63, 0.05)' : 'var(--bg-primary)',
                                cursor: 'pointer',
                                fontSize: '0.84rem',
                                fontWeight: '700',
                                color: 'var(--text-primary)'
                              }}
                            >
                              <input
                                type="radio"
                                name="upiApp"
                                checked={selectedUpiApp === 'other'}
                                onChange={() => setSelectedUpiApp('other')}
                                style={{ accentColor: 'var(--accent-navy)' }}
                              />
                              <span>Other UPI ID</span>
                            </label>
                          </div>

                          {selectedUpiApp === 'other' && (
                            <div style={{ marginTop: '8px' }}>
                              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                                Enter UPI ID / VPA
                              </label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  type="text"
                                  placeholder="e.g. yourname@okaxis"
                                  value={customUpiId}
                                  onChange={(e) => setCustomUpiId(e.target.value)}
                                  className="form-input"
                                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.88rem' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => alert(`UPI ID ${customUpiId || 'demo@upi'} verified!`)}
                                  style={{
                                    padding: '8px 14px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--accent-navy)',
                                    color: '#FAF7F2',
                                    fontWeight: '700',
                                    fontSize: '0.8rem',
                                    border: 'none',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Verify
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* OPTION 2: Credit or Debit Cards */}
                    <div
                      onClick={() => setPaymentCategory('CARD')}
                      style={{
                        border: paymentCategory === 'CARD' ? '2px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                        background: paymentCategory === 'CARD' ? 'rgba(15, 28, 63, 0.02)' : 'var(--bg-card)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="radio"
                            name="paymentCategory"
                            checked={paymentCategory === 'CARD'}
                            onChange={() => setPaymentCategory('CARD')}
                            style={{ accentColor: 'var(--accent-navy)', width: '18px', height: '18px' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CreditCard size={18} style={{ color: 'var(--accent-navy)' }} />
                              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                Credit or Debit Card
                              </strong>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              Visa, MasterCard, RuPay, Maestro & American Express
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Input Fields (Following modern-web-guidance) */}
                      {paymentCategory === 'CARD' && (
                        <div
                          style={{
                            marginTop: '14px',
                            paddingTop: '14px',
                            borderTop: '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                              Card Number
                            </label>
                            <input
                              id="cc-number"
                              name="cc-number"
                              type="text"
                              autoComplete="cc-number"
                              inputMode="numeric"
                              maxLength={19}
                              placeholder="4532 8901 2345 6789"
                              value={cardDetails.number}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                              className="form-input"
                              style={{ width: '100%', padding: '10px 12px', fontSize: '0.9rem', letterSpacing: '0.04em' }}
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                                Format: MM/YY
                              </span>
                              <input
                                id="cc-exp"
                                name="cc-exp"
                                type="text"
                                autoComplete="cc-exp"
                                maxLength={5}
                                placeholder="MM/YY"
                                value={cardDetails.expiry}
                                onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                                className="form-input"
                                style={{ width: '100%', padding: '8px 12px', fontSize: '0.88rem' }}
                              />
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                                CVV / CVC
                              </span>
                              <input
                                id="cc-csc"
                                name="cc-csc"
                                type="password"
                                autoComplete="cc-csc"
                                inputMode="numeric"
                                maxLength={4}
                                placeholder="•••"
                                value={cardDetails.cvv}
                                onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                                className="form-input"
                                style={{ width: '100%', padding: '8px 12px', fontSize: '0.88rem' }}
                              />
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                              Name on Card
                            </label>
                            <input
                              id="cc-name"
                              name="cc-name"
                              type="text"
                              autoComplete="cc-name"
                              placeholder="FATEH PRAJAPATI"
                              value={cardDetails.name}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                              className="form-input"
                              style={{ width: '100%', padding: '8px 12px', fontSize: '0.88rem', textTransform: 'uppercase' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* OPTION 3: Cash On Delivery (COD) */}
                    <div
                      onClick={() => setPaymentCategory('COD')}
                      style={{
                        border: paymentCategory === 'COD' ? '2px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                        background: paymentCategory === 'COD' ? 'rgba(15, 28, 63, 0.02)' : 'var(--bg-card)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="radio"
                            name="paymentCategory"
                            checked={paymentCategory === 'COD'}
                            onChange={() => setPaymentCategory('COD')}
                            style={{ accentColor: 'var(--accent-navy)', width: '18px', height: '18px' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Banknote size={18} style={{ color: 'var(--accent-navy)' }} />
                              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                Cash on Delivery (COD)
                              </strong>
                              <span
                                style={{
                                  background: 'rgba(15, 28, 63, 0.08)',
                                  color: 'var(--accent-navy)',
                                  fontSize: '0.7rem',
                                  fontWeight: '800',
                                  padding: '2px 6px',
                                  borderRadius: 'var(--radius-sm)'
                                }}
                              >
                                ZERO EXTRA CHARGE
                              </span>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              Pay in cash or scan QR code when your package arrives at your doorstep
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* OPTION 4: Wallets */}
                    <div
                      onClick={() => setPaymentCategory('WALLET')}
                      style={{
                        border: paymentCategory === 'WALLET' ? '2px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                        background: paymentCategory === 'WALLET' ? 'rgba(15, 28, 63, 0.02)' : 'var(--bg-card)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="radio"
                            name="paymentCategory"
                            checked={paymentCategory === 'WALLET'}
                            onChange={() => setPaymentCategory('WALLET')}
                            style={{ accentColor: 'var(--accent-navy)', width: '18px', height: '18px' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Wallet size={18} style={{ color: 'var(--accent-navy)' }} />
                              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                Wallets
                              </strong>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              Amazon Pay Balance, Paytm Wallet, PhonePe Wallet
                            </span>
                          </div>
                        </div>
                      </div>

                      {paymentCategory === 'WALLET' && (
                        <div
                          style={{
                            marginTop: '12px',
                            paddingTop: '12px',
                            borderTop: '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--bg-primary)',
                              border: selectedWallet === 'amazonpay_wallet' ? '1.5px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="radio"
                                name="walletChoice"
                                checked={selectedWallet === 'amazonpay_wallet'}
                                onChange={() => setSelectedWallet('amazonpay_wallet')}
                                style={{ accentColor: 'var(--accent-navy)' }}
                              />
                              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Amazon Pay Balance</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: '700' }}>
                              Available: ₹1,450
                            </span>
                          </label>

                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--bg-primary)',
                              border: selectedWallet === 'paytm_wallet' ? '1.5px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="radio"
                                name="walletChoice"
                                checked={selectedWallet === 'paytm_wallet'}
                                onChange={() => setSelectedWallet('paytm_wallet')}
                                style={{ accentColor: 'var(--accent-navy)' }}
                              />
                              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Paytm Wallet</span>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* OPTION 5: Net Banking */}
                    <div
                      onClick={() => setPaymentCategory('NETBANKING')}
                      style={{
                        border: paymentCategory === 'NETBANKING' ? '2px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                        background: paymentCategory === 'NETBANKING' ? 'rgba(15, 28, 63, 0.02)' : 'var(--bg-card)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="radio"
                            name="paymentCategory"
                            checked={paymentCategory === 'NETBANKING'}
                            onChange={() => setPaymentCategory('NETBANKING')}
                            style={{ accentColor: 'var(--accent-navy)', width: '18px', height: '18px' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Building size={18} style={{ color: 'var(--accent-navy)' }} />
                              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                Net Banking
                              </strong>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              All major Indian banks supported (HDFC, ICICI, SBI, Axis, Kotak)
                            </span>
                          </div>
                        </div>
                      </div>

                      {paymentCategory === 'NETBANKING' && (
                        <div
                          style={{
                            marginTop: '12px',
                            paddingTop: '12px',
                            borderTop: '1px solid var(--border-subtle)'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                            Select Bank:
                          </label>
                          <select
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="form-input"
                            style={{ width: '100%', padding: '10px 12px', fontSize: '0.88rem' }}
                          >
                            <option value="HDFC">HDFC Bank</option>
                            <option value="ICICI">ICICI Bank</option>
                            <option value="SBI">State Bank of India</option>
                            <option value="Axis">Axis Bank</option>
                            <option value="Kotak">Kotak Mahindra Bank</option>
                            <option value="PNB">Punjab National Bank</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 1 Action Footer */}
                  <div
                    style={{
                      marginTop: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      paddingTop: '16px',
                      borderTop: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                        Selected Payment:
                      </span>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--accent-navy)' }}>
                        {getPaymentMethodDisplay()}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="btn-primary"
                      style={{
                        padding: '12px 24px',
                        fontSize: '0.92rem',
                        fontWeight: '800',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>Continue to Address Selection</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 2: ADDRESS SELECTION (Primary & Multiple Addresses) */}
              {/* ======================================================== */}
              {currentStep === 2 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <div>
                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.25rem',
                          fontWeight: '800',
                          color: 'var(--text-primary)',
                          margin: 0
                        }}
                      >
                        Select Delivery Address
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Choose where you want your limited drop delivered, or add a new location.
                      </p>
                    </div>

                    {!isAddingNewAddress && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddressId(null);
                          setAddressForm({
                            fullName: currentUser?.name || '',
                            phone: currentUser?.phone || '',
                            addressLine: '',
                            city: '',
                            state: 'Maharashtra',
                            pincode: '',
                            tag: 'Home',
                            isPrimary: addresses.length === 0
                          });
                          setIsAddingNewAddress(true);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--accent-navy)',
                          color: '#FAF7F2',
                          fontSize: '0.8rem',
                          fontWeight: '800',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <Plus size={14} />
                        <span>Add New Address</span>
                      </button>
                    )}
                  </div>

                  {/* Add / Edit Address Form View */}
                  {isAddingNewAddress ? (
                    <div
                      style={{
                        background: 'var(--bg-card)',
                        border: '1.5px solid var(--accent-navy)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '18px',
                        marginBottom: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--accent-navy)' }}>
                          {editingAddressId ? 'Edit Address' : 'Add New Delivery Address'}
                        </strong>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewAddress(false);
                            setEditingAddressId(null);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: '700'
                          }}
                        >
                          Cancel
                        </button>
                      </div>

                      <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                              Full Name *
                            </label>
                            <input
                              type="text"
                              name="fullName"
                              autoComplete="name"
                              required
                              value={addressForm.fullName}
                              onChange={handleAddressInputChange}
                              className="form-input"
                              placeholder="e.g. Fateh Prajapati"
                              style={{ width: '100%', padding: '8px 12px', fontSize: '0.88rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                              Mobile Number (for delivery OTP) *
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              autoComplete="tel"
                              required
                              value={addressForm.phone}
                              onChange={handleAddressInputChange}
                              className="form-input"
                              placeholder="e.g. 9876543210"
                              style={{ width: '100%', padding: '8px 12px', fontSize: '0.88rem' }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                            Flat, House No., Building, Street *
                          </label>
                          <textarea
                            name="addressLine"
                            autoComplete="street-address"
                            required
                            rows={2}
                            value={addressForm.addressLine}
                            onChange={handleAddressInputChange}
                            className="form-input"
                            placeholder="e.g. Flat 402, High Street Boulevard, Bandra West"
                            style={{ width: '100%', padding: '8px 12px', fontSize: '0.88rem', resize: 'vertical' }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                Pincode *
                              </label>
                              <button
                                type="button"
                                onClick={handleAutoDetectLocation}
                                disabled={isDetecting}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--accent-red)',
                                  fontSize: '0.74rem',
                                  fontWeight: '800',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                  cursor: 'pointer'
                                }}
                              >
                                <Navigation size={10} />
                                <span>{isDetecting ? 'Detecting...' : 'Detect'}</span>
                              </button>
                            </div>
                            <input
                              type="text"
                              name="pincode"
                              autoComplete="postal-code"
                              required
                              maxLength={6}
                              value={addressForm.pincode}
                              onChange={handleAddressInputChange}
                              className="form-input"
                              placeholder="400001"
                              style={{ width: '100%', padding: '8px 12px', fontSize: '0.88rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                              City *
                            </label>
                            <input
                              type="text"
                              name="city"
                              autoComplete="address-level2"
                              required
                              value={addressForm.city}
                              onChange={handleAddressInputChange}
                              className="form-input"
                              placeholder="Mumbai"
                              style={{ width: '100%', padding: '8px 12px', fontSize: '0.88rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                              State *
                            </label>
                            <input
                              type="text"
                              name="state"
                              autoComplete="address-level1"
                              required
                              value={addressForm.state}
                              onChange={handleAddressInputChange}
                              className="form-input"
                              placeholder="Maharashtra"
                              style={{ width: '100%', padding: '8px 12px', fontSize: '0.88rem' }}
                            />
                          </div>
                        </div>

                        {/* Deliverability Badge */}
                        {deliveryStatus && (
                          <div
                            style={{
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-md)',
                              background: deliveryStatus.isDeliverable ? 'rgba(5, 150, 105, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                              border: `1px solid ${deliveryStatus.isDeliverable ? 'var(--accent-green)' : 'var(--accent-red)'}`,
                              fontSize: '0.78rem',
                              color: deliveryStatus.isDeliverable ? 'var(--accent-green)' : 'var(--accent-red)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Clock size={14} />
                            <span>
                              {deliveryStatus.isDeliverable
                                ? `Estimated Delivery: ${deliveryStatus.standardDays} days (${deliveryStatus.city}, ${deliveryStatus.state})`
                                : 'Pincode deliverability being checked.'}
                            </span>
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>
                            <input
                              type="checkbox"
                              name="isPrimary"
                              checked={addressForm.isPrimary}
                              onChange={handleAddressInputChange}
                              style={{ accentColor: 'var(--accent-navy)' }}
                            />
                            <span>Make this my Primary / Default Delivery Address</span>
                          </label>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            {['Home', 'Work', 'Studio'].map(tag => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => setAddressForm(prev => ({ ...prev, tag }))}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: 'var(--radius-full)',
                                  fontSize: '0.74rem',
                                  fontWeight: '700',
                                  border: addressForm.tag === tag ? '1.5px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                                  background: addressForm.tag === tag ? 'rgba(15, 28, 63, 0.08)' : 'var(--bg-primary)',
                                  color: addressForm.tag === tag ? 'var(--accent-navy)' : 'var(--text-secondary)',
                                  cursor: 'pointer'
                                }}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="btn-primary"
                          style={{
                            marginTop: '8px',
                            padding: '10px',
                            fontWeight: '800',
                            fontSize: '0.88rem'
                          }}
                        >
                          Save Address
                        </button>
                      </form>
                    </div>
                  ) : null}

                  {/* Saved Address Cards Listing */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {addresses.map((addr) => {
                      const isSelected = addr.id === selectedAddressId;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          style={{
                            padding: '16px',
                            borderRadius: 'var(--radius-lg)',
                            border: isSelected ? '2px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                            background: isSelected ? 'rgba(15, 28, 63, 0.02)' : 'var(--bg-card)',
                            boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <input
                                type="radio"
                                name="selectedAddress"
                                checked={isSelected}
                                onChange={() => setSelectedAddressId(addr.id)}
                                style={{ accentColor: 'var(--accent-navy)', width: '18px', height: '18px' }}
                              />
                              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                {addr.fullName}
                              </strong>
                              {addr.tag && (
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    fontWeight: '800',
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-secondary)'
                                  }}
                                >
                                  {addr.tag}
                                </span>
                              )}
                              {addr.isPrimary && (
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    fontWeight: '800',
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'rgba(15, 28, 63, 0.1)',
                                    color: 'var(--accent-navy)'
                                  }}
                                >
                                  ★ PRIMARY LOCATION
                                </span>
                              )}
                            </div>

                            {/* Edit / Delete Buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={(e) => handleStartEditAddress(addr, e)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 10px',
                                  borderRadius: 'var(--radius-md)',
                                  background: 'var(--bg-primary)',
                                  border: '1px solid var(--border-subtle)',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.76rem',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                <Edit2 size={12} />
                                <span>Edit</span>
                              </button>

                              {addresses.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteAddress(addr.id, e)}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    color: 'var(--accent-red)',
                                    cursor: 'pointer'
                                  }}
                                  title="Delete Address"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '28px' }}>
                            {addr.addressLine}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: '28px' }}>
                            Phone: {addr.phone}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Step 2 Action Footer */}
                  <div
                    style={{
                      marginTop: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      paddingTop: '16px',
                      borderTop: '1px solid var(--border-subtle)'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <ArrowLeft size={16} />
                      <span>Back to Payment</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!activeAddress) {
                          alert('Please select or add an address to continue.');
                          return;
                        }
                        setCurrentStep(3);
                      }}
                      className="btn-primary"
                      style={{
                        padding: '12px 24px',
                        fontSize: '0.92rem',
                        fontWeight: '800',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>Deliver to this Address • Continue to Summary</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 3: ORDER SUMMARY & FINAL REVIEW (Amazon-Style)      */}
              {/* ======================================================== */}
              {currentStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        color: 'var(--text-primary)',
                        margin: 0
                      }}
                    >
                      Order Details & Review
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Review your delivery destination, payment method, and streetwear items before placing order.
                    </p>
                  </div>

                  {/* SUMMARY CARD 1: DELIVERY ADDRESS (With Direct Change Option) */}
                  <div
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(15, 28, 63, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-navy)',
                          flexShrink: 0
                        }}
                      >
                        <MapPin size={16} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)' }}>
                          Delivery Address
                        </span>
                        <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                          {activeAddress?.fullName}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {activeAddress?.addressLine}, {activeAddress?.city}, {activeAddress?.state} - <strong>{activeAddress?.pincode}</strong>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Phone: {activeAddress?.phone}
                        </div>
                      </div>
                    </div>

                    {/* Change Address Action Button */}
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--accent-navy)',
                        color: 'var(--accent-navy)',
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Edit2 size={12} />
                      <span>Change Address</span>
                    </button>
                  </div>

                  {/* SUMMARY CARD 2: PAYMENT METHOD (With Direct Change Option) */}
                  <div
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(15, 28, 63, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-navy)',
                          flexShrink: 0
                        }}
                      >
                        <CreditCard size={16} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)' }}>
                          Payment Method
                        </span>
                        <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                          {getPaymentMethodDisplay()}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Encrypted 256-bit Secure Gateway • No Hidden Convenience Fees
                        </div>
                      </div>
                    </div>

                    {/* Change Payment Action Button */}
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--accent-navy)',
                        color: 'var(--accent-navy)',
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Edit2 size={12} />
                      <span>Change Payment</span>
                    </button>
                  </div>

                  {/* SUMMARY CARD 3: ORDER ITEMS BREAKDOWN */}
                  <div
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)' }}>
                        Items in Drop ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--accent-navy)', fontWeight: '700' }}>
                        Polorse Heavyweight Archive
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {cartItems.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            borderBottom: idx !== cartItems.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                            paddingBottom: idx !== cartItems.length - 1 ? '10px' : '0'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              style={{ width: '44px', height: '54px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                            <div>
                              <div style={{ fontSize: '0.86rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                                {item.title}
                              </div>
                              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                                Size: <strong>{item.selectedSize || 'Standard'}</strong> • Color:{' '}
                                <strong>{item.selectedColor || 'Standard'}</strong> • Qty: <strong>{item.quantity}</strong>
                              </div>
                            </div>
                          </div>

                          <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SUMMARY CARD 4: BILLING BREAKDOWN */}
                  <div
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      fontSize: '0.86rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Items Total ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
                      <span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-green)', fontWeight: '700' }}>
                        <span>Discount ({appliedCoupon?.code || 'COUPON'})</span>
                        <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Doorstep Express Shipping</span>
                      <span>{shipping === 0 ? 'FREE' : '₹99'}</span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '1.2rem',
                        fontWeight: '900',
                        fontFamily: 'var(--font-display)',
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '10px',
                        color: 'var(--text-primary)',
                        marginTop: '4px'
                      }}
                    >
                      <span>Total Amount Payable</span>
                      <span style={{ color: 'var(--accent-navy)' }}>₹{finalTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Trust & Exchange Assurance */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(15, 28, 63, 0.04)',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <Truck size={18} style={{ color: 'var(--accent-navy)', flexShrink: 0 }} />
                    <span>
                      Dispatched via <strong>Polorse Express Logistics</strong>. Includes 7-Day Doorstep Size Exchange &
                      Tamper-Proof Box.
                    </span>
                  </div>

                  {/* Final Place Order Action Button (Customized to Payment Method) */}
                  <div
                    style={{
                      marginTop: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handlePlaceOrder}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '1rem',
                        fontWeight: '900',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        background: 'var(--accent-navy)',
                        color: '#FAF7F2',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-md)',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Clock size={18} className="animate-spin" />
                          <span>Processing Secure Order...</span>
                        </>
                      ) : !currentUser ? (
                        <>
                          <Lock size={18} />
                          <span>Sign In to Place Order • ₹{finalTotal.toLocaleString('en-IN')}</span>
                        </>
                      ) : paymentCategory === 'COD' ? (
                        <>
                          <Banknote size={18} />
                          <span>Confirm & Place Order (Cash on Delivery) • ₹{finalTotal.toLocaleString('en-IN')}</span>
                        </>
                      ) : paymentCategory === 'UPI' ? (
                        <>
                          <Smartphone size={18} />
                          <span>Pay ₹{finalTotal.toLocaleString('en-IN')} via {getPaymentMethodDisplay()}</span>
                        </>
                      ) : (
                        <>
                          <CreditCard size={18} />
                          <span>Pay ₹{finalTotal.toLocaleString('en-IN')} with {getPaymentMethodDisplay()}</span>
                        </>
                      )}
                    </button>

                    <div style={{ textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      By confirming, you agree to Polorse Terms of Drop, Authentic Garment Guarantee & Return Policy.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
