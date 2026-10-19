import React, { useState, useEffect } from 'react';
import {
  Package,
  PlusCircle,
  Tag,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
  MessageCircle,
  Layers,
  Sparkles,
  Smartphone,
  Save,
  RotateCcw,
  MapPin,
  Navigation,
  Compass,
  Truck,
  Clock,
  ShieldCheck as ShieldIcon
} from 'lucide-react';
import {
  fetchProducts,
  addProduct,
  deleteProduct,
  updateProduct,
  fetchCoupons,
  addCoupon,
  deleteCoupon,
  fetchOrders,
  updateOrderStatus
} from '../services/storeService';
import { isFirebaseConfigured, saveCustomFirebaseConfig, clearCustomFirebaseConfig, firebaseConfig } from '../services/firebaseConfig';
import { getDeliveryRules, saveDeliveryRules, checkPincodeDeliverability, autoDetectLocation } from '../services/pincodeService';

export default function AdminPortal({ onSwitchToStore }) {
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'add-product', 'coupons', 'orders', 'delivery', 'firebase'
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delivery Rules State
  const [deliveryRules, setDeliveryRules] = useState(getDeliveryRules());
  const [adminPinTest, setAdminPinTest] = useState('');
  const [adminPinResult, setAdminPinResult] = useState(null);
  const [isTestingAdminPin, setIsTestingAdminPin] = useState(false);
  const [isAdminDetecting, setIsAdminDetecting] = useState(false);
  const [newExpressPin, setNewExpressPin] = useState('');
  const [newBlockedPin, setNewBlockedPin] = useState('');

  // New Product Form State
  const [newProd, setNewProd] = useState({
    title: '',
    category: 'Hoodies',
    price: '',
    originalPrice: '',
    description: '',
    imageUrl: '',
    tags: 'OVERSIZED, NEW DROP',
    colors: [
      { name: 'Obsidian Black', hex: '#111111' },
      { name: 'Charcoal Wash', hex: '#2b2b2e' }
    ],
    sizes: [
      { size: 'S', stock: 15 },
      { size: 'M', stock: 25 },
      { size: 'L', stock: 20 },
      { size: 'XL', stock: 10 },
      { size: 'XXL', stock: 5 }
    ]
  });

  // Color inputs inside product form
  const [colorInputName, setColorInputName] = useState('');
  const [colorInputHex, setColorInputHex] = useState('#ff5c00');

  // New Coupon Form State
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage',
    value: 15,
    minOrder: 1500,
    description: ''
  });

  // Firebase Config Form State
  const [fbConfigInput, setFbConfigInput] = useState({
    apiKey: firebaseConfig.apiKey || '',
    authDomain: firebaseConfig.authDomain || '',
    projectId: firebaseConfig.projectId || '',
    storageBucket: firebaseConfig.storageBucket || '',
    messagingSenderId: firebaseConfig.messagingSenderId || '',
    appId: firebaseConfig.appId || ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, c, o] = await Promise.all([
        fetchProducts(),
        fetchCoupons(),
        fetchOrders()
      ]);
      setProducts(p);
      setCoupons(c);
      setOrders(o);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("aura_store_update", handleUpdate);
    return () => window.removeEventListener("aura_store_update", handleUpdate);
  }, []);

  // Metrics
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'Cancelled')
    .reduce((acc, o) => acc + (o.total || 0), 0);

  const activeOrdersCount = orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;

  // Handle Image Upload / Preview
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProd(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Color to Product Form
  const handleAddColor = () => {
    if (!colorInputName.trim()) return;
    setNewProd(prev => ({
      ...prev,
      colors: [...prev.colors, { name: colorInputName.trim(), hex: colorInputHex }]
    }));
    setColorInputName('');
  };

  const handleRemoveColor = (index) => {
    setNewProd(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  // Stock change
  const handleStockChange = (sizeName, newStock) => {
    setNewProd(prev => ({
      ...prev,
      sizes: prev.sizes.map(s => s.size === sizeName ? { ...s, stock: parseInt(newStock) || 0 } : s)
    }));
  };

  // Submit New Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProd.title || !newProd.price) {
      alert("Please provide at least Title and Selling Price");
      return;
    }

    const payload = {
      title: newProd.title,
      category: newProd.category,
      price: parseFloat(newProd.price),
      originalPrice: newProd.originalPrice ? parseFloat(newProd.originalPrice) : null,
      description: newProd.description || 'Premium streetwear heavyweight drop.',
      imageUrl: newProd.imageUrl || '/products/hoodie-charcoal.jpg',
      tags: newProd.tags.split(',').map(t => t.trim()).filter(Boolean),
      colors: newProd.colors,
      sizes: newProd.sizes,
      inStock: true,
      isFeatured: true
    };

    await addProduct(payload);
    alert(`Apparel "${payload.title}" added to store!`);
    setActiveTab('products');
    loadData();
  };

  // Submit New Coupon
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code) return;

    await addCoupon({
      ...newCoupon,
      code: newCoupon.code.toUpperCase(),
      value: parseFloat(newCoupon.value) || 10,
      minOrder: parseFloat(newCoupon.minOrder) || 0,
      isActive: true
    });

    setNewCoupon({
      code: '',
      type: 'percentage',
      value: 15,
      minOrder: 1500,
      description: ''
    });
    alert("New discount voucher created!");
    loadData();
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '30px 24px', minHeight: '80vh' }}>
      {/* Top Admin Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge-tag badge-orange">BROTHER'S MANAGEMENT HUB</span>
            {isFirebaseConfigured ? (
              <span className="badge-tag badge-lime" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} /> FIREBASE CLOUD CONNECTED
              </span>
            ) : (
              <span className="badge-tag" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                LOCAL TESTING MODE
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '2.2rem', marginTop: '6px' }}>Store Administration</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Upload clothes, manage inventory & stock, create discount coupons, and track customer orders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('add-product')}
            className="btn-primary"
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <PlusCircle size={18} />
            <span>Upload New Apparel</span>
          </button>
          <button
            onClick={onSwitchToStore}
            className="btn-secondary"
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <ExternalLink size={16} />
            <span>View Customer Store</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'var(--bg-card)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(243, 91, 4, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-orange)'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Gross Revenue
            </span>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)' }}>₹{totalRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(15, 28, 63, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-navy)'
          }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Orders Placed
            </span>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)' }}>{orders.length} ({activeOrdersCount} Active)</h3>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(197, 160, 89, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold)'
          }}>
            <Package size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Apparel Catalog
            </span>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)' }}>{products.length} Items Live</h3>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(194, 26, 44, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-red)'
          }}>
            <Tag size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Promo Coupons
            </span>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)' }}>{coupons.filter(c => c.isActive).length} Active</h3>
          </div>
        </div>
      </div>

      {/* Tab Navigation Navigation Bar */}
      <div style={{
        display: 'flex',
        gap: '10px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '28px',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '12px 20px',
            fontWeight: '600',
            fontSize: '0.95rem',
            color: activeTab === 'products' ? 'var(--accent-navy)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'products' ? '2px solid var(--accent-navy)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Package size={17} />
          <span>Clothes Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('add-product')}
          style={{
            padding: '12px 20px',
            fontWeight: '600',
            fontSize: '0.95rem',
            color: activeTab === 'add-product' ? 'var(--accent-navy)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'add-product' ? '2px solid var(--accent-navy)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <PlusCircle size={17} />
          <span>+ Upload Product</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '12px 20px',
            fontWeight: '600',
            fontSize: '0.95rem',
            color: activeTab === 'orders' ? 'var(--accent-navy)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'orders' ? '2px solid var(--accent-navy)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ShoppingBag size={17} />
          <span>Customer Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          style={{
            padding: '12px 20px',
            fontWeight: '600',
            fontSize: '0.95rem',
            color: activeTab === 'coupons' ? 'var(--accent-navy)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'coupons' ? '2px solid var(--accent-navy)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Tag size={17} />
          <span>Discounts & Coupons</span>
        </button>

        <button
          onClick={() => setActiveTab('delivery')}
          style={{
            padding: '12px 20px',
            fontWeight: '600',
            fontSize: '0.95rem',
            color: activeTab === 'delivery' ? 'var(--accent-navy)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'delivery' ? '2px solid var(--accent-navy)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <MapPin size={17} />
          <span>Delivery & Pincodes</span>
        </button>

        <button
          onClick={() => setActiveTab('firebase')}
          style={{
            padding: '12px 20px',
            fontWeight: '600',
            fontSize: '0.95rem',
            color: activeTab === 'firebase' ? 'var(--accent-orange)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'firebase' ? '2px solid var(--accent-orange)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Smartphone size={17} />
          <span>Firebase & Flutter Sync</span>
        </button>
      </div>

      {/* TAB 1: PRODUCT CATALOG */}
      {activeTab === 'products' && (
        <div className="animate-fade">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {products.map(prod => (
              <div
                key={prod.id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  padding: '16px',
                  display: 'flex',
                  gap: '14px'
                }}
              >
                <img
                  src={prod.imageUrl}
                  alt={prod.title}
                  style={{ width: '84px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-orange)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {prod.category}
                    </span>
                    <h4 style={{ fontSize: '0.95rem', color: '#fff', marginTop: '2px', lineHeight: '1.3' }}>
                      {prod.title}
                    </h4>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', marginTop: '4px', color: '#fff' }}>
                      ₹{prod.price.toLocaleString('en-IN')}{' '}
                      {prod.originalPrice && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          ₹{prod.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock across sizes */}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {prod.sizes?.map(s => (
                      <span key={s.size} style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 5px', borderRadius: '3px' }}>
                        {s.size}: <strong>{s.stock}</strong>
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                    <button
                      onClick={() => updateProduct(prod.id, { inStock: !prod.inStock })}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: prod.inStock ? 'var(--accent-green)' : 'var(--accent-red)',
                        background: prod.inStock ? 'rgba(16,185,129,0.1)' : 'rgba(255,51,102,0.1)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)'
                      }}
                    >
                      {prod.inStock ? '● In Stock' : '○ Out of Stock'}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete "${prod.title}"?`)) {
                          deleteProduct(prod.id);
                          loadData();
                        }
                      }}
                      className="btn-danger"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD NEW APPAREL */}
      {activeTab === 'add-product' && (
        <div className="animate-fade" style={{ maxWidth: '850px', background: 'var(--bg-card)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Upload New Streetwear Apparel</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
            Enter details, select available sizes & colors, set prices, and upload product photos.
          </p>

          <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acid-Wash Oversized Heavyweight Hoodie"
                  value={newProd.title}
                  onChange={(e) => setNewProd({ ...newProd, title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Category *
                </label>
                <select
                  value={newProd.category}
                  onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                >
                  <option value="Hoodies">Hoodies</option>
                  <option value="T-Shirts">T-Shirts</option>
                  <option value="Bottoms">Bottoms / Cargo</option>
                  <option value="Outerwear">Outerwear & Jackets</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="2499"
                  value={newProd.price}
                  onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Original MRP (₹) (For showing discount)
                </label>
                <input
                  type="number"
                  placeholder="3999"
                  value={newProd.originalPrice}
                  onChange={(e) => setNewProd({ ...newProd, originalPrice: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Tags / Badges (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="OVERSIZED, DROP 01, HEAVYWEIGHT"
                  value={newProd.tags}
                  onChange={(e) => setNewProd({ ...newProd, tags: e.target.value })}
                />
              </div>
            </div>

            {/* Image upload & preview */}
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Product Image (Upload from Computer or enter Image URL)
              </label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  style={{ maxWidth: '300px' }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>or</span>
                <input
                  type="text"
                  placeholder="Paste image URL (https://...)"
                  value={newProd.imageUrl}
                  onChange={(e) => setNewProd({ ...newProd, imageUrl: e.target.value })}
                />
              </div>
              {newProd.imageUrl && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={newProd.imageUrl}
                    alt="Preview"
                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-hover)' }}
                  />
                  <span style={{ fontSize: '0.82rem', color: 'var(--accent-green)' }}>✓ Image preview loaded</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Product Description & Fabric Specs
              </label>
              <textarea
                rows={3}
                placeholder="420 GSM french terry cotton, drop shoulder boxy silhouette, high density screen print..."
                value={newProd.description}
                onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
              />
            </div>

            {/* Sizes & Stock inventory */}
            <div>
              <label style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                Sizes & Initial Stock
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                {newProd.sizes.map(s => (
                  <div key={s.size} style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                      Size {s.size}
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={s.stock}
                      onChange={(e) => handleStockChange(s.size, e.target.value)}
                      style={{ padding: '6px', fontSize: '0.85rem' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Colors Management */}
            <div>
              <label style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                Available Colors
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                {newProd.colors.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--bg-secondary)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.82rem'
                    }}
                  >
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: c.hex }} />
                    <span>{c.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(i)}
                      style={{ color: 'var(--accent-red)', marginLeft: '4px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', maxWidth: '400px' }}>
                <input
                  type="text"
                  placeholder="Color Name (e.g. Bone White)"
                  value={colorInputName}
                  onChange={(e) => setColorInputName(e.target.value)}
                  style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                />
                <input
                  type="color"
                  value={colorInputHex}
                  onChange={(e) => setColorInputHex(e.target.value)}
                  style={{ width: '45px', padding: '2px', height: '38px', cursor: 'pointer' }}
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                >
                  Add Color
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '14px', fontSize: '1rem', marginTop: '12px' }}
            >
              Publish Apparel to Storefront
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: CUSTOMER ORDERS */}
      {activeTab === 'orders' && (
        <div className="animate-fade">
          <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Received Customer Orders</h2>
          {orders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No orders placed yet. Place a test order from the Customer Store!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map(order => (
                <div
                  key={order.id}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    padding: '20px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '12px',
                    marginBottom: '14px'
                  }}>
                    <div>
                      <span className="badge-tag badge-orange" style={{ marginRight: '8px' }}>
                        {order.id}
                      </span>
                      <strong style={{ fontSize: '1.1rem', color: '#fff' }}>
                        {order.customerName}
                      </strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginLeft: '10px' }}>
                        {new Date(order.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        Status:
                      </span>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        style={{
                          width: 'auto',
                          padding: '4px 10px',
                          fontSize: '0.82rem',
                          background: 'var(--bg-secondary)',
                          borderColor: order.orderStatus === 'Delivered' ? 'var(--accent-green)' : 'var(--accent-orange)'
                        }}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing / Packing</option>
                        <option value="Shipped">Shipped / In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {/* Items */}
                    <div>
                      <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Ordered Clothes
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem' }}>
                            <img src={item.imageUrl} alt="" style={{ width: '38px', height: '44px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div>
                              <div style={{ color: '#fff', fontWeight: '600' }}>{item.title}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer & Address */}
                    <div>
                      <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Shipping Address & Phone
                      </h4>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {order.address}
                      </p>
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.88rem', color: '#fff', fontWeight: '600' }}>
                          📞 {order.phone}
                        </span>
                        <a
                          href={`https://wa.me/${order.phone?.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(order.customerName)},%20this%20is%20Polorse%20regarding%20your%20order%20${order.id}.`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#25D366',
                            color: '#000',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            textDecoration: 'none'
                          }}
                        >
                          <MessageCircle size={12} />
                          WhatsApp
                        </a>
                      </div>
                    </div>

                    {/* Payment & Total */}
                    <div>
                      <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Payment Details
                      </h4>
                      <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>Payment: <strong style={{ color: '#fff' }}>{order.paymentMethod}</strong></div>
                        <div>Status: <span style={{ color: order.paymentStatus.includes('PAID') ? 'var(--accent-green)' : 'var(--accent-orange)' }}>{order.paymentStatus}</span></div>
                        {order.couponApplied && (
                          <div style={{ color: 'var(--accent-lime)' }}>Coupon: {order.couponApplied} (-₹{order.discount})</div>
                        )}
                        <div style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--accent-orange)', marginTop: '4px' }}>
                          Total: ₹{order.total?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: COUPONS & DISCOUNTS */}
      {activeTab === 'coupons' && (
        <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          {/* Create Coupon Form */}
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Create New Promo Coupon</h3>
            <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Coupon Code (e.g. FESTIVE20) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="SUMMER25"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Type
                  </label>
                  <select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                  >
                    <option value="percentage">% Percentage Off</option>
                    <option value="flat">₹ Flat Rupee Off</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Minimum Order Spend (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={newCoupon.minOrder}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Description (shown to customer)
                </label>
                <input
                  type="text"
                  placeholder="20% off on all streetwear drops"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                Add Coupon Code
              </button>
            </form>
          </div>

          {/* Existing Coupons */}
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Active Promotional Codes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {coupons.map(coupon => (
                <div
                  key={coupon.id}
                  style={{
                    background: 'var(--bg-card)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge-tag badge-orange" style={{ fontSize: '0.82rem' }}>
                        {coupon.code}
                      </span>
                      <strong style={{ color: '#fff' }}>
                        {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} Flat OFF`}
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {coupon.description || `Min order ₹${coupon.minOrder}`}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Delete coupon ${coupon.code}?`)) {
                        deleteCoupon(coupon.id);
                        loadData();
                      }
                    }}
                    className="btn-danger"
                    style={{ padding: '6px 10px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FIREBASE & FLUTTER SYNC */}
      {activeTab === 'firebase' && (
        <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: 'var(--bg-card)',
            padding: '28px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Smartphone size={24} style={{ color: 'var(--accent-orange)' }} />
              <h2 style={{ fontSize: '1.5rem' }}>How the Flutter / iOS App Connects to This</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Because we built this store with a decoupled data architecture, you don't have to rebuild any backend when you create the Flutter app!
              Both this Website and your upcoming Flutter App communicate with the <strong>exact same Firebase Firestore database</strong>:
            </p>

            {/* Architecture Card */}
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              margin: '16px 0',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              color: 'var(--accent-cyan)'
            }}>
              <div>Firebase Firestore Cloud Database Collections:</div>
              <div style={{ color: 'var(--text-primary)', marginTop: '4px' }}>
                ├── 📁 /products &nbsp;&nbsp;(Apparel, variants, sizes, colors, pricing, images)<br/>
                ├── 📁 /coupons &nbsp;&nbsp;&nbsp;(Promo codes, % discounts, min spend limits)<br/>
                └── 📁 /orders &nbsp;&nbsp;&nbsp;&nbsp;(Customer name, phone, address, items, COD/UPI status)
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '6px' }}>
                Flutter Code Preview (Paste into your future Flutter app):
              </h4>
              <pre style={{
                background: '#09090b',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                color: '#a5b4fc',
                fontSize: '0.85rem',
                overflowX: 'auto',
                border: '1px solid var(--border-subtle)'
              }}>
{`// In your Flutter project (pubspec.yaml -> cloud_firestore: ^5.0.0)
final snapshot = await FirebaseFirestore.instance
    .collection('products')
    .where('inStock', isEqualTo: true)
    .get();

final products = snapshot.docs.map((doc) => Product.fromMap(doc.data())).toList();`}
              </pre>
            </div>
          </div>

          {/* Firebase API Keys Configurator Form */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '28px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>
              Live Firebase Credentials (Optional)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
              Currently running in seamless instant test mode. Whenever you create a free project on <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-orange)' }}>console.firebase.google.com</a>, you can paste the 6 keys here to switch from local storage to live Google Cloud Firestore!
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>API Key</label>
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={fbConfigInput.apiKey}
                  onChange={(e) => setFbConfigInput({ ...fbConfigInput, apiKey: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Project ID</label>
                <input
                  type="text"
                  placeholder="polorse-clothing-store"
                  value={fbConfigInput.projectId}
                  onChange={(e) => setFbConfigInput({ ...fbConfigInput, projectId: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auth Domain</label>
                <input
                  type="text"
                  placeholder="polorse-clothing-store.firebaseapp.com"
                  value={fbConfigInput.authDomain}
                  onChange={(e) => setFbConfigInput({ ...fbConfigInput, authDomain: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Storage Bucket</label>
                <input
                  type="text"
                  placeholder="polorse-clothing-store.appspot.com"
                  value={fbConfigInput.storageBucket}
                  onChange={(e) => setFbConfigInput({ ...fbConfigInput, storageBucket: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Messaging Sender ID</label>
                <input
                  type="text"
                  placeholder="1029384756"
                  value={fbConfigInput.messagingSenderId}
                  onChange={(e) => setFbConfigInput({ ...fbConfigInput, messagingSenderId: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>App ID</label>
                <input
                  type="text"
                  placeholder="1:1029384756:web:abcd1234..."
                  value={fbConfigInput.appId}
                  onChange={(e) => setFbConfigInput({ ...fbConfigInput, appId: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  if (!fbConfigInput.apiKey || !fbConfigInput.projectId) {
                    alert("Please provide at least API Key and Project ID");
                    return;
                  }
                  saveCustomFirebaseConfig(fbConfigInput);
                }}
                className="btn-primary"
              >
                <Save size={16} />
                <span>Save & Connect Firebase</span>
              </button>

              <button
                onClick={() => {
                  if (confirm("Reset to demo store?")) {
                    clearCustomFirebaseConfig();
                  }
                }}
                className="btn-secondary"
              >
                <RotateCcw size={16} />
                <span>Reset to Local Demo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DELIVERY & PINCODES */}
      {activeTab === 'delivery' && (
        <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Top Admin Pincode Diagnostic Tool */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '28px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <MapPin size={24} style={{ color: 'var(--accent-red)' }} />
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>
                Live Pincode Deliverability Checker & Diagnostic
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
              Enter any Indian 6-digit PIN code or auto-detect location to verify customer delivery availability, estimated days, courier transit time, and Cash on Delivery eligibility.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', maxWidth: '680px' }}>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit PIN (e.g. 400001 or 560038)"
                value={adminPinTest}
                onChange={(e) => setAdminPinTest(e.target.value.replace(/[^0-9]/g, ''))}
                style={{ flex: 1, minWidth: '220px', fontSize: '0.95rem' }}
              />

              <button
                type="button"
                onClick={async () => {
                  if (adminPinTest.length !== 6) {
                    alert("Please enter a 6-digit PIN code");
                    return;
                  }
                  setIsTestingAdminPin(true);
                  const res = await checkPincodeDeliverability(adminPinTest);
                  setAdminPinResult(res);
                  setIsTestingAdminPin(false);
                }}
                disabled={isTestingAdminPin || adminPinTest.length !== 6}
                className="btn-primary"
                style={{ padding: '11px 20px' }}
              >
                {isTestingAdminPin ? 'Checking SLA...' : 'Check Deliverability'}
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsAdminDetecting(true);
                  const loc = await autoDetectLocation();
                  if (loc?.pincode) {
                    setAdminPinTest(loc.pincode);
                    setAdminPinResult(loc.deliveryInfo);
                  }
                  setIsAdminDetecting(false);
                }}
                disabled={isAdminDetecting}
                className="btn-secondary"
                style={{ padding: '11px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Navigation size={14} className={isAdminDetecting ? 'animate-spin' : ''} />
                <span>{isAdminDetecting ? 'Detecting...' : 'Auto-Detect Location'}</span>
              </button>
            </div>

            {/* Diagnostic Result Card */}
            {adminPinResult && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: adminPinResult.isDeliverable ? 'rgba(5, 150, 105, 0.06)' : 'rgba(194, 26, 44, 0.06)',
                border: `1px solid ${adminPinResult.isDeliverable ? 'rgba(5, 150, 105, 0.25)' : 'rgba(194, 26, 44, 0.25)'}`,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Deliverability Status
                  </span>
                  <div style={{
                    fontSize: '1.05rem',
                    fontWeight: '700',
                    color: adminPinResult.isDeliverable ? 'var(--accent-green)' : 'var(--accent-red)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '2px'
                  }}>
                    {adminPinResult.isDeliverable ? '✓ Serviceable & Deliverable' : '✗ Non-Serviceable Area'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Postal Destination
                  </span>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {adminPinResult.city}, {adminPinResult.state} ({adminPinResult.pincode})
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Courier SLA Transit
                  </span>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent-navy)', marginTop: '2px' }}>
                    {adminPinResult.deliveryDays}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Cash on Delivery (COD)
                  </span>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: adminPinResult.isCodAllowed ? 'var(--accent-green)' : 'var(--accent-red)',
                    marginTop: '2px'
                  }}>
                    {adminPinResult.isCodAllowed ? '✓ COD Allowed' : '✗ Prepaid Only'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Serviceable Pincodes and SLA Rules */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* Express Metro Pincodes */}
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Truck size={20} style={{ color: 'var(--accent-navy)' }} />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Express Metro PINs (1-2 Days)</h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Priority delivery hubs with direct courier flight connections.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px', maxHeight: '140px', overflowY: 'auto' }}>
                {deliveryRules.expressPincodes?.map((pin) => (
                  <span
                    key={pin}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{pin}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...deliveryRules,
                          expressPincodes: deliveryRules.expressPincodes.filter(p => p !== pin)
                        };
                        setDeliveryRules(updated);
                        saveDeliveryRules(updated);
                      }}
                      style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Add 6-digit PIN (e.g. 110001)"
                  value={newExpressPin}
                  onChange={(e) => setNewExpressPin(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newExpressPin.length !== 6) return;
                    if (!deliveryRules.expressPincodes.includes(newExpressPin)) {
                      const updated = {
                        ...deliveryRules,
                        expressPincodes: [...deliveryRules.expressPincodes, newExpressPin]
                      };
                      setDeliveryRules(updated);
                      saveDeliveryRules(updated);
                      setNewExpressPin('');
                    }
                  }}
                  className="btn-secondary"
                  style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}
                >
                  Add Express PIN
                </button>
              </div>
            </div>

            {/* Blocked or Non-Serviceable Pincodes */}
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldIcon size={20} style={{ color: 'var(--accent-red)' }} />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Blocked / Restricted PINs</h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                PIN codes where shipping is disabled due to carrier limitations or high return risk.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px', minHeight: '38px' }}>
                {deliveryRules.blockedPincodes?.length === 0 ? (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    No PIN codes blocked. All standard Indian pincodes are currently serviceable.
                  </span>
                ) : (
                  deliveryRules.blockedPincodes?.map((pin) => (
                    <span
                      key={pin}
                      style={{
                        background: 'rgba(194, 26, 44, 0.08)',
                        border: '1px solid rgba(194, 26, 44, 0.25)',
                        color: 'var(--accent-red)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.82rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{pin}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...deliveryRules,
                            blockedPincodes: deliveryRules.blockedPincodes.filter(p => p !== pin)
                          };
                          setDeliveryRules(updated);
                          saveDeliveryRules(updated);
                        }}
                        style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Block 6-digit PIN"
                  value={newBlockedPin}
                  onChange={(e) => setNewBlockedPin(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newBlockedPin.length !== 6) return;
                    if (!deliveryRules.blockedPincodes.includes(newBlockedPin)) {
                      const updated = {
                        ...deliveryRules,
                        blockedPincodes: [...deliveryRules.blockedPincodes, newBlockedPin]
                      };
                      setDeliveryRules(updated);
                      saveDeliveryRules(updated);
                      setNewBlockedPin('');
                    }
                  }}
                  className="btn-danger"
                  style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}
                >
                  Block Pincode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
