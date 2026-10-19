import React from 'react';
import { ShoppingBag, ShieldCheck, Flame, Search, SlidersHorizontal, Store } from 'lucide-react';

export default function Navbar({
  activeView,
  setActiveView,
  cartCount,
  onOpenCart,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories
}) {
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

      <div style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        {/* Official Brand Logo */}
        <div 
          onClick={() => setActiveView('store')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <img
            src="/polorse-logo.jpg"
            alt="POLORSE - Made in India"
            style={{
              height: '46px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        </div>

        {/* Categories Bar (when in store view) */}
        {activeView === 'store' && (
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            padding: '4px 0'
          }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: '600',
                background: selectedCategory === 'all' ? 'var(--text-primary)' : 'transparent',
                color: selectedCategory === 'all' ? 'var(--text-inverse)' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: selectedCategory === 'all' ? 'var(--text-primary)' : 'var(--border-subtle)'
              }}
            >
              All Drops
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  background: selectedCategory === cat ? 'var(--text-primary)' : 'transparent',
                  color: selectedCategory === cat ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? 'var(--text-primary)' : 'var(--border-subtle)',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </nav>
        )}

        {/* Right Actions & View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search box for customer store */}
          {activeView === 'store' && (
            <div style={{ position: 'relative', width: '220px', display: 'none' }} className="search-desktop">
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  paddingLeft: '36px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-full)'
                }}
              />
            </div>
          )}

          {/* View Switcher: Store vs Brother's Admin Hub */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            padding: '4px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => setActiveView('store')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: '600',
                background: activeView === 'store' ? 'var(--accent-navy)' : 'transparent',
                color: activeView === 'store' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              <Store size={15} />
              <span>Customer Store</span>
            </button>
            <button
              onClick={() => setActiveView('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: '600',
                background: activeView === 'admin' ? 'var(--accent-red)' : 'transparent',
                color: activeView === 'admin' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              <ShieldCheck size={15} />
              <span>Brother's Admin</span>
            </button>
          </div>

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
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-sm)'
              }}
              title="View Shopping Cart"
            >
              <ShoppingBag size={20} />
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
    </header>
  );
}
