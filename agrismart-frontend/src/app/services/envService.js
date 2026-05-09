// Environment helpers for client-side config (Vite exposes only vars prefixed with VITE_)
export const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
// Secret should stay on the server; included only for completeness if ever needed in dev builds
export const RAZORPAY_KEY_SECRET = import.meta.env.VITE_RAZORPAY_KEY_SECRET;
