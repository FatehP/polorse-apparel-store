import { db, isFirebaseConfigured } from "./firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";

import { INITIAL_PRODUCTS } from "../data/productsData";

const INITIAL_COUPONS = [
  {
    id: "c-firstdrop",
    code: "FIRSTDROP",
    type: "percentage",
    value: 20,
    minOrder: 2000,
    description: "20% OFF on your first street order above ₹2,000",
    isActive: true
  },
  {
    id: "c-street10",
    code: "STREET10",
    type: "percentage",
    value: 10,
    minOrder: 0,
    description: "Flat 10% OFF with no minimum spend",
    isActive: true
  },
  {
    id: "c-polorse500",
    code: "POLORSE500",
    type: "flat",
    value: 500,
    minOrder: 3000,
    description: "₹500 Instant Discount on orders above ₹3,000",
    isActive: true
  }
];

const INITIAL_ORDERS = [
  {
    id: "ORD-9421",
    customerName: "Rohan Verma",
    phone: "+91 98765 43210",
    address: "Flat 402, Skyline Towers, Indiranagar, Bengaluru - 560038",
    items: [
      {
        id: "prod-hoodie-01",
        title: "Heavyweight Acid-Wash Oversized Hoodie",
        size: "L",
        color: "Vintage Charcoal",
        price: 2999,
        quantity: 1,
        imageUrl: "/products/hoodie-charcoal.jpg"
      }
    ],
    subtotal: 2999,
    discount: 600,
    couponApplied: "FIRSTDROP",
    total: 2399,
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    orderStatus: "Processing",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

// Helper to notify other components/tabs
function notifyStoreUpdate(type) {
  window.dispatchEvent(new CustomEvent("aura_store_update", { detail: { type } }));
}

// ---------------- PRODUCTS ----------------
export async function fetchProducts() {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn("Firestore fetchProducts failed, using localStorage fallback:", e);
    }
  }

  const stored = localStorage.getItem("polorse_products") || localStorage.getItem("aura_products");
  if (!stored) {
    localStorage.setItem("polorse_products", JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length < INITIAL_PRODUCTS.length) {
      localStorage.setItem("polorse_products", JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return parsed;
  } catch (e) {
    localStorage.setItem("polorse_products", JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
}

export async function addProduct(productData) {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, "products"), {
        ...productData,
        createdAt: serverTimestamp()
      });
      notifyStoreUpdate("products");
      return { id: docRef.id, ...productData };
    } catch (e) {
      console.error("Firestore addDoc failed, using local storage:", e);
    }
  }

  const products = await fetchProducts();
  const newProduct = {
    ...productData,
    id: `prod-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  products.unshift(newProduct);
  localStorage.setItem("aura_products", JSON.stringify(products));
  notifyStoreUpdate("products");
  return newProduct;
}

export async function updateProduct(id, updates) {
  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, "products", id);
      await updateDoc(ref, updates);
      notifyStoreUpdate("products");
      return true;
    } catch (e) {
      console.error("Firestore updateDoc failed:", e);
    }
  }

  const products = await fetchProducts();
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    localStorage.setItem("aura_products", JSON.stringify(products));
    notifyStoreUpdate("products");
    return true;
  }
  return false;
}

export async function deleteProduct(id) {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "products", id));
      notifyStoreUpdate("products");
      return true;
    } catch (e) {
      console.error("Firestore deleteDoc failed:", e);
    }
  }

  const products = await fetchProducts();
  const filtered = products.filter(p => p.id !== id);
  localStorage.setItem("aura_products", JSON.stringify(filtered));
  notifyStoreUpdate("products");
  return true;
}

// ---------------- COUPONS ----------------
export async function fetchCoupons() {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, "coupons"));
      if (!snapshot.empty) {
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn("Firestore fetchCoupons failed, using localStorage fallback:", e);
    }
  }

  const stored = localStorage.getItem("aura_coupons");
  if (!stored) {
    localStorage.setItem("aura_coupons", JSON.stringify(INITIAL_COUPONS));
    return INITIAL_COUPONS;
  }
  return JSON.parse(stored);
}

export async function addCoupon(couponData) {
  const codeFormatted = couponData.code.trim().toUpperCase();
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, "coupons"), {
        ...couponData,
        code: codeFormatted,
        createdAt: serverTimestamp()
      });
      notifyStoreUpdate("coupons");
      return { id: docRef.id, ...couponData, code: codeFormatted };
    } catch (e) {
      console.error("Firestore addCoupon failed:", e);
    }
  }

  const coupons = await fetchCoupons();
  const newCoupon = {
    ...couponData,
    id: `c-${Date.now()}`,
    code: codeFormatted
  };
  coupons.push(newCoupon);
  localStorage.setItem("aura_coupons", JSON.stringify(coupons));
  notifyStoreUpdate("coupons");
  return newCoupon;
}

export async function deleteCoupon(id) {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "coupons", id));
      notifyStoreUpdate("coupons");
      return true;
    } catch (e) {
      console.error("Firestore deleteCoupon failed:", e);
    }
  }

  const coupons = await fetchCoupons();
  const filtered = coupons.filter(c => c.id !== id);
  localStorage.setItem("aura_coupons", JSON.stringify(filtered));
  notifyStoreUpdate("coupons");
  return true;
}

export async function validateCoupon(inputCode, subtotal) {
  if (!inputCode) return { valid: false, message: "Please enter a coupon code" };
  const coupons = await fetchCoupons();
  const found = coupons.find(c => c.code.toUpperCase() === inputCode.trim().toUpperCase() && c.isActive);

  if (!found) {
    return { valid: false, message: "Invalid or expired coupon code" };
  }

  if (subtotal < (found.minOrder || 0)) {
    return {
      valid: false,
      message: `Minimum order of ₹${found.minOrder.toLocaleString("en-IN")} required for this code`
    };
  }

  let discountAmount = 0;
  if (found.type === "percentage") {
    discountAmount = Math.round((subtotal * found.value) / 100);
  } else {
    discountAmount = Math.min(found.value, subtotal);
  }

  return {
    valid: true,
    coupon: found,
    discountAmount,
    message: `Applied ${found.code} (Saved ₹${discountAmount.toLocaleString("en-IN")})`
  };
}

// ---------------- ORDERS ----------------
export async function fetchOrders() {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn("Firestore fetchOrders failed:", e);
    }
  }

  const stored = localStorage.getItem("aura_orders");
  if (!stored) {
    localStorage.setItem("aura_orders", JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
  return JSON.parse(stored);
}

export async function createOrder(orderPayload) {
  const newOrder = {
    ...orderPayload,
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        ...newOrder,
        createdAt: serverTimestamp()
      });
      notifyStoreUpdate("orders");
      return { ...newOrder, id: docRef.id };
    } catch (e) {
      console.error("Firestore createOrder failed:", e);
    }
  }

  const orders = await fetchOrders();
  orders.unshift(newOrder);
  localStorage.setItem("aura_orders", JSON.stringify(orders));
  notifyStoreUpdate("orders");
  return newOrder;
}

export async function updateOrderStatus(orderId, newStatus) {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, "orders", orderId), { orderStatus: newStatus });
      notifyStoreUpdate("orders");
      return true;
    } catch (e) {
      console.error("Firestore updateOrderStatus failed:", e);
    }
  }

  const orders = await fetchOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index].orderStatus = newStatus;
    localStorage.setItem("aura_orders", JSON.stringify(orders));
    notifyStoreUpdate("orders");
    return true;
  }
  return false;
}
