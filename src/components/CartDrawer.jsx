import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';
import { validateCoupon } from '../services/storeService';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  appliedCoupon,
  setAppliedCoupon
}) {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isOpen) return null;

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discountAmount = Math.min(appliedCoupon.value, subtotal);
    }
  }

  const freeShippingThreshold = 1999;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = async (codeToTry) => {
    const code = (codeToTry || couponInput).trim();
    setCouponError('');
    setCouponSuccess('');

    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    const result = await validateCoupon(code, subtotal);
    if (result.valid) {
      setAppliedCoupon(result.coupon);
      setCouponSuccess(result.message);
      setCouponInput('');
    } else {
      setCouponError(result.message);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 60,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} style={{ color: 'var(--accent-navy)' }} />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Your Bag</h2>
            <span className="badge-tag">
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)} items
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              color: 'var(--text-secondary)',
              padding: '6px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div style={{
          padding: '12px 24px',
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            marginBottom: '6px',
            color: 'var(--text-secondary)'
          }}>
            {amountNeededForFreeShipping === 0 ? (
              <span style={{ color: 'var(--accent-green)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={14} /> You unlocked FREE Express Shipping!
              </span>
            ) : (
              <span>
                Add <strong>₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</strong> more for FREE Shipping!
              </span>
            )}
            <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{progressPercent}%</span>
          </div>

          <div style={{
            width: '100%',
            height: '6px',
            background: 'var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: progressPercent === 100 ? 'var(--accent-green)' : 'var(--accent-navy)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Cart Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cartItems.length === 0 ? (
            <div style={{
              margin: 'auto',
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-muted)'
            }}>
              <ShoppingBag size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>Your Bag is Empty</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>Discover the latest drop and add your favorite fits.</p>
              <button onClick={onClose} className="btn-secondary" style={{ borderRadius: 'var(--radius-full)' }}>
                Explore Clothes
              </button>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div
                key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                style={{
                  display: 'flex',
                  gap: '14px',
                  background: 'var(--bg-card)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  position: 'relative'
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{
                    width: '74px',
                    height: '84px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-sm)',
                    background: '#111'
                  }}
                />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: '1.3' }}>
                      {item.title}
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <span>Size: <strong style={{ color: 'var(--text-primary)' }}>{item.selectedSize}</strong></span>
                      <span>•</span>
                      <span>Color: <strong style={{ color: 'var(--text-primary)' }}>{item.selectedColor}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '1rem' }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <button
                        onClick={() => onUpdateQuantity(item, item.quantity - 1)}
                        style={{ padding: '4px 8px', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', minWidth: '20px', textAlign: 'center', color: 'var(--text-primary)' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item, item.quantity + 1)}
                        style={{ padding: '4px 8px', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveItem(item)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    color: 'var(--text-muted)',
                    padding: '4px'
                  }}
                  title="Remove item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Coupon Codes & Checkout Summary (only when cart has items) */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            {/* Coupon input */}
            <div>
              {appliedCoupon ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(197, 255, 70, 0.1)',
                  border: '1px solid rgba(197, 255, 70, 0.3)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tag size={16} style={{ color: 'var(--accent-lime)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-lime)' }}>
                      Code <strong>{appliedCoupon.code}</strong> Applied (-₹{discountAmount})
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    style={{ fontSize: '0.78rem', color: 'var(--accent-red)', fontWeight: '600' }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Enter promo coupon..."
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      style={{ textTransform: 'uppercase', fontSize: '0.85rem', padding: '8px 12px' }}
                    />
                    <button
                      onClick={() => handleApplyCoupon()}
                      className="btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      Apply
                    </button>
                  </div>

                  {/* Quick coupon chips */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Quick codes:</span>
                    <button
                      onClick={() => handleApplyCoupon('FIRSTDROP')}
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(243, 91, 4, 0.15)',
                        color: 'var(--accent-orange)',
                        border: '1px dashed var(--accent-orange)'
                      }}
                    >
                      FIRSTDROP (20% OFF)
                    </button>
                    <button
                      onClick={() => handleApplyCoupon('STREET10')}
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: 'var(--text-secondary)',
                        border: '1px dashed var(--border-subtle)'
                      }}
                    >
                      STREET10 (10% OFF)
                    </button>
                  </div>

                  {couponError && (
                    <div style={{ color: 'var(--accent-red)', fontSize: '0.78rem', marginTop: '4px' }}>
                      {couponError}
                    </div>
                  )}
                  {couponSuccess && (
                    <div style={{ color: 'var(--accent-green)', fontSize: '0.78rem', marginTop: '4px' }}>
                      {couponSuccess}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Price Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-lime)', fontWeight: '600' }}>
                  <span>Promo Discount</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Shipping</span>
                <span style={{ color: 'var(--accent-lime)', fontWeight: '600' }}>
                  {amountNeededForFreeShipping === 0 ? 'FREE' : '₹99'}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'var(--text-primary)',
                fontWeight: '700',
                fontSize: '1.15rem',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '8px',
                marginTop: '4px'
              }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--accent-orange)' }}>
                  ₹{(total + (amountNeededForFreeShipping === 0 ? 0 : 99)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={onProceedToCheckout}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
