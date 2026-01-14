"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useGuest } from "@/hooks/useGuest";
import { useSocket } from "@/hooks/useSocket";
import { roomApi } from "@/lib/api";
import { Room, Player } from "@/types/game";
import { ChessGameState } from "@/types/chess";
import ChessBoard from "@/components/games/chess/ChessBoard";
import WaitingRoom from "@/components/games/shared/WaitingRoom";
import { LudoThemeProvider } from "@/contexts/LudoThemeContext";

/* ---------------- TIME CONTROLS ---------------- */
const TIME_CONTROLS = [
  { minutes: 1, name: "Bullet" },
  { minutes: 3, name: "Blitz" },
  { minutes: 5, name: "Blitz" },
  { minutes: 10, name: "Rapid" },
  { minutes: 30, name: "Classical" },
  { minutes: 60, name: "Classical" },
];

/* ---------------- PIECE VALUES ---------------- */
const PIECE_VALUES: Record<string, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9
};

const PIECE_SYMBOLS: Record<string, string> = {
  P: "♙", N: "♘", B: "♗", R: "♖", Q: "♕",
  p: "♟", n: "♞", b: "♝", r: "♜", q: "♛",
};

/* ---------------- THEME BACKGROUNDS ---------------- */
const THEME_BACKGROUNDS: Record<string, { bg: string; pattern: string }> = {
  green: {
    bg: "linear-gradient(135deg, #1a1f16 0%, #262b22 50%, #1a1f16 100%)",
    pattern: "radial-gradient(circle at 20% 80%, rgba(119, 149, 86, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(119, 149, 86, 0.08) 0%, transparent 40%)",
  },
  wood: {
    bg: "linear-gradient(135deg, #1f1a14 0%, #2a231b 50%, #1f1a14 100%)",
    pattern: "radial-gradient(circle at 30% 70%, rgba(181, 136, 99, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(181, 136, 99, 0.08) 0%, transparent 40%)",
  },
  blue: {
    bg: "linear-gradient(135deg, #141a1f 0%, #1b232a 50%, #141a1f 100%)",
    pattern: "radial-gradient(circle at 25% 75%, rgba(140, 162, 173, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(140, 162, 173, 0.08) 0%, transparent 40%)",
  },
  purple: {
    bg: "linear-gradient(135deg, #1a141f 0%, #231b2a 50%, #1a141f 100%)",
    pattern: "radial-gradient(circle at 20% 80%, rgba(155, 114, 176, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(155, 114, 176, 0.08) 0%, transparent 40%)",
  },
  coral: {
    bg: "linear-gradient(135deg, #1f1614 0%, #2a1f1b 50%, #1f1614 100%)",
    pattern: "radial-gradient(circle at 25% 75%, rgba(235, 119, 98, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(235, 119, 98, 0.08) 0%, transparent 40%)",
  },
  ice: {
    bg: "linear-gradient(135deg, #141920 0%, #1b2128 50%, #141920 100%)",
    pattern: "radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(173, 216, 230, 0.08) 0%, transparent 40%)",
  },
  neon: {
    bg: "linear-gradient(135deg, #0a0a12 0%, #12121a 50%, #0a0a12 100%)",
    pattern: "radial-gradient(circle at 20% 80%, rgba(0, 255, 136, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 0, 255, 0.06) 0%, transparent 40%)",
  },
  dark: {
    bg: "linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #0d0d0d 100%)",
    pattern: "radial-gradient(circle at 25% 75%, rgba(80, 80, 80, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(80, 80, 80, 0.08) 0%, transparent 40%)",
  },
};

/* ---------------- CAPTURED PIECES CALCULATOR ---------------- */
function getCapturedPieces(fen: string, forColor: "white" | "black"): { pieces: string[]; points: number } {
  // Starting pieces for each side
  const startingPieces = { p: 8, n: 2, b: 2, r: 2, q: 1 };
  const boardPart = fen.split(" ")[0];

  // Count current pieces on board
  const whitePieces = { p: 0, n: 0, b: 0, r: 0, q: 0 };
  const blackPieces = { p: 0, n: 0, b: 0, r: 0, q: 0 };

  for (const char of boardPart) {
    if (char === "P") whitePieces.p++;
    else if (char === "N") whitePieces.n++;
    else if (char === "B") whitePieces.b++;
    else if (char === "R") whitePieces.r++;
    else if (char === "Q") whitePieces.q++;
    else if (char === "p") blackPieces.p++;
    else if (char === "n") blackPieces.n++;
    else if (char === "b") blackPieces.b++;
    else if (char === "r") blackPieces.r++;
    else if (char === "q") blackPieces.q++;
  }

  // Calculate captured pieces (what the opponent lost, which we captured)
  const captured: string[] = [];
  let points = 0;
  const opponentPieces = forColor === "white" ? blackPieces : whitePieces;
  const opponentSymbols = forColor === "white" ? "pnbrq" : "PNBRQ";

  for (const [piece, starting] of Object.entries(startingPieces)) {
    const lost = starting - opponentPieces[piece as keyof typeof opponentPieces];
    for (let i = 0; i < lost; i++) {
      const symbol = opponentSymbols[["p", "n", "b", "r", "q"].indexOf(piece)];
      captured.push(PIECE_SYMBOLS[symbol] || "");
      points += PIECE_VALUES[piece];
    }
  }

  // points is the sum of values of pieces we captured (opponent lost)
  // Only show if we have a material advantage
  return { pieces: captured, points };
}

export default function ChessRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params.roomId as string).toUpperCase();

  const { guest, loading: guestLoading } = useGuest();
  const { isConnected, emit, on } = useSocket();

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<ChessGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTime, setSelectedTime] = useState(3);
  const [whiteTime, setWhiteTime] = useState(3 * 60);
  const [blackTime, setBlackTime] = useState(3 * 60);
  const [drawOffer, setDrawOffer] = useState<{ from: string; username: string } | null>(null);
  const [showDrawAccepted, setShowDrawAccepted] = useState(false);
  const [drawRejectedNotif, setDrawRejectedNotif] = useState(false);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);
  const [abortedBy, setAbortedBy] = useState<string | null>(null);
  const [boardTheme, setBoardTheme] = useState<"green" | "wood" | "blue" | "purple" | "coral" | "ice" | "neon" | "dark">("wood");
  const [activeTab, setActiveTab] = useState<"moves" | "themes">("moves");
  const [timerStarted, setTimerStarted] = useState(false);
  const [viewMoveIndex, setViewMoveIndex] = useState<number | null>(null); // null = live view
  const [rematchOffer, setRematchOffer] = useState<{ from: string; username: string } | null>(null);
  const [rematchRejectedNotif, setRematchRejectedNotif] = useState(false);

  const currentPlayer = players.find((p) => p.sessionId === guest?.sessionId);
  const isHost = currentPlayer?.isHost ?? false;
  const myColor = gameState?.playerColors?.[guest?.sessionId ?? ""] ?? "white";
  const opponent = players.find((p) => p.sessionId !== guest?.sessionId);
  const opponentColor = myColor === "white" ? "black" : "white";

  // Debug log
  console.log("Players:", players);
  console.log("Guest sessionId:", guest?.sessionId);
  console.log("Opponent found:", opponent);
  console.log("🎨 gameState.playerColors:", gameState?.playerColors);
  console.log("🎨 myColor:", myColor, "turn:", gameState?.turn);
  console.log("🎮 canMove:", gameState?.turn === myColor && room?.status !== "finished");

  /* ---------------- FETCH ROOM ---------------- */
  useEffect(() => {
    if (guestLoading) return;
    if (!guest) {
      router.push("/games/chess");
      return;
    }

    (async () => {
      try {
        const res = await roomApi.get(roomCode);
        if (res.success && res.data) {
          setRoom(res.data);
          setPlayers(res.data.players);
        } else {
          setError("Room not found");
        }
      } catch {
        setError("Failed to load room");
      }
      setLoading(false);
    })();
  }, [roomCode, guest, guestLoading, router]);

  /* ---------------- PERIODIC ROOM REFRESH ---------------- */
  useEffect(() => {
    if (!guest || loading) return;

    const interval = setInterval(async () => {
      try {
        const res = await roomApi.get(roomCode);
        if (res.success && res.data) {
          setPlayers(res.data.players);
        }
      } catch (err) {
        console.error("Failed to refresh room:", err);
      }
    }, 2000); // Refresh every 2 seconds

    return () => clearInterval(interval);
  }, [guest, loading, roomCode]);

  /* ---------------- SOCKET JOIN ---------------- */
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

  /* ---------------- SOCKET LISTENERS ---------------- */
  useEffect(() => {
    if (!guest || !isConnected) return;

    const unsubJoined = on("room:playerJoined", (data: any) => {
      console.log("Player joined:", data);
      if (data.players) {
        setPlayers(data.players);
      }
    });

    const unsubLeft = on("room:playerLeft", (data: any) => {
      console.log("Player left:", data);
      if (data.players) {
        setPlayers(data.players);
      }
    });

    const unsubUpdated = on("room:updated", (data: any) => {
      console.log("Room updated:", data);
      if (data.players) {
        setPlayers(data.players);
      }
      if (data.room) {
        setRoom(data.room);
      }
    });

    const unsubStart = on("game:start", (data: any) => {
      console.log("Game started:", data);
      setGameState(data.state);
      setRoom((prev) => prev && { ...prev, status: "playing" });
      // Use timeControl from event data if available, otherwise fall back to selectedTime
      const timeMinutes = data.timeControl || selectedTime;
      setSelectedTime(timeMinutes);
      setWhiteTime(timeMinutes * 60);
      setBlackTime(timeMinutes * 60);
      setTimerStarted(false);
      // Update players when game starts
      if (data.players) {
        setPlayers(data.players);
      } else if (data.room?.players) {
        setPlayers(data.room.players);
      }
    });

    const unsubState = on("game:state", (data: any) => {
      console.log("Game state updated:", data);
      setGameState(data.state);
    });

    const unsubWinner = on("game:winner", (data: any) => {
      console.log("Game finished:", data);
      setRoom((prev) => prev && { ...prev, status: "finished" });
    });

    const unsubDrawOffer = on("game:drawOffer", (data: any) => {
      console.log("Draw offer received:", data);
      setDrawOffer({ from: data.from, username: data.username });
    });

    const unsubDrawAccepted = on("game:drawAccepted", () => {
      console.log("Draw accepted");
      setShowDrawAccepted(true);
      setDrawOffer(null);
      setRoom((prev) => prev && { ...prev, status: "finished" });
      setTimeout(() => setShowDrawAccepted(false), 5000);
    });

    const unsubDrawRejected = on("game:drawRejected", () => {
      console.log("Draw rejected");
      setDrawOffer(null);
      setDrawRejectedNotif(true);
      setTimeout(() => setDrawRejectedNotif(false), 3000);
    });

    const unsubAborted = on("game:aborted", (data: any) => {
      console.log("Game aborted:", data);
      setAbortedBy(data.by || "a player");
      setRoom((prev) => prev && { ...prev, status: "finished" });
      setTimeout(() => setAbortedBy(null), 5000);
    });

    const unsubRematchOffer = on("game:rematchOffer", (data: any) => {
      console.log("Rematch offer received:", data);
      setRematchOffer({ from: data.from, username: data.username });
    });

    const unsubRematchAccepted = on("game:rematchAccepted", () => {
      console.log("Rematch accepted");
      setRematchOffer(null);
      setWhiteTime(selectedTime * 60);
      setBlackTime(selectedTime * 60);
      setTimerStarted(false);
      setRoom((prev) => prev && { ...prev, status: "playing" });
    });

    const unsubRematchRejected = on("game:rematchRejected", () => {
      console.log("Rematch rejected");
      setRematchOffer(null);
      setRematchRejectedNotif(true);
      setTimeout(() => setRematchRejectedNotif(false), 3000);
    });

    const unsubError = on("error", (data: any) => {
      setError(data.message);
      setTimeout(() => setError(""), 3000);
    });

    return () => {
      unsubJoined();
      unsubLeft();
      unsubUpdated();
      unsubStart();
      unsubState();
      unsubWinner();
      unsubDrawOffer();
      unsubDrawAccepted();
      unsubDrawRejected();
      unsubAborted();
      unsubRematchOffer();
      unsubRematchAccepted();
      unsubRematchRejected();
      unsubError();
    };
  }, [guest, isConnected, on, selectedTime]);

  /* ---------------- TIMER TICK (UI ONLY) ---------------- */
  useEffect(() => {
    // Only tick timer if game is playing AND timer has started (first move made)
    if (!gameState || room?.status !== "playing" || !timerStarted) return;

    const interval = setInterval(() => {
      if (gameState.turn === "white") {
        setWhiteTime((t) => {
          const newTime = Math.max(0, t - 1);
          if (newTime === 0 && t > 0) {
            setRoom((prev) => prev && { ...prev, status: "finished" });
          }
          return newTime;
        });
      } else {
        setBlackTime((t) => {
          const newTime = Math.max(0, t - 1);
          if (newTime === 0 && t > 0) {
            setRoom((prev) => prev && { ...prev, status: "finished" });
          }
          return newTime;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, room?.status, timerStarted]);

  // Start timer after first move
  useEffect(() => {
    if (gameState?.moveHistory && gameState.moveHistory.length > 0 && !timerStarted) {
      setTimerStarted(true);
    }
  }, [gameState?.moveHistory, timerStarted]);

  /* ---------------- ACTIONS ---------------- */
  const handleMove = useCallback(
    (from: string, to: string, promotion?: string) => {
      console.log("Move attempted:", { from, to, promotion, roomCode });
      emit("game:action", {
        roomCode,
        action: "move",
        payload: { from, to, promotion },
      });
    },
    [emit, roomCode],
  );

  const handleLeaveRoom = () => {
    emit("room:leave", {});
    router.push("/games/chess");
  };

  const handleStartGame = () => {
    emit("game:start", { roomCode, timeControl: selectedTime });
  };

  const handleRematch = () => {
    setRoom((prev) => prev && { ...prev, status: "waiting" });
    setGameState(null);
    setWhiteTime(selectedTime * 60);
    setBlackTime(selectedTime * 60);
  };

  const handleOfferDraw = () => {
    emit("game:action", {
      roomCode,
      action: "offerDraw",
      payload: { username: guest?.username },
    });
  };

  const handleAcceptDraw = () => {
    emit("game:action", {
      roomCode,
      action: "acceptDraw",
    });
  };

  const handleRejectDraw = () => {
    emit("game:action", {
      roomCode,
      action: "rejectDraw",
    });
    setDrawOffer(null);
  };

  const handleAbort = () => {
    setShowAbortConfirm(true);
  };

  const confirmAbort = () => {
    emit("game:action", {
      roomCode,
      action: "abort",
      payload: { username: guest?.username },
    });
    setShowAbortConfirm(false);
  };

  const cancelAbort = () => {
    setShowAbortConfirm(false);
  };

  const handleOfferRematch = () => {
    emit("game:action", {
      roomCode,
      action: "offerRematch",
      payload: { username: guest?.username },
    });
  };

  const handleAcceptRematch = () => {
    emit("game:action", {
      roomCode,
      action: "acceptRematch",
    });
  };

  const handleRejectRematch = () => {
    emit("game:action", {
      roomCode,
      action: "rejectRematch",
    });
    setRematchOffer(null);
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // Determine winner
  const getWinner = () => {
    if (!isFinished) return null;

    // Check if time ran out
    if (whiteTime === 0) {
      return opponentColor === "black" ? opponent?.username : guest?.username;
    }
    if (blackTime === 0) {
      return opponentColor === "white" ? opponent?.username : guest?.username;
    }

    // Check game state winner
    if (gameState?.winner) {
      return gameState.winner === myColor ? guest?.username : opponent?.username;
    }

    return null;
  };

  /* ---------------- RENDER ---------------- */
  if (loading || guestLoading) {
    return <div className="min-h-screen bg-[#302e2b]" />;
  }

  const isWaiting = room?.status === "waiting";
  const isPlaying = room?.status === "playing";
  const isFinished = room?.status === "finished";
  const winner = getWinner();

  // Pair moves for display (white + black per row)
  const pairedMoves: Array<{ num: number; white: string; black?: string }> = [];
  if (gameState?.moveHistory) {
    for (let i = 0; i < gameState.moveHistory.length; i += 2) {
      pairedMoves.push({
        num: Math.floor(i / 2) + 1,
        white: `${gameState.moveHistory[i].from}${gameState.moveHistory[i].to}`,
        black: gameState.moveHistory[i + 1]
          ? `${gameState.moveHistory[i + 1].from}${gameState.moveHistory[i + 1].to}`
          : undefined,
      });
    }
  }

  return (
    <LudoThemeProvider>
      <div
        className="min-h-screen text-white transition-all duration-500 relative"
        style={{
          background: THEME_BACKGROUNDS[boardTheme]?.bg || THEME_BACKGROUNDS.wood.bg,
        }}
      >
        {/* Background Pattern Overlay */}
        <div
          className="fixed inset-0 pointer-events-none transition-all duration-500"
          style={{
            background: THEME_BACKGROUNDS[boardTheme]?.pattern || THEME_BACKGROUNDS.wood.pattern,
          }}
        />

        {/* Floating Chess Pieces Decoration */}
        {(isPlaying || isFinished) && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div
              className="absolute text-6xl opacity-5"
              style={{
                left: '5%', top: '15%',
                animation: 'float-slow 8s ease-in-out infinite',
              }}
            >♟</div>
            <div
              className="absolute text-7xl opacity-5"
              style={{
                right: '8%', top: '25%',
                animation: 'float-medium 6s ease-in-out infinite 1s',
              }}
            >♞</div>
            <div
              className="absolute text-5xl opacity-5"
              style={{
                left: '10%', bottom: '20%',
                animation: 'float-slow 10s ease-in-out infinite 2s',
              }}
            >♝</div>
            <div
              className="absolute text-8xl opacity-5"
              style={{
                right: '5%', bottom: '15%',
                animation: 'float-medium 7s ease-in-out infinite 0.5s',
              }}
            >♜</div>
            <div
              className="absolute text-6xl opacity-5"
              style={{
                left: '50%', top: '8%',
                transform: 'translateX(-50%)',
                animation: 'float-slow 9s ease-in-out infinite 3s',
              }}
            >♛</div>
          </div>
        )}
        {/* WAITING ROOM */}
        {isWaiting && room && guest && (
          <>
            <Header />
            <main className="pt-24 pb-12 px-4">
              {/* Time Control Selection - Host Only */}
              {isHost ? (
                <div className="max-w-md mx-auto mb-6">
                  <div className="bg-[#262522] rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3 text-center">Time Control</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_CONTROLS.map((tc) => (
                        <button
                          key={tc.minutes}
                          onClick={() => {
                            setSelectedTime(tc.minutes);
                            setWhiteTime(tc.minutes * 60);
                            setBlackTime(tc.minutes * 60);
                          }}
                          className={`px-4 py-3 rounded-lg font-semibold transition-all ${selectedTime === tc.minutes
                            ? "bg-[#81b64c] text-white"
                            : "bg-[#3d3935] text-gray-300 hover:bg-[#4d4945]"
                            }`}
                        >
                          <div className="text-lg">{tc.minutes} min</div>
                          <div className="text-xs opacity-70">{tc.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto mb-6">
                  <div className="bg-[#262522] rounded-lg p-4 text-center">
                    <p className="text-gray-400">Waiting for host to start the game...</p>
                  </div>
                </div>
              )}
              <WaitingRoom
                roomCode={roomCode}
                gameTitle={"Chess"}
                players={players}
                isHost={isHost}
                minPlayers={2}
                maxPlayers={2}
                onStart={handleStartGame}
                onLeave={handleLeaveRoom}
                currentSessionId={""}
              />
            </main>
          </>
        )}

        {/* GAME */}
        {(isPlaying || isFinished) && gameState && (
          <div className="min-h-screen flex justify-center items-center py-6">
            <div className="flex gap-4">
              {/* LEFT: BOARD SECTION */}
              <div className="flex flex-col gap-1">
                {/* Opponent Player Bar */}
                <div
                  className={`flex items-center justify-between h-12 px-2 rounded relative transition-all ${isFinished && gameState.winner === opponentColor ? "winner-square" :
                    isFinished && gameState.winner && gameState.winner !== opponentColor ? "loser-square" : ""
                    }`}
                  style={{ width: 800 }}
                >
                  {/* Win/Lose Flag */}
                  {isFinished && gameState.winner && (
                    <div className={`absolute -top-1 -right-1 w-6 h-6 rounded flex items-center justify-center text-xs ${gameState.winner === opponentColor
                      ? "bg-green-500 text-white"
                      : "bg-red-500"
                      }`}>
                      {gameState.winner === opponentColor ? "🏆" : "🏳"}
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded bg-[#454341] flex items-center justify-center text-sm font-bold text-white ${isFinished && gameState.winner !== opponentColor && gameState.winner ? "fallen-king" : ""
                      }`}>
                      {opponent?.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white text-sm leading-tight">
                        {opponent?.username || "Waiting..."}
                      </span>
                      <div className="flex items-center gap-0.5 text-xs text-gray-400 leading-tight">
                        {getCapturedPieces(gameState.fen, opponentColor).pieces.length > 0 && (
                          <>
                            <span className="flex">
                              {getCapturedPieces(gameState.fen, opponentColor).pieces.map((p: string, i: number) => (
                                <span key={i} className="text-xs">{p}</span>
                              ))}
                            </span>
                            <span className="text-[#81b64c] font-semibold text-xs ml-0.5">
                              +{getCapturedPieces(gameState.fen, opponentColor).points}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Clock */}
                  <div className={`flex items-center gap-2 px-4 py-2 rounded text-xl font-bold tracking-wider transition-all ${gameState.turn === opponentColor
                    ? "bg-white text-[#1a1918]"
                    : "bg-[#262522] text-[#999]"
                    } ${(opponentColor === "white" ? whiteTime : blackTime) <= 30 && gameState.turn === opponentColor ? "!bg-red-600 !text-white" : ""}`}
                    style={{
                      fontFamily: "'Courier New', Consolas, monospace",
                      fontVariantNumeric: "tabular-nums",
                      ...((opponentColor === "white" ? whiteTime : blackTime) <= 30 && gameState.turn === opponentColor ? { animation: "pulse-bg 1s ease-in-out infinite" } : {})
                    }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    {formatTime(opponentColor === "white" ? whiteTime : blackTime)}
                  </div>
                </div>

                {/* Chess Board */}
                <div className="rounded overflow-hidden shadow-lg">
                  <ChessBoard
                    fen={gameState.fen}
                    orientation={myColor}
                    canMove={gameState.turn === myColor && !isFinished}
                    onMove={handleMove}
                    theme={boardTheme}
                    size={800}
                    winner={isFinished ? gameState.winner : null}
                  />
                </div>

                {/* Your Player Bar */}
                <div
                  className={`flex items-center justify-between h-12 px-2 rounded relative transition-all ${isFinished && gameState.winner === myColor ? "winner-square" :
                    isFinished && gameState.winner && gameState.winner !== myColor ? "loser-square" : ""
                    }`}
                  style={{ width: 800 }}
                >
                  {/* Win/Lose Flag */}
                  {isFinished && gameState.winner && (
                    <div className={`absolute -top-1 -right-1 w-6 h-6 rounded flex items-center justify-center text-xs ${gameState.winner === myColor
                      ? "bg-green-500 text-white"
                      : "bg-red-500"
                      }`}>
                      {gameState.winner === myColor ? "🏆" : "🏳"}
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded bg-[#81b64c] flex items-center justify-center text-sm font-bold text-white ${isFinished && gameState.winner !== myColor && gameState.winner ? "fallen-king" : ""
                      }`}>
                      {guest?.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white text-sm leading-tight">
                        {guest?.username}
                      </span>
                      <div className="flex items-center gap-0.5 text-xs text-gray-400 leading-tight">
                        {getCapturedPieces(gameState.fen, myColor).pieces.length > 0 && (
                          <>
                            <span className="flex">
                              {getCapturedPieces(gameState.fen, myColor).pieces.map((p: string, i: number) => (
                                <span key={i} className="text-xs">{p}</span>
                              ))}
                            </span>
                            <span className="text-[#81b64c] font-semibold text-xs ml-0.5">
                              +{getCapturedPieces(gameState.fen, myColor).points}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Clock */}
                  <div className={`flex items-center gap-2 px-4 py-2 rounded text-xl font-bold tracking-wider transition-all ${gameState.turn === myColor
                    ? "bg-white text-[#1a1918]"
                    : "bg-[#262522] text-[#999]"
                    } ${(myColor === "white" ? whiteTime : blackTime) <= 30 && gameState.turn === myColor ? "!bg-red-600 !text-white" : ""}`}
                    style={{
                      fontFamily: "'Courier New', Consolas, monospace",
                      fontVariantNumeric: "tabular-nums",
                      ...((myColor === "white" ? whiteTime : blackTime) <= 30 && gameState.turn === myColor ? { animation: "pulse-bg 1s ease-in-out infinite" } : {})
                    }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    {formatTime(myColor === "white" ? whiteTime : blackTime)}
                  </div>
                </div>
              </div>

              {/* RIGHT: SIDE PANEL */}
              <div className="flex flex-col bg-[#262522] rounded overflow-hidden" style={{ width: 340, height: 848 }}>
                {/* Tabs */}
                <div className="flex border-b border-[#3d3935]">
                  <button
                    onClick={() => setActiveTab("moves")}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === "moves" ? "text-white border-b-2 border-[#81b64c]" : "text-gray-500 hover:text-white"}`}
                  >
                    Moves
                  </button>
                  <button
                    onClick={() => setActiveTab("themes")}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === "themes" ? "text-white border-b-2 border-[#81b64c]" : "text-gray-500 hover:text-white"}`}
                  >
                    Themes
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === "moves" ? (
                  <>
                    {/* Starting Position Label */}
                    <div className="px-4 py-2.5 border-b border-[#3d3935] text-sm text-gray-400">
                      Starting Position
                    </div>

                    {/* Moves Table */}
                    <div className="flex-1 overflow-y-auto">
                      {pairedMoves.length === 0 ? (
                        <div className="p-4 text-gray-500 text-sm">No moves yet</div>
                      ) : (
                        <div className="divide-y divide-[#3d3935]/50">
                          {pairedMoves.map((move) => (
                            <div key={move.num} className="flex text-sm hover:bg-[#3d3935]/30 transition-colors">
                              <span className="w-10 px-2 py-1.5 text-gray-500 bg-[#1a1918]/50 text-center">
                                {move.num}.
                              </span>
                              <span className="flex-1 px-3 py-1.5 cursor-pointer hover:bg-[#454341]/50">
                                {move.white}
                              </span>
                              <span className="flex-1 px-3 py-1.5 cursor-pointer text-gray-400 hover:bg-[#454341]/50">
                                {move.black || ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Playback Controls */}
                    <div className="flex justify-center gap-1.5 py-3 border-t border-[#3d3935]">
                      <button
                        onClick={() => setViewMoveIndex(0)}
                        disabled={!gameState?.moveHistory?.length}
                        className="w-10 h-10 bg-[#3d3935] hover:bg-[#4d4945] disabled:opacity-50 disabled:cursor-not-allowed rounded-sm flex items-center justify-center text-base transition-colors"
                        title="First move"
                      >
                        ⏮
                      </button>
                      <button
                        onClick={() => setViewMoveIndex(prev =>
                          prev === null
                            ? (gameState?.moveHistory?.length ?? 1) - 2
                            : Math.max(0, prev - 1)
                        )}
                        disabled={!gameState?.moveHistory?.length || viewMoveIndex === 0}
                        className="w-10 h-10 bg-[#3d3935] hover:bg-[#4d4945] disabled:opacity-50 disabled:cursor-not-allowed rounded-sm flex items-center justify-center text-base transition-colors"
                        title="Previous move"
                      >
                        ◀
                      </button>
                      <button
                        onClick={() => setViewMoveIndex(null)}
                        className={`w-10 h-10 rounded-sm flex items-center justify-center text-base transition-colors ${viewMoveIndex === null
                          ? "bg-[#81b64c] text-white"
                          : "bg-[#3d3935] hover:bg-[#4d4945]"
                          }`}
                        title="Live position"
                      >
                        ●
                      </button>
                      <button
                        onClick={() => setViewMoveIndex(prev =>
                          prev === null
                            ? null
                            : Math.min((gameState?.moveHistory?.length ?? 1) - 1, prev + 1)
                        )}
                        disabled={!gameState?.moveHistory?.length || viewMoveIndex === null || viewMoveIndex >= (gameState?.moveHistory?.length ?? 0) - 1}
                        className="w-10 h-10 bg-[#3d3935] hover:bg-[#4d4945] disabled:opacity-50 disabled:cursor-not-allowed rounded-sm flex items-center justify-center text-base transition-colors"
                        title="Next move"
                      >
                        ▶
                      </button>
                      <button
                        onClick={() => setViewMoveIndex(null)}
                        disabled={viewMoveIndex === null}
                        className="w-10 h-10 bg-[#3d3935] hover:bg-[#4d4945] disabled:opacity-50 disabled:cursor-not-allowed rounded-sm flex items-center justify-center text-base transition-colors"
                        title="Last move (live)"
                      >
                        ⏭
                      </button>
                    </div>

                    {/* Game Controls */}
                    <div className="flex gap-6 px-4 py-3 border-t border-[#3d3935] text-sm justify-center">
                      {!isFinished ? (
                        <>
                          <button
                            onClick={handleOfferDraw}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                          >
                            <span className="text-lg">½</span> Draw
                          </button>
                          <button
                            onClick={handleAbort}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                          >
                            <span className="text-base">🏳</span> Abort
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-4">
                          <span className="text-[#81b64c] font-semibold">Game Over</span>
                          {winner && <span className="text-white">- {winner} wins!</span>}
                          <button
                            onClick={handleOfferRematch}
                            className="ml-4 px-4 py-1.5 bg-[#81b64c] hover:bg-[#6fa53b] rounded text-white font-semibold transition-colors"
                          >
                            Rematch
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Game Info */}
                    <div className="px-4 py-3 bg-[#1a1918] text-xs border-t border-[#3d3935]">
                      <div className="font-semibold text-gray-500 mb-1 uppercase tracking-wide">Game Info</div>
                      <div className="text-gray-300">
                        {guest?.username} vs. {opponent?.username || "..."} • {selectedTime} min
                      </div>
                    </div>
                  </>
                ) : (
                  /* Themes Tab */
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="text-sm text-gray-400 mb-4">Select Board Theme</div>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Green Theme */}
                      <button
                        onClick={() => setBoardTheme("green")}
                        className={`p-2 rounded-lg border-2 transition-all ${boardTheme === "green" ? "border-[#81b64c]" : "border-transparent hover:border-[#3d3935]"
                          }`}
                      >
                        <div className="aspect-square rounded overflow-hidden grid grid-cols-4">
                          {[...Array(16)].map((_, i) => (
                            <div
                              key={i}
                              className={`${(Math.floor(i / 4) + i) % 2 === 0 ? "bg-[#ebecd0]" : "bg-[#779556]"}`}
                            />
                          ))}
                        </div>
                        <div className="text-center text-xs text-white mt-2">Green</div>
                      </button>

                      {/* Wood Theme */}
                      <button
                        onClick={() => setBoardTheme("wood")}
                        className={`p-2 rounded-lg border-2 transition-all ${boardTheme === "wood" ? "border-[#81b64c]" : "border-transparent hover:border-[#3d3935]"
                          }`}
                      >
                        <div className="aspect-square rounded overflow-hidden grid grid-cols-4">
                          {[...Array(16)].map((_, i) => (
                            <div
                              key={i}
                              className={`${(Math.floor(i / 4) + i) % 2 === 0 ? "bg-[#f0d9b5]" : "bg-[#b58863]"}`}
                            />
                          ))}
                        </div>
                        <div className="text-center text-xs text-white mt-2">Wood</div>
                      </button>

                      {/* Blue Theme */}
                      <button
                        onClick={() => setBoardTheme("blue")}
                        className={`p-2 rounded-lg border-2 transition-all ${boardTheme === "blue" ? "border-[#81b64c]" : "border-transparent hover:border-[#3d3935]"
                          }`}
                      >
                        <div className="aspect-square rounded overflow-hidden grid grid-cols-4">
                          {[...Array(16)].map((_, i) => (
                            <div
                              key={i}
                              className={`${(Math.floor(i / 4) + i) % 2 === 0 ? "bg-[#dee3e6]" : "bg-[#8ca2ad]"}`}
                            />
                          ))}
                        </div>
                        <div className="text-center text-xs text-white mt-2">Ice</div>
                      </button>

                      {/* Purple Theme */}
                      <button
                        onClick={() => setBoardTheme("purple")}
                        className={`p-2 rounded-lg border-2 transition-all ${boardTheme === "purple" ? "border-[#81b64c]" : "border-transparent hover:border-[#3d3935]"
                          }`}
                      >
                        <div className="aspect-square rounded overflow-hidden grid grid-cols-4">
                          {[...Array(16)].map((_, i) => (
                            <div
                              key={i}
                              className={`${(Math.floor(i / 4) + i) % 2 === 0 ? "bg-[#f0e6f6]" : "bg-[#9b72b0]"}`}
                            />
                          ))}
                        </div>
                        <div className="text-center text-xs text-white mt-2">Purple</div>
                      </button>

                      {/* Coral Theme */}
                      <button
                        onClick={() => setBoardTheme("coral")}
                        className={`p-2 rounded-lg border-2 transition-all ${boardTheme === "coral" ? "border-[#81b64c]" : "border-transparent hover:border-[#3d3935]"
                          }`}
                      >
                        <div className="aspect-square rounded overflow-hidden grid grid-cols-4">
                          {[...Array(16)].map((_, i) => (
                            <div
                              key={i}
                              className={`${(Math.floor(i / 4) + i) % 2 === 0 ? "bg-[#fce4d8]" : "bg-[#eb7762]"}`}
                            />
                          ))}
                        </div>
                        <div className="text-center text-xs text-white mt-2">Coral</div>
                      </button>

                      {/* Ice Theme */}
                      <button
                        onClick={() => setBoardTheme("ice")}
                        className={`p-2 rounded-lg border-2 transition-all ${boardTheme === "ice" ? "border-[#81b64c]" : "border-transparent hover:border-[#3d3935]"
                          }`}
                      >
                        <div className="aspect-square rounded overflow-hidden grid grid-cols-4">
                          {[...Array(16)].map((_, i) => (
                            <div
                              key={i}
                              className={`${(Math.floor(i / 4) + i) % 2 === 0 ? "bg-[#e8f4f8]" : "bg-[#6fa8c0]"}`}
                            />
                          ))}
                        </div>
                        <div className="text-center text-xs text-white mt-2">Ice</div>
                      </button>

                      {/* Neon Theme */}
                      <button
                        onClick={() => setBoardTheme("neon")}
                        className={`p-2 rounded-lg border-2 transition-all ${boardTheme === "neon" ? "border-[#81b64c]" : "border-transparent hover:border-[#3d3935]"
                          }`}
                      >
                        <div className="aspect-square rounded overflow-hidden grid grid-cols-4">
                          {[...Array(16)].map((_, i) => (
                            <div
                              key={i}
                              className={`${(Math.floor(i / 4) + i) % 2 === 0 ? "bg-[#1a1a2e]" : "bg-[#16213e]"}`}
                            />
                          ))}
                        </div>
                        <div className="text-center text-xs text-white mt-2">Neon</div>
                      </button>

                      {/* Dark Theme */}
                      <button
                        onClick={() => setBoardTheme("dark")}
                        className={`p-2 rounded-lg border-2 transition-all ${boardTheme === "dark" ? "border-[#81b64c]" : "border-transparent hover:border-[#3d3935]"
                          }`}
                      >
                        <div className="aspect-square rounded overflow-hidden grid grid-cols-4">
                          {[...Array(16)].map((_, i) => (
                            <div
                              key={i}
                              className={`${(Math.floor(i / 4) + i) % 2 === 0 ? "bg-[#4a4a4a]" : "bg-[#2d2d2d]"}`}
                            />
                          ))}
                        </div>
                        <div className="text-center text-xs text-white mt-2">Dark</div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Abort Confirmation Modal */}
        {showAbortConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#262522] p-6 rounded-lg max-w-sm">
              <h3 className="text-lg font-semibold mb-4">Abort Game?</h3>
              <p className="text-gray-400 mb-4">Are you sure you want to abort this game?</p>
              <div className="flex gap-3">
                <Button onClick={cancelAbort} className="flex-1 bg-[#3d3935] rounded">Cancel</Button>
                <Button onClick={confirmAbort} className="flex-1 bg-red-600 rounded">Abort</Button>
              </div>
            </div>
          </div>
        )}

        {/* Draw Offer Modal - Only show to opponent */}
        {drawOffer && drawOffer.from !== guest?.sessionId && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#262522] p-6 rounded-lg max-w-sm">
              <h3 className="text-lg font-semibold mb-4">Draw Offer</h3>
              <p className="text-gray-400 mb-4">{drawOffer.username} offers a draw</p>
              <div className="flex gap-3">
                <Button onClick={handleRejectDraw} className="flex-1 bg-[#3d3935] rounded">Decline</Button>
                <Button onClick={handleAcceptDraw} className="flex-1 bg-[#81b64c] rounded">Accept</Button>
              </div>
            </div>
          </div>
        )}

        {/* Draw Rejected Notification */}
        {drawRejectedNotif && (
          <div className="fixed top-4 right-4 bg-[#3d3935] text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
            Draw offer was declined
          </div>
        )}

        {/* Aborted Notification */}
        {abortedBy && (
          <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50">
            Game aborted by {abortedBy}
          </div>
        )}

        {/* Rematch Offer Modal - Only show to opponent */}
        {rematchOffer && rematchOffer.from !== guest?.sessionId && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#262522] p-6 rounded-lg max-w-sm">
              <h3 className="text-lg font-semibold mb-4">Rematch Offer</h3>
              <p className="text-gray-400 mb-4">{rematchOffer.username} wants a rematch!</p>
              <div className="flex gap-3">
                <Button onClick={handleRejectRematch} className="flex-1 bg-[#3d3935] rounded">Decline</Button>
                <Button onClick={handleAcceptRematch} className="flex-1 bg-[#81b64c] rounded">Accept</Button>
              </div>
            </div>
          </div>
        )}

        {/* Rematch Rejected Notification */}
        {rematchRejectedNotif && (
          <div className="fixed top-4 right-4 bg-[#3d3935] text-white px-4 py-3 rounded-lg shadow-lg z-50">
            Rematch offer was declined
          </div>
        )}
      </div>
    </LudoThemeProvider>
  );
}