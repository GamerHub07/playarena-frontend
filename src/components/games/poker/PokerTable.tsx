import { PokerState } from "@/types/poker";

export default function PokerTable({
  gameState,
  mySessionId,
  onAction,
}: {
  gameState: PokerState;
  mySessionId: string;
  onAction: (action: string, data?: any) => void;
}) {
  const myIndex = gameState.players.findIndex(
    p => p.sessionId === mySessionId
  );

  return (
    <div className="p-6 text-white">
      <h2 className="text-center mb-4">Pot: {gameState.pot}</h2>

      <div className="flex justify-center gap-2 mb-6">
        {gameState.communityCards.map((c, i) => (
          <div key={i} className="w-14 h-20 bg-white text-black flex items-center justify-center">
            {c}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {gameState.players.map((p, i) => (
          <div
            key={p.sessionId}
            className={`p-4 border ${
              i === gameState.currentTurn ? "border-yellow-400" : "border-gray-700"
            }`}
          >
            <p>{p.username}{p.sessionId === mySessionId && " (You)"}</p>
            <p>Chips: {p.chips}</p>
            <p>Status: {p.status}</p>
          </div>
        ))}
      </div>

      {myIndex === gameState.currentTurn && (
        <div className="flex gap-3 justify-center">
          <button onClick={() => onAction("fold")}>Fold</button>
          <button onClick={() => onAction("call")}>Call</button>
          <button onClick={() => onAction("raise", { amount: 100 })}>Raise</button>
        </div>
      )}
    </div>
  );
}
