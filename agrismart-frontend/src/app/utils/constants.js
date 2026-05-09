/**
 * Application constants
 */
export const APP_NAME = 'AgriSmart';
export const APP_DESCRIPTION = 'Smart Agriculture Platform';
export const APP_VERSION = '1.0.0';
/**
 * API Configuration
 */
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:1212',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
};
/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
    TOKEN: 'agrismart_token',
    USER: 'agrismart_user',
    THEME: 'theme',
    LANGUAGE: 'language',
};
/**
 * Routes
 */
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    DASHBOARD: '/dashboard',
    CROPS: '/crops',
    ORDERS: '/orders',
    SHIPMENTS: '/shipments',
    WEATHER: '/weather',
    PRICES: '/prices',
    DISEASE: '/disease',
    CHATBOT: '/chatbot',
    PROFILE: '/profile',
};
/**
 * User Roles
 */
export const USER_ROLES = {
    FARMER: 'farmer',
    BUYER: 'buyer',
    ADMIN: 'admin',
};
/**
 * Crop Status
 */
export const CROP_STATUS = {
    GROWING: 'growing',
    HARVESTED: 'harvested',
    SOLD: 'sold',
};
/**
 * Order Status
 */
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
};
/**
 * Shipment Status
 */
export const SHIPMENT_STATUS = {
    PENDING: 'pending',
    IN_TRANSIT: 'in_transit',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
};
/**
 * Disease Severity Levels
 */
export const DISEASE_SEVERITY = {
    LOW: 'low',
    MODERATE: 'moderate',
    HIGH: 'high',
    CRITICAL: 'critical',
};
/**
 * Pagination
 */
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};
/**
 * Date Formats
 */
export const DATE_FORMATS = {
    FULL: 'MMMM DD, YYYY',
    SHORT: 'MMM DD, YYYY',
    TIME: 'HH:mm:ss',
    DATETIME: 'MMMM DD, YYYY HH:mm',
};
/**
 * Supported Units
 */
export const UNITS = {
    WEIGHT: ['kg', 'ton', 'quintal', 'pound'],
    TEMPERATURE: ['celsius', 'fahrenheit'],
    AREA: ['acre', 'hectare', 'sqft'],
};
/**
 * File Upload
 */
export const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ACCEPTED_FORMATS: ['image/jpeg', 'image/png', 'image/jpg'],
};
/**
 * Weather Icons Mapping
 */
export const WEATHER_ICONS = {
    sunny: '☀️',
    'partly-cloudy': '⛅',
    cloudy: '☁️',
    rainy: '🌧️',
    stormy: '⛈️',
    snowy: '❄️',
};
/**
 * Chart Colors
 */
export const CHART_COLORS = {
    PRIMARY: '#16a34a',
    SECONDARY: '#84cc16',
    TERTIARY: '#22c55e',
    QUATERNARY: '#eab308',
    QUINARY: '#f59e0b',
};
/**
 * Breakpoints (matches Tailwind)
 */
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
};
/**
 * Toast Configuration
 */
export const TOAST_CONFIG = {
    DURATION: 3000,
    POSITION: 'top-right',
};
/**
 * Regex Patterns
 */
export const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[6-9]\d{9}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
};
/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Unauthorized. Please login again.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'Resource not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
};
/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
    LOGIN: 'Login successful!',
    LOGOUT: 'Logged out successfully.',
    SIGNUP: 'Account created successfully!',
    UPDATE: 'Updated successfully!',
    DELETE: 'Deleted successfully!',
    CREATE: 'Created successfully!',
};
