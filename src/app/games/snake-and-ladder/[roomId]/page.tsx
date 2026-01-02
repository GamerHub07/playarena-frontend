"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import WaitingRoom from "@/components/games/ludo/WaitingRoom";
import Card from "@/components/ui/Card";
import Dice from "@/components/games/ludo/Dice";
import { useGuest } from "@/hooks/useGuest";
import { useSocket } from "@/hooks/useSocket";
import { roomApi } from "@/lib/api";
import { Room, Player } from "@/types/game";
import { SnakeAndLadderState } from "@/types/snakeAndLadder";
import Board from "@/components/games/snakeAndLadder/Board";

export default function SnakeAndLadderRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params.roomId as string).toUpperCase();

  const { guest, loading: guestLoading } = useGuest();
  const { isConnected, emit, on } = useSocket();

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<SnakeAndLadderState | null>(null);
  const [loading, setLoading] = useState(true);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState("");

  const myPlayerIndex = players.findIndex(
    (p) => p.sessionId === guest?.sessionId
  );
  const isHost = players.find((p) => p.sessionId === guest?.sessionId)?.isHost;

  /* ------------------ Fetch room ------------------ */
  useEffect(() => {
    if (guestLoading) return;
    if (!guest) {
      router.push("/games/snake-and-ladder");
      return;
    }

    roomApi
      .get(roomCode)
      .then((res) => {
        if (res.success && res.data) {
          setRoom(res.data);
          setPlayers(res.data.players);
        } else {
          setError("Room not found");
        }
      })
      .catch(() => setError("Failed to load room"))
      .finally(() => setLoading(false));
  }, [guest, guestLoading, roomCode, router]);

  /* ------------------ Socket listeners ------------------ */
  useEffect(() => {
    if (!guest || !isConnected) return;

    const offRoom = on("room:update", (data: any) => {
      setPlayers(data.players);
      setRoom((prev) => (prev ? { ...prev, status: data.status } : null));
    });

    const offStart = on("game:start", (data: any) => {
      setGameState(data.state);
      setRoom((prev) => (prev ? { ...prev, status: "playing" } : null));
    });

    const offState = on("game:state", (data: any) => {
      setGameState(data.state);
      setRolling(false);
    });

    const offWinner = on("game:winner", () => {
      setRoom((prev) => (prev ? { ...prev, status: "finished" } : null));
    });

    const offError = on("error", (data: any) => {
      setError(data.message);
      setRolling(false);
      setTimeout(() => setError(""), 3000);
    });

    return () => {
      offRoom();
      offStart();
      offState();
      offWinner();
      offError();
    };
  }, [guest, isConnected, on]);

  /* ------------------ Join / Leave room ------------------ */
  useEffect(() => {
    if (!guest || !isConnected || loading) return;

    emit("room:join", {
      roomCode,
      sessionId: guest.sessionId,
      username: guest.username,
    });

    return () => {
      emit("room:leave", {});
    };
  }, [guest, isConnected, loading, roomCode, emit]);

  /* ------------------ Actions ------------------ */
  const handleStartGame = useCallback(() => {
    emit("game:start", { roomCode });
  }, [emit, roomCode]);

  const handleRollDice = useCallback(() => {
    if (!gameState) return;
    if (gameState.currentPlayer !== myPlayerIndex) return;
    setRolling(true);
    emit("game:action", { roomCode, action: "roll" });
  }, [emit, roomCode, gameState, myPlayerIndex]);

  /* ------------------ Render ------------------ */
  if (loading || guestLoading) return null;

  const isWaiting = room?.status === "waiting";
  const isPlaying = room?.status === "playing";
  const isFinished = room?.status === "finished";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main className="pt-24 px-4">
        {error && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {isWaiting && room && (
          <WaitingRoom
            roomCode={roomCode}
            players={players}
            isHost={!!isHost}
            minPlayers={room.minPlayers}
            maxPlayers={room.maxPlayers}
            onStart={handleStartGame}
            onLeave={() => router.push("/games/snake-and-ladder")}
          />
        )}

        {(isPlaying || isFinished) && gameState && (
          <div className="max-w-xl mx-auto">
            <Card className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Snake & Ladder</h2>

              <p className="mb-4">
                Current Turn:{" "}
                <b>{players[gameState.currentPlayer]?.username}</b>
              </p>

              <Dice
                value={gameState.lastDice}
                rolling={rolling}
                canRoll={
                  !isFinished && gameState.currentPlayer === myPlayerIndex
                }
                onRoll={handleRollDice}
                playerColor="blue"
              />

              <Board positions={gameState.positions} players={players} />

              {isFinished && gameState.winner !== null && (
                <div className="mt-6 text-lg font-bold">
                  🏆 {players[gameState.winner]?.username} Wins!
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
