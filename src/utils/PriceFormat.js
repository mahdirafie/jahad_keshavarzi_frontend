/**
 * Formats a number with comma separators for thousands
 * @param {number} price - The price to format
 * @returns {string} - Formatted price with commas
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return "";
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Formats a price with the appropriate currency symbol (تومان)
 * @param {number} price - The price to format
 * @returns {string} - Formatted price with currency
 */
export const formatPriceWithCurrency = (price) => {
  if (!price && price !== 0) return "";
  return `${formatPrice(price)} تومان`;
};
