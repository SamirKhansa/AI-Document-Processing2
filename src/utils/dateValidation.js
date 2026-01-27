/**
 * Parses a date string in various formats and returns a Date object
 * Supports formats: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY
 */
export const parseDate = (dateString) => {
  if (!dateString || dateString === "") return null;

  // Try DD/MM/YYYY format
  const ddmmyyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const ddmmyyyyMatch = dateString.match(ddmmyyyyRegex);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    return new Date(year, month - 1, day);
  }

  // Try YYYY-MM-DD format
  const yyyymmddRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const yyyymmddMatch = dateString.match(yyyymmddRegex);
  if (yyyymmddMatch) {
    const [, year, month, day] = yyyymmddMatch;
    return new Date(year, month - 1, day);
  }

  // Try DD-MM-YYYY format
  const ddmmyyyyDashRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
  const ddmmyyyyDashMatch = dateString.match(ddmmyyyyDashRegex);
  if (ddmmyyyyDashMatch) {
    const [, day, month, year] = ddmmyyyyDashMatch;
    return new Date(year, month - 1, day);
  }

  // Try YYYY/MM/DD format
  const yyyymmddSlashRegex = /^(\d{4})\/(\d{2})\/(\d{2})$/;
  const yyyymmddSlashMatch = dateString.match(yyyymmddSlashRegex);
  if (yyyymmddSlashMatch) {
    const [, year, month, day] = yyyymmddSlashMatch;
    return new Date(year, month - 1, day);
  }

  // Fallback: try native Date parsing
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Checks if a document is still valid based on its expiry date
 * @param {string} expiryDateString - The expiry date string from the document
 * @returns {boolean|null} - true if valid, false if expired, null if date cannot be parsed
 */
export const isDocumentValid = (expiryDateString) => {
  const expiryDate = parseDate(expiryDateString);
  if (!expiryDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate comparison

  return expiryDate >= today;
};

/**
 * Gets the number of days until expiry (negative if expired)
 * @param {string} expiryDateString - The expiry date string from the document
 * @returns {number|null} - Days until expiry, null if date cannot be parsed
 */
export const getDaysUntilExpiry = (expiryDateString) => {
  const expiryDate = parseDate(expiryDateString);
  if (!expiryDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Determines which field contains the expiry date based on the extracted data
 * @param {Object} extractedData - The data extracted from the document
 * @returns {string|null} - The expiry date string or null if not found
 */
export const getExpiryDateFromData = (extractedData) => {
  if (!extractedData) return null;

  // Check common expiry date field names
  const expiryFields = ['expiry', 'expiryDate', 'passportExpiry'];
  
  for (const field of expiryFields) {
    if (extractedData[field] && extractedData[field] !== "") {
      return extractedData[field];
    }
  }

  return null;
};
