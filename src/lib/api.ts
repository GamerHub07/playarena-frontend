import axios from 'axios';
import { Guest, Room, ApiResponse } from '@/types/game';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
