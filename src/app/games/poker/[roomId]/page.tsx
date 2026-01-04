"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useGuest } from "@/hooks/useGuest";
import { useSocket } from "@/hooks/useSocket";
import PokerTable from "@/components/games/poker/PokerTable";
import WaitingRoom from "@/components/games/poker/WaitingRoom";
import Header from "@/components/layout/Header";
import { PokerState } from "@/types/poker";

export default function PokerRoomPage() {
  const { roomId } = useParams();
  const roomCode = String(roomId).toUpperCase();
  const { guest } = useGuest();
  const { emit, on, isConnected } = useSocket();

  const [roomStatus, setRoomStatus] = useState<"waiting" | "playing">("waiting");
  const [gameState, setGameState] = useState<PokerState | null>(null);

  useEffect(() => {
    if (!guest || !isConnected) return;

    emit("room:join", {
      roomCode,
      sessionId: guest.sessionId,
      username: guest.username,
    });

    const unsubStart = on("game:start", (p: any) => {
      setGameState(p.state);
      setRoomStatus("playing");
    });

    const unsubState = on("game:state", (p: any) => {
      setGameState(p.state);
    });

    return () => {
      unsubStart();
      unsubState();
    };
  }, [guest, isConnected]);

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {roomStatus === "waiting" && (
        <WaitingRoom
          roomCode={roomCode}
          onStart={() => emit("game:start", { roomCode })}
          players={[]}
          isHost
          minPlayers={2}
          maxPlayers={6}
          onLeave={() => {}}
        />
      )}

      {roomStatus === "playing" && gameState && guest && (
        <PokerTable
          gameState={gameState}
          mySessionId={guest.sessionId}
          onAction={(action, data) =>
            emit("game:action", { roomCode, action, data })
          }
        />
      )}
    </div>
  );
}
