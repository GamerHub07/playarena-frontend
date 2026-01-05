import { Player } from '@/types/poker';
import PokerCard from './PokerCard';

export default function PlayerSlot({ player, isMe, positionClass }: { player: Player, isMe: boolean, positionClass: string }) {
    return (
        <div className={`absolute ${positionClass} flex flex-col items-center gap-2`}>
            {/* Mini Cards */}
            <div className="flex -space-x-4 mb-1">
                {player.cards.length > 0 ? (
                    player.cards.map((c, i) => <PokerCard key={i} card={c} className="scale-50 origin-bottom" />)
                ) : (
                    !player.isFolded && (
                        <>
                            <PokerCard hidden className="scale-50 origin-bottom" />
                            <PokerCard hidden className="scale-50 origin-bottom" />
                        </>
                    )
                )}
            </div>

            {/* Player Info Box */}
            <div className={`
                p-3 rounded-xl min-w-[100px] text-center border-2 transition-all
                ${player.isTurn ? 'bg-slate-800 border-emerald-400 scale-110 shadow-lg shadow-emerald-500/20' : 'bg-slate-900/90 border-slate-700'}
                ${player.isFolded ? 'opacity-50' : 'opacity-100'}
            `}>
                <div className="text-xs font-bold truncate max-w-[80px] text-slate-300">
                    {player.username} {isMe && "(You)"}
                </div>
                <div className="text-sm font-mono text-emerald-400">
                    ${player.chips}
                </div>
                {player.bet > 0 && (
                    <div className="absolute -top-6 bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/50">
                        Bet: ${player.bet}
                    </div>
                )}
            </div>
        </div>
    );
}