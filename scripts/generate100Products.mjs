import fs from 'fs';
import path from 'path';

// Curated high-resolution fashion / streetwear image pools from Unsplash
const HOODIE_IMAGES = [
  "/products/hoodie-charcoal.jpg",
  "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"
];

const TSHIRT_IMAGES = [
  "/products/tee-cream.jpg",
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=900&q=80"
];

const PANTS_IMAGES = [
  "/products/cargo-olive.jpg",
  "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=900&q=80"
];

const OUTERWEAR_IMAGES = [
  "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80"
];

const ACCESSORY_IMAGES = [
  "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"
];

// Product Blueprints for 100 items
const titles = [
  // 1-25 Hoodies & Sweatshirts
  { title: "Heavyweight Acid-Wash Oversized Hoodie", cat: "Hoodies", gsm: "420 GSM", price: 2999, orig: 4999, tags: ["DROP 01", "OVERSIZED", "BESTSELLER"] },
  { title: "Polorse Crest Heritage Shield Hoodie", cat: "Hoodies", gsm: "450 GSM", price: 3499, orig: 5499, tags: ["SIGNATURE", "LUXURY FLEECE", "NEW"] },
  { title: "Vintage Sun-Faded Boxy Hoodie", cat: "Hoodies", gsm: "400 GSM", price: 2799, orig: 4299, tags: ["VINTAGE WASH", "DROP 02"] },
  { title: "Double-Zip Thermal Lined Street Hoodie", cat: "Hoodies", gsm: "480 GSM", price: 3799, orig: 5999, tags: ["THERMAL LINED", "HEAVYWEIGHT"] },
  { title: "Sovereign Roman Numeral Fleece Hoodie", cat: "Hoodies", gsm: "420 GSM", price: 3199, orig: 4799, tags: ["LIMITED", "BESTSELLER"] },
  { title: "French Terry Raglan Drop-Shoulder Hoodie", cat: "Hoodies", gsm: "380 GSM", price: 2599, orig: 3999, tags: ["ESSENTIAL", "OVERSIZED"] },
  { title: "Minimalist Monochrome Crop Box Hoodie", cat: "Hoodies", gsm: "400 GSM", price: 2899, orig: 4499, tags: ["CROPPED FIT", "STREETWEAR"] },
  { title: "Contrast Stitch Heavyweight Fleece Hoodie", cat: "Hoodies", gsm: "440 GSM", price: 3299, orig: 4999, tags: ["CONTRAST SEAM", "SIGNATURE"] },
  { title: "Distressed Hem Vintage Mineral Wash Hoodie", cat: "Hoodies", gsm: "410 GSM", price: 2999, orig: 4599, tags: ["DISTRESSED", "ACID WASH"] },
  { title: "Raw-Seam Heavyweight Pullover Hoodie", cat: "Hoodies", gsm: "430 GSM", price: 3099, orig: 4899, tags: ["RAW SEAM", "OVERSIZED"] },
  { title: "Washed Clay Oversized Heavy Hoodie", cat: "Hoodies", gsm: "420 GSM", price: 2899, orig: 4399, tags: ["ORGANIC COTTON", "NEW"] },
  { title: "Emerald Green Crest Loopback Hoodie", cat: "Hoodies", gsm: "450 GSM", price: 3599, orig: 5499, tags: ["LUXURY", "LIMITED DROP"] },
  { title: "Cobalt Blue Heavyweight Streetwear Hoodie", cat: "Hoodies", gsm: "420 GSM", price: 2999, orig: 4699, tags: ["BOLD HUE", "BESTSELLER"] },
  { title: "Sand Dune Boxy Drop-Shoulder Hoodie", cat: "Hoodies", gsm: "400 GSM", price: 2799, orig: 4199, tags: ["NEUTRAL TONE", "ESSENTIAL"] },
  { title: "Heather Grey Athletic Heritage Hoodie", cat: "Hoodies", gsm: "440 GSM", price: 3199, orig: 4899, tags: ["HEAVY FLEECE", "CLASSIC"] },
  { title: "Midnight Navy Velvet-Finish Brushed Hoodie", cat: "Hoodies", gsm: "460 GSM", price: 3699, orig: 5799, tags: ["VELVET TOUCH", "SIGNATURE"] },
  { title: "Chocolate Brown 450 GSM Heavy Hoodie", cat: "Hoodies", gsm: "450 GSM", price: 3399, orig: 5199, tags: ["RICH EARTH", "POPULAR"] },
  { title: "Charcoal Ribbed Half-Zip Fleece Pullover", cat: "Hoodies", gsm: "390 GSM", price: 2899, orig: 4299, tags: ["HALF-ZIP", "MINIMAL"] },
  { title: "Raw Hem Oversized Crewneck Sweatshirt", cat: "Hoodies", gsm: "400 GSM", price: 2499, orig: 3799, tags: ["RAW HEM", "DROP 01"] },
  { title: "Vintage Collegiate Embroidered Sweatshirt", cat: "Hoodies", gsm: "420 GSM", price: 2799, orig: 4199, tags: ["COLLEGIATE", "RETRO"] },
  { title: "Dropped Shoulder French Terry Crew", cat: "Hoodies", gsm: "380 GSM", price: 2399, orig: 3699, tags: ["EVERYDAY", "BOX FIT"] },
  { title: "Distressed Vintage Athletic Sweatshirt", cat: "Hoodies", gsm: "410 GSM", price: 2699, orig: 3999, tags: ["AGED LOOK", "HEAVY COTTON"] },
  { title: "Minimalist Thermal Waffle Knit Pullover", cat: "Hoodies", gsm: "360 GSM", price: 2299, orig: 3499, tags: ["WAFFLE KNIT", "COMFORT"] },
  { title: "Boxy Ribbed Mock-Neck Sweatshirt", cat: "Hoodies", gsm: "430 GSM", price: 2999, orig: 4499, tags: ["MOCK NECK", "STRUCTURAL"] },
  { title: "Two-Tone Colorblock Heavy Crewneck", cat: "Hoodies", gsm: "420 GSM", price: 2899, orig: 4299, tags: ["COLORBLOCK", "STREETWEAR"] },

  // 26-55 T-Shirts & Polos
  { title: "Raw-Cut Boxy Minimalist Tee", cat: "T-Shirts", gsm: "280 GSM", price: 1499, orig: 2199, tags: ["ESSENTIAL", "HEAVYWEIGHT", "NEW"] },
  { title: "Polorse Pique Equestrian Polo Tee", cat: "T-Shirts", gsm: "260 GSM", price: 1899, orig: 2799, tags: ["POLO CLUB", "BESTSELLER", "CLASSIC"] },
  { title: "Acid-Wash Vintage Graphic Oversized Tee", cat: "T-Shirts", gsm: "280 GSM", price: 1599, orig: 2399, tags: ["ACID WASH", "GRAPHIC DROP"] },
  { title: "280 GSM Compact Heavy Cotton Tee", cat: "T-Shirts", gsm: "280 GSM", price: 1399, orig: 1999, tags: ["COMPACT COTTON", "STAPLE"] },
  { title: "Drop-Shoulder Pigment Dyed Street Tee", cat: "T-Shirts", gsm: "260 GSM", price: 1499, orig: 2299, tags: ["PIGMENT DYED", "FADED HUE"] },
  { title: "Minimalist Mock-Neck Heavy Boxy Tee", cat: "T-Shirts", gsm: "290 GSM", price: 1699, orig: 2599, tags: ["MOCK NECK", "STRUCTURED"] },
  { title: "Vintage Mineral Wash Heavy Tee", cat: "T-Shirts", gsm: "270 GSM", price: 1549, orig: 2299, tags: ["MINERAL WASH", "BESTSELLER"] },
  { title: "Monogram Embroidered Pocket Tee", cat: "T-Shirts", gsm: "250 GSM", price: 1499, orig: 2199, tags: ["POCKET EMBROIDERY", "SUBTLE"] },
  { title: "Ribbed Collar Thick Cotton Skate Tee", cat: "T-Shirts", gsm: "300 GSM", price: 1649, orig: 2499, tags: ["300 GSM", "SKATE CUT"] },
  { title: "Distressed Cracked Print Band Style Tee", cat: "T-Shirts", gsm: "260 GSM", price: 1599, orig: 2399, tags: ["CRACKED PRINT", "RETRO"] },
  { title: "Sun-Bleached Sand Boxy Tee", cat: "T-Shirts", gsm: "270 GSM", price: 1449, orig: 2099, tags: ["SUN BLEACHED", "SUMMER DROP"] },
  { title: "Washed Forest Green Street Tee", cat: "T-Shirts", gsm: "280 GSM", price: 1499, orig: 2199, tags: ["EARTH TONE", "ORGANIC"] },
  { title: "Dark Amber Heavyweight Cotton Tee", cat: "T-Shirts", gsm: "280 GSM", price: 1499, orig: 2199, tags: ["RICH AMBER", "AUTUMN"] },
  { title: "Terracotta Pigment Dyed Boxy Tee", cat: "T-Shirts", gsm: "260 GSM", price: 1399, orig: 2099, tags: ["TERRACOTTA", "MINIMAL"] },
  { title: "Retro Athletic Mesh Inset Street Tee", cat: "T-Shirts", gsm: "250 GSM", price: 1699, orig: 2499, tags: ["ATHLETIC", "MESH ACCENT"] },
  { title: "High-Density Gel Print Street Tee", cat: "T-Shirts", gsm: "280 GSM", price: 1599, orig: 2299, tags: ["GEL PRINT", "TACTILE"] },
  { title: "Oversized Split Hem Raw-Cut Tee", cat: "T-Shirts", gsm: "270 GSM", price: 1499, orig: 2199, tags: ["SPLIT HEM", "DRAPE"] },
  { title: "Heavy Cotton Raglan Skate Tee", cat: "T-Shirts", gsm: "280 GSM", price: 1549, orig: 2299, tags: ["RAGLAN SLEEVE", "SKATE"] },
  { title: "Vintage Black Chain-Stitched Tee", cat: "T-Shirts", gsm: "270 GSM", price: 1599, orig: 2399, tags: ["CHAIN STITCH", "ARTISAN"] },
  { title: "Bone White Clean Minimalist Boxy Tee", cat: "T-Shirts", gsm: "290 GSM", price: 1499, orig: 2199, tags: ["BONE WHITE", "ICONIC"] },
  { title: "Charcoal Washed Heavy Mock Neck Tee", cat: "T-Shirts", gsm: "280 GSM", price: 1699, orig: 2499, tags: ["MOCK COLLAR", "SMOKE"] },
  { title: "Crimson Red Heritage Crest Tee", cat: "T-Shirts", gsm: "260 GSM", price: 1499, orig: 2199, tags: ["CREST PRINT", "POLORSE RED"] },
  { title: "Heavyweight Long Sleeve Boxy Tee", cat: "T-Shirts", gsm: "300 GSM", price: 1899, orig: 2799, tags: ["LONG SLEEVE", "WINTER LAYER"] },
  { title: "Vintage Striped Heavy Knit Tee", cat: "T-Shirts", gsm: "270 GSM", price: 1649, orig: 2399, tags: ["STRIPED", "KNIT COTTON"] },
  { title: "Slub Cotton Textured Street Tee", cat: "T-Shirts", gsm: "250 GSM", price: 1399, orig: 1999, tags: ["SLUB TEXTURE", "BREATHABLE"] },
  { title: "Oversized Buttonless Johnny Collar Polo", cat: "T-Shirts", gsm: "280 GSM", price: 2199, orig: 3299, tags: ["JOHNNY COLLAR", "LUXURY"] },
  { title: "Heavy Knitted Ribbed Resort Polo", cat: "T-Shirts", gsm: "320 GSM", price: 2499, orig: 3699, tags: ["KNIT POLO", "RESORT"] },
  { title: "Retro Tennis Pique Street Polo", cat: "T-Shirts", gsm: "270 GSM", price: 1999, orig: 2899, tags: ["TENNIS CLUB", "RETRO"] },
  { title: "Zip-Neck Structured Pique Polo", cat: "T-Shirts", gsm: "290 GSM", price: 2299, orig: 3399, tags: ["METALLIC ZIP", "CLEAN"] },
  { title: "Striped Contrast Collar Boxy Polo", cat: "T-Shirts", gsm: "270 GSM", price: 1949, orig: 2899, tags: ["CONTRAST TRIM", "SIGNATURE"] },

  // 56-80 Pants, Cargoes & Denim
  { title: "Multi-Pocket Tactical Heavy Cargo Pants", cat: "Pants", gsm: "340 GSM", price: 2499, orig: 3999, tags: ["TACTICAL", "HEAVY TWILL", "BESTSELLER"] },
  { title: "Polorse Pleated Wide-Leg Wool Trousers", cat: "Pants", gsm: "320 GSM", price: 2799, orig: 4299, tags: ["PLEATED FIT", "QUIET LUXURY", "NEW"] },
  { title: "Double-Knee Heavy Canvas Carpenter Pants", cat: "Pants", gsm: "380 GSM", price: 2699, orig: 4199, tags: ["DOUBLE KNEE", "WORKWEAR"] },
  { title: "14oz Rigid Vintage Selvedge Denim", cat: "Pants", gsm: "14 OZ", price: 3499, orig: 5299, tags: ["SELVEDGE", "JAPANESE DENIM"] },
  { title: "French Terry Heavy Drop Sweatpants", cat: "Pants", gsm: "420 GSM", price: 2299, orig: 3499, tags: ["HEAVY FLEECE", "COMFORT FIT"] },
  { title: "Baggy Acid-Wash Skate Jeans", cat: "Pants", gsm: "13 OZ", price: 2899, orig: 4499, tags: ["BAGGY SKATE", "ACID WASH"] },
  { title: "Relaxed Fit Twill Chino Trousers", cat: "Pants", gsm: "300 GSM", price: 2199, orig: 3299, tags: ["CLEAN CHINO", "EVERYDAY"] },
  { title: "Parachute Nylon Street Trackpants", cat: "Pants", gsm: "180 GSM", price: 2399, orig: 3699, tags: ["PARACHUTE", "TECHWEAR"] },
  { title: "Minimalist Drawstring Linen-Cotton Pants", cat: "Pants", gsm: "260 GSM", price: 2299, orig: 3399, tags: ["LINEN BLEND", "BREATHABLE"] },
  { title: "Heavyweight Ribbed Cuff Joggers", cat: "Pants", gsm: "400 GSM", price: 2199, orig: 3299, tags: ["JOGGER", "SLOUCH FIT"] },
  { title: "Wide Straight-Leg Utility Fatigue Pants", cat: "Pants", gsm: "320 GSM", price: 2599, orig: 3899, tags: ["MILITARY FATIGUE", "STURDY"] },
  { title: "Raw Hem Vintage Denim Jeans", cat: "Pants", gsm: "13.5 OZ", price: 2799, orig: 4299, tags: ["RAW HEM", "STRAIGHT FIT"] },
  { title: "Charcoal Waxed Cotton Moto Pants", cat: "Pants", gsm: "360 GSM", price: 3299, orig: 4999, tags: ["WAXED COTTON", "MOTO DETAILS"] },
  { title: "Elasticated Waist Pleated Dress Pants", cat: "Pants", gsm: "290 GSM", price: 2499, orig: 3799, tags: ["SMART CASUAL", "STRETCH WAIST"] },
  { title: "Knee-Darted Ergonomic Cargo Pants", cat: "Pants", gsm: "330 GSM", price: 2699, orig: 4099, tags: ["3D ERGONOMIC", "CARGO"] },
  { title: "Vintage Olive Field Utility Trousers", cat: "Pants", gsm: "340 GSM", price: 2549, orig: 3899, tags: ["OLIVE FIELD", "HERITAGE"] },
  { title: "Heavy French Terry Slouch Shorts", cat: "Pants", gsm: "400 GSM", price: 1699, orig: 2499, tags: ["SLOUCH SHORTS", "SUMMER"] },
  { title: "Tactical Utility Cargo Shorts", cat: "Pants", gsm: "320 GSM", price: 1899, orig: 2799, tags: ["CARGO SHORTS", "ZIP POCKETS"] },
  { title: "Raw Hem Heavyweight Cotton Sweatshorts", cat: "Pants", gsm: "380 GSM", price: 1599, orig: 2299, tags: ["RAW HEM", "GYM / STREET"] },
  { title: "Double-Pleated Relaxed Summer Shorts", cat: "Pants", gsm: "260 GSM", price: 1799, orig: 2599, tags: ["PLEATED", "RESORT WEAR"] },
  { title: "Corduroy Wide-Leg Casual Trousers", cat: "Pants", gsm: "350 GSM", price: 2699, orig: 3999, tags: ["CORDUROY", "TEXTURED"] },
  { title: "Contrast Stitch Skate Carpenter Denim", cat: "Pants", gsm: "13 OZ", price: 2999, orig: 4499, tags: ["CARPENTER", "WHITE STITCH"] },
  { title: "Heavyweight Thermal Waffle Lounge Pants", cat: "Pants", gsm: "340 GSM", price: 1999, orig: 2899, tags: ["THERMAL WAFFLE", "RELAXED"] },
  { title: "Vintage Washed Denim Work Pants", cat: "Pants", gsm: "14 OZ", price: 3199, orig: 4799, tags: ["WORKWEAR DENIM", "VINTAGE WASH"] },
  { title: "Minimalist Elastic Hem Wind Trackpants", cat: "Pants", gsm: "200 GSM", price: 2199, orig: 3199, tags: ["WINDPROOF", "ATHLEISURE"] },

  // 81-92 Outerwear & Jackets
  { title: "Wool & Leather Heritage Varsity Bomber", cat: "Outerwear", gsm: "650 GSM", price: 5499, orig: 8499, tags: ["VARSITY", "GENUINE LEATHER", "FLAGSHIP"] },
  { title: "Heavyweight Canvas Workwear Chore Jacket", cat: "Outerwear", gsm: "420 GSM", price: 3999, orig: 5999, tags: ["CHORE JACKET", "CANVAS"] },
  { title: "Boxy Distressed Denim Trucker Jacket", cat: "Outerwear", gsm: "14.5 OZ", price: 3799, orig: 5699, tags: ["TRUCKER", "RAW DENIM"] },
  { title: "Quilted Down Puffer Vest / Gilet", cat: "Outerwear", gsm: "THERMAL", price: 3299, orig: 4999, tags: ["PUFFER GILET", "WEATHERPROOF"] },
  { title: "Sherpa Fleece Lined Utility Overshirt", cat: "Outerwear", gsm: "480 GSM", price: 3499, orig: 5299, tags: ["SHERPA LINED", "COSY"] },
  { title: "Water-Resistant Matte Street Windbreaker", cat: "Outerwear", gsm: "TECH", price: 2999, orig: 4499, tags: ["MATTE SHELL", "WATERPROOF"] },
  { title: "Corduroy Collar Ranch Chore Coat", cat: "Outerwear", gsm: "450 GSM", price: 4199, orig: 6299, tags: ["RANCH COAT", "CORD COLLAR"] },
  { title: "Minimalist Tailored Wool Overcoat", cat: "Outerwear", gsm: "700 GSM", price: 6499, orig: 9999, tags: ["WOOL BLEND", "EDITORIAL"] },
  { title: "Zip-Up Bonded Fleece Track Jacket", cat: "Outerwear", gsm: "380 GSM", price: 2899, orig: 4299, tags: ["TRACK JACKET", "ATHLETIC"] },
  { title: "Acid-Wash Oversized Flannel Overshirt", cat: "Outerwear", gsm: "350 GSM", price: 2699, orig: 3999, tags: ["FLANNEL", "HEAVY PLAID"] },
  { title: "Heavyweight Faux Suede Trucker Jacket", cat: "Outerwear", gsm: "400 GSM", price: 4299, orig: 6499, tags: ["SUEDE TEXTURE", "ELEVATED"] },
  { title: "Lightweight Ripstop Technical Shell", cat: "Outerwear", gsm: "TECHWEAR", price: 3399, orig: 4999, tags: ["RIPSTOP", "HOODED"] },

  // 93-100 Accessories & Headwear
  { title: "Heavyweight Washed Canvas Equestrian Cap", cat: "Accessories", gsm: "320 GSM", price: 999, orig: 1499, tags: ["CANVAS CAP", "BRASS BUCKLE"] },
  { title: "Chunky Ribbed Merino Wool Beanie", cat: "Accessories", gsm: "WOOL", price: 1199, orig: 1799, tags: ["MERINO BEANIE", "WINTER"] },
  { title: "Structured Nylon Crossbody Street Bag", cat: "Accessories", gsm: "NYLON", price: 1899, orig: 2799, tags: ["CROSSBODY", "WATER RESISTANT"] },
  { title: "Premium Vegetable-Tanned Leather Cardholder", cat: "Accessories", gsm: "LEATHER", price: 1499, orig: 2299, tags: ["REAL LEATHER", "HANDMADE"] },
  { title: "Heavy Brass Polorse Signature Keychain", cat: "Accessories", gsm: "SOLID BRASS", price: 799, orig: 1199, tags: ["SOLID BRASS", "MINIMAL"] },
  { title: "Ribbed Heavy Cotton Tube Socks (3-Pack)", cat: "Accessories", gsm: "COMBED COTTON", price: 699, orig: 999, tags: ["3-PACK", "CUSHIONED"] },
  { title: "Minimalist Webbing Utility Belt", cat: "Accessories", gsm: "NYLON WEBBING", price: 899, orig: 1299, tags: ["QUICK RELEASE", "TACTICAL"] },
  { title: "Heavy Canvas Tote Bag with Embroidered Crest", cat: "Accessories", gsm: "420 GSM", price: 1299, orig: 1899, tags: ["CANVAS TOTE", "EMBROIDERED"] }
];

const colorPalettes = [
  [
    { name: "Obsidian Black", hex: "#111111" },
    { name: "Vintage Charcoal", hex: "#2b2b2e" },
    { name: "Bone Cream", hex: "#FAF7F2" }
  ],
  [
    { name: "Polorse Navy", hex: "#0F1C3F" },
    { name: "Warm Khaki", hex: "#D4C5A9" },
    { name: "Forest Green", hex: "#1D3A2C" }
  ],
  [
    { name: "Muted Terracotta", hex: "#B85C43" },
    { name: "Washed Slate", hex: "#4B5563" },
    { name: "Chalk White", hex: "#F3F4F6" }
  ],
  [
    { name: "Chocolate Brown", hex: "#3B2219" },
    { name: "Heather Grey", hex: "#9CA3AF" },
    { name: "Deep Crimson", hex: "#881337" }
  ]
];

const products = titles.map((item, index) => {
  const num = String(index + 1).padStart(3, '0');
  const palette = colorPalettes[index % colorPalettes.length];

  let imagePool = TSHIRT_IMAGES;
  if (item.cat === 'Hoodies') imagePool = HOODIE_IMAGES;
  else if (item.cat === 'Pants') imagePool = PANTS_IMAGES;
  else if (item.cat === 'Outerwear') imagePool = OUTERWEAR_IMAGES;
  else if (item.cat === 'Accessories') imagePool = ACCESSORY_IMAGES;

  const mainImg = imagePool[index % imagePool.length];
  const secondImg = imagePool[(index + 1) % imagePool.length];
  const thirdImg = imagePool[(index + 2) % imagePool.length];
  const fourthImg = imagePool[(index + 3) % imagePool.length];

  let sizes = [
    { size: "S", stock: 12 + (index % 10) },
    { size: "M", stock: 18 + (index % 15) },
    { size: "L", stock: 15 + (index % 12) },
    { size: "XL", stock: 8 + (index % 8) },
    { size: "XXL", stock: 4 + (index % 5) }
  ];

  if (item.cat === 'Pants') {
    sizes = [
      { size: "30", stock: 10 + (index % 6) },
      { size: "32", stock: 16 + (index % 10) },
      { size: "34", stock: 12 + (index % 8) },
      { size: "36", stock: 6 + (index % 5) }
    ];
  } else if (item.cat === 'Accessories') {
    sizes = [
      { size: "One Size", stock: 25 + (index % 20) }
    ];
  }

  return {
    id: `prod-drop-${num}`,
    title: item.title,
    category: item.cat,
    price: item.price,
    originalPrice: item.orig,
    description: `${item.gsm} luxury combed compact cotton. Designed with dropped shoulders, structural boxy drape, and bespoke Polorse hardware. Built to retain form wash after wash.`,
    imageUrl: mainImg,
    images: [mainImg, secondImg, thirdImg, fourthImg],
    tags: item.tags,
    colors: palette,
    sizes: sizes,
    isFeatured: index < 12,
    inStock: true,
    createdAt: new Date(Date.now() - (index * 3600000 * 2)).toISOString()
  };
});

const content = `// 100 Authentic Luxury Streetwear Products for POLORSE Catalog
export const INITIAL_PRODUCTS = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync(path.resolve('./src/data/productsData.js'), content, 'utf-8');
console.log(`✅ Generated ${products.length} products into src/data/productsData.js`);
