import React, { useState, useEffect } from 'react';
import {
  X,
  LifeBuoy,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  RotateCcw,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  PhoneCall,
  Mail,
  ExternalLink,
  Plus
} from 'lucide-react';
import { getCurrentUser } from '../services/authService';
import { fetchOrders } from '../services/storeService';

export default function CustomerSupportModal({
  isOpen,
  onClose,
  initialTab = 'ticket', // 'ticket', 'faq', 'my-tickets'
  onOpenOrders
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [user, setUser] = useState(() => getCurrentUser());
  const [userOrders, setUserOrders] = useState([]);
  
  // Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    orderId: '',
    category: 'Size Exchange Request',
    priority: 'Normal',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState(null);
  const [tickets, setTickets] = useState([]);

  // Load existing tickets from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('polorse_support_tickets') || '[]');
      setTickets(stored);
    } catch {
      setTickets([]);
    }
  }, [isOpen, createdTicketId]);

  // Load user orders for dropdown selection
  useEffect(() => {
    if (isOpen) {
      setUser(getCurrentUser());
      fetchOrders().then(orders => setUserOrders(orders || []));
    }
  }, [isOpen]);

  // Sync initial tab
  useEffect(() => {
    setActiveTab(initialTab);
    setCreatedTicketId(null);
  }, [initialTab, isOpen]);

  // Handle Form Submission
  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      alert('Please provide a subject and message for your ticket.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTicket = {
        id: ticketId,
        ...ticketForm,
        name: ticketForm.name || user?.name || 'Valued Customer',
        email: ticketForm.email || user?.email || 'customer@polorse.com',
        status: 'Open',
        createdAt: new Date().toISOString(),
        estimatedResolution: 'Within 4 Hours'
      };

      const updatedTickets = [newTicket, ...tickets];
      localStorage.setItem('polorse_support_tickets', JSON.stringify(updatedTickets));
      setTickets(updatedTickets);
      setCreatedTicketId(ticketId);
      setIsSubmitting(false);

      // Reset form
      setTicketForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        orderId: '',
        category: 'Size Exchange Request',
        priority: 'Normal',
        subject: '',
        message: ''
      });
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 28, 63, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 95,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        overscrollBehavior: 'contain'
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
          maxWidth: '740px',
          height: '90vh',
          maxHeight: '840px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* iOS Pull Handle */}
        <div className="sheet-handle" style={{ margin: '8px auto 0 auto' }} />

        {/* Modal Header */}
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
                background: 'rgba(194, 26, 44, 0.1)',
                border: '1px solid rgba(194, 26, 44, 0.25)',
                color: 'var(--accent-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LifeBuoy size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: '800' }}>
                Customer Care & Help Center
              </h2>
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-navy)', fontWeight: '700' }}>
                POLORSE Concierge • 24/7 Dedicated Support
              </span>
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

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-primary)',
            padding: '4px 12px',
            gap: '6px'
          }}
        >
          <button
            type="button"
            onClick={() => { setActiveTab('ticket'); setCreatedTicketId(null); }}
            style={{
              flex: '1 0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'ticket' ? 'var(--accent-navy)' : 'transparent',
              color: activeTab === 'ticket' ? '#FAF7F2' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Send size={14} />
            <span>Create Ticket</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my-tickets')}
            style={{
              flex: '1 0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'my-tickets' ? 'var(--accent-navy)' : 'transparent',
              color: activeTab === 'my-tickets' ? '#FAF7F2' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Clock size={14} />
            <span>My Tickets ({tickets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            style={{
              flex: '1 0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'direct' ? 'var(--accent-navy)' : 'transparent',
              color: activeTab === 'direct' ? '#FAF7F2' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <PhoneCall size={14} />
            <span>Direct Support</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div
          className="modal-scrollable-content"
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          {/* ======================================================== */}
          {/* TAB 1: CREATE SUPPORT TICKET                             */}
          {/* ======================================================== */}
          {activeTab === 'ticket' && (
            <div>
              {createdTicketId ? (
                /* Ticket Submitted Success Screen */
                <div
                  style={{
                    textAlign: 'center',
                    padding: '30px 20px',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid var(--accent-green)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'rgba(5, 150, 105, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-green)'
                    }}
                  >
                    <CheckCircle2 size={32} />
                  </div>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    Support Ticket Created Successfully!
                  </h3>

                  <div
                    style={{
                      padding: '8px 18px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: '800',
                      color: 'var(--accent-navy)',
                      fontSize: '0.92rem'
                    }}
                  >
                    Ticket ID: <span style={{ color: 'var(--accent-red)' }}>{createdTicketId}</span>
                  </div>

                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.5 }}>
                    Your request has been escalated to the Polorse Priority Concierge. A dedicated support executive will contact you via WhatsApp / Email within <strong>4 business hours</strong>.
                  </p>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('my-tickets')}
                      className="btn-primary"
                      style={{ fontSize: '0.84rem', padding: '8px 18px' }}
                    >
                      View Ticket Status
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreatedTicketId(null)}
                      className="btn-secondary"
                      style={{ fontSize: '0.84rem', padding: '8px 18px' }}
                    >
                      Create Another Ticket
                    </button>
                  </div>
                </div>
              ) : (
                /* Ticket Submission Form */
                <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Category Selection */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Support Category *
                    </label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.86rem',
                        fontWeight: '700',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="Size Exchange Request">🔄 Size Exchange Request (7-Day Doorstep)</option>
                      <option value="Order Tracking & Delay">🚚 Order Tracking & Delivery Status</option>
                      <option value="Damaged or Wrong Item">⚠️ Damaged / Defective / Wrong Item Received</option>
                      <option value="Refund & Cancellation">💳 Refund / Payment / Cancellation</option>
                      <option value="Payment or UPI Issue">⚡ UPI / Card Failed but Money Deducted</option>
                      <option value="Product Sizing Advice">📏 Fit, GSM & Sizing Advice</option>
                      <option value="Other Issue">💬 Other General Inquiry</option>
                    </select>
                  </div>

                  {/* Order ID Selection */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Associated Order ID (Optional)
                    </label>
                    {userOrders.length > 0 ? (
                      <select
                        value={ticketForm.orderId}
                        onChange={(e) => setTicketForm({ ...ticketForm, orderId: e.target.value })}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.86rem',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option value="">Select from your recent orders (or leave blank)</option>
                        {userOrders.map((ord) => (
                          <option key={ord.id} value={ord.id}>
                            {ord.id} - ₹{ord.total} ({ord.orderStatus || 'Processing'})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="e.g. ORD-9421 (if applicable)"
                        value={ticketForm.orderId}
                        onChange={(e) => setTicketForm({ ...ticketForm, orderId: e.target.value })}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.86rem'
                        }}
                      />
                    )}
                  </div>

                  {/* Priority & Contact Info Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Your Phone (WhatsApp) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={ticketForm.phone}
                        onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.86rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Priority Level
                      </label>
                      <select
                        value={ticketForm.priority}
                        onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.86rem',
                          fontWeight: '700'
                        }}
                      >
                        <option value="Normal">Normal (Response within 6 hrs)</option>
                        <option value="High">High (Response within 4 hrs)</option>
                        <option value="Urgent">🚨 Urgent (Immediate Escalation)</option>
                      </select>
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Subject / Short Summary *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Need size exchange from M to L for Acid Wash Hoodie"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.86rem'
                      }}
                    />
                  </div>

                  {/* Detailed Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Detailed Issue Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please explain the issue in detail. If this is a size exchange, mention the new size desired. Our team will verify and initiate doorstep pickup."
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.86rem',
                        lineHeight: 1.4
                      }}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                    style={{
                      padding: '12px 20px',
                      fontSize: '0.92rem',
                      fontWeight: '800',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Send size={16} />
                    <span>{isSubmitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: MY TICKETS STATUS                                 */}
          {/* ======================================================== */}
          {activeTab === 'my-tickets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Active & Past Support Tickets
                </span>
                <button
                  type="button"
                  onClick={() => { setActiveTab('ticket'); setCreatedTicketId(null); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    color: 'var(--accent-navy)',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={14} /> New Ticket
                </button>
              </div>

              {tickets.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)'
                  }}
                >
                  <LifeBuoy size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    No Support Tickets Found
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Have any questions regarding orders, sizing, or exchanges?
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ticket')}
                    className="btn-primary"
                    style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                  >
                    Create Your First Ticket
                  </button>
                </div>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '800', color: 'var(--accent-navy)', fontSize: '0.88rem' }}>
                          {t.id}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: t.status === 'Open' ? 'rgba(202, 138, 4, 0.12)' : 'rgba(5, 150, 105, 0.12)',
                            color: t.status === 'Open' ? '#CA8A04' : 'var(--accent-green)',
                            border: `1px solid ${t.status === 'Open' ? '#CA8A04' : 'var(--accent-green)'}`
                          }}
                        >
                          {t.status}
                        </span>
                      </div>

                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {t.subject}
                    </h4>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {t.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '4px', fontSize: '0.74rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Category: <strong style={{ color: 'var(--text-primary)' }}>{t.category}</strong>
                      </span>
                      <span style={{ color: 'var(--accent-navy)', fontWeight: '700' }}>
                        ETA: {t.estimatedResolution || 'Within 4 Hours'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: DIRECT SUPPORT CHANNELS (WHATSAPP, PHONE, EMAIL)  */}
          {/* ======================================================== */}
          {activeTab === 'direct' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* WhatsApp VIP Concierge */}
              <a
                href="https://wa.me/919876543210?text=Hello%20Polorse%20Team%2C%20I%20need%20assistance%20with%20my%20order."
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'rgba(37, 211, 102, 0.08)',
                  border: '1.5px solid rgba(37, 211, 102, 0.3)',
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: '#25D366',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      Instant WhatsApp Concierge
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Chat live with our styling & order team (+91 98765 43210)
                    </p>
                  </div>
                </div>
                <ExternalLink size={16} style={{ color: '#25D366' }} />
              </a>

              {/* Official Support Email */}
              <a
                href="mailto:support@polorse.com?subject=Support%20Request%20-%20Polorse%20Apparel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'var(--accent-navy)',
                      color: '#FAF7F2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      Official Email Desk
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      support@polorse.com • Guaranteed response within 4 hours
                    </p>
                  </div>
                </div>
                <ExternalLink size={16} style={{ color: 'var(--text-muted)' }} />
              </a>

              {/* Operating Hours Card */}
              <div
                style={{
                  padding: '16px 20px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} style={{ color: 'var(--accent-navy)' }} />
                  <span style={{ fontSize: '0.84rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    Customer Care Working Hours
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Monday to Saturday: <strong>10:00 AM – 8:00 PM IST</strong><br />
                  Sunday: Emergency Order Escapes only (WhatsApp)
                </p>
              </div>

              {/* Instant Policies Link */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div
                  style={{
                    padding: '12px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-navy)', fontWeight: '700', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <RotateCcw size={14} />
                    <span>7-Day Exchange</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Free doorstep pickup & reverse dispatch for any size change.
                  </p>
                </div>

                <div
                  style={{
                    padding: '12px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)', fontWeight: '700', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <ShieldCheck size={14} />
                    <span>Safe Refunds</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Instant UPI & bank source refunds credited in 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
