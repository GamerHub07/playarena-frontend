import axios from 'axios';
import { Guest, Room, ApiResponse } from '@/types/game';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor for auth token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const authApi = {
    register: async (userData: any) => {
        const { data } = await api.post('/auth/register', userData);
        return data;
    },
    login: async (creds: any) => {
        const { data } = await api.post('/auth/login', creds);
        return data;
    },
    getProfile: async () => {
        const { data } = await api.get('/auth/profile');
        return data;
    }
};

export const guestApi = {
    create: async (username: string): Promise<ApiResponse<Guest>> => {
        const { data } = await api.post('/guest', { username });
        return data;
    },

    get: async (sessionId: string): Promise<ApiResponse<Guest>> => {
        const { data } = await api.get(`/guest/${sessionId}`);
        return data;
    },
};

export const roomApi = {
    create: async (sessionId: string, gameType: string): Promise<ApiResponse<Room>> => {
        const { data } = await api.post('/rooms', { sessionId, gameType });
        return data;
    },

    get: async (code: string): Promise<ApiResponse<Room>> => {
        const { data } = await api.get(`/rooms/${code}`);
        return data;
    },

    join: async (code: string, sessionId: string): Promise<ApiResponse<Room>> => {
        const { data } = await api.post(`/rooms/${code}/join`, { sessionId });
        return data;
    },
};

export default api;
