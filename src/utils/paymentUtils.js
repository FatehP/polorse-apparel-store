/**
 * Payment and Input Masking Formatters for POLORSE Streetwear App
 */

/**
 * Automatically masks and formats card expiration date as MM/YY as user types
 * Handles month clamping (01-12), auto leading-zero for months > 1,
 * and seamless backspacing across the slash.
 * 
 * @param {string} rawVal Current input value
 * @param {string} prevVal Previous input value for backspace handling
 * @returns {string} Formatted MM/YY string
 */
export const formatCardExpiry = (rawVal, prevVal = '') => {
  if (!rawVal) return '';

  // Handle backspace when previous value ended with '/'
  if (prevVal.endsWith('/') && rawVal === prevVal.slice(0, -1)) {
    return rawVal.slice(0, -1);
  }

  // Keep digits only, max 4 digits
  const digits = rawVal.replace(/\D/g, '').slice(0, 4);
  if (!digits) return '';

  // Single digit handling
  if (digits.length === 1) {
    // If first digit is > 1 (e.g. '2'-'9'), auto prefix with '0' -> '02/'
    if (Number(digits) > 1) {
      return `0${digits}/`;
    }
    return digits;
  }

  // 2 or more digits
  let mm = digits.slice(0, 2);
  const mmNum = parseInt(mm, 10);
  if (mmNum > 12) {
    mm = '12';
  } else if (mmNum === 0 && mm.length === 2) {
    mm = '01';
  }

  const yy = digits.slice(2);
  return yy.length > 0 ? `${mm}/${yy}` : `${mm}/`;
};
