/**
 * Centralized API Configuration
 * All service files should import getApiUrl() from here
 */

// Environment variable debugging
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);
console.log('import.meta.env:', import.meta.env);

/**
 * Determine API URL with fallback logic
 * Priority: 1) Environment variable, 2) Infer from hostname, 3) localhost
 */
export const getApiUrl = (): string => {
  // 1. Try environment variable (most reliable)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 2. In production, try to infer from current hostname
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Digital Ocean App Platform
    if (hostname.includes('ondigitalocean.app')) {
      const protocol = window.location.protocol;
      return `${protocol}//${hostname}/api/v1`;
    }

    // Generic production detection
    if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
      const protocol = window.location.protocol;
      return `${protocol}//${hostname}/api/v1`;
    }
  }

  // 3. Fallback to localhost for development
  return 'http://localhost:8000/api/v1';
};

export const API_URL = getApiUrl();

console.log('Using API_URL:', API_URL);

export default API_URL;
