import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Truck, Smartphone, Banknote, ArrowRight, Check, MapPin, Navigation, Clock, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createOrder } from '../services/storeService';
import { checkPincodeDeliverability, autoDetectLocation } from '../services/pincodeService';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  appliedCoupon,
  onOrderSuccess
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    state: 'Maharashtra'
  });

  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'UPI'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState(null);

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

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'pincode') {
      const clean = value.replace(/[^0-9]/g, '');
      if (clean.length === 6) {
        const info = await checkPincodeDeliverability(clean);
        setDeliveryStatus(info);
        if (info.isDeliverable) {
          setFormData(prev => ({
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

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    const loc = await autoDetectLocation();
    if (loc?.pincode) {
      setFormData(prev => ({
        ...prev,
        pincode: loc.pincode,
        city: loc.city || prev.city,
        state: loc.state || prev.state
      }));
      setDeliveryStatus(loc.deliveryInfo);
    }
    setIsDetecting(false);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone || !formData.address || !formData.pincode) {
      alert("Please fill in all delivery details");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: formData.customerName,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        items: cartItems.map(item => ({
          id: item.id,
          title: item.title,
          size: item.selectedSize,
          color: item.selectedColor,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        })),
        subtotal,
        discount: discountAmount,
        couponApplied: appliedCoupon ? appliedCoupon.code : null,
        shipping,
        total: finalTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'UPI' ? 'PAID (UPI)' : 'PENDING (COD)',
        orderStatus: 'Confirmed'
      };

      const placedOrder = await createOrder(orderPayload);
      setCompletedOrder(placedOrder);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.warn("Confetti ignored", err);
      }

      onOrderSuccess();
    } catch (err) {
      console.error("Order creation failed", err);
      alert("Failed to place order. Please try again.");
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
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: completedOrder ? '560px' : '780px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            color: 'var(--text-secondary)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <X size={16} />
        </button>

        {completedOrder ? (
          /* Order Confirmation View */
          <div style={{ padding: '40px 32px', textAlign: 'center' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid var(--accent-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'var(--accent-green)'
            }}>
              <CheckCircle2 size={38} />
            </div>

            <span className="badge-tag badge-lime" style={{ marginBottom: '10px' }}>
              ORDER CONFIRMED
            </span>

            <h2 style={{ fontSize: '1.8rem', color: '#fff', marginTop: '6px' }}>
              Thank You, {completedOrder.customerName.split(' ')[0]}!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '6px' }}>
              Your streetwear drop is being prepped. Order ID: <strong>{completedOrder.id}</strong>
            </p>

            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              marginTop: '24px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                <strong style={{ color: '#fff' }}>{completedOrder.paymentMethod}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                <strong style={{ color: 'var(--accent-orange)' }}>₹{completedOrder.total.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Deliver To:</span>
                <span style={{ color: '#fff', maxWidth: '65%', textAlign: 'right' }}>{completedOrder.address}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Phone / WhatsApp:</span>
                <strong style={{ color: '#fff' }}>{completedOrder.phone}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <a
                href={`https://wa.me/?text=Hi!%20I%20just%20placed%20order%20${completedOrder.id}%20for%20Polorse%20totaling%20₹${completedOrder.total}.`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}
              >
                Notify on WhatsApp
              </a>
              <button
                onClick={onClose}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                Back to Store
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Input Form */
          <div style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>Checkout & Delivery</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
              Fast Pan-India shipping with Cash on Delivery or Instant UPI.
            </p>

            <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {/* Left Column: Customer & Shipping Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  1. Shipping Information
                </h3>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    placeholder="e.g. Aryan Sharma"
                    value={formData.customerName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Delivery Address (House/Building, Street) *
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={2}
                    placeholder="e.g. Flat 301, Silver Oak Apts, MG Road"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="e.g. Mumbai"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        PIN Code *
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoDetect}
                        disabled={isDetecting}
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--accent-red)',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          background: 'none',
                          border: 'none',
                          padding: 0
                        }}
                      >
                        <Navigation size={10} className={isDetecting ? 'animate-spin' : ''} />
                        <span>{isDetecting ? 'Detecting...' : 'Auto-Detect'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      name="pincode"
                      maxLength={6}
                      required
                      placeholder="400001"
                      value={formData.pincode}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Delivery Verification Badge */}
                {deliveryStatus && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: deliveryStatus.isDeliverable ? 'rgba(5, 150, 105, 0.08)' : 'rgba(194, 26, 44, 0.08)',
                    border: `1px solid ${deliveryStatus.isDeliverable ? 'rgba(5, 150, 105, 0.25)' : 'rgba(194, 26, 44, 0.25)'}`,
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {deliveryStatus.isDeliverable ? (
                      <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} />
                    ) : (
                      <AlertCircle size={14} style={{ color: 'var(--accent-red)' }} />
                    )}
                    <span style={{ color: deliveryStatus.isDeliverable ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: '600' }}>
                      {deliveryStatus.isDeliverable
                        ? `✓ Serviceable to ${deliveryStatus.city || formData.city} (${deliveryStatus.deliveryDays}) • ${deliveryStatus.isCodAllowed ? 'COD Available' : 'Prepaid Only'}`
                        : 'Pincode not currently serviceable'}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column: Payment Method & Order Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  2. Choose Payment Mode
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* COD Option */}
                  <div
                    onClick={() => setPaymentMethod('COD')}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      background: paymentMethod === 'COD' ? 'rgba(243, 91, 4, 0.1)' : 'var(--bg-card)',
                      border: paymentMethod === 'COD' ? '2px solid var(--accent-orange)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <Banknote size={24} style={{ color: paymentMethod === 'COD' ? 'var(--accent-orange)' : 'var(--text-muted)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '0.95rem' }}>Cash on Delivery (COD)</strong>
                        <span className="badge-tag badge-lime">POPULAR</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Pay in cash or UPI when your parcel is delivered to your doorstep.
                      </p>
                    </div>
                  </div>

                  {/* UPI Option */}
                  <div
                    onClick={() => setPaymentMethod('UPI')}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      background: paymentMethod === 'UPI' ? 'rgba(0, 240, 255, 0.1)' : 'var(--bg-card)',
                      border: paymentMethod === 'UPI' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <Smartphone size={24} style={{ color: paymentMethod === 'UPI' ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '0.95rem' }}>Instant UPI / QR</strong>
                        <span className="badge-tag">GPay / PhonePe / Paytm</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Zero transaction fees, immediate instant order confirmation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Final Order Review Box */}
                <div style={{
                  background: 'var(--bg-card)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginTop: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Items ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-lime)' }}>
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : '₹99'}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.15rem',
                    fontWeight: '700',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '8px',
                    color: '#fff'
                  }}>
                    <span>Amount Payable</span>
                    <span style={{ color: 'var(--accent-orange)' }}>₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                >
                  {isSubmitting ? 'Placing Order...' : `Confirm Order • ₹${finalTotal.toLocaleString('en-IN')}`}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
