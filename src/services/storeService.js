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

const INITIAL_PRODUCTS = [
  {
    id: "prod-hoodie-01",
    title: "Heavyweight Acid-Wash Oversized Hoodie",
    category: "Hoodies",
    price: 2999,
    originalPrice: 4999,
    description: "420 GSM ultra-heavyweight brushed french terry cotton. Features distressed ribbing, drop-shoulder silhouette, double-layered hood, and Polorse tonal high-density chest embroidery.",
    imageUrl: "/products/hoodie-charcoal.jpg",
    tags: ["DROP 01", "OVERSIZED", "BESTSELLER"],
    colors: [
      { name: "Vintage Charcoal", hex: "#2b2b2e" },
      { name: "Obsidian Black", hex: "#111111" }
    ],
    sizes: [
      { size: "S", stock: 12 },
      { size: "M", stock: 24 },
      { size: "L", stock: 18 },
      { size: "XL", stock: 10 },
      { size: "XXL", stock: 5 }
    ],
    isFeatured: true,
    inStock: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-hoodie-04",
    title: "Polorse Crest Heritage Shield Hoodie",
    category: "Hoodies",
    price: 3499,
    originalPrice: 5499,
    description: "450 GSM pure loopback fleece cotton. Featuring the signature Polorse Equestrian Shield embroidered on the chest with golden brass eyelets and custom drawstrings.",
    imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80",
    tags: ["SIGNATURE", "LUXURY FLEECE", "NEW"],
    colors: [
      { name: "Polorse Navy", hex: "#0F1C3F" },
      { name: "Heritage Crimson", hex: "#C21A2C" },
      { name: "Oatmeal Heather", hex: "#E5DEC9" }
    ],
    sizes: [
      { size: "S", stock: 14 },
      { size: "M", stock: 22 },
      { size: "L", stock: 30 },
      { size: "XL", stock: 16 }
    ],
    isFeatured: true,
    inStock: true,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "prod-tee-02",
    title: "Raw-Cut Boxy Minimalist Tee",
    category: "T-Shirts",
    price: 1499,
    originalPrice: 2199,
    description: "280 GSM premium compact cotton jersey with wide ribbed collar and dropped shoulders. Tailored for a structured, boxy drape that holds its shape wash after wash.",
    imageUrl: "/products/tee-cream.jpg",
    tags: ["ESSENTIAL", "HEAVYWEIGHT", "NEW"],
    colors: [
      { name: "Bone Cream", hex: "#e5ded3" },
      { name: "Washed Slate", hex: "#52575d" }
    ],
    sizes: [
      { size: "S", stock: 20 },
      { size: "M", stock: 35 },
      { size: "L", stock: 28 },
      { size: "XL", stock: 14 }
    ],
    isFeatured: true,
    inStock: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-polo-05",
    title: "Polorse Pique Equestrian Polo Tee",
    category: "T-Shirts",
    price: 1899,
    originalPrice: 2799,
    description: "260 GSM double-mercerized pique combed cotton with knit ribbed collar, two-button mother-of-pearl placket, and embroidered horse mallet insignia.",
    imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=900&q=80",
    tags: ["POLO CLUB", "BESTSELLER", "CLASSIC"],
    colors: [
      { name: "Chalk White", hex: "#F8F9FA" },
      { name: "Deep Navy", hex: "#0F1C3F" },
      { name: "Sage Olive", hex: "#636d55" }
    ],
    sizes: [
      { size: "S", stock: 18 },
      { size: "M", stock: 26 },
      { size: "L", stock: 20 },
      { size: "XL", stock: 12 }
    ],
    isFeatured: true,
    inStock: true,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: "prod-shirt-06",
    title: "Textured Relaxed Camp Collar Linen Shirt",
    category: "Shirts",
    price: 2299,
    originalPrice: 3499,
    description: "Handcrafted from 100% pure European flax linen with a relaxed resort Cuban collar, straight split hem, and natural wooden buttons. Exceptionally breathable for warm climates.",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80",
    tags: ["100% LINEN", "SUMMER RESORT", "TRENDING"],
    colors: [
      { name: "Ecru Ivory", hex: "#F3ECE1" },
      { name: "Dusty Olive", hex: "#707A65" },
      { name: "Midnight Navy", hex: "#162A4F" }
    ],
    sizes: [
      { size: "S", stock: 15 },
      { size: "M", stock: 28 },
      { size: "L", stock: 22 },
      { size: "XL", stock: 8 }
    ],
    isFeatured: true,
    inStock: true,
    createdAt: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: "prod-shirt-07",
    title: "Tailored Oxford Button-Down Oversized Shirt",
    category: "Shirts",
    price: 2499,
    originalPrice: 3899,
    description: "Classic 100% two-ply Oxford weave cotton. Featuring a curved tail, relaxed dropped shoulders, button-down collar, and reinforced chest pocket with discreet Polorse embroidery.",
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
    tags: ["OXFORD WEAVE", "TIMELESS", "SMART CASUAL"],
    colors: [
      { name: "Crisp White", hex: "#FFFFFF" },
      { name: "Sky Chambray", hex: "#93C5FD" }
    ],
    sizes: [
      { size: "S", stock: 12 },
      { size: "M", stock: 25 },
      { size: "L", stock: 18 },
      { size: "XL", stock: 10 }
    ],
    isFeatured: false,
    inStock: true,
    createdAt: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: "prod-jeans-08",
    title: "Vintage Wash Relaxed Wide-Leg Denim Jeans",
    category: "Jeans",
    price: 3899,
    originalPrice: 5999,
    description: "14 oz heavyweight authentic ringspun cotton denim. Subtle stone wash with whiskering, high-rise relaxed wide-leg silhouette, custom antique copper hardware, and genuine leather back patch.",
    imageUrl: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=900&q=80",
    tags: ["14 OZ DENIM", "WIDE LEG", "PREMIUM SELVEDGE"],
    colors: [
      { name: "Washed Indigo", hex: "#4A6FA5" },
      { name: "Faded Vintage Black", hex: "#262626" }
    ],
    sizes: [
      { size: "30", stock: 10 },
      { size: "32", stock: 22 },
      { size: "34", stock: 18 },
      { size: "36", stock: 8 }
    ],
    isFeatured: true,
    inStock: true,
    createdAt: new Date(Date.now() - 18000000).toISOString()
  },
  {
    id: "prod-cargo-03",
    title: "Tactical Relaxed Parachute Cargo Pants",
    category: "Cargo",
    price: 3499,
    originalPrice: 5499,
    description: "Engineered from washed ripstop cotton with articulated knee darts, dual deep cargo compartments, an elasticated waistband with industrial metal-tipped drawstrings, and adjustable ankle toggles.",
    imageUrl: "/products/cargo-olive.jpg",
    tags: ["TACTICAL", "LIMITED EDITION"],
    colors: [
      { name: "Washed Olive", hex: "#636d55" },
      { name: "Charcoal Grey", hex: "#323537" }
    ],
    sizes: [
      { size: "S", stock: 8 },
      { size: "M", stock: 15 },
      { size: "L", stock: 12 },
      { size: "XL", stock: 6 }
    ],
    isFeatured: true,
    inStock: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-pants-09",
    title: "Pleated Relaxed Tailored Chino Trousers",
    category: "Pants",
    price: 2799,
    originalPrice: 4299,
    description: "Crafted from heavy 320 GSM brushed twill cotton with double forward front pleats, hidden elastic waist extension, slash pockets, and a clean taper that lands effortlessly over sneakers or loafers.",
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80",
    tags: ["PLEATED FIT", "QUIET LUXURY", "NEW"],
    colors: [
      { name: "Warm Khaki", hex: "#D4C5A9" },
      { name: "Polorse Navy", hex: "#0F1C3F" },
      { name: "Obsidian", hex: "#1A1A1A" }
    ],
    sizes: [
      { size: "30", stock: 12 },
      { size: "32", stock: 20 },
      { size: "34", stock: 16 },
      { size: "36", stock: 6 }
    ],
    isFeatured: true,
    inStock: true,
    createdAt: new Date(Date.now() - 21600000).toISOString()
  }
];

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
    const existingIds = new Set(parsed.map(p => p.id));
    const missing = INITIAL_PRODUCTS.filter(p => !existingIds.has(p.id));
    if (missing.length > 0) {
      const merged = [...parsed, ...missing];
      localStorage.setItem("polorse_products", JSON.stringify(merged));
      return merged;
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
