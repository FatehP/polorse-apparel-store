import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Package,
  MapPin,
  CreditCard,
  Camera,
  CheckCircle2,
  Clock,
  Truck,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Check,
  Smartphone,
  Wallet,
  Sparkles,
  Download,
  RotateCcw,
  Navigation,
  Crown,
  Award,
  ChevronRight,
  Zap,
  Star,
  Gift
} from 'lucide-react';
import { formatCardExpiry } from '../utils/paymentUtils';
import {
  getCurrentUser,
  updateUserProfile,
  getUserAddresses,
  addOrUpdateUserAddress,
  deleteUserAddress,
  getUserCards,
  addOrUpdateUserCard,
  deleteUserCard,
  logout
} from '../services/authService';
import { fetchOrders } from '../services/storeService';
import { autoDetectLocation, checkPincodeDeliverability } from '../services/pincodeService';

export default function UserProfileModal({
  isOpen,
  onClose,
  initialTab = 'profile',
  currentUser,
  onUserUpdate,
  onOpenAuth
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(initialTab); // 'profile', 'orders', 'addresses', 'payments'
  const [user, setUser] = useState(currentUser || getCurrentUser());

  // --- Profile Edit State ---
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

  // Avatar presets for instant selection
  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'
  ];

  // --- Orders State ---
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);

  // --- Addresses State ---
  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    tag: 'Home',
    isPrimary: false
  });
  const [isDetecting, setIsDetecting] = useState(false);

  // --- Cards State ---
  const [cards, setCards] = useState([]);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [cardForm, setCardForm] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    network: 'Visa',
    isPrimary: false
  });

  // Sync state on tab/user change
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const updated = currentUser || getCurrentUser();
    setUser(updated);
    if (updated) {
      setProfileForm({
        name: updated.name || '',
        email: updated.email || '',
        phone: updated.phone || ''
      });
      setAddresses(getUserAddresses());
      setCards(getUserCards());
    }
  }, [currentUser]);

  // Load orders
  useEffect(() => {
    if (activeTab === 'orders' || isOpen) {
      setIsLoadingOrders(true);
      fetchOrders().then(allOrders => {
        setOrders(allOrders);
        setIsLoadingOrders(false);
      });
    }
  }, [activeTab, isOpen]);

  // --- Profile Actions ---
  const handleProfileFormSubmit = (e) => {
    e.preventDefault();
    const updated = updateUserProfile(profileForm);
    setUser(updated);
    onUserUpdate?.(updated);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 2500);
  };

  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const updated = updateUserProfile({ avatar: dataUrl });
        setUser(updated);
        onUserUpdate?.(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetAvatar = (avatarUrl) => {
    const updated = updateUserProfile({ avatar: avatarUrl });
    setUser(updated);
    onUserUpdate?.(updated);
  };

  // --- Address Actions ---
  const openNewAddressModal = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: user?.name || '',
      phone: user?.phone || '',
      addressLine: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
      tag: 'Home',
      isPrimary: addresses.length === 0
    });
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine: addr.addressLine,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      tag: addr.tag || 'Home',
      isPrimary: Boolean(addr.isPrimary)
    });
    setIsAddressModalOpen(true);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...addressForm,
      id: editingAddress?.id
    };
    addOrUpdateUserAddress(payload);
    const updated = getUserAddresses();
    setAddresses(updated);
    setIsAddressModalOpen(false);
    onUserUpdate?.(getCurrentUser());
  };

  const handleDeleteAddress = (id) => {
    if (addresses.length <= 1) {
      alert('You must retain at least one delivery address.');
      return;
    }
    const updated = deleteUserAddress(id);
    setAddresses(updated);
    onUserUpdate?.(getCurrentUser());
  };

  const handleSetPrimaryAddress = (id) => {
    const target = addresses.find(a => a.id === id);
    if (target) {
      addOrUpdateUserAddress({ ...target, isPrimary: true });
      setAddresses(getUserAddresses());
      onUserUpdate?.(getCurrentUser());
    }
  };

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    const loc = await autoDetectLocation();
    if (loc?.pincode) {
      setAddressForm(prev => ({
        ...prev,
        pincode: loc.pincode,
        city: loc.city || prev.city,
        state: loc.state || prev.state
      }));
    }
    setIsDetecting(false);
  };

  // --- Card Actions ---
  const openNewCardModal = () => {
    setEditingCard(null);
    setCardForm({
      number: '',
      name: user?.name || '',
      expiry: '',
      cvv: '',
      network: 'Visa',
      isPrimary: cards.length === 0
    });
    setIsCardModalOpen(true);
  };

  const openEditCardModal = (card) => {
    setEditingCard(card);
    setCardForm({
      number: card.number,
      name: card.name,
      expiry: card.expiry,
      cvv: card.cvv || '•••',
      network: card.network || 'Visa',
      isPrimary: Boolean(card.isPrimary)
    });
    setIsCardModalOpen(true);
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    if (!cardForm.number || !cardForm.name || !cardForm.expiry) {
      alert('Please fill in card details.');
      return;
    }
    const cleanNum = cardForm.number.replace(/\s+/g, '');
    let network = 'Visa';
    if (cleanNum.startsWith('5')) network = 'MasterCard';
    else if (cleanNum.startsWith('6')) network = 'RuPay';
    else if (cleanNum.startsWith('3')) network = 'Amex';

    const payload = {
      ...cardForm,
      network,
      id: editingCard?.id
    };
    addOrUpdateUserCard(payload);
    setCards(getUserCards());
    setIsCardModalOpen(false);
    onUserUpdate?.(getCurrentUser());
  };

  const handleDeleteCard = (cardId) => {
    const updated = deleteUserCard(cardId);
    setCards(updated);
    onUserUpdate?.(getCurrentUser());
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 28, 63, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        overscrollBehavior: 'contain',
        touchAction: 'none'
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-secondary)',
          border: '1.5px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '860px',
          height: '92vh',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          overflow: 'hidden',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y'
        }}
      >
        {/* iOS Pull Handle */}
        <div className="sheet-handle" style={{ margin: '8px auto 0 auto' }} />

        {/* Modal Top Bar */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--accent-navy)',
                color: '#FAF7F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '1rem',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.15rem',
                  fontWeight: '900',
                  margin: 0,
                  color: 'var(--text-primary)',
                  letterSpacing: '0.02em'
                }}
              >
                {user?.name || 'Polorse Member'}
              </h2>
              <div
                onClick={() => setIsVipModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  padding: '2px 0',
                  marginTop: '2px'
                }}
                title="Click to view VIP Tier & Benefits"
              >
                <Sparkles size={13} style={{ color: '#D97706' }} />
                <span style={{ fontSize: '0.74rem', color: 'var(--accent-navy)', fontWeight: '800', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                  {user?.tier || 'Polorse VIP Member'}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: '600' }}>• Customer Hub</span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    color: '#D97706',
                    background: 'rgba(217, 119, 6, 0.1)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    marginLeft: '2px'
                  }}
                >
                  PERKS →
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-primary)',
            padding: '4px 12px',
            gap: '6px',
            overflowX: 'auto'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              flex: '1 0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'profile' ? 'var(--accent-navy)' : 'transparent',
              color: activeTab === 'profile' ? '#FAF7F2' : 'var(--text-secondary)',
              fontSize: '0.84rem',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <User size={15} />
            <span>Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            style={{
              flex: '1 0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'orders' ? 'var(--accent-navy)' : 'transparent',
              color: activeTab === 'orders' ? '#FAF7F2' : 'var(--text-secondary)',
              fontSize: '0.84rem',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Package size={15} />
            <span>My Orders & Tracking</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            style={{
              flex: '1 0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'addresses' ? 'var(--accent-navy)' : 'transparent',
              color: activeTab === 'addresses' ? '#FAF7F2' : 'var(--text-secondary)',
              fontSize: '0.84rem',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <MapPin size={15} />
            <span>Saved Addresses</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            style={{
              flex: '1 0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'payments' ? 'var(--accent-navy)' : 'transparent',
              color: activeTab === 'payments' ? '#FAF7F2' : 'var(--text-secondary)',
              fontSize: '0.84rem',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <CreditCard size={15} />
            <span>Payment Methods</span>
          </button>
        </div>

        {/* Scrollable Tab Content with Smooth Mobile Momentum Scrolling */}
        <div
          className="modal-scrollable-content"
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y',
            padding: '20px',
            boxSizing: 'border-box'
          }}
        >
          {/* ======================================================== */}
          {/* TAB 1: PROFILE DETAILS & AVATAR UPLOAD                   */}
          {/* ======================================================== */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Avatar Section */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)' }}>
                  Profile Picture & Avatar
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '3px solid var(--accent-navy)',
                        boxShadow: 'var(--shadow-md)',
                        background: 'var(--accent-navy)',
                        color: '#FAF7F2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: '800'
                      }}
                    >
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>

                    <label
                      htmlFor="avatar-upload-input"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--accent-navy)',
                        color: '#FAF7F2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: '2px solid #FAF7F2',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      title="Upload profile photo"
                    >
                      <Camera size={14} />
                      <input
                        id="avatar-upload-input"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      Upload Custom Photo
                    </h4>
                    <p style={{ margin: '3px 0 8px 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Supports PNG, JPG or WebP. Or select a curated streetwear avatar preset:
                    </p>

                    {/* Presets */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <img
                          key={idx}
                          src={preset}
                          alt={`Preset ${idx}`}
                          onClick={() => handleSelectPresetAvatar(preset)}
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            border: user?.avatar === preset ? '2px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                            boxShadow: user?.avatar === preset ? '0 0 6px rgba(15, 28, 63, 0.4)' : 'none',
                            transform: user?.avatar === preset ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all var(--transition-fast)'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details Form */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)' }}>
                    Personal Information
                  </span>
                  {profileSaveSuccess && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-green)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={14} />
                      <span>Profile Updated Successfully!</span>
                    </span>
                  )}
                </div>

                <form onSubmit={handleProfileFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        className="form-input"
                        placeholder="Fateh Prajapati"
                        style={{ width: '100%', padding: '10px 12px', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        className="form-input"
                        placeholder="fateh@polorse.com"
                        style={{ width: '100%', padding: '10px 12px', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Mobile Phone
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="form-input"
                        placeholder="9876543210"
                        style={{ width: '100%', padding: '10px 12px', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                          VIP Tier & Benefits
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsVipModalOpen(true)}
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            color: '#D97706',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>View Tier Roadmap</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>

                      <div
                        onClick={() => setIsVipModalOpen(true)}
                        style={{
                          padding: '12px 14px',
                          background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(15, 28, 63, 0.05) 100%)',
                          border: '1px solid rgba(217, 119, 6, 0.28)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'rgba(217, 119, 6, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#D97706',
                              flexShrink: 0
                            }}
                          >
                            <Crown size={18} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--accent-navy)' }}>
                                {user?.tier || 'Polorse VIP Silver Member'}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.64rem',
                                  fontWeight: '800',
                                  background: '#D97706',
                                  color: '#fff',
                                  padding: '1px 6px',
                                  borderRadius: '999px',
                                  letterSpacing: '0.04em',
                                  textTransform: 'uppercase'
                                }}
                              >
                                Active
                              </span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              ₹6,498 spent • ₹3,502 to Black Label Tier • Click for perks & rewards
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontWeight: '700', fontSize: '0.76rem' }}>
                          <span>Perks</span>
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{
                      alignSelf: 'flex-start',
                      padding: '12px 28px',
                      fontSize: '0.88rem',
                      fontWeight: '800',
                      marginTop: '8px'
                    }}
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: MY ORDERS & LIVE TRACKING STATUS                  */}
          {/* ======================================================== */}
          {activeTab === 'orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
                    My Orders & Status Updates
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Track your streetwear drop, check delivery updates, and view invoices.
                  </p>
                </div>
                <span
                  style={{
                    background: 'rgba(15, 28, 63, 0.08)',
                    color: 'var(--accent-navy)',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  {orders.length} Total Orders
                </span>
              </div>

              {isLoadingOrders ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Clock className="animate-spin" size={24} style={{ margin: '0 auto 10px auto' }} />
                  <p>Loading your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div
                  style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <Package size={42} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    No orders placed yet
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Your purchased items and live tracking milestones will appear here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1.5px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {/* Order Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '1rem', color: 'var(--accent-navy)' }}>
                              {ord.id}
                            </strong>
                            <span
                              style={{
                                background: ord.paymentStatus === 'PAID' ? 'rgba(5, 150, 105, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                                color: ord.paymentStatus === 'PAID' ? 'var(--accent-green)' : '#D97706',
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)'
                              }}
                            >
                              {ord.paymentStatus === 'PAID' ? 'PAID' : 'PAY ON DELIVERY'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                            ₹{ord.total?.toLocaleString('en-IN')}
                          </span>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            {ord.paymentMethod}
                          </div>
                        </div>
                      </div>

                      {/* Live Tracking Milestone Bar */}
                      <div
                        style={{
                          background: 'rgba(15, 28, 63, 0.03)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '14px 16px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.76rem', fontWeight: '800', color: 'var(--accent-navy)', textTransform: 'uppercase' }}>
                            Live Delivery Status: Confirmed & Processing
                          </span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--accent-green)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Truck size={13} />
                            <span>Estimated Delivery in 2-3 Days</span>
                          </span>
                        </div>

                        {/* Interactive Timeline Stepper */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', position: 'relative' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ height: '4px', borderRadius: '2px', background: 'var(--accent-green)' }} />
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--accent-green)' }}>1. Confirmed</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ height: '4px', borderRadius: '2px', background: 'var(--accent-navy)' }} />
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--accent-navy)' }}>2. Packed</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ height: '4px', borderRadius: '2px', background: 'var(--border-subtle)' }} />
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>3. Shipped</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ height: '4px', borderRadius: '2px', background: 'var(--border-subtle)' }} />
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>4. Delivered</span>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {ord.items?.map((item, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  style={{ width: '40px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                              )}
                              <div>
                                <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                                  {item.title}
                                </strong>
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                                  Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                                </div>
                              </div>
                            </div>
                            <span style={{ fontSize: '0.86rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                        <button
                          type="button"
                          onClick={() => alert(`Tracking details for ${ord.id} - Courier: Bluedart Express AWB #94821039`)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--accent-navy)',
                            color: '#FAF7F2',
                            fontSize: '0.78rem',
                            fontWeight: '800',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Truck size={12} />
                          <span>Track Courier</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => alert(`Invoice for ${ord.id} generated successfully.`)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Download size={12} />
                          <span>Invoice</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: SAVED ADDRESSES                                   */}
          {/* ======================================================== */}
          {activeTab === 'addresses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
                    Saved Delivery Addresses
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Manage your shipping locations for 1-click checkout.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openNewAddressModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-navy)',
                    color: '#FAF7F2',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <Plus size={14} />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Addresses List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: addr.isPrimary ? '2px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: addr.isPrimary ? 'var(--shadow-sm)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                          {addr.fullName}
                        </strong>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          {addr.tag || 'Home'}
                        </span>
                        {addr.isPrimary && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: '800',
                              letterSpacing: '0.06em',
                              padding: '3px 9px',
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--accent-navy)',
                              color: '#FAF7F2',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              lineHeight: 1.1,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            ★ PRIMARY
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {!addr.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryAddress(addr.id)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--bg-primary)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--accent-navy)',
                              fontSize: '0.74rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Make Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditAddressModal(addr)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                        {addresses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-md)',
                              background: 'rgba(239, 68, 68, 0.08)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              color: 'var(--accent-red)',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                      {addr.addressLine}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Mobile: {addr.phone}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: PAYMENT METHODS & SAVED CARDS                     */}
          {/* ======================================================== */}
          {activeTab === 'payments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
                    Saved Payment Cards & UPI
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Add or update your payment methods for rapid express checkout.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openNewCardModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-navy)',
                    color: '#FAF7F2',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <Plus size={14} />
                  <span>Add New Card</span>
                </button>
              </div>

              {/* Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {cards.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: 'linear-gradient(135deg, #0F1C3F 0%, #1E293B 100%)',
                      color: '#FAF7F2',
                      borderRadius: 'var(--radius-lg)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '160px',
                      boxShadow: '0 8px 20px rgba(15, 28, 63, 0.25)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.08em', color: '#FCD34D' }}>
                          POLORSE EXCLUSIVE
                        </span>
                        {c.isPrimary && (
                          <span style={{ fontSize: '0.62rem', background: '#FCD34D', color: '#0F1C3F', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '1rem', fontWeight: '900', fontStyle: 'italic' }}>
                        {c.network || 'VISA'}
                      </span>
                    </div>

                    <div style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '0.12em', fontFamily: 'monospace' }}>
                      •••• •••• •••• {c.last4 || '4242'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '0.62rem', opacity: 0.7, display: 'block', textTransform: 'uppercase' }}>
                          Cardholder
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800' }}>
                          {c.name || 'FATEH PRAJAPATI'}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.62rem', opacity: 0.7, display: 'block', textTransform: 'uppercase' }}>
                          Expires
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800' }}>
                          {c.expiry || '08/28'}
                        </span>
                      </div>

                      {/* Card Edit / Delete */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => openEditCardModal(c)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: 'none',
                            color: '#fff',
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="Update Card"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCard(c.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.25)',
                            border: 'none',
                            color: '#fff',
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="Delete Card"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* UPI & Wallets Preview */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)' }}>
                  Linked UPI Accounts & Wallets
                </span>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Smartphone size={16} style={{ color: 'var(--accent-navy)' }} />
                    <span style={{ fontSize: '0.86rem', fontWeight: '700' }}>PhonePe UPI (fateh@ybl)</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: '800' }}>Active</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wallet size={16} style={{ color: 'var(--accent-navy)' }} />
                    <span style={{ fontSize: '0.86rem', fontWeight: '700' }}>Amazon Pay Balance</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: '800' }}>₹1,450 Available</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* MODAL: ADD / EDIT ADDRESS                                     */}
        {/* ============================================================ */}
        {isAddressModalOpen && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 28, 63, 0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
          >
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                width: '100%',
                maxWidth: '520px',
                boxShadow: 'var(--shadow-xl)',
                border: '1.5px solid var(--accent-navy)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <strong style={{ fontSize: '1rem', color: 'var(--accent-navy)' }}>
                  {editingAddress ? 'Update Delivery Address' : 'Add New Address'}
                </strong>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddressSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="form-input"
                      placeholder="Fateh Prajapati"
                      style={{ width: '100%', padding: '8px 12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Mobile Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="form-input"
                      placeholder="9876543210"
                      style={{ width: '100%', padding: '8px 12px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Street Address & Flat / Building *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={addressForm.addressLine}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine: e.target.value }))}
                    className="form-input"
                    placeholder="e.g. Flat 402, High Street Boulevard"
                    style={{ width: '100%', padding: '8px 12px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Pincode *</label>
                      <button
                        type="button"
                        onClick={handleAutoDetect}
                        disabled={isDetecting}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-red)', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}
                      >
                        {isDetecting ? 'Detecting...' : 'Detect'}
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))}
                      className="form-input"
                      placeholder="400001"
                      style={{ width: '100%', padding: '8px 12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>City *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                      className="form-input"
                      placeholder="Mumbai"
                      style={{ width: '100%', padding: '8px 12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>State *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                      className="form-input"
                      placeholder="Maharashtra"
                      style={{ width: '100%', padding: '8px 12px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>
                    <input
                      type="checkbox"
                      checked={addressForm.isPrimary}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, isPrimary: e.target.checked }))}
                      style={{ accentColor: 'var(--accent-navy)' }}
                    />
                    <span>Make this my Primary Address</span>
                  </label>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['Home', 'Work', 'Studio'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setAddressForm(prev => ({ ...prev, tag }))}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          border: addressForm.tag === tag ? '1.5px solid var(--accent-navy)' : '1px solid var(--border-subtle)',
                          background: addressForm.tag === tag ? 'rgba(15, 28, 63, 0.08)' : 'var(--bg-primary)',
                          color: addressForm.tag === tag ? 'var(--accent-navy)' : 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '6px', padding: '10px', fontWeight: '800' }}
                >
                  Save Address
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL: ADD / EDIT PAYMENT CARD                                */}
        {/* ============================================================ */}
        {isCardModalOpen && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 28, 63, 0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
          >
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                width: '100%',
                maxWidth: '460px',
                boxShadow: 'var(--shadow-xl)',
                border: '1.5px solid var(--accent-navy)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <strong style={{ fontSize: '1rem', color: 'var(--accent-navy)' }}>
                  {editingCard ? 'Update Payment Card' : 'Add New Credit/Debit Card'}
                </strong>
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Card Number *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4532 8901 2345 6789"
                    value={cardForm.number}
                    onChange={(e) => setCardForm(prev => ({ ...prev, number: e.target.value }))}
                    className="form-input"
                    style={{ width: '100%', padding: '8px 12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Name on Card *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="FATEH PRAJAPATI"
                    value={cardForm.name}
                    onChange={(e) => setCardForm(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input"
                    style={{ width: '100%', padding: '8px 12px', textTransform: 'uppercase' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Expiry (MM/YY) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="MM/YY"
                      value={cardForm.expiry}
                      onChange={(e) => {
                        const formatted = formatCardExpiry(e.target.value, cardForm.expiry);
                        setCardForm(prev => ({ ...prev, expiry: formatted }));
                      }}
                      className="form-input"
                      style={{ width: '100%', padding: '8px 12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      CVV *
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="•••"
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm(prev => ({ ...prev, cvv: e.target.value }))}
                      className="form-input"
                      style={{ width: '100%', padding: '8px 12px' }}
                    />
                  </div>
                </div>

                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.82rem', marginTop: '6px', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={cardForm.isPrimary}
                    onChange={(e) => setCardForm(prev => ({ ...prev, isPrimary: e.target.checked }))}
                  />
                  <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Set as default card for 1-click checkout</span>
                </label>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '6px', padding: '10px', fontWeight: '800' }}
                >
                  Save Card
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIP PRIVÉ CIRCLE & TIER BENEFITS MODAL                    */}
        {/* ======================================================== */}
        {isVipModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1100,
              background: 'rgba(15, 28, 63, 0.72)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsVipModalOpen(false);
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '480px',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: '#FAF7F2',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid rgba(217, 119, 6, 0.3)',
                boxShadow: '0 24px 60px rgba(15, 28, 63, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* Luxury Header Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0F1C3F 0%, #1A2E63 60%, #2A1D34 100%)',
                  padding: '24px 20px',
                  color: '#FAF7F2',
                  position: 'relative',
                  borderTopLeftRadius: 'var(--radius-xl)',
                  borderTopRightRadius: 'var(--radius-xl)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsVipModalOpen(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: 'none',
                    color: '#FAF7F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(217, 119, 6, 0.25)', border: '1px solid rgba(217, 119, 6, 0.5)', padding: '4px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '800', color: '#FBBF24', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  <Crown size={13} />
                  <span>Polorse Privé Circle</span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '0.02em', color: '#FAF7F2' }}>
                  VIP Tier & Benefits
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#CBD5E1', margin: 0, lineHeight: 1.4 }}>
                  Exclusive member privileges, priority drops, and storewide rewards.
                </p>
              </div>

              {/* Body Content */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Current Tier Status Card */}
                <div
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(217, 119, 6, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                        <Star size={15} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', display: 'block' }}>
                          Current Tier Status
                        </span>
                        <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-navy)' }}>
                          Silver VIP Member
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '3px 8px', borderRadius: '999px', background: '#D97706', color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      Active
                    </span>
                  </div>

                  {/* Spend Milestone Progress Bar */}
                  <div style={{ marginTop: '12px', background: 'rgba(15, 28, 63, 0.04)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Lifetime Spending</span>
                      <span style={{ fontWeight: '800', color: 'var(--accent-navy)' }}>₹6,498 / ₹10,000</span>
                    </div>

                    <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: '65%',
                          height: '100%',
                          background: 'linear-gradient(90deg, #D97706 0%, #F59E0B 50%, #0F1C3F 100%)',
                          borderRadius: '999px'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span>Silver Tier (₹2,500)</span>
                      <span style={{ color: '#D97706', fontWeight: '700' }}>₹3,502 to Black Label Tier 👑</span>
                    </div>
                  </div>
                </div>

                {/* Tier Perks Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Unlocked Silver VIP Perks
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                    {[
                      { icon: <Zap size={15} style={{ color: '#D97706' }} />, title: '1-Hour Early Access', desc: 'Shop limited edition archive drops before public launch.' },
                      { icon: <Award size={15} style={{ color: '#D97706' }} />, title: '5% Instant VIP Checkout Discount', desc: 'Automatically applied to every eligible cart.' },
                      { icon: <RotateCcw size={15} style={{ color: '#D97706' }} />, title: 'Free Doorstep Size Exchanges', desc: 'No-questions-asked seamless pickup & re-delivery.' },
                      { icon: <Gift size={15} style={{ color: '#D97706' }} />, title: '₹500 Birthday Month Drop Credit', desc: 'Annual gift loaded straight to your member account.' }
                    ].map((perk, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(217, 119, 6, 0.05)',
                          border: '1px solid rgba(217, 119, 6, 0.15)'
                        }}
                      >
                        <div style={{ marginTop: '2px', flexShrink: 0 }}>{perk.icon}</div>
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--accent-navy)' }}>
                            {perk.title}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {perk.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '6px' }}>
                    Next Milestone: Black Label VIP (At ₹10,000)
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                    {[
                      { title: 'Flat 10% Lifetime Storewide Discount', desc: 'Double your savings on heavyweight hoodies & accessories.' },
                      { title: '2-Hour Priority Window + Secret Colorways', desc: 'Access unreleased vault colorways reserved for Black Label.' },
                      { title: 'Free Priority Express Delivery', desc: 'Same-day Mumbai dispatch & 24hr delivery across metro India.' },
                      { title: 'Complimentary Signature Polorse Canvas Tote', desc: 'Included as a gift in every Black Label order.' }
                    ].map((perk, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-secondary)',
                          border: '1px dashed var(--border-subtle)',
                          opacity: 0.88
                        }}
                      >
                        <Crown size={15} style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {perk.title}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {perk.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Close CTA */}
                <button
                  type="button"
                  onClick={() => setIsVipModalOpen(false)}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    letterSpacing: '0.02em',
                    marginTop: '4px'
                  }}
                >
                  Got It • Return to Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
