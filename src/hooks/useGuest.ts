'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Guest } from '@/types/game';
import { guestApi } from '@/lib/api';

const STORAGE_KEY = 'playarena_guest';

export function useGuest() {
    const [guest, setGuest] = useState<Guest | null>(null);
    const [loading, setLoading] = useState(true);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Verify session is still valid
                guestApi.get(parsed.sessionId)
                    .then(res => {
                        if (res.success && res.data) {
                            setGuest(res.data);
                        } else {
                            localStorage.removeItem(STORAGE_KEY);
                        }
                    })
                    .catch(() => {
                        localStorage.removeItem(STORAGE_KEY);
                    })
                    .finally(() => setLoading(false));
            } catch {
                localStorage.removeItem(STORAGE_KEY);
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (username: string): Promise<Guest | null> => {
        try {
            const res = await guestApi.create(username);
            if (res.success && res.data) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
                setGuest(res.data);
                return res.data;
            }
            return null;
        } catch {
            return null;
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setGuest(null);
    }, []);

    return { guest, loading, login, logout };
}
