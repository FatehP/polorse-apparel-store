import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AdminPortal from './components/AdminPortal';
import FilterDrawer from './components/FilterDrawer';
import AuthModal from './components/AuthModal';
import { fetchProducts } from './services/storeService';
import { getCurrentUser, logout } from './services/authService';
import { ArrowDown, Flame, Sparkles, Shield, Truck, RefreshCw, Smartphone, SlidersHorizontal, X, RotateCcw, ArrowUpDown } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('store'); // 'store' or 'admin'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('featured');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Cart & Modals
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener('polorse_auth_changed', handleAuthChange);
    return () => window.removeEventListener('polorse_auth_changed', handleAuthChange);
  }, []);

  // Global mobile body scroll lock whenever any modal or drawer is active
  const isAnyModalActive = Boolean(selectedProduct || isCartOpen || isFilterOpen || isCheckoutOpen || isAuthModalOpen);
  useEffect(() => {
    if (isAnyModalActive) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isAnyModalActive]);

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  // Load products
  const loadStoreProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
      // Smoothly dismiss initial brand preloader
      const preloader = document.getElementById('polorse-preloader');
      if (preloader) {
        setTimeout(() => {
          preloader.classList.add('preloader-fade-out');
          setTimeout(() => {
            if (preloader && preloader.parentNode) {
              preloader.parentNode.removeChild(preloader);
            }
          }, 650);
        }, 400);
      }
    }
  };

  useEffect(() => {
    loadStoreProducts();

    // Listen to local / broadcast updates
    const handleStoreUpdate = () => loadStoreProducts();
    window.addEventListener("aura_store_update", handleStoreUpdate);
    return () => window.removeEventListener("aura_store_update", handleStoreUpdate);
  }, []);

  // Derive categories & counts
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  const categoryCounts = products.reduce((acc, p) => {
    if (p.category) {
      acc[p.category] = (acc[p.category] || 0) + 1;
    }
    return acc;
  }, {});

  // Compute active filters count
  let activeFiltersCount = 0;
  if (selectedCategory !== 'all') activeFiltersCount++;
  if (selectedSort !== 'featured') activeFiltersCount++;
  if (priceRange !== 'all') activeFiltersCount++;
  if (selectedSizes.length > 0) activeFiltersCount += selectedSizes.length;
  if (inStockOnly) activeFiltersCount++;

  // Reset all filters
  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSort('featured');
    setPriceRange('all');
    setSelectedSizes([]);
    setInStockOnly(false);
  };

  // Multi-criteria Filter & Sort
  const filteredProducts = products
    .filter(p => {
      // 1. Category
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // 2. Search Query (title, description, category, tags, color names)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = p.title?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        const catMatch = p.category?.toLowerCase().includes(q);
        const tagMatch = p.tags?.some(t => t.toLowerCase().includes(q));
        const colorMatch = p.colors?.some(c => c.name?.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !catMatch && !tagMatch && !colorMatch) {
          return false;
        }
      }

      // 3. Price Range
      if (priceRange === 'under-1500' && p.price >= 1500) return false;
      if (priceRange === '1500-2500' && (p.price < 1500 || p.price > 2500)) return false;
      if (priceRange === '2500-3500' && (p.price < 2500 || p.price > 3500)) return false;
      if (priceRange === 'above-3500' && p.price <= 3500) return false;

      // 4. Sizes
      if (selectedSizes.length > 0) {
        const hasAnySize = p.sizes?.some(s => selectedSizes.includes(s.size) && s.stock > 0);
        if (!hasAnySize) return false;
      }

      // 5. In-Stock Only
      if (inStockOnly && !p.inStock) return false;

      return true;
    })
    .sort((a, b) => {
      if (selectedSort === 'price-low') {
        return a.price - b.price;
      }
      if (selectedSort === 'price-high') {
        return b.price - a.price;
      }
      if (selectedSort === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (selectedSort === 'discount') {
        const discA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) : 0;
        const discB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) : 0;
        return discB - discA;
      }
      // 'featured'
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });


  // Cart operations
  const handleAddToCart = (productWithSelection) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.id === productWithSelection.id &&
                item.selectedSize === productWithSelection.selectedSize &&
                item.selectedColor === productWithSelection.selectedColor
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += productWithSelection.quantity;
        return updated;
      } else {
        return [...prevCart, productWithSelection];
      }
    });
  };

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(item);
      return;
    }
    setCart(prevCart =>
      prevCart.map(i =>
        i.id === item.id && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor
          ? { ...i, quantity: newQuantity }
          : i
      )
    );
  };

  const handleRemoveFromCart = (item) => {
    setCart(prevCart =>
      prevCart.filter(
        i => !(i.id === item.id && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor)
      )
    );
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleBuyNow = (productWithSelection) => {
    handleAddToCart(productWithSelection);
    if (selectedProduct) {
      setSelectedProduct(null);
    }
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        cartCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        onOpenFilter={() => setIsFilterOpen(true)}
        activeFiltersCount={activeFiltersCount}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main View Router: Storefront vs Brother's Admin Portal */}
      {activeView === 'admin' ? (
        <AdminPortal onSwitchToStore={() => setActiveView('store')} />
      ) : (
        <main style={{ flex: 1 }}>
          {/* Product Catalog Grid (Products First) */}
          <section id="catalog" className="catalog-section" style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px 24px 48px' }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div>
                <span className="badge-tag badge-orange" style={{ marginBottom: '6px' }}>CATALOG DROP</span>
                <h2 style={{ fontSize: '2.2rem' }}>
                  {selectedCategory === 'all' ? 'All Streetwear Apparel' : selectedCategory}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'} • Hand-crafted oversized silhouettes
                </p>
              </div>

              {/* Catalog Toolbar: Sort Dropdown & Filter Trigger Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {/* Sort Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Sort:
                  </span>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    style={{
                      width: 'auto',
                      padding: '8px 14px',
                      fontSize: '0.84rem',
                      fontWeight: '600',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="featured">Featured / Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest Drops</option>
                    <option value="discount">Highest Discount</option>
                  </select>
                </div>

                {/* Filter Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    background: activeFiltersCount > 0 ? 'var(--accent-navy)' : 'var(--bg-secondary)',
                    color: activeFiltersCount > 0 ? '#fff' : 'var(--text-primary)',
                    border: '1px solid',
                    borderColor: activeFiltersCount > 0 ? 'var(--accent-navy)' : 'var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer'
                  }}
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
            </div>

            {/* Active Filter Chips Bar */}
            {(searchQuery || selectedCategory !== 'all' || priceRange !== 'all' || selectedSizes.length > 0 || inStockOnly || selectedSort !== 'featured') && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '24px',
                padding: '10px 14px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Active Filters:
                </span>

                {searchQuery && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    fontWeight: '600'
                  }}>
                    <span>Search: "{searchQuery}"</span>
                    <button onClick={() => setSearchQuery('')} style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                      <X size={12} />
                    </button>
                  </span>
                )}

                {selectedCategory !== 'all' && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    fontWeight: '600'
                  }}>
                    <span>Category: {selectedCategory}</span>
                    <button onClick={() => setSelectedCategory('all')} style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                      <X size={12} />
                    </button>
                  </span>
                )}

                {priceRange !== 'all' && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    fontWeight: '600'
                  }}>
                    <span>Price: {priceRange}</span>
                    <button onClick={() => setPriceRange('all')} style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                      <X size={12} />
                    </button>
                  </span>
                )}

                {selectedSizes.map(size => (
                  <span key={size} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    fontWeight: '600'
                  }}>
                    <span>Size: {size}</span>
                    <button onClick={() => setSelectedSizes(selectedSizes.filter(s => s !== size))} style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                      <X size={12} />
                    </button>
                  </span>
                ))}

                {inStockOnly && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    fontWeight: '600'
                  }}>
                    <span>In-Stock Only</span>
                    <button onClick={() => setInStockOnly(false)} style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                      <X size={12} />
                    </button>
                  </span>
                )}

                <button
                  onClick={handleClearAllFilters}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    color: 'var(--accent-red)',
                    fontWeight: '700',
                    marginLeft: 'auto',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={12} />
                  <span>Clear All Filters</span>
                </button>
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                Loading clothes catalog...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)'
              }}>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '8px' }}>No Apparel Matches Your Search or Filters</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '20px' }}>
                  Try relaxing your price range, clearing search terms, or exploring other categories!
                </p>
                <button
                  onClick={handleClearAllFilters}
                  className="btn-primary"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="catalog-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cart={cart}
                    onSelectProduct={setSelectedProduct}
                    onQuickAdd={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Brand Story & Trust Highlights Section (Below Catalog) */}
          <section style={{
            position: 'relative',
            padding: '70px 24px 65px',
            background: 'radial-gradient(ellipse at center, #F3ECE1 0%, #FAF7F2 100%)',
            borderTop: '1px solid var(--border-subtle)',
            overflow: 'hidden'
          }}>
            <div style={{
              maxWidth: '1240px',
              margin: '0 auto',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(194, 26, 44, 0.08)',
                border: '1px solid rgba(194, 26, 44, 0.25)',
                color: 'var(--accent-red)',
                fontSize: '0.82rem',
                fontWeight: '700',
                letterSpacing: '0.08em',
                marginBottom: '18px'
              }}>
                <Flame size={15} />
                <span>POLORSE SIGNATURE DROP • CRAFTED IN INDIA • 100% COMBED COTTON</span>
              </div>

              <h2 style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
                lineHeight: '1.1',
                letterSpacing: '-0.03em',
                maxWidth: '920px',
                marginBottom: '18px',
                color: 'var(--text-primary)'
              }}>
                CRAFTED IN INDIA. <span style={{ color: 'var(--accent-red)' }}>POLORSE</span> APPAREL.
              </h2>

              <p style={{
                fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
                color: 'var(--text-secondary)',
                maxWidth: '680px',
                lineHeight: '1.6',
                marginBottom: '36px'
              }}>
                Ultra-heavyweight dropped-shoulder hoodies, tailored boxy tees, and structured bottoms. Engineered for refined comfort, exceptional drape, and timeless Indian craftsmanship.
              </p>

              {/* Highlights Bar in White & Creme */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                width: '100%',
                maxWidth: '960px',
                padding: '24px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-md)',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Truck size={24} style={{ color: 'var(--accent-navy)' }} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>Pan-India Fast Shipping</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Delivered in 3-5 business days</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Sparkles size={24} style={{ color: 'var(--accent-red)' }} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>Cash on Delivery & UPI</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Pay cash at doorstep or via UPI</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <RefreshCw size={24} style={{ color: 'var(--accent-gold)' }} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>Easy Size Exchanges</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>7 days doorstep replacement</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '48px 24px 30px'
      }}>
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '36px',
          marginBottom: '40px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <img
                src="/polorse-logo.jpg"
                alt="POLORSE"
                style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              Heritage quality modern apparel & streetwear by Polorse. Crafted in India with 100% premium cotton, custom silhouettes, and timeless aesthetics.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Customer Care
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Pan-India Shipping Policy</span>
              <span>7-Day Size Exchanges</span>
              <span>Track Your Order</span>
              <span>Cash on Delivery Guidelines</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Promotions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Use code <strong>FIRSTDROP</strong> for 20% off</span>
              <span>Use code <strong>STREET10</strong> for 10% off</span>
              <span>Free delivery on orders above ₹1,999</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Brother's Backoffice
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
              Manage products, edit sizes & prices, view orders, and sync with your future Flutter mobile app.
            </p>
            <button
              onClick={() => {
                setActiveView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Open Polorse Admin Hub
            </button>
          </div>
        </div>

        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} POLORSE. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Smartphone size={14} style={{ color: 'var(--accent-orange)' }} />
            <span>Built with API-first architecture • Ready for Flutter iOS & Android App</span>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          cart={cart}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
          onBuyNow={handleBuyNow}
        />
      )}

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
        appliedCoupon={appliedCoupon}
        setAppliedCoupon={setAppliedCoupon}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        appliedCoupon={appliedCoupon}
        onOrderSuccess={handleOrderSuccess}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Member Authentication Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
        }}
      />

      {/* Filter & Sort Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        selectedSizes={selectedSizes}
        setSelectedSizes={setSelectedSizes}
        inStockOnly={inStockOnly}
        setInStockOnly={setInStockOnly}
        onClearAll={handleClearAllFilters}
        totalProductsCount={products.length}
        filteredCount={filteredProducts.length}
        categoryCounts={categoryCounts}
      />
    </div>
  );
}
