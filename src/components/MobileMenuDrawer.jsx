import React, { useState } from 'react';
import {
  X,
  User,
  Search,
  ChevronRight,
  Plus,
  Minus,
  Flame,
  LifeBuoy,
  Package,
  RotateCcw,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  Heart,
  ChevronDown,
  Layers,
  Send
} from 'lucide-react';

export default function MobileMenuDrawer({
  isOpen,
  onClose,
  currentUser = null,
  categories = [],
  selectedCategory,
  onSelectCategory,
  searchQuery,
  setSearchQuery,
  onOpenAuth,
  onOpenProfile,
  onOpenSupport,
  onOpenOrders,
  onOpenWishlist,
  wishlistCount = 0
}) {
  const [isProductsOpen, setIsProductsOpen] = useState(true);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onClose();
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategoryClick = (cat) => {
    onSelectCategory(cat);
    onClose();
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 28, 63, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 95,
        display: 'flex',
        justifyContent: 'flex-start',
        overscrollBehavior: 'contain'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '88%',
          maxWidth: '380px',
          height: '100%',
          background: 'var(--bg-secondary)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInLeft 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* ======================================================== */}
        {/* 1. TOP HEADER: ACCOUNT TRIGGER & CLOSE (BEARDO STYLE)    */}
        {/* ======================================================== */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card)'
          }}
        >
          {/* Account Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (currentUser) {
                onOpenProfile?.('profile');
              } else {
                onOpenAuth?.();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--bg-primary)',
                border: '1.5px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-navy)',
                overflow: 'hidden'
              }}
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <User size={18} />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--accent-red)' }}>
                {currentUser ? (currentUser.name ? currentUser.name.split(' ')[0] : 'Account') : 'Account'}
              </span>
              <ChevronRight size={16} style={{ color: 'var(--accent-red)' }} />
            </div>
          </button>

          {/* Close Drawer Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ======================================================== */}
        {/* 2. SEARCH BAR INSIDE SIDEBAR                            */}
        {/* ======================================================== */}
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                color: 'var(--text-secondary)',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Search for hoodies, cargoes, tees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '38px',
                paddingRight: '12px',
                paddingTop: '9px',
                paddingBottom: '9px',
                fontSize: '0.86rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
            />
          </form>
        </div>

        {/* ======================================================== */}
        {/* 3. PROMOTIONAL TICKER BANNER (BEARDO STYLE)              */}
        {/* ======================================================== */}
        <div
          style={{
            padding: '10px 18px',
            background: 'linear-gradient(90deg, rgba(194, 26, 44, 0.08) 0%, rgba(15, 28, 63, 0.06) 100%)',
            borderBottom: '1px solid rgba(194, 26, 44, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Flame size={15} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Get ₹500 OFF on ₹3,000+ | Code: <strong style={{ color: 'var(--accent-red)' }}>POLORSE500</strong>
          </span>
        </div>

        {/* ======================================================== */}
        {/* 4. SCROLLABLE NAVIGATION LINKS & SECTIONS                */}
        {/* ======================================================== */}
        <div
          className="modal-scrollable-content"
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '14px 0 30px'
          }}
        >
          {/* Section: Products Accordion */}
          <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setIsProductsOpen(!isProductsOpen)}
              style={{
                width: '100%',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontWeight: '800',
                background: 'transparent',
                textAlign: 'left'
              }}
            >
              <span>Products & Apparel</span>
              {isProductsOpen ? <Minus size={18} /> : <Plus size={18} />}
            </button>

            {isProductsOpen && (
              <div style={{ background: 'var(--bg-primary)', padding: '6px 0 10px' }}>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('all')}
                  style={{
                    width: '100%',
                    padding: '8px 28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: selectedCategory === 'all' ? 'var(--accent-red)' : 'var(--text-secondary)',
                    fontWeight: selectedCategory === 'all' ? '800' : '600',
                    fontSize: '0.88rem',
                    textAlign: 'left'
                  }}
                >
                  <span>All Drops (Signature Catalog)</span>
                  {selectedCategory === 'all' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-red)' }} />}
                </button>

                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryClick(cat)}
                      style={{
                        width: '100%',
                        padding: '8px 28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: isSelected ? 'var(--accent-red)' : 'var(--text-secondary)',
                        fontWeight: isSelected ? '800' : '600',
                        fontSize: '0.88rem',
                        textAlign: 'left'
                      }}
                    >
                      <span>{cat}</span>
                      {isSelected && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-red)' }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Direct Category & Feature Highlights */}
          <div style={{ padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => handleCategoryClick('Hoodies')}
              style={{
                width: '100%',
                padding: '11px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--text-primary)',
                fontSize: '0.96rem',
                fontWeight: '800',
                textAlign: 'left'
              }}
            >
              <span>New Launch: Drop 01</span>
            </button>

            <button
              type="button"
              onClick={() => handleCategoryClick('Oversized Tees')}
              style={{
                width: '100%',
                padding: '11px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--text-primary)',
                fontSize: '0.96rem',
                fontWeight: '800',
                textAlign: 'left'
              }}
            >
              <span>Best Sellers</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenWishlist?.();
              }}
              style={{
                width: '100%',
                padding: '11px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--text-primary)',
                fontSize: '0.96rem',
                fontWeight: '800',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={16} style={{ color: 'var(--accent-red)' }} />
                <span>My Saved Wishlist</span>
              </div>
              {wishlistCount > 0 && (
                <span
                  style={{
                    background: 'var(--accent-red)',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    padding: '1px 8px',
                    borderRadius: '10px'
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenOrders?.();
              }}
              style={{
                width: '100%',
                padding: '11px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--text-primary)',
                fontSize: '0.96rem',
                fontWeight: '800',
                textAlign: 'left'
              }}
            >
              <Package size={16} style={{ color: 'var(--accent-navy)' }} />
              <span>Track Orders & Delivery</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* 5. CUSTOMER CARE & SUPPORT SECTION (USER REQUESTED!)     */}
          {/* ======================================================== */}
          <div style={{ padding: '14px 20px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              Customer Care & Concierge
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
              {/* Create Ticket Button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSupport?.('ticket');
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(194, 26, 44, 0.08)',
                  border: '1.5px solid rgba(194, 26, 44, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'var(--accent-red)',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Send size={15} />
                  <span>Create Support Ticket</span>
                </div>
                <ChevronRight size={15} />
              </button>

              {/* Help Center / FAQ */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSupport?.('direct');
                }}
                style={{
                  width: '100%',
                  padding: '9px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  textAlign: 'left'
                }}
              >
                <LifeBuoy size={16} style={{ color: 'var(--accent-navy)' }} />
                <span>Help Center & FAQ</span>
              </button>

              {/* WhatsApp Concierge */}
              <a
                href="https://wa.me/919876543210?text=Hello%20Polorse%20Team%2C%20I%20need%20assistance."
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '100%',
                  padding: '9px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#25D366',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  textDecoration: 'none'
                }}
              >
                <MessageSquare size={16} />
                <span>Direct WhatsApp Support</span>
              </a>

              {/* 7-Day Exchange Policy */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSupport?.('direct');
                }}
                style={{
                  width: '100%',
                  padding: '9px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.84rem',
                  fontWeight: '600',
                  textAlign: 'left'
                }}
              >
                <RotateCcw size={15} />
                <span>Return & 7-Day Size Exchange</span>
              </button>
            </div>
          </div>

          {/* Secondary Brand Links (Beardo Style) */}
          <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={onClose}>
              About POLORSE Brand Heritage
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={onClose}>
              Privacy & Data Policy
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={onClose}>
              Terms & Conditions
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={onClose}>
              Store Locator & Experience Center
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 6. BOTTOM FULL-WIDTH STICKY CTA (BEARDO EXACT RED CTA)   */}
        {/* ======================================================== */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)',
            boxShadow: '0 -4px 16px rgba(15, 28, 63, 0.06)'
          }}
        >
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectCategory('all');
              const catalogEl = document.getElementById('catalog');
              if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-red)',
              color: '#FFFFFF',
              fontSize: '0.96rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              border: 'none',
              boxShadow: '0 4px 14px var(--accent-red-glow)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <ShoppingBag size={18} />
            <span>SHOP ALL PRODUCTS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
