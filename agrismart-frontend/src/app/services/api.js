import axios from 'axios';
// Use relative base URL so requests go through the Vite dev proxy (/api → localhost:5000).
// This avoids CORS issues regardless of which port the dev server runs on.
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('agrismart_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// Response interceptor for error handling
apiClient.interceptors.response.use((response) => response, (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthRequest = url.includes('/api/auth/');

    // For protected routes, force logout on 401. Allow auth endpoints to surface errors without a page reload.
    if (status === 401 && !isAuthRequest && localStorage.getItem('agrismart_token')) {
        localStorage.removeItem('agrismart_token');
        localStorage.removeItem('agrismart_user');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
// Auth Service
export const authService = {
    login: (data) => apiClient.post('/api/auth/login', data),
    register: (data) => apiClient.post('/api/auth/signup', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
// User Service
export const userService = {
    getProfile: () => apiClient.get('/api/users/me'),
    updateProfile: (data) => apiClient.patch('/api/users/me', data),
    uploadProfileImage: (data) => apiClient.patch('/api/users/upload-profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
// Crop Service
export const cropService = {
    getAllCrops: () => apiClient.get('/api/crops'),
    getCropById: (id) => apiClient.get(`/api/crops/${id}`),
    createCrop: (data) => apiClient.post('/api/crops', data),
    updateCrop: (id, data) => apiClient.put(`/api/crops/${id}`, data),
    deleteCrop: (id) => apiClient.delete(`/api/crops/${id}`),
};
// Order Service
export const orderService = {
    getAllOrders: () => apiClient.get('/api/orders'),
    getOrderById: (id) => apiClient.get(`/api/orders/${id}`),
    createOrder: (data) => apiClient.post('/api/orders', data),
    updateOrderStatus: (id, status) => apiClient.patch(`/api/orders/${id}/status`, { status }),
};
// Shipment Service
export const shipmentService = {
    getAllShipments: () => apiClient.get('/api/shipments'),
    getShipmentById: (id) => apiClient.get(`/api/shipments/${id}`),
    updateShipmentStatus: (id, data) => apiClient.patch(`/api/shipments/${id}/status`, data),
};
// Weather Service
export const weatherService = {
    getCurrentWeather: (lat, lng) => apiClient.get('/api/weather/current', { params: { lat, lng } }),
    getLatestWeather: () => apiClient.get('/api/weather/latest'),
};
// Price Service
export const priceService = {
    getLatestPrices: (cropName, limit) => apiClient.get('/api/prices', { params: { cropName, limit } }),
    // Route predict through backend — never call the ML server directly from the browser
    predictPrice: (data) => apiClient.post('/api/prices/predict', data),
};
// Disease Detection Service
export const diseaseService = {
    detectDisease: (data) => apiClient.post('/api/disease/detect', data),
    getDiseaseHistory: () => apiClient.get('/api/disease/my'),
};
// Chatbot Service
export const chatbotService = {
    ask: (message, language) => apiClient.post('/api/chatbot/ask', { message, language }),
};
export default apiClient;
