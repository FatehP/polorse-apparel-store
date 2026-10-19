import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Truck,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  MapPin,
  Navigation,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { checkPincodeDeliverability, autoDetectLocation } from '../services/pincodeService';

export default function ProductModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.size || '');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Multi-image list
  const imageList = (Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : [product.imageUrl || '/products/hoodie-charcoal.jpg'];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Reset active image when product changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    setActiveImageIndex(prev => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    setActiveImageIndex(prev => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation for image gallery
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageList.length]);

  // Pincode Deliverability State
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const savingsAmount = product.originalPrice ? product.originalPrice - product.price : 0;

  const currentSizeObj = product.sizes?.find(s => s.size === selectedSize);
  const currentStock = currentSizeObj?.stock ?? 10;

  const handleCheckPincode = async (e) => {
    if (e) e.preventDefault();
    if (!pincodeInput.trim()) return;
    setIsCheckingPincode(true);
    const res = await checkPincodeDeliverability(pincodeInput);
    setPincodeResult(res);
    setIsCheckingPincode(false);
  };

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    const loc = await autoDetectLocation();
    if (loc?.pincode) {
      setPincodeInput(loc.pincode);
      setPincodeResult(loc.deliveryInfo);
    }
    setIsDetecting(false);
  };

  const handleAdd = () => {
    onAddToCart({
      ...product,
      selectedColor,
      selectedSize,
      quantity,
      imageUrl: imageList[activeImageIndex] || product.imageUrl
    });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
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
        zIndex: 50,
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
          maxWidth: '960px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Left Side: Full-Bleed Product Image with Floating Thumbnail Grid */}
        <div style={{
          position: 'relative',
          width: '100%',
          minHeight: '520px',
          height: '100%',
          overflow: 'hidden',
          background: 'transparent',
          borderRight: '1px solid var(--border-subtle)'
        }}>
          {/* Full-Bleed Main Image Filling Entire Height */}
          <img
            key={activeImageIndex}
            src={imageList[activeImageIndex]}
            alt={`${product.title} - Angle ${activeImageIndex + 1}`}
            className="animate-fade"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />

          {/* Badges on Top-Left */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
            {product.tags?.map((tag, idx) => (
              <span key={idx} className="badge-tag badge-red">{tag}</span>
            ))}
            {discountPercent > 0 && (
              <span className="badge-tag badge-lime">{discountPercent}% OFF</span>
            )}
          </div>

          {/* Left & Right Navigational Arrows */}
          {imageList.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                aria-label="Previous image"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(4px)',
                  color: 'var(--accent-navy)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
              >
                <ChevronLeft size={20} />
              </button>

              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Next image"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(4px)',
                  color: 'var(--accent-navy)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Floating Thumbnail Grid (Overlay Above Full Image with Transparent Background) */}
          {imageList.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: 0,
              right: 0,
              padding: '0 16px',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              zIndex: 10,
              overflowX: 'auto'
            }}>
              {imageList.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`View photo ${idx + 1}`}
                  style={{
                    position: 'relative',
                    width: '58px',
                    height: '58px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: activeImageIndex === idx
                      ? '2.5px solid #0F1C3F'
                      : '1.5px solid rgba(255, 255, 255, 0.9)',
                    outline: activeImageIndex === idx ? '2px solid #FFFFFF' : 'none',
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.28)',
                    opacity: activeImageIndex === idx ? 1 : 0.82,
                    transform: activeImageIndex === idx ? 'scale(1.06)' : 'scale(1)',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    padding: 0,
                    background: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (activeImageIndex !== idx) e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    if (activeImageIndex !== idx) e.currentTarget.style.opacity = '0.82';
                  }}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Controls */}
        <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <span style={{
              fontSize: '0.8rem',
              color: 'var(--accent-red)',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              {product.category}
            </span>
            <h2 style={{
              fontSize: '1.6rem',
              color: 'var(--text-primary)',
              marginTop: '4px',
              lineHeight: '1.2'
            }}>
              {product.title}
            </h2>

            {/* Price section */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '10px' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: '700',
                color: 'var(--text-primary)'
              }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <>
                  <span style={{
                    fontSize: '1.05rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'line-through'
                  }}>
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span style={{
                    fontSize: '0.85rem',
                    color: 'var(--accent-lime)',
                    fontWeight: '600'
                  }}>
                    Save ₹{savingsAmount.toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {product.description}
          </p>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  Colorway: <strong style={{ color: '#fff' }}>{selectedColor}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {product.colors.map(col => (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColor(col.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      background: selectedColor === col.name ? 'rgba(255,255,255,0.12)' : 'var(--bg-card)',
                      border: selectedColor === col.name ? '2px solid var(--accent-orange)' : '1px solid var(--border-subtle)',
                      color: selectedColor === col.name ? '#fff' : 'var(--text-secondary)',
                      fontSize: '0.82rem',
                      fontWeight: '600'
                    }}
                  >
                    <span style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: col.hex,
                      display: 'inline-block'
                    }} />
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  Select Size (Street Fit):
                </span>
                {currentStock < 10 && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-orange)', fontWeight: '700' }}>
                    🔥 Only {currentStock} pieces left in {selectedSize}!
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {product.sizes.map(s => (
                  <button
                    key={s.size}
                    onClick={() => setSelectedSize(s.size)}
                    style={{
                      minWidth: '46px',
                      height: '42px',
                      padding: '0 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      background: selectedSize === s.size ? 'var(--accent-navy)' : 'var(--bg-secondary)',
                      color: selectedSize === s.size ? '#fff' : 'var(--text-primary)',
                      border: selectedSize === s.size ? '2px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Location & Pincode Deliverability Checker */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                <MapPin size={16} style={{ color: 'var(--accent-red)' }} />
                <span>Check Delivery & COD Availability</span>
              </div>

              <button
                type="button"
                onClick={handleAutoDetect}
                disabled={isDetecting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--accent-navy)',
                  background: 'rgba(15, 28, 63, 0.06)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                <Navigation size={12} className={isDetecting ? 'animate-spin' : ''} />
                <span>{isDetecting ? 'Detecting...' : 'Auto-Detect PIN'}</span>
              </button>
            </div>

            <form onSubmit={handleCheckPincode} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit Indian PIN (e.g. 560038)"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                style={{
                  fontSize: '0.85rem',
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)'
                }}
              />
              <button
                type="submit"
                disabled={isCheckingPincode || pincodeInput.length !== 6}
                className="btn-secondary"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  whiteSpace: 'nowrap',
                  background: pincodeInput.length === 6 ? 'var(--accent-navy)' : 'var(--bg-secondary)',
                  color: pincodeInput.length === 6 ? '#fff' : 'var(--text-muted)'
                }}
              >
                {isCheckingPincode ? 'Checking...' : 'Check'}
              </button>
            </form>

            {pincodeResult && (
              <div style={{
                background: pincodeResult.isDeliverable ? 'rgba(5, 150, 105, 0.08)' : 'rgba(194, 26, 44, 0.08)',
                border: `1px solid ${pincodeResult.isDeliverable ? 'rgba(5, 150, 105, 0.25)' : 'rgba(194, 26, 44, 0.25)'}`,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {pincodeResult.isDeliverable ? (
                    <CheckCircle2 size={15} style={{ color: 'var(--accent-green)' }} />
                  ) : (
                    <AlertCircle size={15} style={{ color: 'var(--accent-red)' }} />
                  )}
                  <strong style={{ color: pincodeResult.isDeliverable ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {pincodeResult.isDeliverable
                      ? `Deliverable to ${pincodeResult.city}, ${pincodeResult.state} (${pincodeResult.pincode})`
                      : 'Currently Non-Serviceable'}
                  </strong>
                </div>

                {pincodeResult.isDeliverable && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                      <Clock size={12} /> {pincodeResult.message}
                    </span>
                    <span className={`badge-tag ${pincodeResult.isCodAllowed ? 'badge-lime' : ''}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                      {pincodeResult.isCodAllowed ? '✓ Cash on Delivery Available' : 'Prepaid Orders Only'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quantity Selector and Add Button */}
          <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0 8px'
            }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '10px 12px', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '700' }}
              >
                -
              </button>
              <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '700', color: 'var(--text-primary)' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={{ padding: '10px 12px', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '700' }}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="btn-primary"
              style={{
                flex: 1,
                background: isAdded ? 'var(--accent-green)' : 'var(--accent-navy)'
              }}
            >
              {isAdded ? (
                <>
                  <Check size={18} />
                  <span>Added to Polorse Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  <span>Add to Bag • ₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                </>
              )}
            </button>
          </div>

          {/* Value props */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '16px',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <Truck size={16} style={{ color: 'var(--accent-orange)' }} />
              <span>Fast Pan-India Delivery</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <RefreshCw size={16} style={{ color: 'var(--accent-lime)' }} />
              <span>7-Day Free Size Exchange</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={16} style={{ color: 'var(--accent-cyan)' }} />
              <span>100% Authentic Quality</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
