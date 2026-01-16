import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Получаем токен из localStorage
const getToken = () => {
    return localStorage.getItem('authToken');
};

// Интерцептор для добавления токена к запросам
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🚀 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
});

// Обработка ошибок
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Если токен невалидный, разлогиниваем пользователя
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        console.error('❌ API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// API методы для аутентификации
export const authAPI = {
    telegramLogin: (telegramData) => api.post('/api/auth/telegram', telegramData),
    logout: () => api.post('/api/auth/logout'),
    getMe: () => api.get('/api/auth/me'),
    devLogin: (payload) => api.post('/api/auth/dev-login', payload),
};

// Остальные API методы остаются без изменений
export const userAPI = {
    getAll: (deleted = false) => api.get(`/api/user?deleted=${deleted}`),
    getById: (id) => api.get(`/api/user/${id}`),
    create: (userData) => api.post('/api/user', userData),
    update: (id, userData) => api.put(`/api/user/${id}`, userData),
    delete: (id) => api.delete(`/api/user/${id}`),
    forceDelete: (id) => api.delete(`/api/user/force/${id}`),
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
    getByArea: (areaId) => api.get(`/api/fulcrum/area/${areaId}`),
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
