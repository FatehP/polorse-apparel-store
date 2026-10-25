import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Flame, ShieldCheck, Truck } from 'lucide-react';

const BANNER_SLIDES = [
  {
    id: 'slide-01',
    badge: 'NEW SEASON DROP',
    badgeIcon: Flame,
    title: 'POLORSE ARCHIVE // DROP 01',
    subtitle: '420 GSM Heavyweight Boxy Silhouettes',
    description: 'Bespoke hand-crafted streetwear made from pure combed compact cotton in Mumbai.',
    ctaPrimary: 'Shop The Drop',
    ctaSecondary: 'Explore Hoodies',
    categoryTarget: 'Hoodies',
    bgGradient: 'linear-gradient(135deg, #090E1D 0%, #0F1C3F 55%, #1E2E5D 100%)',
    accentColor: '#F59E0B',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'slide-02',
    badge: 'LIMITED FESTIVE RUN',
    badgeIcon: Sparkles,
    title: 'FLAT 40% OFF STOREWIDE',
    subtitle: 'Use Code POLORSEVIP for Extra Savings',
    description: 'Instant checkout discount across heavyweight hoodies, acid-wash oversized tees, and parachute cargos.',
    ctaPrimary: 'Claim Discount',
    ctaSecondary: 'Shop T-Shirts',
    categoryTarget: 'T-Shirts',
    bgGradient: 'linear-gradient(135deg, #2B0A11 0%, #5C131E 50%, #0F1C3F 100%)',
    accentColor: '#EF4444',
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'slide-03',
    badge: 'DELIVERY PROMISE',
    badgeIcon: Truck,
    title: 'FREE EXPRESS SHIPPING ON ₹1,999+',
    subtitle: 'Doorstep Size Exchanges • 100% Quality Guaranteed',
    description: 'Same-day Mumbai dispatch & 24hr delivery to top metros with hassle-free doorstep pickup.',
    ctaPrimary: 'Explore All Fits',
    ctaSecondary: 'View Cargo Pants',
    categoryTarget: 'Pants',
    bgGradient: 'linear-gradient(135deg, #0D162B 0%, #172554 60%, #1E1B4B 100%)',
    accentColor: '#10B981',
    image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1200&q=80'
  }
];

export default function TopHeroBanner({ onSelectCategory }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  // Auto-play timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? BANNER_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
    touchStartX.current = null;
  };

  const slide = BANNER_SLIDES[currentSlide];
  const BadgeIcon = slide.badgeIcon;

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      style={{
        maxWidth: '1360px',
        margin: '16px auto 0',
        padding: '0 16px',
        boxSizing: 'border-box'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          background: slide.bgGradient,
          minHeight: '220px',
          boxShadow: '0 12px 36px rgba(15, 28, 63, 0.18)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          transition: 'background 0.5s ease',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* Background Atmosphere Image with Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.22,
            mixBlendMode: 'overlay',
            transition: 'opacity 0.5s ease'
          }}
        />

        {/* Ambient Radial Lighting Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-40%',
            left: '-10%',
            width: '60%',
            height: '180%',
            background: `radial-gradient(circle, ${slide.accentColor}25 0%, transparent 70%)`,
            pointerEvents: 'none'
          }}
        />

        {/* Slide Content Box */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            padding: '24px 24px',
            width: '100%',
            maxWidth: '680px',
            color: '#FAF7F2'
          }}
        >
          {/* Badge Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.14)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: `1px solid ${slide.accentColor}55`,
              fontSize: '0.68rem',
              fontWeight: '800',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: slide.accentColor,
              marginBottom: '10px'
            }}
          >
            <BadgeIcon size={12} />
            <span>{slide.badge}</span>
          </div>

          {/* Main Title */}
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.25rem, 3.2vw, 2.1rem)',
              fontWeight: '900',
              lineHeight: 1.15,
              margin: '0 0 6px 0',
              color: '#FAF7F2',
              letterSpacing: '0.02em',
              textShadow: '0 2px 10px rgba(0,0,0,0.4)'
            }}
          >
            {slide.title}
          </h2>

          {/* Subtitle & Tagline */}
          <p
            style={{
              fontSize: 'clamp(0.82rem, 1.8vw, 0.98rem)',
              fontWeight: '700',
              color: '#E2E8F0',
              margin: '0 0 4px 0',
              lineHeight: 1.3
            }}
          >
            {slide.subtitle}
          </p>

          <p
            className="nav-desktop-only"
            style={{
              fontSize: '0.82rem',
              color: '#94A3B8',
              margin: '0 0 16px 0',
              maxWidth: '480px',
              lineHeight: 1.4
            }}
          >
            {slide.description}
          </p>

          {/* CTA Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '14px',
              flexWrap: 'wrap'
            }}
          >
            <button
              type="button"
              onClick={scrollToCatalog}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: 'var(--radius-full)',
                background: '#FAF7F2',
                color: 'var(--accent-navy)',
                fontSize: '0.8rem',
                fontWeight: '800',
                letterSpacing: '0.03em',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{slide.ctaPrimary}</span>
              <ArrowRight size={13} />
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectCategory?.(slide.categoryTarget);
                scrollToCatalog();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FAF7F2',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{slide.ctaSecondary}</span>
            </button>
          </div>
        </div>


        {/* Slide Indicator Dots */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '16px',
            display: 'flex',
            gap: '6px',
            zIndex: 5
          }}
        >
          {BANNER_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                width: currentSlide === idx ? '22px' : '7px',
                height: '7px',
                borderRadius: '999px',
                background: currentSlide === idx ? '#FAF7F2' : 'rgba(255, 255, 255, 0.35)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
