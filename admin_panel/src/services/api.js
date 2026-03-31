import axios from 'axios';

const getDefaultApiBaseUrl = () => {
    if (typeof window === 'undefined') {
        return 'http://localhost:8080';
    }

    const { hostname, protocol } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8080';
    }

    if (hostname.startsWith('api.')) {
        return `${protocol}//${hostname}`;
    }

    const baseHost = hostname.replace(/^admin\./, '').replace(/^www\./, '');
    return `${protocol}//api.${baseHost}`;
};

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || getDefaultApiBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const getToken = () => {
    return localStorage.getItem('authToken');
};

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (payload) => api.post('/api/auth/login', payload),
    register: (payload) => api.post('/api/auth/register', payload),
    telegramLogin: (telegramData) => api.post('/api/auth/telegram', telegramData),
    logout: () => api.post('/api/auth/logout'),
    getMe: () => api.get('/api/auth/me'),
    devLogin: (payload) => api.post('/api/auth/dev-login', payload),
};

export const dashboardAPI = {
    getAdminStats: () => api.get('/api/dashboard/admin'),
    getMyStats: () => api.get('/api/dashboard/me'),
};

export const userAPI = {
    getAll: (deleted = false) => api.get(`/api/user?deleted=${deleted}`),
    getAdminList: () => api.get('/api/user/admin-list'),
    getById: (id) => api.get(`/api/user/${id}`),
    create: (userData) => api.post('/api/user', userData),
    update: (id, userData) => api.put(`/api/user/${id}`, userData),
    delete: (id) => api.delete(`/api/user/${id}`),
    forceDelete: (id) => api.delete(`/api/user/force/${id}`),
    block: (id) => api.patch(`/api/user/${id}/block`),
    unblock: (id) => api.patch(`/api/user/${id}/unblock`),
};

export const mappingAreaAPI = {
    getAll: (deleted = false) => api.get(`/api/mapping-area?deleted=${deleted}`),
    getByUser: (userId, deleted = false) =>
        api.get(`/api/mapping-area/user/${userId}?deleted=${deleted}`),
    getById: (id) => api.get(`/api/mapping-area/${id}`),
    create: (areaData) => api.post('/api/mapping-area', areaData),
    update: (id, areaData) => api.put(`/api/mapping-area/${id}`, areaData),
    delete: (id) => api.delete(`/api/mapping-area/${id}`),
    forceDelete: (id) => api.delete(`/api/mapping-area/force/${id}`),
};

export const floorAPI = {
    getByArea: (areaId, deleted = false) =>
        api.get(`/api/floor/area/${areaId}?deleted=${deleted}`),
    getById: (id) => api.get(`/api/floor/${id}`),
    create: (floorData) => api.post('/api/floor', floorData),
    update: (id, floorData) => api.put(`/api/floor/${id}`, floorData),
    delete: (id) => api.delete(`/api/floor/${id}`),
    forceDelete: (id) => api.delete(`/api/floor/force/${id}`),
};

export const fulcrumAPI = {
    getByFloor: (floorId) => api.get(`/api/fulcrum/floor/${floorId}`),
    getByArea: (areaId, deleted = false) =>
        api.get(`/api/fulcrum/area/${areaId}?deleted=${deleted}`),
    getQrAvailability: (areaIds = []) =>
        api.get('/api/fulcrum/qr-availability', {
            params: { areaIds: areaIds.join(',') }
        }),
    getById: (id) => api.get(`/api/fulcrum/${id}`),
    create: (fulcrumData) => api.post('/api/fulcrum', fulcrumData),
    update: (id, fulcrumData) => api.put(`/api/fulcrum/${id}`, fulcrumData),
    delete: (id) => api.delete(`/api/fulcrum/${id}`),
    forceDelete: (id) => api.delete(`/api/fulcrum/force/${id}`),
    addConnection: (id, connectionData) =>
        api.post(`/api/fulcrum/${id}/connection`, connectionData),
    removeConnection: (id, connectedId) =>
        api.delete(`/api/fulcrum/${id}/connection/${connectedId}`),
};

export default api;
