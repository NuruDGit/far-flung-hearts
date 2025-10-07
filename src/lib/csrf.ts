/**
 * CSRF (Cross-Site Request Forgery) Protection
 * 
 * This module provides utilities for generating, storing, and validating
 * CSRF tokens to protect against CSRF attacks.
 */

/**
 * Generate a cryptographically secure CSRF token
 */
export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

/**
 * Store CSRF token in session storage
 */
export const storeCSRFToken = (token: string) => {
  sessionStorage.setItem('csrf_token', token);
};

/**
 * Retrieve CSRF token from session storage
 */
export const getCSRFToken = (): string | null => {
  return sessionStorage.getItem('csrf_token');
};

/**
 * Validate a CSRF token against the stored token
 */
export const validateCSRFToken = (token: string): boolean => {
  const storedToken = getCSRFToken();
  return storedToken !== null && token === storedToken;
};

/**
 * Clear CSRF token from session storage
 */
export const clearCSRFToken = () => {
  sessionStorage.removeItem('csrf_token');
};

/**
 * Rotate CSRF token (generate new token and store it)
 * Use this for sensitive operations
 */
export const rotateCSRFToken = (): string => {
  const newToken = generateCSRFToken();
  storeCSRFToken(newToken);
  return newToken;
};

/**
 * Get CSRF token or generate if not exists
 */
export const ensureCSRFToken = (): string => {
  let token = getCSRFToken();
  if (!token) {
    token = generateCSRFToken();
    storeCSRFToken(token);
  }
  return token;
};
