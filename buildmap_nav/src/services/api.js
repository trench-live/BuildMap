import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Только необходимые методы для карты
export const floorAPI = {
    getById: (id) => api.get(`/api/floor/${id}`),
    getByFulcrumId: (id) => api.get(`/api/floor/fulcrum/${id}`),
};

export const fulcrumAPI = {
    getById: (id) => api.get(`/api/fulcrum/${id}`),
    getByFloor: (floorId) => api.get(`/api/fulcrum/floor/${floorId}`),
};

export const navigationAPI = {
    findPath: (routeRequest) => api.post('/api/navigation/path', routeRequest),
};