import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  ShieldCheck,
  Flame,
  Search,
  SlidersHorizontal,
  Store,
  X,
  User,
  LogOut,
  ChevronDown,
  Package,
  MapPin,
  CreditCard,
  Heart,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  Menu,
  LifeBuoy
} from 'lucide-react';

export default function Navbar({
  activeView,
  setActiveView,
  cartCount = 0,
  onOpenCart,
  wishlistCount = 0,
  onOpenWishlist,
  isWishlistActive = false,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories = [],
  products = [],
  onSelectProduct,
  onOpenFilter,
  activeFiltersCount = 0,
  currentUser = null,
  onOpenAuth,
  onOpenProfile,
  onOpenMobileMenu,
  onOpenSupport,
  onLogout
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartBadgeAnimate, setCartBadgeAnimate] = useState(false);
  const [wishlistBadgeAnimate, setWishlistBadgeAnimate] = useState(false);
  const searchContainerRef = useRef(null);

  // Compact header on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger scale-bounce animation when cart count changes
  useEffect(() => {
    if (cartCount > 0) {
      setCartBadgeAnimate(true);
      const timer = setTimeout(() => setCartBadgeAnimate(false), 450);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  // Trigger scale-bounce animation when wishlist count changes
  useEffect(() => {
    if (wishlistCount > 0) {
      setWishlistBadgeAnimate(true);
      const timer = setTimeout(() => setWishlistBadgeAnimate(false), 450);
      return () => clearTimeout(timer);
    }
  }, [wishlistCount]);

  // Close search auto-suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsSearchFocused(false);
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
    if (e.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };

  // Curated trending search terms
  const TRENDING_TAGS = [
    'Acid Wash Hoodie',
    'Oversized Tee',
    'Cargo Pants',
    'Heavyweight',
    'Varsity Jacket'
  ];

  // Matching drops for live search suggestions preview
  const searchMatches = searchQuery.trim()
    ? products.filter(p => {
        const q = searchQuery.toLowerCase();
        return (
          p.title?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.tags?.some(t => t.toLowerCase().includes(q))
        );
      }).slice(0, 4)
    : [];

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: isScrolled ? 'rgba(250, 247, 242, 0.96)' : 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: isScrolled ? '0 4px 20px rgba(15, 28, 63, 0.08)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* ======================================================== */}
      {/* TIER 1: LUXURY ANNOUNCEMENT TICKER (COLLAPSIBLE ON SCROLL) */}
      {/* ======================================================== */}
      <div
        className="announcement-marquee-wrapper"
        style={{
          height: isScrolled ? '0px' : '32px',
          padding: isScrolled ? '0' : '6px 0',
          opacity: isScrolled ? 0 : 1,
          overflow: 'hidden',
          transition: 'all 0.28s ease'
        }}
      >
        <div className="announcement-marquee-track">
          <div className="announcement-item">
            <Flame size={12} style={{ color: '#FCD34D', flexShrink: 0 }} />
            <span>POLORSE SIGNATURE DROP • USE CODE <strong>POLORSE500</strong> FOR ₹500 OFF • FREE EXPRESS SHIPPING ON ₹1,999+ • 7-DAY DOORSTEP EXCHANGE</span>
          </div>
          <div className="announcement-item">
            <Flame size={12} style={{ color: '#FCD34D', flexShrink: 0 }} />
            <span>POLORSE SIGNATURE DROP • USE CODE <strong>POLORSE500</strong> FOR ₹500 OFF • FREE EXPRESS SHIPPING ON ₹1,999+ • 7-DAY DOORSTEP EXCHANGE</span>
          </div>
          <div className="announcement-item">
            <Flame size={12} style={{ color: '#FCD34D', flexShrink: 0 }} />
            <span>POLORSE SIGNATURE DROP • USE CODE <strong>POLORSE500</strong> FOR ₹500 OFF • FREE EXPRESS SHIPPING ON ₹1,999+ • 7-DAY DOORSTEP EXCHANGE</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TIER 2: MAIN BRAND HEADER ROW                             */}
      {/* ======================================================== */}
      <div
        className="navbar-main-row"
        style={{
          padding: isScrolled ? '8px 24px' : '12px 24px',
          transition: 'padding 0.25s ease'
        }}
      >
        {/* Brand Logo & Mobile Menu Hamburger Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="mobile-menu-btn"
            id="mobile-hamburger-btn"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              padding: 0
            }}
            title="Open Mobile Navigation Menu"
          >
            <Menu size={20} />
          </button>

          <div
            onClick={() => {
              setActiveView('store');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0
            }}
          >
            <img
              src="/polorse-logo.jpg"
              alt="POLORSE"
              style={{
                height: isScrolled ? '36px' : '42px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
                transition: 'height 0.2s ease'
              }}
            />
          </div>
        </div>

        {/* Center: Live Search Bar with Auto-Suggestions (Desktop) */}
        {activeView === 'store' && (
          <div
            ref={searchContainerRef}
            className="nav-search-container"
            style={{ position: 'relative' }}
          >
            <div
              style={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '14px',
                  color: isSearchFocused ? 'var(--accent-navy)' : 'var(--text-secondary)',
                  transition: 'color 0.2s ease',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Search hoodies, oversized tees, cargoes, jackets..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  paddingLeft: '38px',
                  paddingRight: searchQuery ? '36px' : '14px',
                  paddingTop: isScrolled ? '8px' : '10px',
                  paddingBottom: isScrolled ? '8px' : '10px',
                  fontSize: '0.86rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-secondary)',
                  border: isSearchFocused ? '1.5px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                  boxShadow: isSearchFocused ? '0 0 0 3px rgba(15, 28, 63, 0.08)' : 'var(--shadow-sm)',
                  width: '100%',
                  transition: 'all 0.2s ease'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Filter Trigger Button */}
            <button
              type="button"
              onClick={onOpenFilter}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: isScrolled ? '8px 16px' : '9px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.84rem',
                fontWeight: '700',
                background: activeFiltersCount > 0 ? 'var(--accent-navy)' : 'var(--bg-secondary)',
                color: activeFiltersCount > 0 ? '#FAF7F2' : 'var(--text-primary)',
                border: '1px solid',
                borderColor: activeFiltersCount > 0 ? 'var(--accent-navy)' : 'var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Filter catalog"
            >
              <SlidersHorizontal size={14} style={{ color: activeFiltersCount > 0 ? '#FAF7F2' : 'var(--accent-red)' }} />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span
                  style={{
                    background: 'var(--accent-red)',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: '800',
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    marginLeft: '2px'
                  }}
                >
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Live Search Auto-Suggestions Dropdown */}
            {isSearchFocused && (
              <div className="search-suggestions-popover">
                {/* Trending Tags Section */}
                <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <TrendingUp size={13} style={{ color: 'var(--accent-red)' }} />
                    <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)' }}>
                      Trending Street Searches
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {TRENDING_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSearchQuery(tag);
                          setIsSearchFocused(false);
                          const catalogEl = document.getElementById('catalog');
                          if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={{
                          padding: '4px 10px',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-navy)';
                          e.currentTarget.style.color = 'var(--accent-navy)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instant Matching Products Preview */}
                {searchQuery.trim() && (
                  <div style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)' }}>
                        Instant Matches ({searchMatches.length})
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Press Enter for all
                      </span>
                    </div>

                    {searchMatches.length === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '8px 0' }}>
                        No instant matches for "{searchQuery}". Press Enter to search catalog.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {searchMatches.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setIsSearchFocused(false);
                              onSelectProduct?.(item);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '6px 8px',
                              borderRadius: 'var(--radius-md)',
                              cursor: 'pointer',
                              transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              style={{
                                width: '40px',
                                height: '48px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-subtle)'
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4
                                style={{
                                  fontSize: '0.84rem',
                                  fontWeight: '700',
                                  color: 'var(--text-primary)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {item.title}
                              </h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--accent-navy)' }}>
                                  ₹{item.price?.toLocaleString('en-IN')}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  {item.category}
                                </span>
                              </div>
                            </div>
                            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Right Section: Actions & Navigation Triggers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* View Switcher: Store vs Admin (Desktop Only) */}
          <div
            className="nav-desktop-only"
            style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              padding: '3px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <button
              onClick={() => setActiveView('store')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: '700',
                background: activeView === 'store' ? 'var(--accent-navy)' : 'transparent',
                color: activeView === 'store' ? '#FAF7F2' : 'var(--text-secondary)'
              }}
            >
              <Store size={13} />
              <span>Store</span>
            </button>
            <button
              onClick={() => setActiveView('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: '700',
                background: activeView === 'admin' ? 'var(--accent-red)' : 'transparent',
                color: activeView === 'admin' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              <ShieldCheck size={13} />
              <span>Admin</span>
            </button>
          </div>

          {/* Orders Quick-Access Pill (Store View Only) */}
          {activeView === 'store' && (
            <button
              type="button"
              onClick={() => onOpenProfile?.('orders')}
              id="navbar-orders-shortcut-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Track Orders & Live Status"
            >
              <Package size={14} style={{ color: 'var(--accent-navy)' }} />
              <span className="nav-desktop-only">Orders</span>
            </button>
          )}

          {/* Wishlist Button with Live Scale-Bounce Counter */}
          {activeView === 'store' && (
            <button
              type="button"
              onClick={onOpenWishlist}
              id="navbar-wishlist-btn"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isWishlistActive ? 'rgba(194, 26, 44, 0.08)' : 'var(--bg-secondary)',
                border: isWishlistActive ? '1.5px solid var(--accent-red)' : '1px solid var(--border-subtle)',
                width: isScrolled ? '36px' : '40px',
                height: isScrolled ? '36px' : '40px',
                borderRadius: 'var(--radius-md)',
                color: isWishlistActive ? 'var(--accent-red)' : 'var(--text-primary)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              title="Saved Wishlist Items"
            >
              <Heart
                size={18}
                fill={isWishlistActive || wishlistCount > 0 ? 'var(--accent-red)' : 'none'}
                style={{ color: isWishlistActive || wishlistCount > 0 ? 'var(--accent-red)' : 'currentColor' }}
              />
              {wishlistCount > 0 && (
                <span
                  className={wishlistBadgeAnimate ? 'animate-badge-bounce' : ''}
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'var(--accent-red)',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: '800',
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    boxShadow: '0 2px 6px var(--accent-red-glow)'
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </button>
          )}

          {/* Cart Bag Trigger with Live Scale-Bounce Counter */}
          {activeView === 'store' && (
            <button
              onClick={onOpenCart}
              id="navbar-cart-btn"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                width: isScrolled ? '36px' : '40px',
                height: isScrolled ? '36px' : '40px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              title="View Shopping Bag"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span
                  className={cartBadgeAnimate ? 'animate-badge-bounce' : ''}
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: 'var(--accent-red)',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    minWidth: '20px',
                    height: '20px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px var(--accent-red-glow)',
                    padding: '0 4px'
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User Sign In / Profile Dropdown */}
          {activeView === 'store' && (
            <div style={{ position: 'relative' }}>
              {!currentUser ? (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  id="navbar-sign-in-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: isScrolled ? '7px 12px' : '8px 14px',
                    background: 'var(--bg-secondary)',
                    border: '1.5px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease'
                  }}
                  title="Sign In / Register"
                >
                  <User size={15} style={{ color: 'var(--accent-navy)' }} />
                  <span className="nav-desktop-only">Sign In</span>
                </button>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    id="navbar-user-profile-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 10px 4px 5px',
                      background: 'var(--bg-secondary)',
                      border: '1.5px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    title="User Account Hub"
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--accent-navy)',
                        color: '#FAF7F2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        overflow: 'hidden'
                      }}
                    >
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <span className="nav-desktop-only" style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {currentUser.name ? currentUser.name.split(' ')[0] : 'Member'}
                    </span>
                    <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        background: 'var(--bg-secondary)',
                        border: '1.5px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
                        minWidth: '240px',
                        padding: '6px 0',
                        zIndex: 60
                      }}
                    >
                      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'var(--accent-navy)',
                              color: '#FAF7F2',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.85rem',
                              fontWeight: '800'
                            }}
                          >
                            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p style={{ fontSize: '0.86rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                              {currentUser.name || 'Valued Member'}
                            </p>
                            <span style={{ fontSize: '0.72rem', color: 'var(--accent-navy)', fontWeight: '700' }}>
                              Polorse VIP Member
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenProfile?.('profile');
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          color: 'var(--text-primary)',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          textAlign: 'left'
                        }}
                      >
                        <User size={15} style={{ color: 'var(--accent-navy)' }} />
                        <span>Profile & Avatar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenProfile?.('orders');
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          color: 'var(--text-primary)',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          textAlign: 'left'
                        }}
                      >
                        <Package size={15} style={{ color: 'var(--accent-navy)' }} />
                        <span>My Orders & Live Tracking</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenProfile?.('addresses');
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          color: 'var(--text-primary)',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          textAlign: 'left'
                        }}
                      >
                        <MapPin size={15} style={{ color: 'var(--accent-navy)' }} />
                        <span>Saved Delivery Addresses</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenProfile?.('payments');
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          color: 'var(--text-primary)',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          textAlign: 'left'
                        }}
                      >
                        <CreditCard size={15} style={{ color: 'var(--accent-navy)' }} />
                        <span>Saved Cards & UPI</span>
                      </button>

                      {/* Customer Care & Create Ticket */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenSupport?.('ticket');
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          color: 'var(--accent-red)',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          textAlign: 'left'
                        }}
                      >
                        <LifeBuoy size={15} style={{ color: 'var(--accent-red)' }} />
                        <span>Customer Care & Create Ticket</span>
                      </button>

                      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout?.();
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          color: 'var(--accent-red)',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          textAlign: 'left'
                        }}
                      >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE LIVE SEARCH & FILTER ROW                          */}
      {/* ======================================================== */}
      {activeView === 'store' && (
        <div className="nav-mobile-search-row">
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                color: 'var(--text-secondary)',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Search hoodies, cargoes, tees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                paddingLeft: '36px',
                paddingRight: searchQuery ? '32px' : '12px',
                paddingTop: '8px',
                paddingBottom: '8px',
                fontSize: '0.84rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={10} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenFilter}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: '700',
              background: activeFiltersCount > 0 ? 'var(--accent-navy)' : 'var(--bg-secondary)',
              color: activeFiltersCount > 0 ? '#FAF7F2' : 'var(--text-primary)',
              border: '1px solid',
              borderColor: activeFiltersCount > 0 ? 'var(--accent-navy)' : 'var(--border-subtle)',
              flexShrink: 0
            }}
          >
            <SlidersHorizontal size={14} style={{ color: activeFiltersCount > 0 ? '#FAF7F2' : 'var(--accent-red)' }} />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span
                style={{
                  background: 'var(--accent-red)',
                  color: '#fff',
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px'
                }}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TIER 3: SCROLLABLE STICKY CATEGORY PILL BAR              */}
      {/* ======================================================== */}
      {activeView === 'store' && (
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-primary)',
            padding: '7px 24px'
          }}
        >
          <div
            className="category-scroll-bar"
            style={{
              maxWidth: '1360px',
              margin: '0 auto'
            }}
          >
            {/* All Drops Pill */}
            <button
              onClick={() => {
                setSelectedCategory('all');
                const catalogEl = document.getElementById('catalog');
                if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: '800',
                background: selectedCategory === 'all' && !isWishlistActive ? 'var(--accent-navy)' : 'var(--bg-secondary)',
                color: selectedCategory === 'all' && !isWishlistActive ? '#FAF7F2' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: selectedCategory === 'all' && !isWishlistActive ? 'var(--accent-navy)' : 'var(--border-subtle)',
                whiteSpace: 'nowrap',
                boxShadow: selectedCategory === 'all' && !isWishlistActive ? '0 2px 8px rgba(15, 28, 63, 0.15)' : 'none',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              <Sparkles size={13} style={{ color: selectedCategory === 'all' && !isWishlistActive ? '#FCD34D' : 'var(--text-muted)' }} />
              <span>All Drops</span>
              <span
                style={{
                  fontSize: '0.7rem',
                  opacity: 0.8,
                  padding: '1px 5px',
                  borderRadius: '10px',
                  background: selectedCategory === 'all' && !isWishlistActive ? 'rgba(255, 255, 255, 0.2)' : 'var(--bg-primary)'
                }}
              >
                {products.length}
              </span>
            </button>

            {/* Dynamic Category Pills */}
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat && !isWishlistActive;
              const count = products.filter(p => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    const catalogEl = document.getElementById('catalog');
                    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 15px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    background: isSelected ? 'var(--accent-navy)' : 'var(--bg-secondary)',
                    color: isSelected ? '#FAF7F2' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--accent-navy)' : 'var(--border-subtle)',
                    whiteSpace: 'nowrap',
                    boxShadow: isSelected ? '0 2px 8px rgba(15, 28, 63, 0.15)' : 'none',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  <span>{cat}</span>
                  {count > 0 && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        opacity: 0.8,
                        padding: '1px 5px',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'var(--bg-primary)'
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Wishlist Shortcut Pill */}
            {wishlistCount > 0 && (
              <button
                onClick={onOpenWishlist}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 15px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  background: isWishlistActive ? 'var(--accent-red)' : 'var(--bg-secondary)',
                  color: isWishlistActive ? '#FFFFFF' : 'var(--accent-red)',
                  border: '1px solid',
                  borderColor: isWishlistActive ? 'var(--accent-red)' : 'rgba(194, 26, 44, 0.25)',
                  whiteSpace: 'nowrap',
                  boxShadow: isWishlistActive ? '0 2px 8px var(--accent-red-glow)' : 'none',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                <Heart size={13} fill="currentColor" />
                <span>Wishlist</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '1px 5px',
                    borderRadius: '10px',
                    background: isWishlistActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(194, 26, 44, 0.1)'
                  }}
                >
                  {wishlistCount}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
