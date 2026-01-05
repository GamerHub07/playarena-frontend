import { PokerGameState } from '@/types/poker';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Copy, Users } from 'lucide-react'; // If you have lucide-react installed

interface Props {
    gameState: PokerGameState;
    isHost: boolean;
    onStart: () => void;
}

export default function LobbyView({ gameState, isHost, onStart }: Props) {
    const maxPlayers = 6;
    const currentPlayers = gameState.players.length;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(gameState.roomCode);
        // You could add a toast notification here
    };

    return (
        <div className="max-w-md mx-auto pt-24 px-4">
            <Card className="p-8 bg-slate-900 border-slate-800 shadow-2xl relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full" />
                
                <div className="text-center mb-8 relative">
                    <h2 className="text-slate-500 text-xs uppercase tracking-[0.2em] mb-2">Entry Code</h2>
                    <div className="flex items-center justify-center gap-3">
                        <div className="text-4xl font-mono font-bold text-emerald-400 tracking-wider">
                            {gameState.roomCode}
                        </div>
                        <button 
                            onClick={copyToClipboard}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-emerald-400"
                        >
                            <Copy size={18} />
                        </button>
                    </div>
                </div>

                <div className="space-y-3 mb-10 relative">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                            <Users size={14} />
                            Players
                        </h3>
                        <span className="text-xs font-mono text-slate-500">
                            {currentPlayers} / {maxPlayers}
                        </span>
                    </div>

                    <div className="grid gap-2">
                        {gameState.players.map((player) => (
                            <div 
                                key={player.sessionId || player.id} 
                                className="flex justify-between items-center p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                    <span className="font-medium text-slate-200">{player.username}</span>
                                    {player.isHost && (
                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                                            HOST
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-slate-500 font-mono">${player.chips}</span>
                            </div>
                        ))}
                        
                        {/* Empty Slots */}
                        {Array.from({ length: maxPlayers - currentPlayers }).map((_, i) => (
                            <div key={`empty-${i}`} className="p-4 border border-dashed border-slate-800/60 rounded-xl text-slate-700 text-sm text-center italic">
                                Open Seat
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {isHost ? (
                        <Button 
                            onClick={onStart} 
                            className="w-full bg-emerald-600 hover:bg-emerald-500 py-6 text-lg font-bold shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]"
                            disabled={currentPlayers < 2}
                        >
                            {currentPlayers < 2 ? 'Awaiting Players...' : 'Deal Cards'}
                        </Button>
                    ) : (
                        <div className="text-center py-4 bg-slate-800/30 rounded-xl border border-slate-800">
                            <p className="text-slate-400 text-sm animate-pulse">Host is preparing the deck...</p>
                        </div>
                    )}
                    
                    <div className="flex flex-col items-center gap-1">
                         <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                            Texas Hold'em • No Limit
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-emerald-500/70 font-mono">
                            <span>Blinds: {gameState.smallBlind}/{gameState.bigBlind}</span>
                            <span>•</span>
                            <span>Min Buy-in: ${gameState.bigBlind * 100}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}