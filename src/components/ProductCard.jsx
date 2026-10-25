import React, { useState } from 'react';
import { Plus, Eye, Check, Zap, Heart, Minus, ShoppingBag } from 'lucide-react';

export default function ProductCard({
  product,
  cart = [],
  isWishlisted = false,
  onToggleWishlist,
  onSelectProduct,
  onQuickAdd,
  onUpdateQuantity,
  onBuyNow
}) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.size || '');
  const [isAdded, setIsAdded] = useState(false);
  const [addedSize, setAddedSize] = useState(null);
  const [wishlistPopped, setWishlistPopped] = useState(false);

  // Check if this product + selected size & color is in the cart
  const cartItem = cart?.find(
    item => item.id === product.id &&
            item.selectedSize === selectedSize &&
            (!selectedColor || item.selectedColor === selectedColor)
  );
  const inCartQty = cartItem ? cartItem.quantity : 0;

  // Calculate discount percentage
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAddClick = (e, sizeOverride) => {
    e.stopPropagation();
    const sizeToUse = sizeOverride || selectedSize || product.sizes?.[0]?.size || 'M';
    setSelectedSize(sizeToUse);
    onQuickAdd({
      ...product,
      selectedColor,
      selectedSize: sizeToUse,
      quantity: 1
    });
    setAddedSize(sizeToUse);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setAddedSize(null);
    }, 1200);
  };

  const handleBuyNowClick = (e) => {
    e.stopPropagation();
    if (onBuyNow) {
      onBuyNow({
        ...product,
        selectedColor,
        selectedSize: selectedSize || product.sizes?.[0]?.size || 'M',
        quantity: 1
      });
    }
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    setWishlistPopped(true);
    setTimeout(() => setWishlistPopped(false), 380);
    onToggleWishlist?.(product.id);
  };

  // Determine inventory / status tag
  const statusTag = product.tags?.find(t =>
    ['BESTSELLER', 'LIMITED DROP', 'NEW ARRIVAL', 'DROP 01', 'OVERSIZED'].includes(t.toUpperCase())
  ) || (product.isFeatured ? 'HOT DROP' : 'LIMITED');

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="product-card-container"
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal)',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.borderColor = 'var(--border-hover)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* ======================================================== */}
      {/* 4:5 HIGH-IMPACT PRODUCT IMAGE FRAME                      */}
      {/* ======================================================== */}
      <div
        className="product-card-frame"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 5',
          background: '#FAF7F2',
          borderBottom: '1px solid var(--border-subtle)',
          overflow: 'hidden'
        }}
      >
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'}
          alt=""
          aria-label={product.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80';
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        />

        {/* Top Badges (Status + Discount) */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            zIndex: 2
          }}
        >
          <span
            className="badge-tag badge-navy"
            style={{
              letterSpacing: '0.08em',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
              fontSize: '0.64rem'
            }}
          >
            [{statusTag}]
          </span>

          {discountPercent > 0 && (
            <span
              className="badge-tag badge-red"
              style={{
                boxShadow: '0 2px 6px rgba(194, 26, 44, 0.25)',
                fontSize: '0.64rem'
              }}
            >
              [{discountPercent}% OFF]
            </span>
          )}
        </div>

        {/* Top-Right Wishlist Floating Heart Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={wishlistPopped ? 'animate-heart-pop' : ''}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isWishlisted ? 'var(--accent-red)' : 'var(--text-secondary)',
            cursor: 'pointer',
            zIndex: 4,
            transition: 'transform 0.18s ease'
          }}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            size={16}
            fill={isWishlisted ? 'var(--accent-red)' : 'none'}
            style={{ color: isWishlisted ? 'var(--accent-red)' : 'currentColor' }}
          />
        </button>

        {/* Quick-Action Hover Overlay (Indian D2C Fashion Style) */}
        <div className="product-card-quick-overlay">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#FAF7F2', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Quick Add Size
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectProduct(product);
              }}
              style={{
                fontSize: '0.68rem',
                color: '#FCD34D',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <Eye size={12} /> View Full
            </button>
          </div>

          {/* Quick Size Select Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {product.sizes?.map((sz) => {
              const isSelected = addedSize === sz.size;
              return (
                <button
                  key={sz.size}
                  type="button"
                  onClick={(e) => handleQuickAddClick(e, sz.size)}
                  disabled={sz.stock === 0}
                  style={{
                    flex: '1 0 auto',
                    padding: '5px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    background: isSelected ? 'var(--accent-green)' : 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(4px)',
                    color: '#FAF7F2',
                    border: isSelected ? '1px solid var(--accent-green)' : '1px solid rgba(255, 255, 255, 0.25)',
                    cursor: sz.stock === 0 ? 'not-allowed' : 'pointer',
                    opacity: sz.stock === 0 ? 0.4 : 1,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (sz.stock > 0 && !isSelected) {
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.color = 'var(--accent-navy)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
                      e.currentTarget.style.color = '#FAF7F2';
                    }
                  }}
                >
                  {isSelected ? <Check size={12} /> : sz.size}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PRODUCT DETAILS & CARD FOOTER                            */}
      {/* ======================================================== */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {/* Category & Color Swatches Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: '700' }}>
            {product.category || 'Apparel'}
          </span>

          {/* Color Dots */}
          {product.colors && product.colors.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {product.colors.slice(0, 4).map((c, idx) => (
                <span
                  key={idx}
                  title={c.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColor(c.name);
                  }}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: c.hex || '#111',
                    border: selectedColor === c.name ? '2px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    display: 'inline-block'
                  }}
                />
              ))}
              {product.colors.length > 4 && (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Product Title */}
        <h3
          style={{
            fontSize: '0.96rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            lineHeight: 1.35,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '2.7em'
          }}
        >
          {product.title}
        </h3>

        {/* Pricing & Savings */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
          <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-navy)' }}>
            ₹{product.price?.toLocaleString('en-IN')}
          </span>
          {product.originalPrice && (
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
              ₹{product.originalPrice?.toLocaleString('en-IN')}
            </span>
          )}
          {discountPercent > 0 && (
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: 'var(--accent-red)' }}>
              ({discountPercent}% OFF)
            </span>
          )}
        </div>

        {/* Quick Stepper or Add to Bag Action Button */}
        <div style={{ marginTop: '6px' }}>
          {inCartQty > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-primary)',
                border: '1.5px solid var(--accent-navy)',
                borderRadius: 'var(--radius-md)',
                padding: '4px 10px',
                height: '38px'
              }}
            >
              <button
                type="button"
                onClick={() => onUpdateQuantity(cartItem, inCartQty - 1)}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Minus size={13} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--accent-navy)' }}>
                  {inCartQty} in Bag
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  ({selectedSize})
                </span>
              </div>

              <button
                type="button"
                onClick={() => onUpdateQuantity(cartItem, inCartQty + 1)}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'var(--accent-navy)',
                  color: '#FAF7F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px' }}>
              <button
                type="button"
                onClick={handleQuickAddClick}
                style={{
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: isAdded ? 'var(--accent-green)' : 'var(--accent-navy)',
                  color: '#FAF7F2',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                {isAdded ? (
                  <>
                    <Check size={15} />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNowClick}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(194, 26, 44, 0.08)',
                  border: '1px solid rgba(194, 26, 44, 0.25)',
                  color: 'var(--accent-red)',
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Instant Buy Now with Express Checkout"
              >
                <Zap size={13} />
                <span>Buy</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
