import { parseDate } from "./dateValidation";

/**
 * Validates QID format (11 digits)
 */
export const validateQID = (qid) => {
  if (!qid) return { isValid: true, warning: null };
  
  const qidStr = String(qid).replace(/\s/g, '');
  if (!/^\d{11}$/.test(qidStr)) {
    return {
      isValid: false,
      warning: "QID should be 11 digits"
    };
  }
  return { isValid: true, warning: null };
};

/**
 * Validates passport number format
 */
export const validatePassportNumber = (passport) => {
  if (!passport) return { isValid: true, warning: null };
  
  const passportStr = String(passport).replace(/\s/g, '');
  if (passportStr.length < 6 || passportStr.length > 12) {
    return {
      isValid: false,
      warning: "Passport number seems invalid (usually 6-12 characters)"
    };
  }
  return { isValid: true, warning: null };
};

/**
 * Validates commercial registration number
 */
export const validateCRNumber = (crNo) => {
  if (!crNo) return { isValid: true, warning: null };
  
  const crStr = String(crNo).replace(/\s/g, '');
  if (!/^\d+$/.test(crStr)) {
    return {
      isValid: false,
      warning: "CR number should contain only digits"
    };
  }
  return { isValid: true, warning: null };
};

/**
 * Validates that date of birth is before expiry date
 */
export const validateDateOrder = (dateOfBirth, expiryDate) => {
  if (!dateOfBirth || !expiryDate) return { isValid: true, warning: null };
  
  const dob = parseDate(dateOfBirth);
  const expiry = parseDate(expiryDate);
  
  if (!dob || !expiry) return { isValid: true, warning: null };
  
  if (dob >= expiry) {
    return {
      isValid: false,
      warning: "Date of birth should be before expiry date"
    };
  }
  
  // Check if DOB is too recent (less than 18 years ago for most documents)
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  
  if (dob > eighteenYearsAgo) {
    return {
      isValid: false,
      warning: "Date of birth indicates person is under 18"
    };
  }
  
  return { isValid: true, warning: null };
};

/**
 * Validates creation date is before expiry date
 */
export const validateCreationBeforeExpiry = (creationDate, expiryDate) => {
  if (!creationDate || !expiryDate) return { isValid: true, warning: null };
  
  const creation = parseDate(creationDate);
  const expiry = parseDate(expiryDate);
  
  if (!creation || !expiry) return { isValid: true, warning: null };
  
  if (creation >= expiry) {
    return {
      isValid: false,
      warning: "Creation date should be before expiry date"
    };
  }
  
  return { isValid: true, warning: null };
};

/**
 * Validates tax registration number format
 */
export const validateTaxRegNo = (taxRegNo) => {
  if (!taxRegNo) return { isValid: true, warning: null };
  
  const taxStr = String(taxRegNo).replace(/\s/g, '');
  if (!/^\d{10}$/.test(taxStr)) {
    return {
      isValid: false,
      warning: "Tax registration number should be 10 digits"
    };
  }
  return { isValid: true, warning: null };
};

/**
 * Validates capital amount (should be positive number)
 */
export const validateCapital = (capital) => {
  if (!capital) return { isValid: true, warning: null };
  
  const capitalNum = parseFloat(String(capital).replace(/[^\d.]/g, ''));
  if (isNaN(capitalNum) || capitalNum <= 0) {
    return {
      isValid: false,
      warning: "Capital should be a positive number"
    };
  }
  return { isValid: true, warning: null };
};

/**
 * Main validation function that checks all fields based on document type
 */
export const validateExtractedData = (data) => {
  const warnings = [];
  
  if (!data) return warnings;
  
  // QID/Passport validations
  if (data.idNo) {
    const qidValidation = validateQID(data.idNo);
    if (!qidValidation.isValid) {
      warnings.push({ field: 'idNo', message: qidValidation.warning });
    }
  }
  
  if (data.passportNumber) {
    const passportValidation = validatePassportNumber(data.passportNumber);
    if (!passportValidation.isValid) {
      warnings.push({ field: 'passportNumber', message: passportValidation.warning });
    }
  }
  
  // Date validations
  if (data.dateOfBirth && data.expiry) {
    const dateOrderValidation = validateDateOrder(data.dateOfBirth, data.expiry);
    if (!dateOrderValidation.isValid) {
      warnings.push({ field: 'dateOfBirth', message: dateOrderValidation.warning });
    }
  }
  
  if (data.dateOfBirth && data.passportExpiry) {
    const dateOrderValidation = validateDateOrder(data.dateOfBirth, data.passportExpiry);
    if (!dateOrderValidation.isValid) {
      warnings.push({ field: 'dateOfBirth', message: dateOrderValidation.warning });
    }
  }
  
  // CR validations
  if (data.commercialRegNo) {
    const crValidation = validateCRNumber(data.commercialRegNo);
    if (!crValidation.isValid) {
      warnings.push({ field: 'commercialRegNo', message: crValidation.warning });
    }
  }
  
  if (data.taxRegNo) {
    const taxValidation = validateTaxRegNo(data.taxRegNo);
    if (!taxValidation.isValid) {
      warnings.push({ field: 'taxRegNo', message: taxValidation.warning });
    }
  }
  
  if (data.capital) {
    const capitalValidation = validateCapital(data.capital);
    if (!capitalValidation.isValid) {
      warnings.push({ field: 'capital', message: capitalValidation.warning });
    }
  }
  
  if (data.creationDate && data.expiryDate) {
    const creationValidation = validateCreationBeforeExpiry(data.creationDate, data.expiryDate);
    if (!creationValidation.isValid) {
      warnings.push({ field: 'creationDate', message: creationValidation.warning });
    }
  }
  
  return warnings;
};
