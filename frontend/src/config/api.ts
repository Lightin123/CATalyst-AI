/**
 * API configuration for CATalyst AI frontend.
 *
 * In development: defaults to http://localhost:5000
 * In production:  uses VITE_API_URL environment variable (set in Render dashboard)
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
