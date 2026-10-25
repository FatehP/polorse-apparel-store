import React, { useState } from 'react';
import {
  X,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  Check,
  Sparkles,
  Truck,
  ShieldCheck,
  Plus,
  Zap
} from 'lucide-react';
import { validateCoupon } from '../services/storeService';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onAddToCart,
  onProceedToCheckout,
  appliedCoupon,
  setAppliedCoupon
}) {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [addedComboId, setAddedComboId] = useState(null);

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

  // Curated "Complete the Look" combo accessories
  const COMBO_RECOMMENDATIONS = [
    {
      id: 'combo-socks-01',
      title: 'Polorse Heavyweight Ribbed Socks (3-Pack)',
      category: 'Accessories',
      price: 499,
      originalPrice: 899,
      imageUrl: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=400&q=80',
      selectedSize: 'Free Size',
      selectedColor: 'Vintage Heather'
    },
    {
      id: 'combo-cap-02',
      title: 'Heritage Washed Twill Dad Cap',
      category: 'Headwear',
      price: 899,
      originalPrice: 1499,
      imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=400&q=80',
      selectedSize: 'Adjustable',
      selectedColor: 'Deep Navy'
    },
    {
      id: 'combo-tee-03',
      title: 'Essential Heavyweight Oversized Tee',
      category: 'T-Shirts',
      price: 1299,
      originalPrice: 2199,
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
      selectedSize: 'L',
      selectedColor: 'Bone Cream'
    },
    {
      id: 'combo-chain-04',
      title: 'Industrial Cuban Link Steel Chain',
      category: 'Jewellery',
      price: 799,
      originalPrice: 1299,
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80',
      selectedSize: '50cm',
      selectedColor: 'Silver Chrome'
    }
  ];

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

  const handleAddCombo = (comboItem) => {
    onAddToCart?.({
      id: comboItem.id,
      title: comboItem.title,
      category: comboItem.category,
      price: comboItem.price,
      originalPrice: comboItem.originalPrice,
      imageUrl: comboItem.imageUrl,
      selectedSize: comboItem.selectedSize,
      selectedColor: comboItem.selectedColor,
      quantity: 1
    });
    setAddedComboId(comboItem.id);
    setTimeout(() => setAddedComboId(null), 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 28, 63, 0.72)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 90,
        display: 'flex',
        justifyContent: 'flex-end',
        overscrollBehavior: 'contain'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          background: 'var(--bg-secondary)',
          borderLeft: '1.5px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* ======================================================== */}
        {/* DRAWER HEADER                                            */}
        {/* ======================================================== */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-navy)'
              }}
            >
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: '800' }}>
                Your Shopping Bag
              </h2>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)} Items Selected
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ======================================================== */}
        {/* PERSISTENT FREE SHIPPING PROGRESS BAR                    */}
        {/* ======================================================== */}
        <div
          style={{
            padding: '12px 24px',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.82rem',
              marginBottom: '6px'
            }}
          >
            {amountNeededForFreeShipping === 0 ? (
              <span style={{ color: 'var(--accent-green)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={14} /> FREE Express Shipping Unlocked!
              </span>
            ) : (
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                Add <strong style={{ color: 'var(--accent-red)' }}>₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</strong> more for <strong style={{ color: 'var(--accent-green)' }}>FREE Express Delivery</strong>!
              </span>
            )}
            <span style={{ fontWeight: '800', color: 'var(--accent-navy)', fontSize: '0.78rem' }}>
              {progressPercent}%
            </span>
          </div>

          {/* Progress track */}
          <div
            style={{
              width: '100%',
              height: '7px',
              background: 'var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: progressPercent === 100
                  ? 'var(--accent-green)'
                  : 'linear-gradient(90deg, var(--accent-navy) 0%, var(--accent-red) 100%)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* SCROLLABLE BODY (CART ITEMS + COMPLETE THE LOOK COMBOS)  */}
        {/* ======================================================== */}
        <div
          className="modal-scrollable-content"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {cartItems.length === 0 ? (
            <div
              style={{
                margin: 'auto',
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-muted)'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--bg-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'var(--text-secondary)'
                }}
              >
                <ShoppingBag size={28} />
              </div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '800', marginBottom: '6px' }}>
                Your Bag is Empty
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', maxWidth: '280px', margin: '0 auto 20px' }}>
                Explore hand-crafted heavyweight drops and add your favorite fits to unlock free delivery.
              </p>
              <button
                onClick={onClose}
                className="btn-primary"
                style={{ borderRadius: 'var(--radius-full)', padding: '10px 24px', fontSize: '0.88rem' }}
              >
                Explore Polorse Catalog
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cartItems.map((item, idx) => (
                  <div
                    key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                    style={{
                      display: 'flex',
                      gap: '14px',
                      background: 'var(--bg-card)',
                      padding: '12px',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-subtle)',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      style={{
                        width: '74px',
                        height: '88px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)',
                        background: '#FAF7F2',
                        border: '1px solid var(--border-subtle)'
                      }}
                    />

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '24px' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '700', lineHeight: '1.3' }}>
                          {item.title}
                        </h4>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                          <span>Size: <strong style={{ color: 'var(--accent-navy)' }}>{item.selectedSize}</strong></span>
                          <span>•</span>
                          <span>Color: <strong style={{ color: 'var(--text-primary)' }}>{item.selectedColor}</strong></span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                        <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--accent-navy)' }}>
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>

                        {/* Quantity Stepper */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'var(--bg-primary)',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item, item.quantity - 1)}
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: '0.82rem', fontWeight: '800', minWidth: '16px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item, item.quantity + 1)}
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              background: 'var(--accent-navy)',
                              color: '#FAF7F2',
                              fontSize: '0.85rem',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Remove item button */}
                      <button
                        onClick={() => onRemoveItem(item)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          color: 'var(--text-muted)',
                          padding: '4px',
                          borderRadius: '50%'
                        }}
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ======================================================== */}
              {/* DYNAMIC "COMPLETE THE LOOK" COMBO RECOMMENDATION ROW     */}
              {/* ======================================================== */}
              <div
                style={{
                  marginTop: '8px',
                  padding: '16px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} style={{ color: 'var(--accent-gold)' }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Complete The Look • Add-Ons
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-navy)', fontWeight: '700' }}>
                    Special Street Combos
                  </span>
                </div>

                <div className="cart-combo-row">
                  {COMBO_RECOMMENDATIONS.map((combo) => {
                    const isAdded = addedComboId === combo.id;
                    return (
                      <div
                        key={combo.id}
                        style={{
                          width: '160px',
                          flexShrink: 0,
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <img
                          src={combo.imageUrl}
                          alt={combo.title}
                          style={{
                            width: '100%',
                            height: '95px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-sm)',
                            background: '#FAF7F2'
                          }}
                        />
                        <h5
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                            lineHeight: 1.25,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: '2.5em'
                          }}
                        >
                          {combo.title}
                        </h5>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-navy)' }}>
                            ₹{combo.price}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            ₹{combo.originalPrice}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddCombo(combo)}
                          style={{
                            padding: '5px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: isAdded ? 'var(--accent-green)' : 'var(--accent-navy)',
                            color: '#FAF7F2',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isAdded ? (
                            <>
                              <Check size={12} />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus size={12} />
                              <span>+ Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Confidence Badges */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(15, 28, 63, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={14} style={{ color: 'var(--accent-navy)' }} />
                  <span>Ships in 24 Hours</span>
                </div>
                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} style={{ color: 'var(--accent-green)' }} />
                  <span>7-Day Exchange</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ======================================================== */}
        {/* CHECKOUT SUMMARY & PROMO COUPONS FOOTER                  */}
        {/* ======================================================== */}
        {cartItems.length > 0 && (
          <div
            style={{
              padding: '18px 24px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 -4px 16px rgba(15, 28, 63, 0.05)'
            }}
          >
            {/* Promo Code Input */}
            <div>
              {appliedCoupon ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(5, 150, 105, 0.08)',
                    border: '1px solid rgba(5, 150, 105, 0.3)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tag size={15} style={{ color: 'var(--accent-green)' }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--accent-green)' }}>
                      Code <strong>{appliedCoupon.code}</strong> Applied (-₹{discountAmount})
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    style={{ fontSize: '0.75rem', color: 'var(--accent-red)', fontWeight: '700', cursor: 'pointer' }}
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
                      style={{ textTransform: 'uppercase', fontSize: '0.84rem', padding: '8px 12px' }}
                    />
                    <button
                      onClick={() => handleApplyCoupon()}
                      className="btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '0.84rem', fontWeight: '700' }}
                    >
                      Apply
                    </button>
                  </div>

                  {/* Quick coupon chips */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Offers:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('POLORSE500')}
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(194, 26, 44, 0.08)',
                        color: 'var(--accent-red)',
                        border: '1px dashed var(--accent-red)',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      POLORSE500 (₹500 OFF)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('FIRSTDROP')}
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(15, 28, 63, 0.06)',
                        color: 'var(--accent-navy)',
                        border: '1px dashed var(--accent-navy)',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      FIRSTDROP (20% OFF)
                    </button>
                  </div>

                  {couponError && (
                    <div style={{ color: 'var(--accent-red)', fontSize: '0.76rem', marginTop: '4px' }}>
                      {couponError}
                    </div>
                  )}
                  {couponSuccess && (
                    <div style={{ color: 'var(--accent-green)', fontSize: '0.76rem', marginTop: '4px' }}>
                      {couponSuccess}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Price Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Bag Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-green)', fontWeight: '700' }}>
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Delivery Charges</span>
                <span style={{ color: amountNeededForFreeShipping === 0 ? 'var(--accent-green)' : 'var(--text-primary)', fontWeight: '700' }}>
                  {amountNeededForFreeShipping === 0 ? 'FREE EXPRESS' : '₹99'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: 'var(--text-primary)',
                  fontWeight: '800',
                  fontSize: '1.15rem',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '8px',
                  marginTop: '4px'
                }}
              >
                <span>Total Payable</span>
                <span style={{ color: 'var(--accent-navy)' }}>
                  ₹{(total + (amountNeededForFreeShipping === 0 ? 0 : 99)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* High-Converting Checkout CTA Button */}
            <button
              onClick={onProceedToCheckout}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)'
              }}
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
