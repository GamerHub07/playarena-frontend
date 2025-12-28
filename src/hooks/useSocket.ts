'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket } from '@/lib/socket';

export function useSocket() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const s = connectSocket();

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        s.on('connect', onConnect);
        s.on('disconnect', onDisconnect);

        // Set socket after listeners are attached
        setSocket(s);

        // Check initial state
        if (s.connected) {
            setIsConnected(true);
        }

        return () => {
            s.off('connect', onConnect);
            s.off('disconnect', onDisconnect);
            disconnectSocket();
        };
    }, []);

    const emit = useCallback((event: string, data: unknown) => {
        socket?.emit(event, data);
    }, [socket]);

    const on = useCallback((event: string, callback: (...args: unknown[]) => void) => {
        socket?.on(event, callback);
        return () => {
            socket?.off(event, callback);
        };
    }, [socket]);

    return useMemo(() => ({ socket, isConnected, emit, on }), [socket, isConnected, emit, on]);
}
