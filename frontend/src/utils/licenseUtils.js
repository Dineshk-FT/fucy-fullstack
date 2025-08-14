/**
 * Checks if the license is expiring within the specified number of days
 * @param {string} endDate - The license end date string (format: YYYY-MM-DD)
 * @param {number} [days=2] - Number of days before expiry to consider
 * @returns {boolean} - True if license is expiring within the specified days
 */
export const isLicenseExpiring = (endDate, days = 2) => {
  if (!endDate) return false;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiryDate = new Date(endDate);
    if (isNaN(expiryDate.getTime())) return false;
    
    expiryDate.setHours(0, 0, 0, 0);
    
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= days && diffDays >= 0;
  } catch (error) {
    console.error('Error checking license expiration:', error);
    return false;
  }
};

/**
 * Formats the remaining days until license expiry
 * @param {string} endDate - The license end date string (format: YYYY-MM-DD)
 * @returns {string} - Formatted message about remaining days
 */
export const getExpiryMessage = (endDate) => {
  if (!endDate) return 'License expiration date not available.';
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiryDate = new Date(endDate);
    if (isNaN(expiryDate.getTime())) return 'License expiration date is invalid.';
    
    expiryDate.setHours(0, 0, 0, 0);
    
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Your license has expired. Please renew your license to continue using the service.';
    } else if (diffDays === 0) {
      return 'Your license expires today. Please renew your license to avoid service interruption.';
    } else if (diffDays === 1) {
      return 'Your license expires tomorrow. Please renew your license to avoid service interruption.';
    }
    
    return `Your license will expire in ${diffDays} days. Please renew your license to avoid service interruption.`;
  } catch (error) {
    console.error('Error formatting expiry message:', error);
    return 'License expiration information not available';
  }
};
