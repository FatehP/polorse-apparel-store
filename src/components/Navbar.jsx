import React, { useState } from 'react';
import { ShoppingBag, ShieldCheck, Flame, Search, SlidersHorizontal, Store, X, User, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar({
  activeView,
  setActiveView,
  cartCount,
  onOpenCart,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories = [],
  onOpenFilter,
  activeFiltersCount = 0,
  currentUser = null,
  onOpenAuth,
  onLogout
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-panel" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      {/* Top micro-announcement bar */}
      <div style={{
        background: 'linear-gradient(90deg, #0F1C3F 0%, #162A4F 60%, #C21A2C 100%)',
        color: '#fff',
        padding: '7px 16px',
        fontSize: '0.8rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        letterSpacing: '0.04em'
      }}>
        <Flame size={14} style={{ color: '#FCD34D' }} />
        <span>POLORSE SIGNATURE DROP • MADE IN INDIA • USE CODE <strong>POLORSE500</strong> FOR ₹500 OFF • FREE SHIPPING</span>
      </div>

      {/* Main Navbar Row */}
      <div style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Official Brand Logo */}
        <div 
          onClick={() => {
            setActiveView('store');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
        >
          <img
            src="/polorse-logo.jpg"
            alt="POLORSE - Made in India"
            style={{
              height: '44px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        </div>

        {/* Center: Search Bar and Filter Option at the Top (Desktop) */}
        {activeView === 'store' && (
          <div className="nav-search-container">
            {/* Search Input Box */}
            <div style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '14px',
                  color: 'var(--text-secondary)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Search hoodies, cargo, shirts, tees, jeans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  paddingLeft: '38px',
                  paddingRight: searchQuery ? '36px' : '14px',
                  paddingTop: '9px',
                  paddingBottom: '9px',
                  fontSize: '0.88rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                  width: '100%'
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
                    justifyContent: 'center',
                    fontSize: '0.75rem'
                  }}
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Filter Option Button */}
            <button
              type="button"
              onClick={onOpenFilter}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '9px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.86rem',
                fontWeight: '600',
                background: activeFiltersCount > 0 ? 'var(--accent-navy)' : 'var(--bg-secondary)',
                color: activeFiltersCount > 0 ? '#fff' : 'var(--text-primary)',
                border: '1px solid',
                borderColor: activeFiltersCount > 0 ? 'var(--accent-navy)' : 'var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                flexShrink: 0,
                cursor: 'pointer'
              }}
              title="Open filters"
            >
              <SlidersHorizontal size={15} style={{ color: activeFiltersCount > 0 ? '#fff' : 'var(--accent-red)' }} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span style={{
                  background: 'var(--accent-red)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  marginLeft: '2px'
                }}>
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Right Actions & View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* View Switcher: Store vs Brother's Admin Hub */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            padding: '3px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => setActiveView('store')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: '600',
                background: activeView === 'store' ? 'var(--accent-navy)' : 'transparent',
                color: activeView === 'store' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              <Store size={14} />
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
                fontSize: '0.8rem',
                fontWeight: '600',
                background: activeView === 'admin' ? 'var(--accent-red)' : 'transparent',
                color: activeView === 'admin' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              <ShieldCheck size={14} />
              <span>Admin</span>
            </button>
          </div>

          {/* User Authentication Trigger / Profile Dropdown */}
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
                    padding: '8px 14px',
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
                  <span>Sign In</span>
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
                      padding: '5px 12px 5px 6px',
                      background: 'var(--bg-secondary)',
                      border: '1.5px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    title="User Account"
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--accent-navy)',
                      color: '#FAF7F2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.78rem',
                      fontWeight: '800'
                    }}>
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {currentUser.name ? currentUser.name.split(' ')[0] : 'Member'}
                    </span>
                    <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
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
                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
                        minWidth: '220px',
                        padding: '6px 0',
                        zIndex: 60
                      }}
                    >
                      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <p style={{ margin: 0, fontWeight: '800', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                          {currentUser.name}
                        </p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {currentUser.email || currentUser.phone}
                        </p>
                        <span style={{
                          display: 'inline-block',
                          marginTop: '6px',
                          fontSize: '0.68rem',
                          fontWeight: '800',
                          background: 'rgba(252, 211, 77, 0.2)',
                          color: '#B45309',
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-sm)'
                        }}>
                          {currentUser.tier || 'Polorse VIP'}
                        </span>
                      </div>

                      {currentUser.savedAddress && (
                        <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: '700', display: 'block' }}>Saved City:</span>
                          <span>{currentUser.savedAddress.city} ({currentUser.savedAddress.pincode})</span>
                        </div>
                      )}

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
                          gap: '8px',
                          padding: '10px 14px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-red)',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          cursor: 'pointer',
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

          {/* Cart Trigger */}
          {activeView === 'store' && (
            <button
              onClick={onOpenCart}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-sm)'
              }}
              title="View Shopping Cart"
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: 'var(--accent-red)',
                  color: '#fff',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  minWidth: '20px',
                  height: '20px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px var(--accent-red-glow)',
                  padding: '0 4px'
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile / Tablet Search & Filter Row */}
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
              placeholder="Search hoodies, cargo, shirts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                paddingLeft: '36px',
                paddingRight: searchQuery ? '32px' : '12px',
                paddingTop: '8px',
                paddingBottom: '8px',
                fontSize: '0.85rem',
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
              fontWeight: '600',
              background: activeFiltersCount > 0 ? 'var(--accent-navy)' : 'var(--bg-secondary)',
              color: activeFiltersCount > 0 ? '#fff' : 'var(--text-primary)',
              border: '1px solid',
              borderColor: activeFiltersCount > 0 ? 'var(--accent-navy)' : 'var(--border-subtle)',
              flexShrink: 0
            }}
          >
            <SlidersHorizontal size={14} style={{ color: activeFiltersCount > 0 ? '#fff' : 'var(--accent-red)' }} />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span style={{
                background: 'var(--accent-red)',
                color: '#fff',
                fontSize: '0.68rem',
                fontWeight: '700',
                minWidth: '16px',
                height: '16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px'
              }}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Quick Category Bar (when in store view) */}
      {activeView === 'store' && (
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-primary)',
          padding: '6px 24px'
        }}>
          <div style={{
            maxWidth: '1360px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '5px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: '600',
                background: selectedCategory === 'all' ? 'var(--accent-navy)' : 'transparent',
                color: selectedCategory === 'all' ? '#fff' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: selectedCategory === 'all' ? 'var(--accent-navy)' : 'var(--border-subtle)',
                whiteSpace: 'nowrap'
              }}
            >
              All Drops
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  background: selectedCategory === cat ? 'var(--accent-navy)' : 'transparent',
                  color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? 'var(--accent-navy)' : 'var(--border-subtle)',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
