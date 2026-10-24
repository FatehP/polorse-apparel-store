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
  Maximize2,
  Zap,
  Ruler,
  ArrowLeft
} from 'lucide-react';
import { checkPincodeDeliverability, autoDetectLocation } from '../services/pincodeService';

export default function ProductModal({ product, onClose, onAddToCart, onBuyNow }) {
  if (!product) return null;

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.size || '');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

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

  // Bulletproof iOS Body Scroll Lock: physically freeze body at current scroll position
  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevWidth = body.style.width;
    const prevOverflow = body.style.overflow;

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    return () => {
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.width = prevWidth;
      body.style.overflow = prevOverflow;
      window.scrollTo(0, scrollY);
    };
  }, []);

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

  const handlePincodeChange = async (val) => {
    const clean = val.replace(/[^0-9]/g, '').slice(0, 6);
    setPincodeInput(clean);
    if (clean.length === 6) {
      setIsCheckingPincode(true);
      const res = await checkPincodeDeliverability(clean);
      setPincodeResult(res);
      setIsCheckingPincode(false);
    } else if (clean.length < 6 && pincodeResult) {
      setPincodeResult(null);
    }
  };

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

  const handleBuyNow = () => {
    if (!product.inStock) return;
    const itemData = {
      ...product,
      selectedColor,
      selectedSize,
      quantity,
      imageUrl: imageList[activeImageIndex] || product.imageUrl
    };
    if (onBuyNow) {
      onBuyNow(itemData);
    } else {
      onAddToCart(itemData);
      onClose();
    }
  };

  return (
    <div
      className="product-modal-overlay"
      onClick={onClose}
    >
      <div
        className="product-modal-dialog animate-fade"
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Native Modal Pull Handle */}
        <div className="sheet-handle" style={{ gridColumn: '1 / -1', margin: '10px auto 4px auto' }} />

        {/* Mobile Full-Page Top Navigation Bar - Single Clean Back Button */}
        <div className="modal-mobile-topbar">
          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-secondary)',
              border: '1.5px solid var(--border-subtle)',
              fontSize: '0.86rem',
              fontWeight: '700',
              color: 'var(--accent-navy)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
        </div>

        {/* Desktop Floating Close Button */}
        <button
          className="modal-desktop-close-btn"
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
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Left Side: Product Image with Floating Thumbnail Grid */}
        <div className="product-modal-image-col">
          {/* Full-Bleed Main Image Filling Entire Height */}
          <img
            key={activeImageIndex}
            src={imageList[activeImageIndex] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80'}
            alt=""
            aria-label={`${product.title} - Angle ${activeImageIndex + 1}`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80';
            }}
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

          {/* Clean 1-Badge Signature Overlay on Top-Left */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(15, 28, 63, 0.88)',
              backdropFilter: 'blur(8px)',
              color: '#FAF7F2',
              fontSize: '0.72rem',
              fontWeight: '800',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FCD34D' }} />
              {product.tags?.[0] || 'STREET SIGNATURE'}
            </span>
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

          {/* Floating Thumbnail Grid Dock (Glitch-Free Frosted Glass Dock) */}
          {imageList.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px',
              background: 'rgba(15, 28, 63, 0.55)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
              zIndex: 10,
              maxWidth: 'calc(100% - 32px)',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
            }}>
              {imageList.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`View photo ${idx + 1}`}
                  style={{
                    position: 'relative',
                    width: '52px',
                    height: '52px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: activeImageIndex === idx
                      ? '2px solid #FAF7F2'
                      : '1.5px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: activeImageIndex === idx ? '0 0 10px rgba(255, 255, 255, 0.4)' : 'none',
                    opacity: activeImageIndex === idx ? 1 : 0.72,
                    transform: activeImageIndex === idx ? 'scale(1.04)' : 'scale(1)',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    padding: 0,
                    background: '#0F1C3F'
                  }}
                  onMouseEnter={(e) => {
                    if (activeImageIndex !== idx) e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    if (activeImageIndex !== idx) e.currentTarget.style.opacity = '0.72';
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
        <div className="product-modal-details-col">
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
              fontSize: '1.5rem',
              color: 'var(--text-primary)',
              marginTop: '4px',
              lineHeight: '1.2'
            }}>
              {product.title}
            </h2>

            {/* Price section with clean discount pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.7rem',
                fontWeight: '800',
                color: 'var(--text-primary)',
                lineHeight: 1
              }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <>
                  <span style={{
                    fontSize: '1rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'line-through',
                    lineHeight: 1
                  }}>
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: '800',
                    color: 'var(--accent-red)',
                    background: 'rgba(194, 26, 44, 0.08)',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    lineHeight: 1,
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}>
                    {discountPercent}% OFF • Save ₹{savingsAmount.toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>

            {/* Streetwear Silhouette & Model Spec */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '6px',
              marginTop: '12px',
              padding: '7px 11px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              wordBreak: 'break-word',
              maxWidth: '100%'
            }}>
              <span style={{
                fontFamily: 'monospace',
                fontWeight: 800,
                color: 'var(--accent-navy)',
                letterSpacing: '0.08em',
                fontSize: '0.68rem',
                textTransform: 'uppercase'
              }}>
                [ARCHIVE FIT]
              </span>
              <span>•</span>
              <span>Model is 6'1" (185cm) wearing Size L (Signature Boxy Drape)</span>
            </div>

            {/* Heavyweight Fabric Matrix & Scarcity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span className="badge-tag">
                {product.gsm ? `${product.gsm} GSM Custom Milled` : '480 GSM Heavyweight Terry'}
              </span>
              <span className="badge-tag" style={{ background: 'transparent' }}>
                Pre-Shrunk 100% Combed Cotton
              </span>
              <span className="badge-tag" style={{ color: 'var(--accent-red)', borderColor: 'rgba(194, 26, 44, 0.25)', background: 'rgba(194, 26, 44, 0.04)' }}>
                ⚡ Only {currentStock} left in {selectedSize}
              </span>
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
                  Colorway: <strong style={{ color: 'var(--text-primary)' }}>{selectedColor}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
                      background: selectedColor === col.name ? 'rgba(15, 28, 63, 0.08)' : 'var(--bg-card)',
                      border: selectedColor === col.name ? '2px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                      color: selectedColor === col.name ? 'var(--text-primary)' : 'var(--text-secondary)',
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

          {/* Size Selection with Streetwear Size Guide Trigger */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  Select Size (Street Fit):
                </span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(!isSizeGuideOpen)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-navy)',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline'
                  }}
                >
                  <Ruler size={13} />
                  <span>{isSizeGuideOpen ? 'Hide Guide' : 'Size Guide'}</span>
                </button>
              </div>

              {/* Expandable Streetwear Fit Chart */}
              {isSizeGuideOpen && (
                <div className="animate-fade" style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>Polorse Boxy Fit Chart (Inches)</strong>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Oversized Drape</span>
                  </div>
                  <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', minWidth: '240px', fontSize: '0.75rem', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '3px 6px', textAlign: 'left' }}>Size</th>
                        <th style={{ padding: '3px 6px' }}>Chest</th>
                        <th style={{ padding: '3px 6px' }}>Length</th>
                        <th style={{ padding: '3px 6px' }}>Shoulder</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', fontWeight: selectedSize === 'S' ? '800' : '500' }}>
                        <td style={{ padding: '3px 6px', textAlign: 'left', color: 'var(--accent-navy)' }}>S</td>
                        <td style={{ padding: '3px 6px' }}>44"</td>
                        <td style={{ padding: '3px 6px' }}>28.5"</td>
                        <td style={{ padding: '3px 6px' }}>21"</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', fontWeight: selectedSize === 'M' ? '800' : '500' }}>
                        <td style={{ padding: '3px 6px', textAlign: 'left', color: 'var(--accent-navy)' }}>M</td>
                        <td style={{ padding: '3px 6px' }}>46"</td>
                        <td style={{ padding: '3px 6px' }}>29.5"</td>
                        <td style={{ padding: '3px 6px' }}>22"</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', fontWeight: selectedSize === 'L' ? '800' : '500' }}>
                        <td style={{ padding: '3px 6px', textAlign: 'left', color: 'var(--accent-navy)' }}>L</td>
                        <td style={{ padding: '3px 6px' }}>48"</td>
                        <td style={{ padding: '3px 6px' }}>30.5"</td>
                        <td style={{ padding: '3px 6px' }}>23"</td>
                      </tr>
                      <tr style={{ fontWeight: selectedSize === 'XL' ? '800' : '500' }}>
                        <td style={{ padding: '3px 6px', textAlign: 'left', color: 'var(--accent-navy)' }}>XL</td>
                        <td style={{ padding: '3px 6px' }}>50"</td>
                        <td style={{ padding: '3px 6px' }}>31.5"</td>
                        <td style={{ padding: '3px 6px' }}>24"</td>
                      </tr>
                    </tbody>
                    </table>
                  </div>
                  <p style={{ margin: '6px 0 0 0', fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                    💡 <em>Generous dropped-shoulder drape. Stay true to size for boxy fit, or size down for standard fit.</em>
                  </p>
                </div>
              )}

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

          {/* Sleek Compact Pincode & Delivery Section */}
          <div style={{
            padding: '11px 14px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                <MapPin size={14} style={{ color: 'var(--accent-red)' }} />
                <span>Delivery & COD Check</span>
              </div>
              <button
                type="button"
                onClick={handleAutoDetect}
                disabled={isDetecting}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-navy)',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <Navigation size={11} className={isDetecting ? 'animate-spin' : ''} />
                <span>{isDetecting ? 'Detecting...' : 'Auto-Detect PIN'}</span>
              </button>
            </div>

            <form onSubmit={handleCheckPincode} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit Indian PIN (e.g. 110001)"
                value={pincodeInput}
                onChange={(e) => handlePincodeChange(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '0',
                  fontSize: '0.82rem',
                  padding: '7px 10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)'
                }}
              />
              <button
                type="submit"
                disabled={isCheckingPincode || pincodeInput.length !== 6}
                style={{
                  padding: '7px 14px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: pincodeResult?.isDeliverable ? 'var(--accent-green)' : (pincodeInput.length === 6 ? 'var(--accent-navy)' : 'var(--bg-card)'),
                  color: pincodeInput.length === 6 ? '#FAF7F2' : 'var(--text-muted)',
                  cursor: pincodeInput.length === 6 ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isCheckingPincode ? 'Checking...' : (pincodeResult?.isDeliverable ? '✓ Verified' : 'Check')}
              </button>
            </form>

            {pincodeResult && (
              <div style={{
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                flexWrap: 'wrap',
                gap: '6px'
              }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontWeight: '700',
                  color: pincodeResult.isDeliverable ? 'var(--accent-green)' : 'var(--accent-red)'
                }}>
                  {pincodeResult.isDeliverable ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                  <span>{pincodeResult.isDeliverable ? `Deliverable to ${pincodeResult.city} (2-3 days)` : 'Currently non-serviceable'}</span>
                </span>
                {pincodeResult.isDeliverable && (
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    color: pincodeResult.isCodAllowed ? '#166534' : 'var(--text-muted)',
                    background: pincodeResult.isCodAllowed ? 'rgba(34, 197, 94, 0.12)' : 'transparent',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    {pincodeResult.isCodAllowed ? '✓ COD Available' : 'Prepaid Only'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quantity Selector and Action Buttons (Add to Bag & Buy Now) */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-primary)',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0 4px',
              height: '46px',
              flexShrink: 0,
              boxSizing: 'border-box'
            }}>
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '0 8px', height: '100%', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                style={{ padding: '0 8px', height: '100%', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* High-Contrast Luxury Add to Bag Button */}
            <button
              type="button"
              onClick={handleAdd}
              disabled={!product.inStock}
              id="modal-add-to-bag-btn"
              style={{
                flex: '1 1 0',
                minWidth: '0',
                height: '46px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '0 8px',
                fontWeight: '800',
                fontSize: '0.84rem',
                borderRadius: 'var(--radius-md)',
                background: isAdded ? 'rgba(46, 125, 50, 0.12)' : '#FFFFFF',
                color: isAdded ? 'var(--accent-green)' : 'var(--accent-navy)',
                border: isAdded ? '1.5px solid var(--accent-green)' : '1.5px solid var(--accent-navy)',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
                lineHeight: 1,
                cursor: !product.inStock ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)'
              }}
              title="Add item to Bag"
            >
              {isAdded ? (
                <>
                  <Check size={16} style={{ color: 'var(--accent-green)' }} />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>Add to Bag</span>
                </>
              )}
            </button>

            {/* Buy Now Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!product.inStock}
              id="modal-buy-now-btn"
              style={{
                flex: '1 1 0',
                minWidth: '0',
                height: '46px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '0 8px',
                fontWeight: '800',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-navy)',
                color: '#FAF7F2',
                border: '1.5px solid var(--accent-navy)',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
                lineHeight: 1,
                cursor: !product.inStock ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(15, 28, 63, 0.25)',
                transition: 'all var(--transition-fast)'
              }}
              title="Direct Instant Checkout"
            >
              <Zap size={15} style={{ fill: '#FCD34D', color: '#FCD34D' }} />
              <span>Buy Now</span>
            </button>
          </div>

          {/* Value props */}
          <div className="product-modal-value-props">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              <Truck size={16} style={{ color: 'var(--accent-navy)' }} />
              <span>Express Pan-India (2-3 Days)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              <RefreshCw size={16} style={{ color: 'var(--accent-green)' }} />
              <span>7-Day Doorstep Size Exchange</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={16} style={{ color: 'var(--accent-red)' }} />
              <span>Zero-Risk Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
