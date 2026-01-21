"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Chess } from "chess.js";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { useGuest } from "@/hooks/useGuest";
import { useSocket } from "@/hooks/useSocket";
import { roomApi } from "@/lib/api";
import { Room, Player } from "@/types/game";
import { ChessGameState } from "@/types/chess";
import WaitingRoom from "@/components/games/shared/WaitingRoom";
import { LudoThemeProvider } from "@/contexts/LudoThemeContext";
import {
  ChessBoard,
  PlayerBar,
  GameSidePanel,
  GameModals,
  TimeControlSelector,
  FloatingPiecesDecoration,
  THEME_BACKGROUNDS,
  BoardTheme,
} from "@/components/games/chess";

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
  const [boardTheme, setBoardTheme] = useState<BoardTheme>("wood");
  const [pieceTheme, setPieceTheme] = useState<BoardTheme>("wood");
  const [timerStarted, setTimerStarted] = useState(false);
  const [viewMoveIndex, setViewMoveIndex] = useState<number | null>(null);
  const [rematchOffer, setRematchOffer] = useState<{ from: string; username: string } | null>(null);
  const [rematchRejectedNotif, setRematchRejectedNotif] = useState(false);
  const [rematchPending, setRematchPending] = useState(false);
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [resignedBy, setResignedBy] = useState<string | null>(null);

  const currentPlayer = players.find((p) => p.sessionId === guest?.sessionId);
  const isHost = currentPlayer?.isHost ?? false;
  const myColor = gameState?.playerColors?.[guest?.sessionId ?? ""] ?? "white";
  const opponent = players.find((p) => p.sessionId !== guest?.sessionId);
  const opponentColor = myColor === "white" ? "black" : "white";

  // Compute the FEN to display based on viewMoveIndex (for move history playback)
  const displayFen = useMemo(() => {
    if (!gameState?.moveHistory || viewMoveIndex === null) {
      // null = live position
      return gameState?.fen ?? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    }

    // -1 = starting position
    if (viewMoveIndex === -1) {
      return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    }

    // Replay moves up to viewMoveIndex
    try {
      const chess = new Chess();
      for (let i = 0; i <= viewMoveIndex && i < gameState.moveHistory.length; i++) {
        const move = gameState.moveHistory[i];
        // Use the actual promotion piece if specified, otherwise undefined
        chess.move({ from: move.from, to: move.to, promotion: move.promotion });
      }
      return chess.fen();
    } catch (e) {
      console.error("Error computing FEN:", e);
      return gameState.fen;
    }
  }, [gameState?.fen, gameState?.moveHistory, viewMoveIndex]);

  // Disable moves when viewing history (not live)
  const isViewingHistory = viewMoveIndex !== null;

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
    }, 2000);

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
      if (data.players) setPlayers(data.players);
    });

    const unsubLeft = on("room:playerLeft", (data: any) => {
      if (data.players) setPlayers(data.players);
    });

    const unsubUpdated = on("room:updated", (data: any) => {
      if (data.players) setPlayers(data.players);
      if (data.room) setRoom(data.room);
    });

    const unsubStart = on("game:start", (data: any) => {
      setGameState(data.state);
      setRoom((prev) => prev && { ...prev, status: "playing" });
      const timeMinutes = data.timeControl || selectedTime;
      setSelectedTime(timeMinutes);
      setWhiteTime(timeMinutes * 60);
      setBlackTime(timeMinutes * 60);
      setTimerStarted(false);
      if (data.players) {
        setPlayers(data.players);
      } else if (data.room?.players) {
        setPlayers(data.room.players);
      }
    });

    const unsubState = on("game:state", (data: any) => {
      setGameState(data.state);
    });

    const unsubWinner = on("game:winner", () => {
      setRoom((prev) => prev && { ...prev, status: "finished" });
    });

    const unsubDrawOffer = on("game:drawOffer", (data: any) => {
      setDrawOffer({ from: data.from, username: data.username });
    });

    const unsubDrawAccepted = on("game:drawAccepted", () => {
      setShowDrawAccepted(true);
      setDrawOffer(null);
      setRoom((prev) => prev && { ...prev, status: "finished" });
      setTimeout(() => setShowDrawAccepted(false), 5000);
    });

    const unsubDrawRejected = on("game:drawRejected", () => {
      setDrawOffer(null);
      setDrawRejectedNotif(true);
      setTimeout(() => setDrawRejectedNotif(false), 3000);
    });

    const unsubAborted = on("game:aborted", (data: any) => {
      setAbortedBy(data.by || "a player");
      setRoom((prev) => prev && { ...prev, status: "finished" });
    });

    const unsubResigned = on("game:resigned", (data: any) => {
      setResignedBy(data.by || "a player");
      setRoom((prev) => prev && { ...prev, status: "finished" });
    });

    const unsubRematchOffer = on("game:rematchOffer", (data: any) => {
      setRematchOffer({ from: data.from, username: data.username });
    });

    const unsubRematchAccepted = on("game:rematchAccepted", () => {
      setRematchOffer(null);
      setRematchPending(false);
      setWhiteTime(selectedTime * 60);
      setBlackTime(selectedTime * 60);
      setTimerStarted(false);
      setRoom((prev) => prev && { ...prev, status: "playing" });
    });

    const unsubRematchRejected = on("game:rematchRejected", () => {
      setRematchOffer(null);
      setRematchPending(false);
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
      unsubResigned();
      unsubRematchOffer();
      unsubRematchAccepted();
      unsubRematchRejected();
      unsubError();
    };
  }, [guest, isConnected, on, selectedTime]);

  /* ---------------- TIMER TICK (UI ONLY) ---------------- */
  useEffect(() => {
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

  const handleTimeChange = (minutes: number) => {
    setSelectedTime(minutes);
    setWhiteTime(minutes * 60);
    setBlackTime(minutes * 60);
  };

  const handleOfferDraw = () => {
    emit("game:action", {
      roomCode,
      action: "offerDraw",
      payload: { username: guest?.username },
    });
  };

  const handleAcceptDraw = () => {
    emit("game:action", { roomCode, action: "acceptDraw" });
  };

  const handleRejectDraw = () => {
    emit("game:action", { roomCode, action: "rejectDraw" });
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

  const handleResign = () => {
    setShowResignConfirm(true);
  };

  const confirmResign = () => {
    emit("game:action", {
      roomCode,
      action: "resign",
      payload: { username: guest?.username },
    });
    setShowResignConfirm(false);
  };

  const cancelResign = () => {
    setShowResignConfirm(false);
  };

  const handleOfferRematch = () => {
    setRematchPending(true);
    emit("game:action", {
      roomCode,
      action: "offerRematch",
      payload: { username: guest?.username },
    });
  };

  const handleAcceptRematch = () => {
    emit("game:action", { roomCode, action: "acceptRematch" });
  };

  const handleRejectRematch = () => {
    emit("game:action", { roomCode, action: "rejectRematch" });
    setRematchOffer(null);
  };

  // Determine winner
  const getWinner = () => {
    if (!isFinished) return null;
    if (whiteTime === 0) return opponentColor === "black" ? opponent?.username : guest?.username;
    if (blackTime === 0) return opponentColor === "white" ? opponent?.username : guest?.username;
    if (gameState?.winner) return gameState.winner === myColor ? guest?.username : opponent?.username;
    return null;
  };

  // Determine game end reason
  const getGameEndReason = (): "checkmate" | "timeout" | "resign" | "draw" | "stalemate" | "abort" | null => {
    if (!isFinished) return null;
    // Check gameState status first (from backend) - checkmate has priority
    if (gameState?.status === "checkmate" && gameState?.winner) return "checkmate";
    if (gameState?.status === "draw") return "draw";
    // Then check local states
    if (abortedBy) return "abort";
    if (resignedBy) return "resign";
    if (whiteTime === 0 || blackTime === 0) return "timeout";
    // Fallback: if there's a winner, treat as checkmate
    if (gameState?.winner) return "checkmate";
    // No winner and game over = stalemate
    if (!gameState?.winner && gameState?.status !== "playing" && gameState?.status !== "check") return "stalemate";
    return null;
  };

  // Get winner and loser usernames (handles both checkmate and timeout)
  const getWinnerUsername = () => {
    if (!isFinished) return null;
    // Check for timeout - the player whose time ran out loses
    if (whiteTime === 0) {
      // White ran out of time, so black wins
      return myColor === "black" ? guest?.username : opponent?.username;
    }
    if (blackTime === 0) {
      // Black ran out of time, so white wins
      return myColor === "white" ? guest?.username : opponent?.username;
    }
    // Check for regular win (checkmate, resignation)
    if (gameState?.winner) {
      return gameState.winner === myColor ? guest?.username : opponent?.username;
    }
    return null;
  };

  const getLoserUsername = () => {
    if (!isFinished) return null;
    // Check for timeout - the player whose time ran out loses
    if (whiteTime === 0) {
      // White ran out of time, white loses
      return myColor === "white" ? guest?.username : opponent?.username;
    }
    if (blackTime === 0) {
      // Black ran out of time, black loses
      return myColor === "black" ? guest?.username : opponent?.username;
    }
    // Check for regular win (checkmate, resignation)
    if (gameState?.winner) {
      return gameState.winner === myColor ? opponent?.username : guest?.username;
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
  const gameEndReason = getGameEndReason();
  const winnerUsername = getWinnerUsername();
  const loserUsername = getLoserUsername();

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
        {(isPlaying || isFinished) && <FloatingPiecesDecoration />}

        {/* WAITING ROOM */}
        {isWaiting && room && guest && (
          <>
            <Header />
            <main className="pt-24 pb-12 px-4">
              <TimeControlSelector
                selectedTime={selectedTime}
                onTimeChange={handleTimeChange}
                isHost={isHost}
              />
              <WaitingRoom
                roomCode={roomCode}
                gameTitle={"Chess"}
                players={players}
                isHost={isHost}
                minPlayers={2}
                maxPlayers={2}
                onStart={handleStartGame}
                onLeave={handleLeaveRoom}
                currentSessionId={guest?.sessionId || ''}
                headerContent={<div className="text-6xl mb-2">♟️♛</div>}
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
                <PlayerBar
                  username={opponent?.username || "Waiting..."}
                  color={opponentColor}
                  time={opponentColor === "white" ? whiteTime : blackTime}
                  isCurrentTurn={gameState.turn === opponentColor}
                  isFinished={isFinished}
                  isWinner={isFinished && gameState.winner ? gameState.winner === opponentColor : null}
                  fen={gameState.fen}
                  isCurrentPlayer={false}
                />

                {/* Chess Board */}
                <div className="rounded overflow-hidden shadow-lg relative">
                  <ChessBoard
                    fen={displayFen}
                    orientation={myColor}
                    canMove={gameState.turn === myColor && !isFinished && !isViewingHistory}
                    onMove={handleMove}
                    theme={boardTheme}
                    pieceTheme={pieceTheme}
                    size={800}
                    winner={isFinished ? gameState.winner : null}
                    isInCheck={gameState.status === "check"}
                  />
                  {/* History Mode Indicator */}
                  {isViewingHistory && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
                      </svg>
                      Viewing History
                    </div>
                  )}
                </div>

                {/* Your Player Bar */}
                <PlayerBar
                  username={guest?.username || "You"}
                  color={myColor}
                  time={myColor === "white" ? whiteTime : blackTime}
                  isCurrentTurn={gameState.turn === myColor}
                  isFinished={isFinished}
                  isWinner={isFinished && gameState.winner ? gameState.winner === myColor : null}
                  fen={gameState.fen}
                  isCurrentPlayer={true}
                />
              </div>

              {/* RIGHT: SIDE PANEL */}
              <GameSidePanel
                moveHistory={gameState.moveHistory}
                viewMoveIndex={viewMoveIndex}
                setViewMoveIndex={setViewMoveIndex}
                isFinished={isFinished}
                winner={winner || null}
                onOfferDraw={handleOfferDraw}
                onResign={handleResign}
                onOfferRematch={handleOfferRematch}
                myUsername={guest?.username || ""}
                opponentUsername={opponent?.username || ""}
                timeControlMinutes={selectedTime}
                currentBoardTheme={boardTheme}
                currentPieceTheme={pieceTheme}
                onBoardThemeChange={setBoardTheme}
                onPieceThemeChange={setPieceTheme}
              />
            </div>
          </div>
        )}

        {/* Game Modals */}
        <GameModals
          showAbortConfirm={showAbortConfirm}
          onCancelAbort={cancelAbort}
          onConfirmAbort={confirmAbort}
          drawOffer={drawOffer}
          currentSessionId={guest?.sessionId || ""}
          onAcceptDraw={handleAcceptDraw}
          onRejectDraw={handleRejectDraw}
          rematchOffer={rematchOffer}
          onAcceptRematch={handleAcceptRematch}
          onRejectRematch={handleRejectRematch}
          drawRejectedNotif={drawRejectedNotif}
          rematchRejectedNotif={rematchRejectedNotif}
          abortedBy={abortedBy}
          // Winner popup props
          isGameOver={isFinished}
          winner={gameState?.winner}
          myColor={myColor}
          winnerUsername={winnerUsername}
          loserUsername={loserUsername}
          myUsername={guest?.username}
          opponentUsername={opponent?.username}
          gameEndReason={gameEndReason}
          onOfferRematch={handleOfferRematch}
          onLeaveRoom={handleLeaveRoom}
          rematchPending={rematchPending}
          // Resign confirmation props
          showResignConfirm={showResignConfirm}
          onCancelResign={cancelResign}
          onConfirmResign={confirmResign}
        />
      </div>
    </LudoThemeProvider>
  );
}