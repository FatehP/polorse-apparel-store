import React, { useState } from 'react';
import { Plus, Eye, Check } from 'lucide-react';

export default function ProductCard({ product, onSelectProduct, onQuickAdd }) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.size || '');
  const [isAdded, setIsAdded] = useState(false);

  // Calculate discount percentage
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAddClick = (e) => {
    e.stopPropagation();
    onQuickAdd({
      ...product,
      selectedColor,
      selectedSize,
      quantity: 1
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
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
      {/* Product Image Frame */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '105%',
        background: '#15151a',
        overflow: 'hidden'
      }}>
        <img
          src={product.imageUrl || '/products/hoodie-charcoal.jpg'}
          alt={product.title}
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

        {/* Top Badges */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 2
        }}>
          {product.tags?.map((tag, idx) => (
            <span
              key={idx}
              className={`badge-tag ${idx === 0 ? 'badge-orange' : ''}`}
            >
              {tag}
            </span>
          ))}
          {discountPercent > 0 && (
            <span className="badge-tag badge-lime">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Quick View Button on Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectProduct(product);
          }}
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(10, 10, 12, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid var(--border-subtle)',
            zIndex: 2
          }}
        >
          <Eye size={13} />
          <span>Quick View</span>
        </button>
      </div>

      {/* Product Content Details */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '10px' }}>
        <div>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>
            {product.category}
          </span>
          <h3 style={{
            fontSize: '1.05rem',
            color: 'var(--text-primary)',
            marginTop: '3px',
            lineHeight: '1.3'
          }}>
            {product.title}
          </h3>
        </div>

        {/* Colors & Sizes Chips */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          {/* Color Swatches */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
            {product.colors?.map((col) => (
              <button
                key={col.name}
                onClick={() => setSelectedColor(col.name)}
                title={col.name}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: col.hex,
                  border: selectedColor === col.name ? '2px solid var(--accent-navy)' : '1px solid rgba(15,28,63,0.15)',
                  boxShadow: selectedColor === col.name ? '0 0 6px rgba(15,28,63,0.3)' : 'none',
                  transform: selectedColor === col.name ? 'scale(1.15)' : 'scale(1)'
                }}
              />
            ))}
          </div>

          {/* Sizes Pill Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
            {product.sizes?.slice(0, 4).map((s) => (
              <button
                key={s.size}
                onClick={() => setSelectedSize(s.size)}
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: '600',
                  background: selectedSize === s.size ? 'var(--accent-navy)' : 'var(--bg-primary)',
                  color: selectedSize === s.size ? '#fff' : 'var(--text-secondary)',
                  border: selectedSize === s.size ? '1px solid var(--accent-navy)' : '1px solid var(--border-subtle)'
                }}
              >
                {s.size}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing & Add to Bag Action */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'var(--text-primary)'
              }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <span style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'line-through'
                }}>
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleQuickAddClick}
            disabled={!product.inStock}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: isAdded ? 'var(--accent-green)' : 'var(--accent-navy)',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: '600',
              borderRadius: 'var(--radius-md)',
              boxShadow: isAdded ? '0 2px 10px rgba(5, 150, 105, 0.3)' : '0 2px 10px rgba(15, 28, 63, 0.15)',
              cursor: product.inStock ? 'pointer' : 'not-allowed',
              opacity: product.inStock ? 1 : 0.5
            }}
          >
            {isAdded ? (
              <>
                <Check size={14} />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus size={14} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
