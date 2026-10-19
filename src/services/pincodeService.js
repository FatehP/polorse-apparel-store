// Service for Pincode deliverability, SLA tracking, and location auto-detection

// Default serviceable configuration
const DEFAULT_DELIVERY_RULES = {
  isAllIndiaServiceable: true,
  expressPincodes: ['110001', '400001', '560001', '500001', '600001', '700001', '380001', '411001'],
  blockedPincodes: [],
  codRestrictedPincodes: [],
  metroDeliveryDays: '2 - 3 Days',
  standardDeliveryDays: '3 - 5 Days',
  remoteDeliveryDays: '5 - 7 Days'
};

// Known metro prefix zones
const METRO_PINCODE_PREFIXES = {
  '11': { city: 'New Delhi', state: 'Delhi', days: '2 - 3 Days', cod: true },
  '40': { city: 'Mumbai', state: 'Maharashtra', days: '2 - 3 Days', cod: true },
  '56': { city: 'Bengaluru', state: 'Karnataka', days: '2 - 3 Days', cod: true },
  '50': { city: 'Hyderabad', state: 'Telangana', days: '2 - 3 Days', cod: true },
  '60': { city: 'Chennai', state: 'Tamil Nadu', days: '2 - 3 Days', cod: true },
  '70': { city: 'Kolkata', state: 'West Bengal', days: '2 - 3 Days', cod: true },
  '38': { city: 'Ahmedabad', state: 'Gujarat', days: '2 - 3 Days', cod: true },
  '41': { city: 'Pune', state: 'Maharashtra', days: '2 - 3 Days', cod: true },
  '30': { city: 'Jaipur', state: 'Rajasthan', days: '2 - 4 Days', cod: true },
  '22': { city: 'Lucknow', state: 'Uttar Pradesh', days: '3 - 4 Days', cod: true },
  '68': { city: 'Kochi', state: 'Kerala', days: '3 - 4 Days', cod: true },
  '45': { city: 'Indore', state: 'Madhya Pradesh', days: '3 - 4 Days', cod: true },
  '16': { city: 'Chandigarh', state: 'Punjab', days: '2 - 4 Days', cod: true },
  '80': { city: 'Patna', state: 'Bihar', days: '3 - 5 Days', cod: true },
  '78': { city: 'Guwahati', state: 'Assam', days: '4 - 6 Days', cod: true }
};

export function getDeliveryRules() {
  const stored = localStorage.getItem('polorse_delivery_rules');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return DEFAULT_DELIVERY_RULES;
}

export function saveDeliveryRules(rules) {
  localStorage.setItem('polorse_delivery_rules', JSON.stringify(rules));
  window.dispatchEvent(new CustomEvent('polorse_delivery_update'));
}

/**
 * Check if a 6-digit Indian pincode is deliverable
 */
export async function checkPincodeDeliverability(pincode) {
  const cleanPin = String(pincode).trim();

  if (!cleanPin || cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
    return {
      isValid: false,
      isDeliverable: false,
      message: 'Please enter a valid 6-digit Indian PIN code'
    };
  }

  const rules = getDeliveryRules();

  // Check if explicitly blocked
  if (rules.blockedPincodes.includes(cleanPin)) {
    return {
      isValid: true,
      pincode: cleanPin,
      isDeliverable: false,
      message: 'Currently non-serviceable. Please try an alternate delivery address.'
    };
  }

  // Check if express priority
  const isExpress = rules.expressPincodes.includes(cleanPin);

  // Check COD restriction
  const isCodAllowed = !rules.codRestrictedPincodes.includes(cleanPin);

  // Determine city & state via postal prefix or postal API
  const prefix = cleanPin.substring(0, 2);
  let city = METRO_PINCODE_PREFIXES[prefix]?.city || 'Regional Center';
  let state = METRO_PINCODE_PREFIXES[prefix]?.state || 'India';
  let deliveryDays = METRO_PINCODE_PREFIXES[prefix]?.days || rules.standardDeliveryDays;

  if (isExpress) {
    deliveryDays = '1 - 2 Days (Express)';
  }

  // Attempt live lookup from India Post API (non-blocking fallback)
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        city = po.District || po.Name;
        state = po.State;
      }
    }
  } catch (err) {
    // Graceful offline fallback
    console.debug('Postal API lookup offline, used prefix table', err);
  }

  // Calculate estimated delivery date
  const minDays = deliveryDays.includes('1 - 2') ? 2 : deliveryDays.includes('2 - 3') ? 3 : 5;
  const etaDate = new Date();
  etaDate.setDate(etaDate.getDate() + minDays);
  const formattedEta = etaDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return {
    isValid: true,
    pincode: cleanPin,
    isDeliverable: true,
    city,
    state,
    deliveryDays,
    isExpress,
    isCodAllowed,
    estimatedDate: formattedEta,
    message: `Delivery by ${formattedEta} (${deliveryDays})`
  };
}

/**
 * Auto-detect user's location using browser Geolocation or IP location
 */
export async function autoDetectLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      fallbackIpLocation().then(resolve);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocoding via OpenStreetMap Nominatim (free, no API key needed)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&countrycodes=in`,
            { headers: { 'Accept-Language': 'en' } }
          );

          if (res.ok) {
            const data = await res.json();
            const postcode = data.address?.postcode;
            const city = data.address?.city || data.address?.state_district || data.address?.town || data.address?.county;
            const state = data.address?.state;

            if (postcode && /^\d{6}$/.test(postcode)) {
              const deliveryInfo = await checkPincodeDeliverability(postcode);
              resolve({
                success: true,
                pincode: postcode,
                city: city || deliveryInfo.city,
                state: state || deliveryInfo.state,
                deliveryInfo
              });
              return;
            }
          }
        } catch (e) {
          console.debug('Nominatim reverse geo error', e);
        }

        // Fallback if reverse geocode didn't return a 6 digit pin
        fallbackIpLocation().then(resolve);
      },
      (error) => {
        console.debug('Geolocation permission denied or timeout', error);
        fallbackIpLocation().then(resolve);
      },
      { timeout: 6000 }
    );
  });
}

async function fallbackIpLocation() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      const pin = data.postal;
      if (pin && /^\d{6}$/.test(pin)) {
        const deliveryInfo = await checkPincodeDeliverability(pin);
        return {
          success: true,
          pincode: pin,
          city: data.city || deliveryInfo.city,
          state: data.region || deliveryInfo.state,
          deliveryInfo
        };
      }
    }
  } catch (err) {
    console.debug('IP geo failed', err);
  }

  // Graceful default (Bengaluru Metro)
  const defaultPin = '560001';
  const deliveryInfo = await checkPincodeDeliverability(defaultPin);
  return {
    success: true,
    pincode: defaultPin,
    city: 'Bengaluru',
    state: 'Karnataka',
    deliveryInfo,
    isSimulated: true
  };
}
