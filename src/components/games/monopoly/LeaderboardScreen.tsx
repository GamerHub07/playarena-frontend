'use client';
import React from 'react';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { GiTrophy, GiLaurelsTrophy } from 'react-icons/gi';
import { FaMedal } from 'react-icons/fa';

interface LeaderboardEntry {
    username: string;
    rank: number;
}

interface LeaderboardScreenProps {
    winner: { username: string; } | null;
    leaderboard?: LeaderboardEntry[];
    onHub: () => void;
}

export default function LeaderboardScreen({ winner, leaderboard, onHub }: LeaderboardScreenProps) {
    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-[#1a1a1a] border-4 border-[#333] rounded-2xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
                        {/* Background texture matching Ludo's feel but for Monopoly */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" 
                             style={{backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

                        <div className="flex justify-center mb-4">
                            <GiTrophy className="text-7xl text-yellow-500 animate-bounce drop-shadow-lg" />
                        </div>
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-sm">
                            Game Over!
                        </h2>
                        
                        <div className="py-2 space-y-2 relative z-10">
                            <p className="text-gray-400 text-lg">The winner is</p>
                            <p className="text-3xl font-bold text-white tracking-wider">{winner?.username || 'Unknown'}</p>
                        </div>

                        {/* Full Leaderboard */}
                        {leaderboard && leaderboard.length > 0 && (
                            <div className="bg-[#2a2a2a]/80 backdrop-blur rounded-xl p-4 w-full border border-white/10 relative z-10">
                                <h3 className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-widest">Final Standings</h3>
                                <div className="space-y-2">
                                    {leaderboard.map((player) => (
                                        <div key={player.rank} className={`flex justify-between items-center p-3 rounded-lg border ${player.rank === 1 ? 'bg-yellow-900/20 border-yellow-600/50' : 'bg-[#1f1f1f] border-transparent'}`}>
                                            <div className="flex items-center gap-3">
                                                <span className={`
                                                    w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shadow-lg
                                                    ${player.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' : 
                                                      player.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' : 
                                                      player.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-white' : 'bg-gray-700 text-gray-300'}
                                                `}>
                                                    {player.rank}
                                                </span>
                                                <span className={`font-medium ${player.rank === 1 ? 'text-yellow-400' : 'text-white'}`}>{player.username}</span>
                                            </div>
                                            {player.rank === 1 && <FaMedal className="text-2xl text-yellow-500" />}
                                            {player.rank === 2 && <FaMedal className="text-2xl text-gray-400" />}
                                            {player.rank === 3 && <FaMedal className="text-2xl text-orange-600" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-4 relative z-10">
                            <Button 
                                onClick={onHub}
                                className="w-full h-12 text-lg font-semibold transition-all hover:scale-105 shadow-lg"
                                style={{
                                    background: 'linear-gradient(145deg, #16a34a 0%, #15803d 100%)',
                                    border: '2px solid #22c55e',
                                }}
                            >
                                Back to Lobby
                            </Button>
                        </div>
                    </div>
                </div>
        </div>
    );
}
