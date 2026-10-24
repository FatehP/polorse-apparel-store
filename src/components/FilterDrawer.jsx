import React from 'react';
import { X, SlidersHorizontal, Check, RotateCcw, ArrowUpDown, Tag, DollarSign, Layers } from 'lucide-react';

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const PRICE_PRESETS = [
  { id: 'all', label: 'All Prices' },
  { id: 'under-1500', label: 'Under ₹1,500' },
  { id: '1500-2500', label: '₹1,500 – ₹2,500' },
  { id: '2500-3500', label: '₹2,500 – ₹3,500' },
  { id: 'above-3500', label: 'Above ₹3,500' }
];

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured / Recommended' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'newest', label: 'Newest Drops' },
  { id: 'discount', label: 'Biggest Discount %' }
];

export default function FilterDrawer({
  isOpen,
  onClose,
  categories = [],
  selectedCategory,
  setSelectedCategory,
  selectedSort,
  setSelectedSort,
  priceRange,
  setPriceRange,
  selectedSizes = [],
  setSelectedSizes,
  inStockOnly,
  setInStockOnly,
  onClearAll,
  totalProductsCount = 0,
  filteredCount = 0,
  categoryCounts = {}
}) {
  if (!isOpen) return null;

  const handleToggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedSort !== 'featured' ||
    priceRange !== 'all' ||
    selectedSizes.length > 0 ||
    inStockOnly;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(15, 28, 63, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)'
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-navy)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                Filter Collection
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Showing {filteredCount} of {totalProductsCount} items
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {hasActiveFilters && (
              <button
                onClick={onClearAll}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem',
                  color: 'var(--accent-red)',
                  fontWeight: '600',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(194, 26, 44, 0.08)'
                }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Close filters"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filter Sections (Scrollable) */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Section 1: Categories */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '12px'
            }}>
              <Layers size={14} style={{ color: 'var(--accent-red)' }} />
              <span>Apparel Category</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                onClick={() => setSelectedCategory('all')}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  background: selectedCategory === 'all' ? 'var(--accent-navy)' : 'var(--bg-primary)',
                  color: selectedCategory === 'all' ? '#fff' : 'var(--text-primary)',
                  border: '1px solid',
                  borderColor: selectedCategory === 'all' ? 'var(--accent-navy)' : 'var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>All Drops</span>
                <span style={{
                  fontSize: '0.72rem',
                  opacity: 0.8,
                  background: selectedCategory === 'all' ? 'rgba(255,255,255,0.2)' : 'rgba(15,28,63,0.08)',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {totalProductsCount}
                </span>
              </button>

              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    background: selectedCategory === cat ? 'var(--accent-navy)' : 'var(--bg-primary)',
                    color: selectedCategory === cat ? '#fff' : 'var(--text-primary)',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? 'var(--accent-navy)' : 'var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{cat}</span>
                  {categoryCounts[cat] !== undefined && (
                    <span style={{
                      fontSize: '0.72rem',
                      opacity: 0.8,
                      background: selectedCategory === cat ? 'rgba(255,255,255,0.2)' : 'rgba(15,28,63,0.08)',
                      padding: '1px 6px',
                      borderRadius: '10px'
                    }}>
                      {categoryCounts[cat]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Sort By */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '12px'
            }}>
              <ArrowUpDown size={14} style={{ color: 'var(--accent-red)' }} />
              <span>Sort By</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {SORT_OPTIONS.map(opt => {
                const isSelected = selectedSort === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedSort(opt.id)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? '700' : '500',
                      background: isSelected ? 'rgba(15, 28, 63, 0.06)' : 'var(--bg-primary)',
                      color: isSelected ? 'var(--accent-navy)' : 'var(--text-secondary)',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-navy)' : 'var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left'
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={16} style={{ color: 'var(--accent-navy)' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Price Range */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '12px'
            }}>
              <DollarSign size={14} style={{ color: 'var(--accent-red)' }} />
              <span>Price Range</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {PRICE_PRESETS.map(preset => {
                const isSelected = priceRange === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setPriceRange(preset.id)}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? '700' : '500',
                      background: isSelected ? 'var(--accent-navy)' : 'var(--bg-primary)',
                      color: isSelected ? '#fff' : 'var(--text-primary)',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-navy)' : 'var(--border-subtle)',
                      textAlign: 'center'
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Available Sizes */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <Tag size={14} style={{ color: 'var(--accent-red)' }} />
                <span>Available Sizes</span>
              </div>
              {selectedSizes.length > 0 && (
                <button
                  onClick={() => setSelectedSizes([])}
                  style={{ fontSize: '0.75rem', color: 'var(--accent-red)', fontWeight: '600' }}
                >
                  Clear Sizes
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {ALL_SIZES.map(size => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => handleToggleSize(size)}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      background: isSelected ? 'var(--accent-navy)' : 'var(--bg-primary)',
                      color: isSelected ? '#fff' : 'var(--text-primary)',
                      border: '1.5px solid',
                      borderColor: isSelected ? 'var(--accent-navy)' : 'var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isSelected ? '0 2px 8px rgba(15,28,63,0.2)' : 'none'
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Availability */}
          <div style={{
            background: 'var(--bg-primary)',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                In-Stock Items Only
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Hide apparel currently out of stock
              </div>
            </div>

            <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                inset: 0,
                backgroundColor: inStockOnly ? 'var(--accent-navy)' : '#CBD5E1',
                borderRadius: '24px',
                transition: '0.2s'
              }}>
                <span style={{
                  position: 'absolute',
                  height: '18px',
                  width: '18px',
                  left: inStockOnly ? '23px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-primary)',
          display: 'flex',
          gap: '12px'
        }}>
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="btn-secondary"
              style={{ flex: 1, padding: '12px', fontSize: '0.88rem' }}
            >
              Reset All
            </button>
          )}

          <button
            onClick={onClose}
            className="btn-primary"
            style={{ flex: 2, padding: '12px', fontSize: '0.92rem' }}
          >
            Show {filteredCount} {filteredCount === 1 ? 'Piece' : 'Pieces'}
          </button>
        </div>
      </div>
    </div>
  );
}
