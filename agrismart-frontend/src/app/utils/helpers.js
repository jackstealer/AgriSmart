/**
 * Utility functions for AgriSmart application
 */
/**
 * Format currency to Indian Rupees
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};
/**
 * Format date to readable string
 */
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};
/**
 * Format date to short string
 */
export const formatShortDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
    });
};
/**
 * Calculate days until date
 */
export const daysUntil = (date) => {
    const targetDate = new Date(date);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
/**
 * Get status badge variant
 */
export const getStatusVariant = (status) => {
    const statusMap = {
        growing: 'default',
        harvested: 'secondary',
        sold: 'outline',
        pending: 'outline',
        confirmed: 'default',
        shipped: 'secondary',
        delivered: 'outline',
        cancelled: 'destructive',
    };
    return statusMap[status.toLowerCase()] || 'outline';
};
/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength)
        return text;
    return text.substring(0, maxLength) + '...';
};
/**
 * Generate random ID
 */
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
/**
 * Validate email format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
/**
 * Validate phone number (Indian format)
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};
/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (oldValue, newValue) => {
    if (oldValue === 0)
        return 0;
    return ((newValue - oldValue) / oldValue) * 100;
};
/**
 * Get greeting based on time of day
 */
export const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12)
        return 'Good Morning';
    if (hour < 17)
        return 'Good Afternoon';
    return 'Good Evening';
};
/**
 * Debounce function
 */
export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
/**
 * Storage utilities
 */
export const storage = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        }
        catch {
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        }
        catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },
    remove: (key) => {
        localStorage.removeItem(key);
    },
    clear: () => {
        localStorage.clear();
    },
};
