'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import { useGuest } from '@/hooks/useGuest';
import { useAuth } from '@/contexts/AuthContext';
import { roomApi } from '@/lib/api';

export default function TicTacToePage() {
    const router = useRouter();
    const { guest, loading: guestLoading, login } = useGuest();
    const { user } = useAuth();

    const [username, setUsername] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);

    const handleLogin = async () => {
        if (!username.trim() || username.length < 2) {
            setError('Username must be at least 2 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await login(username.trim());
            if (!result) {
                setError('Failed to create session');
            }
        } catch {
            setError('Failed to create session');
        }

        setLoading(false);
    };

    const handleCreateRoom = async (sessionId?: string) => {
        const sid = sessionId || guest?.sessionId;
        if (!sid) {
            setError('Please enter a username first');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await roomApi.create(sid, 'tictactoe');
            if (res.success && res.data) {
                router.push(`/games/tictactoe/${res.data.code}`);
            } else {
                setError(res.message || 'Failed to create room');
            }
        } catch {
            setError('Failed to create room');
        }

        setLoading(false);
    };

    const handleJoinRoom = async () => {
        if (!roomCode.trim() || roomCode.length !== 6) {
            setError('Please enter a valid 6-character room code');
            return;
        }

        const sessionId = guest?.sessionId;
        if (!sessionId) {
            setError('Please enter a username first');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await roomApi.join(roomCode.toUpperCase(), sessionId);
            if (res.success && res.data) {
                router.push(`/games/tictactoe/${res.data.code}`);
            } else {
                setError(res.message || 'Failed to join room');
            }
        } catch {
            setError('Room not found or full');
        }

        setLoading(false);
        setShowJoinModal(false);
    };

    const openJoinModal = () => {
        setRoomCode('');
        setError('');
        setShowJoinModal(true);
    };

    if (guestLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Header />

            <main className="pt-24 pb-12 px-4">
                <div className="max-w-md mx-auto">
                    {/* Title */}
                    <div className="text-center mb-12">
                        <div className="flex justify-center gap-4 mb-6">
                            <span className="text-6xl font-bold text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.5)]">X</span>
                            <span className="text-6xl font-bold text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,0.5)]">O</span>
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2">Tic Tac Toe</h1>
                        <p className="text-slate-400">Classic game of X and O</p>
                    </div>

                    {/* Login or Play Section */}
                    <Card className="p-8 bg-slate-800/50 border-slate-700">
                        {!guest ? (
                            // Login Form
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white text-center mb-6">
                                    Enter Your Name
                                </h2>
                                <Input
                                    placeholder="Your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                    maxLength={20}
                                />
                                {error && (
                                    <p className="text-red-400 text-sm text-center">{error}</p>
                                )}
                                <Button
                                    variant="primary"
                                    onClick={handleLogin}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading ? 'Loading...' : 'Continue'}
                                </Button>
                            </div>
                        ) : (
                            // Play Options
                            <div className="space-y-4">
                                <div className="text-center mb-6">
                                    <p className="text-slate-400 text-sm">Playing as</p>
                                    <p className="text-white font-bold text-xl">{guest.username}</p>
                                </div>

                                {error && (
                                    <p className="text-red-400 text-sm text-center mb-4">{error}</p>
                                )}

                                <Button
                                    variant="primary"
                                    onClick={() => handleCreateRoom()}
                                    disabled={loading}
                                    className="w-full text-lg py-4"
                                >
                                    🎮 Create Room
                                </Button>

                                <Button
                                    variant="secondary"
                                    onClick={openJoinModal}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    🔗 Join Room
                                </Button>
                            </div>
                        )}
                    </Card>

                    {/* Game Info */}
                    <div className="mt-8 text-center text-slate-500 text-sm">
                        <p>2 Players • Quick Matches • No Registration Required</p>
                    </div>
                </div>
            </main>

            {/* Join Room Modal */}
            <Modal
                isOpen={showJoinModal}
                onClose={() => setShowJoinModal(false)}
                title="Join Room"
            >
                <div className="space-y-4">
                    <Input
                        placeholder="Enter room code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                        maxLength={6}
                        className="text-center text-2xl font-mono tracking-widest"
                    />
                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setShowJoinModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleJoinRoom}
                            disabled={loading || roomCode.length !== 6}
                            className="flex-1"
                        >
                            {loading ? 'Joining...' : 'Join'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
