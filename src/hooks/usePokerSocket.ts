import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { PokerGameState } from '@/types/poker';

export const usePokerSocket = (roomCode: string, guest: any) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [gameState, setGameState] = useState<PokerGameState | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!guest || !roomCode) return;

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
        
        const socketInstance = io(socketUrl, {
            transports: ['websocket'],
            reconnectionAttempts: 5
        });

        socketInstance.on('connect', () => {
            console.log("✅ [FRONTEND] Connected to Socket Server");
            setIsConnected(true);
            socketInstance.emit('join_poker_room', { roomCode, guest });
        });

        socketInstance.on('game_state', (data: any) => {
            console.log("📦 [FRONTEND] Received State Update", data);
            if (data && data.state) {
                setGameState(data.state);
            }
        });

        socketInstance.on('connect_error', (err) => {
            console.error("❌ [FRONTEND] Socket Connection Error:", err.message);
        });

        setSocket(socketInstance);
        return () => { socketInstance.disconnect(); };
    }, [roomCode, guest]);

    const sendAction = useCallback((action: string, data?: any) => {
        if (socket && isConnected) {
            socket.emit('poker_action', { roomCode, action, data });
        }
    }, [socket, isConnected, roomCode]);

    return { gameState, sendAction, isConnected };
};