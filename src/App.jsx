import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AdminPortal from './components/AdminPortal';
import { fetchProducts } from './services/storeService';
import { ArrowDown, Flame, Sparkles, Shield, Truck, RefreshCw, Smartphone } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('store'); // 'store' or 'admin'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart & Modals
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Load products
  const loadStoreProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreProducts();

    // Listen to local / broadcast updates
    const handleStoreUpdate = () => loadStoreProducts();
    window.addEventListener("aura_store_update", handleStoreUpdate);
    return () => window.removeEventListener("aura_store_update", handleStoreUpdate);
  }, []);

  // Derive categories
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
      />

      {/* Main View Router: Storefront vs Brother's Admin Portal */}
      {activeView === 'admin' ? (
        <AdminPortal onSwitchToStore={() => setActiveView('store')} />
      ) : (
        <main style={{ flex: 1 }}>
          {/* Hero Banner */}
          <section style={{
            position: 'relative',
            padding: '75px 24px 65px',
            background: 'radial-gradient(ellipse at top, #F3ECE1 0%, #FAF7F2 80%)',
            borderBottom: '1px solid var(--border-subtle)',
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

              <h1 style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.4rem)',
                lineHeight: '1.05',
                letterSpacing: '-0.03em',
                maxWidth: '920px',
                marginBottom: '18px',
                color: 'var(--text-primary)'
              }}>
                CRAFTED IN INDIA. <span style={{ color: 'var(--accent-red)' }}>POLORSE</span> APPAREL.
              </h1>

              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: 'var(--text-secondary)',
                maxWidth: '680px',
                lineHeight: '1.6',
                marginBottom: '32px'
              }}>
                Ultra-heavyweight dropped-shoulder hoodies, tailored boxy tees, and structured bottoms. Engineered for refined comfort, exceptional drape, and timeless Indian craftsmanship.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
                <a
                  href="#catalog"
                  className="btn-primary"
                  style={{ textDecoration: 'none', padding: '14px 28px', fontSize: '1rem', borderRadius: 'var(--radius-full)' }}
                >
                  <span>Explore Collection</span>
                  <ArrowDown size={18} />
                </a>

                <button
                  onClick={() => setActiveView('admin')}
                  className="btn-secondary"
                  style={{ padding: '14px 24px', fontSize: '0.95rem', borderRadius: 'var(--radius-full)' }}
                >
                  <Shield size={18} style={{ color: 'var(--accent-red)' }} />
                  <span>Brother's Admin Portal</span>
                </button>
              </div>

              {/* Highlights Bar in White & Creme */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                width: '100%',
                maxWidth: '960px',
                marginTop: '56px',
                padding: '20px 24px',
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

          {/* Product Catalog Grid */}
          <section id="catalog" style={{ maxWidth: '1360px', margin: '0 auto', padding: '40px 24px 16px' }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div>
                <span className="badge-tag badge-orange" style={{ marginBottom: '6px' }}>CATALOG DROP</span>
                <h2 style={{ fontSize: '2.2rem' }}>
                  {selectedCategory === 'all' ? 'All Streetwear Apparel' : selectedCategory}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Showing {filteredProducts.length} pieces • Hand-crafted oversized silhouettes
                </p>
              </div>

              {/* Mobile / Tablet search bar */}
              <div style={{ width: '100%', maxWidth: '300px' }}>
                <input
                  type="text"
                  placeholder="Filter by name, color, style..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ borderRadius: 'var(--radius-full)' }}
                />
              </div>
            </div>

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
                <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '8px' }}>No Apparel Matches Your Search</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '20px' }}>
                  Try a different search term or category, or upload new clothes in Brother's Admin!
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={setSelectedProduct}
                    onQuickAdd={handleAddToCart}
                  />
                ))}
              </div>
            )}
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
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
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
      />
    </div>
  );
}
