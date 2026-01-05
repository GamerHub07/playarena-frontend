import { PokerGameState, Player } from '@/types/poker';
import PokerCard from './PokerCard';
import PlayerSlot from './PlayerSlot';
import ActionControls from './ActionControl';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card'; // Import Card component for better UI

interface Props {
    gameState: PokerGameState;
    currentUserId?: string;
    onAction: (action: 'fold' | 'call' | 'check' | 'raise' | 'nextRound', amount?: number) => void;
}

export default function TableView({ gameState, currentUserId, onAction }: Props) {
    const me = gameState.players.find(p => p.id === currentUserId);
    const isMatchOver = gameState.players.filter(p => p.chips > 0).length === 1 && gameState.status === 'showdown';

    return (
        <div className="relative w-full h-[100dvh] overflow-hidden flex flex-col items-center justify-center p-4">

            {/* ROOM CODE DISPLAY */}
            <div className="absolute top-4 left-4 z-50 bg-black/40 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                <span className="text-slate-400 text-sm font-semibold mr-2">ROOM CODE:</span>
                <span className="text-emerald-400 font-mono text-xl tracking-widest font-bold">{gameState.roomCode}</span>
            </div>

            {/* 1. THE POKER TABLE (Oval) */}
            <div className="relative w-full max-w-[900px] aspect-[1.8/1] bg-emerald-900 rounded-[200px] border-[12px] border-slate-800 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] flex items-center justify-center mb-4">

                {/* 2. CENTER AREA (Community Cards & Pot) */}
                <div className="text-center z-10">
                    <div className="mb-4">
                        <span className="bg-black/40 px-4 py-1 rounded-full text-emerald-400 font-mono text-lg border border-emerald-500/30">
                            Total Pot: ${gameState.pot}
                        </span>
                    </div>

                    <div className="flex gap-2 justify-center">
                        {gameState.communityCards.map((card, i) => (
                            <PokerCard key={i} card={card} className="scale-90" />
                        ))}
                        {/* Empty card slots */}
                        {Array.from({ length: 5 - gameState.communityCards.length }).map((_, i) => (
                            <div key={i} className="w-12 h-16 md:w-16 md:h-24 rounded-lg border-2 border-emerald-800/50 bg-emerald-950/30" />
                        ))}
                    </div>
                </div>

                {/* 3. PLAYER SLOTS (Absolute Positioned) */}
                {gameState.players.map((player) => (
                    <PlayerSlot
                        key={player.id}
                        player={player}
                        isMe={player.id === currentUserId}
                        positionClass={getSeatPosition(player.position)}
                    />
                ))}
            </div>

            {/* 4. ACTION CONTROLS (Static Position Below Table) */}
            <div className="w-full max-w-2xl px-4 z-40 mt-2 h-24 flex items-center justify-center">
                {me?.isTurn && gameState.status !== 'showdown' ? (
                    <ActionControls
                        minBet={gameState.currentBet}
                        myChips={me.chips}
                        onAction={onAction}
                    />
                ) : (
                    <div className="text-slate-500 font-mono text-sm animate-pulse">
                        {gameState.status === 'showdown' ? 'Showdown In Progress...' : 'Waiting for other players...'}
                    </div>
                )}
            </div>

            {/* 5. WINNER / SHOWDOWN OVERLAY */}
            {gameState.status === 'showdown' && gameState.winners && (
                <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center animate-in fade-in duration-300 backdrop-blur-sm">
                    <Card className="p-8 text-center border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.2)] max-w-2xl w-full mx-4 bg-slate-900">
                        <div className="text-6xl mb-4 animate-bounce">🏆</div>
                        <h2 className="text-3xl font-bold text-yellow-500 mb-2">{isMatchOver ? 'MATCH WINNER' : 'HAND WINNER'}</h2>

                        {/* Winning Hand Reason */}
                        {gameState.winningHandDescription && (
                            <p className="text-emerald-400 font-mono text-lg mb-6 uppercase tracking-wider">
                                {gameState.winningHandDescription}
                            </p>
                        )}

                        <div className="flex flex-wrap justify-center gap-6 mb-8">
                            {gameState.winners.map(winnerId => {
                                const winner = gameState.players.find(p => p.id === winnerId);
                                if (!winner) return null;
                                return (
                                    <div key={winnerId} className="flex flex-col items-center">
                                        <h3 className="text-xl text-white font-bold mb-3">{winner.username}</h3>
                                        <div className="flex gap-2">
                                            {winner.cards?.map((card, i) => (
                                                <PokerCard key={i} card={card} size="lg" />
                                            ))}
                                            {(!winner.cards || winner.cards.length === 0) && (
                                                <span className="text-slate-500 italic">Cards hidden</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Button
                            onClick={() => onAction('nextRound')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-lg px-8 py-3 w-full max-w-xs transition-transform hover:scale-105"
                        >
                            {isMatchOver ? 'New Match' : 'Next Hand ➜'}
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
}

/**
 * Maps player position (0-7) to CSS absolute coordinates for 8 players
 */
function getSeatPosition(pos: number): string {
    const positions = [
        "bottom-[-12%] left-1/2 -translate-x-1/2", // 0: Bottom Center (Self)
        "bottom-[5%] left-[-5%]",                  // 1: Bottom Left
        "top-[40%] left-[-10%] -translate-y-1/2",  // 2: Left
        "top-[5%] left-[-5%]",                     // 3: Top Left
        "top-[-12%] left-1/2 -translate-x-1/2",    // 4: Top Center
        "top-[5%] right-[-5%]",                    // 5: Top Right
        "top-[40%] right-[-10%] -translate-y-1/2", // 6: Right
        "bottom-[5%] right-[-5%]",                 // 7: Bottom Right
    ];
    return positions[pos] || positions[0];
}