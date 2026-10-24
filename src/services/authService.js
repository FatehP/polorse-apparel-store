// Authentication Service with LocalStorage persistence and Firebase compatibility
// Supports Email & Password, Phone + OTP, Google One-Tap, and Guest accounts

const USERS_STORAGE_KEY = 'polorse_registered_users';
const CURRENT_USER_KEY = 'polorse_current_user';
const OTP_STORAGE_KEY = 'polorse_pending_otps';

// Default initial demo user
const INITIAL_DEMO_USERS = [
  {
    id: 'usr-fateh-01',
    name: 'Fateh Prajapati',
    email: 'fateh@polorse.com',
    phone: '9876543210',
    password: 'password123',
    tier: 'Polorse VIP Member',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    savedAddress: {
      fullName: 'Fateh Prajapati',
      phone: '9876543210',
      addressLine: 'Aura Studio 402, High Street Boulevard',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    joinedDate: 'October 2026'
  }
];

function getStoredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_USERS));
      return INITIAL_DEMO_USERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading stored users:', err);
    return INITIAL_DEMO_USERS;
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users to storage:', err);
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
  // Dispatch a custom window event so all components react immediately
  window.dispatchEvent(new Event('polorse_auth_changed'));
}

// 1. Email & Password Sign In
export async function loginWithEmail(email, password) {
  await new Promise(r => setTimeout(r, 400)); // Smooth UX transition
  const cleanEmail = email.trim().toLowerCase();
  const users = getStoredUsers();

  const foundUser = users.find(u => u.email?.toLowerCase() === cleanEmail);
  if (!foundUser) {
    throw new Error('No Polorse account found with this email. Please sign up or check spelling.');
  }

  if (foundUser.password && foundUser.password !== password) {
    throw new Error('Incorrect password. Please try again.');
  }

  const { password: _, ...safeUser } = foundUser;
  setCurrentUser(safeUser);
  return safeUser;
}

// 2. Email & Password Sign Up
export async function signupWithEmail({ name, email, phone, password, address, city, state, pincode }) {
  await new Promise(r => setTimeout(r, 450));
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone ? phone.trim().replace(/\D/g, '') : '';
  const users = getStoredUsers();

  if (users.some(u => u.email?.toLowerCase() === cleanEmail)) {
    throw new Error('An account already exists with this email. Please sign in instead.');
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    password: password,
    tier: 'Polorse Member',
    avatar: null,
    savedAddress: address ? {
      fullName: name.trim(),
      phone: cleanPhone,
      addressLine: address,
      city: city || 'Mumbai',
      state: state || 'Maharashtra',
      pincode: pincode || '400001'
    } : null,
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  };

  users.push(newUser);
  saveUsers(users);

  const { password: _, ...safeUser } = newUser;
  setCurrentUser(safeUser);
  return safeUser;
}

// 3. Mobile Phone & OTP
export async function sendPhoneOtp(phone) {
  await new Promise(r => setTimeout(r, 400));
  const cleanPhone = phone.trim().replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }

  // Pre-configured demo OTP is 1234
  const generatedOtp = '1234';
  const pending = {
    phone: cleanPhone,
    otp: generatedOtp,
    expiresAt: Date.now() + 5 * 60 * 1000
  };
  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(pending));

  return {
    success: true,
    message: `OTP sent to +91 ${cleanPhone}. (Use demo code: ${generatedOtp})`,
    demoOtp: generatedOtp
  };
}

export async function verifyPhoneOtp(phone, otp) {
  await new Promise(r => setTimeout(r, 450));
  const cleanPhone = phone.trim().replace(/\D/g, '');
  const cleanOtp = otp.trim();

  // Allow '1234' or matched stored OTP
  let isValid = cleanOtp === '1234';
  try {
    const raw = localStorage.getItem(OTP_STORAGE_KEY);
    if (raw) {
      const pending = JSON.parse(raw);
      if (pending.phone === cleanPhone && pending.otp === cleanOtp) {
        isValid = true;
      }
    }
  } catch (e) {}

  if (!isValid) {
    throw new Error('Invalid or expired OTP. Please use demo OTP: 1234');
  }

  localStorage.removeItem(OTP_STORAGE_KEY);

  // Check if user exists by phone
  const users = getStoredUsers();
  let existingUser = users.find(u => u.phone === cleanPhone);

  if (!existingUser) {
    // Auto-create account for this phone number
    existingUser = {
      id: `usr-phone-${Date.now()}`,
      name: `Member ${cleanPhone.slice(-4)}`,
      email: `customer${cleanPhone.slice(-4)}@polorse.com`,
      phone: cleanPhone,
      tier: 'Polorse Member',
      avatar: null,
      savedAddress: null,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
    users.push(existingUser);
    saveUsers(users);
  }

  const { password: _, ...safeUser } = existingUser;
  setCurrentUser(safeUser);
  return safeUser;
}

// 4. One-Click Google Sign-In Simulation
export async function loginWithGoogle() {
  await new Promise(r => setTimeout(r, 500));
  const demoGoogleProfile = {
    id: 'usr-google-8891',
    name: 'Fateh Prajapati',
    email: 'fateh.prajapati@gmail.com',
    phone: '9876543210',
    tier: 'Polorse VIP Member',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    savedAddress: {
      fullName: 'Fateh Prajapati',
      phone: '9876543210',
      addressLine: 'Aura Studio 402, High Street Boulevard',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  };

  const users = getStoredUsers();
  const existingIdx = users.findIndex(u => u.email === demoGoogleProfile.email);
  if (existingIdx === -1) {
    users.push(demoGoogleProfile);
  } else {
    users[existingIdx] = { ...users[existingIdx], ...demoGoogleProfile };
  }
  saveUsers(users);

  setCurrentUser(demoGoogleProfile);
  return demoGoogleProfile;
}

// 5. Update user profile or saved address
export function updateUserAddress(addressData) {
  const current = getCurrentUser();
  if (!current) return;

  const updated = {
    ...current,
    savedAddress: addressData
  };
  setCurrentUser(updated);

  const users = getStoredUsers();
  const idx = users.findIndex(u => u.id === current.id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], savedAddress: addressData };
    saveUsers(users);
  }
}

// 6. Sign Out
export function logout() {
  setCurrentUser(null);
}
