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
    getByArea: (areaId, deleted = false) =>
        api.get(`/api/floor/area/${areaId}?deleted=${deleted}`),
};

export const fulcrumAPI = {
    getById: (id) => api.get(`/api/fulcrum/${id}`),
    getByFloor: (floorId) => api.get(`/api/fulcrum/floor/${floorId}`),
    getByArea: (areaId, deleted = false) =>
        api.get(`/api/fulcrum/area/${areaId}?deleted=${deleted}`),
};

export const navigationAPI = {
    findPath: (routeRequest) => api.post('/api/navigation/path', routeRequest),
};
