import axios from 'axios';

// Normalize API base to always include the /api prefix (backend expects it)
const rawBaseURL = import.meta.env.VITE_API_URL || '/api';
const trimmedBaseURL = rawBaseURL.replace(/\/+$/, '');
const baseURL = trimmedBaseURL.endsWith('/api') ? trimmedBaseURL : `${trimmedBaseURL}/api`;

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
