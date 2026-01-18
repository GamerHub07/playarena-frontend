'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import { useGuest } from '@/hooks/useGuest';
import { roomApi } from '@/lib/api';

export default function ChessPage() {
    const router = useRouter();
    const { guest, loading, login } = useGuest();

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [username, setUsername] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pendingAction, setPendingAction] = useState<'create' | 'join' | null>(null);

    // ─────────────────────────────────────────
    // AUTH
    // ─────────────────────────────────────────

    const handleLogin = async () => {
        if (!username.trim() || username.length < 2) {
            setError('Username must be at least 2 characters');
            return;
        }

        setIsLoading(true);
        setError('');

        const result = await login(username.trim());
        setIsLoading(false);

        if (result) {
            setShowLoginModal(false);

            if (pendingAction === 'create') {
                handleCreateRoom(result.sessionId);
            } else if (pendingAction === 'join') {
                setShowJoinModal(true);
            }

            setPendingAction(null);
        } else {
            setError('Failed to create session');
        }
    };

    // ─────────────────────────────────────────
    // CREATE ROOM (CHESS)
    // ─────────────────────────────────────────

    const handleCreateRoom = async (sessionId?: string) => {
        const sid = sessionId || guest?.sessionId;

        if (!sid) {
            setPendingAction('create');
            setShowLoginModal(true);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await roomApi.create(sid, 'chess');
            if (res.success && res.data) {
                router.push(`/games/chess/${res.data.code}`);
            } else {
                setError(res.message || 'Failed to create room');
            }
        } catch {
            setError('Failed to create room');
        }

        setIsLoading(false);
    };

    // ─────────────────────────────────────────
    // JOIN ROOM
    // ─────────────────────────────────────────

    const handleJoinRoom = async () => {
        if (!guest) {
            setPendingAction('join');
            setShowLoginModal(true);
            return;
        }

        if (!roomCode.trim() || roomCode.length !== 6) {
            setError('Enter a valid 6-character room code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await roomApi.join(roomCode.toUpperCase(), guest.sessionId);
            if (res.success && res.data) {
                router.push(`/games/chess/${res.data.code}`);
            } else {
                setError(res.message || 'Room not found');
            }
        } catch {
            setError('Failed to join room');
        }

        setIsLoading(false);
    };

    const openJoinModal = () => {
        if (!guest) {
            setPendingAction('join');
            setShowLoginModal(true);
        } else {
            setShowJoinModal(true);
        }
    };

    // ─────────────────────────────────────────
    // LOADING
    // ─────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
            </div>
        );
    }

    // ─────────────────────────────────────────
    // UI
    // ─────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            <Header />

            <main className="pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto">

                    {/* Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">
                            Chess
                        </h1>
                        <p className="text-[var(--text-muted)] max-w-md mx-auto">
                            Classic 2-player strategy game. Outsmart your opponent and deliver checkmate.
                        </p>
                    </div>

                    {/* Action Cards */}
                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <Card className="p-8 text-center">
                            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                ♟️
                            </div>
                            <h2 className="text-xl font-semibold text-[var(--text)] mb-2">
                                Create Room
                            </h2>
                            <p className="text-sm text-[var(--text-muted)] mb-6">
                                Start a new chess match and invite a friend
                            </p>
                            <Button
                                onClick={() => handleCreateRoom()}
                                loading={isLoading && pendingAction === 'create'}
                                className="w-full"
                            >
                                Create Room
                            </Button>
                        </Card>

                        <Card className="p-8 text-center">
                            <div className="w-16 h-16 bg-[var(--success)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                🤝
                            </div>
                            <h2 className="text-xl font-semibold text-[var(--text)] mb-2">
                                Join Room
                            </h2>
                            <p className="text-sm text-[var(--text-muted)] mb-6">
                                Enter a room code to join an existing match
                            </p>
                            <Button
                                variant="secondary"
                                onClick={openJoinModal}
                                className="w-full"
                            >
                                Join Room
                            </Button>
                        </Card>
                    </div>

                    {/* Rules */}
                    <div className="mt-16 max-w-2xl mx-auto">
                        <h3 className="text-xl font-semibold text-[var(--text)] mb-6 text-center">
                            How to Play Chess
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { icon: '♙', text: 'Each player controls 16 pieces' },
                                { icon: '🔁', text: 'Players take turns moving one piece' },
                                { icon: '⚔️', text: 'Capture opponent pieces strategically' },
                                { icon: '♚', text: 'Checkmate the king to win the game' },
                            ].map((rule, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-4 bg-[#1a1a1a] border border-[var(--border)] rounded-lg"
                                >
                                    <span className="text-2xl">{rule.icon}</span>
                                    <span className="text-sm text-[var(--text-muted)]">
                                        {rule.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
{/* chut */}
            {/* Login Modal */}
            <Modal
                isOpen={showLoginModal}
                onClose={() => {
                    setShowLoginModal(false);
                    setPendingAction(null);
                    setError('');
                }}
                title="Enter Your Name"
                size="sm"
            >
                <div className="space-y-4">
                    <Input
                        placeholder="Your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        error={error}
                        autoFocus
                    />
                    <Button onClick={handleLogin} loading={isLoading} className="w-full">
                        Continue
                    </Button>
                </div>
            </Modal>

            {/* Join Modal */}
            <Modal
                isOpen={showJoinModal}
                onClose={() => {
                    setShowJoinModal(false);
                    setRoomCode('');
                    setError('');
                }}
                title="Join Chess Room"
                size="sm"
            >
                <div className="space-y-4">
                    <Input
                        placeholder="Enter room code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                        error={error}
                        maxLength={6}
                        className="text-center text-2xl tracking-widest font-mono"
                        autoFocus
                    />
                    <Button onClick={handleJoinRoom} loading={isLoading} className="w-full">
                        Join Game
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
