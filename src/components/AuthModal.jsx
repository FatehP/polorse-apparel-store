import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  loginWithEmail,
  signupWithEmail,
  sendPhoneOtp,
  verifyPhoneOtp,
  loginWithGoogle
} from '../services/authService';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [method, setMethod] = useState('email'); // 'email' | 'phone'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Phone OTP States
  const [otpStep, setOtpStep] = useState('enter_phone'); // 'enter_phone' | 'enter_otp'
  const [otpCode, setOtpCode] = useState('');
  const [otpInfo, setOtpInfo] = useState('');

  const resetMessages = () => {
    setError('');
    setSuccessMsg('');
  };

  const handleQuickDemoFill = (e) => {
    e.preventDefault();
    resetMessages();
    setMode('signin');
    setMethod('email');
    setEmail('fateh@polorse.com');
    setPassword('password123');
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (mode === 'signin') {
        const user = await loginWithEmail(email, password);
        setSuccessMsg(`Welcome back, ${user.name || 'Member'}!`);
        setTimeout(() => {
          onAuthSuccess?.(user);
          onClose();
        }, 700);
      } else {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!email.trim()) throw new Error('Please enter your email.');
        if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');

        const user = await signupWithEmail({
          name,
          email,
          phone,
          password,
          city,
          pincode
        });
        setSuccessMsg(`Welcome to Polorse, ${user.name}! Account created.`);
        setTimeout(() => {
          onAuthSuccess?.(user);
          onClose();
        }, 750);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const res = await sendPhoneOtp(phone);
      setOtpStep('enter_otp');
      setOtpInfo(res.message);
      setOtpCode('1234'); // Pre-fill demo OTP for easiest frictionless testing
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const user = await verifyPhoneOtp(phone, otpCode);
      setSuccessMsg(`Welcome, ${user.name || 'Member'}! Signed in via OTP.`);
      setTimeout(() => {
        onAuthSuccess?.(user);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    resetMessages();
    setLoading(true);

    try {
      const user = await loginWithGoogle();
      setSuccessMsg(`Welcome back, ${user.name}! Signed in via Google.`);
      setTimeout(() => {
        onAuthSuccess?.(user);
        onClose();
      }, 650);
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 28, 63, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-secondary)',
          border: '1.5px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '460px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header with Luxury Brand Accent */}
        <div style={{
          background: 'linear-gradient(135deg, #0F1C3F 0%, #162A4F 60%, #1B3566 100%)',
          color: '#FAF7F2',
          padding: '16px 24px 20px',
          position: 'relative'
        }}>
          {/* iOS Sheet Pull Bar */}
          <div className="sheet-handle" style={{ background: 'rgba(255, 255, 255, 0.3)', margin: '0 auto 12px auto' }} />

          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FAF7F2',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Close modal"
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              background: 'rgba(252, 211, 77, 0.15)',
              border: '1px solid rgba(252, 211, 77, 0.3)',
              color: '#FCD34D',
              fontSize: '0.7rem',
              fontWeight: '800',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              Polorse Member Club
            </span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: '800',
            letterSpacing: '0.03em',
            margin: 0
          }}>
            {mode === 'signin' ? 'Sign In to Your Account' : 'Join Polorse Community'}
          </h2>
          <p style={{
            fontSize: '0.82rem',
            color: 'rgba(250, 247, 242, 0.78)',
            margin: '6px 0 0 0',
            lineHeight: 1.4
          }}>
            {mode === 'signin'
              ? 'Access saved addresses, track deliveries & VIP benefits'
              : 'Save addresses, get ₹500 off first order & track active shipments'}
          </p>

          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
            marginTop: '16px',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <button
              type="button"
              onClick={() => { setMode('signin'); resetMessages(); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: '700',
                background: mode === 'signin' ? '#FAF7F2' : 'transparent',
                color: mode === 'signin' ? '#0F1C3F' : 'rgba(255, 255, 255, 0.75)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); resetMessages(); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: '700',
                background: mode === 'signup' ? '#FAF7F2' : 'transparent',
                color: mode === 'signup' ? '#0F1C3F' : 'rgba(255, 255, 255, 0.75)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '72vh' }}>
          {/* Notification Messages */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(194, 26, 44, 0.08)',
              border: '1px solid var(--accent-red)',
              color: 'var(--accent-red)',
              fontSize: '0.82rem',
              fontWeight: '600',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(46, 125, 50, 0.1)',
              border: '1px solid var(--accent-green)',
              color: 'var(--accent-green)',
              fontSize: '0.82rem',
              fontWeight: '600',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Social / Google Quick Action */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '11px 16px',
              background: 'var(--bg-primary)',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
              marginBottom: '16px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '16px 0',
            gap: '12px'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Or with {mode === 'signin' ? 'Email / Mobile' : 'Email'}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          </div>

          {/* Sign In Options (Email vs Mobile OTP) */}
          {mode === 'signin' && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => { setMethod('email'); resetMessages(); }}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  border: '1.5px solid',
                  borderColor: method === 'email' ? 'var(--accent-navy)' : 'var(--border-subtle)',
                  background: method === 'email' ? 'rgba(15, 28, 63, 0.05)' : 'transparent',
                  color: method === 'email' ? 'var(--accent-navy)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                Email & Password
              </button>
              <button
                type="button"
                onClick={() => { setMethod('phone'); resetMessages(); }}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  border: '1.5px solid',
                  borderColor: method === 'phone' ? 'var(--accent-navy)' : 'var(--border-subtle)',
                  background: method === 'phone' ? 'rgba(15, 28, 63, 0.05)' : 'transparent',
                  color: method === 'phone' ? 'var(--accent-navy)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                Mobile Phone & OTP
              </button>
            </div>
          )}

          {/* Form Content: Method 1 (Email & Password) */}
          {(mode === 'signup' || method === 'email') && (
            <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {mode === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '5px', color: 'var(--text-primary)' }}>
                    Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fateh Prajapati"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border-subtle)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '5px', color: 'var(--text-primary)' }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-subtle)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '5px', color: 'var(--text-primary)' }}>
                    Mobile Number (Optional for WhatsApp updates)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="10-digit mobile"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border-subtle)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Password *
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={handleQuickDemoFill}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-navy)',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Fill Demo Credentials
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 38px',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-subtle)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-navy)',
                  color: '#FAF7F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(15, 28, 63, 0.25)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '6px'
                }}
              >
                <span>{loading ? 'Authenticating...' : mode === 'signin' ? 'Sign In to Store' : 'Create Polorse Account'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Form Content: Method 2 (Phone & OTP) */}
          {mode === 'signin' && method === 'phone' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {otpStep === 'enter_phone' ? (
                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '5px', color: 'var(--text-primary)' }}>
                      Enter 10-Digit Mobile Number *
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 12px',
                        background: 'var(--bg-primary)',
                        border: '1.5px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.88rem',
                        fontWeight: '700',
                        color: 'var(--text-primary)'
                      }}>
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1.5px solid var(--border-subtle)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phone.length < 10}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-navy)',
                      color: '#FAF7F2',
                      cursor: (loading || phone.length < 10) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <span>{loading ? 'Sending Code...' : 'Send Verification OTP'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(15, 28, 63, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {otpInfo || `Verification code sent to +91 ${phone}`}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '5px', color: 'var(--text-primary)' }}>
                      Enter 4-Digit OTP Code *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        required
                        maxLength={4}
                        placeholder="1234"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          borderRadius: 'var(--radius-md)',
                          border: '1.5px solid var(--accent-navy)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '1.1rem',
                          fontWeight: '800',
                          letterSpacing: '0.3em',
                          boxSizing: 'border-box',
                          textAlign: 'center'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setOtpStep('enter_phone')}
                      style={{
                        padding: '10px 14px',
                        background: 'transparent',
                        border: '1.5px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      Change Phone
                    </button>
                    <button
                      type="submit"
                      disabled={loading || otpCode.length < 4}
                      className="btn-primary"
                      style={{
                        flex: 1,
                        padding: '11px',
                        fontWeight: '800',
                        fontSize: '0.92rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--accent-navy)',
                        color: '#FAF7F2',
                        cursor: (loading || otpCode.length < 4) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <span>{loading ? 'Verifying...' : 'Verify OTP & Sign In'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Guest Checkout Bypass Option */}
          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Skip and Continue as Guest Shocker / Buyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
