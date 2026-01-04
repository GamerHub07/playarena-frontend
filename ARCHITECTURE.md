# PlayArena Frontend Architecture

## Developer Onboarding & Extension Guide

This document explains how the frontend is structured and how to add new games.

---

## 1. Technology Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type safety |
| **TailwindCSS 4** | Styling |
| **Socket.IO Client** | Real-time communication |
| **Axios** | HTTP API calls |

---

## 2. Folder Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles
│   └── games/
│       ├── ludo/           # Ludo game pages
│       │   ├── page.tsx          # Lobby (create/join)
│       │   └── [roomId]/page.tsx # Game room
│       └── monopoly/       # Monopoly game pages
│           ├── page.tsx
│           └── [roomId]/page.tsx
│
├── components/
│   ├── ui/                 # Reusable UI (Button, Modal, Card, Input)
│   ├── layout/             # Header, etc.
│   └── games/
│       ├── ludo/           # Ludo-specific (Board, Dice, WaitingRoom)
│       └── monopoly/       # Monopoly-specific components
│
├── hooks/
│   ├── useSocket.ts        # Socket.IO connection hook
│   ├── useGuest.ts         # Guest session management
│   └── useTheme.tsx        # Theme context
│
├── lib/
│   ├── api.ts              # HTTP API client (guestApi, roomApi)
│   └── socket.ts           # Socket.IO singleton
│
└── types/
    ├── game.ts             # Shared types (Guest, Player, Room)
    ├── ludo.ts             # Ludo game state types
    └── monopoly.ts         # Monopoly game state types
```

---

## 3. Core Architecture

### Page Structure (per game)

```
/games/{gameType}/          → Lobby page (create/join room)
/games/{gameType}/[roomId]  → Game room (socket-connected gameplay)
```

### Data Flow

```
┌─────────────────┐     HTTP      ┌─────────────────┐
│    Frontend     │ ────────────► │     Backend     │
│                 │               │                 │
│  useGuest()     │  POST /guest  │  Create session │
│  roomApi        │  POST /rooms  │  Create room    │
└────────┬────────┘               └─────────────────┘
         │
         │ Socket.IO (real-time)
         ▼
┌─────────────────┐               ┌─────────────────┐
│   useSocket()   │ ◄───────────► │  Socket Server  │
│                 │               │                 │
│  room:join      │               │  room:update    │
│  game:start     │               │  game:state     │
│  game:action    │               │  game:winner    │
└─────────────────┘               └─────────────────┘
```

---

## 4. Key Hooks

### `useSocket`

Manages Socket.IO connection lifecycle.

```typescript
const { socket, isConnected, emit, on } = useSocket();

// Emit events
emit('game:action', { roomCode, action: 'roll' });

// Listen to events
useEffect(() => {
    const unsub = on('game:state', (data) => { ... });
    return () => unsub();
}, [on]);
```

### `useGuest`

Manages guest session (localStorage + API).

```typescript
const { guest, loading, login } = useGuest();

// Login creates session via API
await login('username');
```

---

## 5. Adding a New Game

### Step 1: Create Types

```
src/types/{game}.ts
```

Define game state, player state, and any constants.

### Step 2: Create Lobby Page

```
src/app/games/{game}/page.tsx
```

- Import shared UI components (Button, Modal, Card)
- Use `useGuest` for session
- Use `roomApi.create(sessionId, 'gameType')` to create rooms

### Step 3: Create Game Room Page

```
src/app/games/{game}/[roomId]/page.tsx
```

- Use `useSocket` for real-time events
- Join room on mount: `emit('room:join', { roomCode, sessionId, username })`
- Listen to `game:start`, `game:state`, `game:winner`
- Emit `game:action` for player moves

### Step 4: Create Components

```
src/components/games/{game}/
├── Board.tsx       # Main game board
├── Dice.tsx        # If applicable
└── ...
```

### Step 5: Add to Landing Page

Update `src/app/page.tsx` GAMES array:

```typescript
{
    id: 'newgame',
    title: 'New Game',
    players: '2-4 Players',
    image: '/games/newgame.png',
    href: '/games/newgame',
    available: true,
    theme: 'bg-purple-500 text-white',
}
```

---

## 6. Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `room:join` | Client → Server | Join a room |
| `room:leave` | Client → Server | Leave room |
| `room:update` | Server → Client | Room state changed |
| `game:start` | Bidirectional | Start game |
| `game:action` | Client → Server | Player action |
| `game:state` | Server → Client | Game state update |
| `game:winner` | Server → Client | Game ended |
| `error` | Server → Client | Error message |

---

## 7. Shared UI Components

| Component | Path | Description |
|-----------|------|-------------|
| `Button` | `ui/Button.tsx` | Primary/secondary buttons |
| `Card` | `ui/Card.tsx` | Container card |
| `Modal` | `ui/Modal.tsx` | Dialog overlay |
| `Input` | `ui/Input.tsx` | Text input |
| `Header` | `layout/Header.tsx` | Navigation header |

---

## 8. Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 9. Production Safety

When working on this project:

❌ Do NOT rename socket events  
❌ Do NOT change payload formats  
❌ Keep backward compatibility  

✅ Follow existing patterns  
✅ Reuse shared components  
✅ Test with multiple tabs/browsers  

---

## 10. Quick Reference

| Want to... | Do this... |
|------------|------------|
| Create a room | `roomApi.create(sessionId, gameType)` |
| Join a room | `emit('room:join', { roomCode, sessionId, username })` |
| Send player action | `emit('game:action', { roomCode, action, data })` |
| Get game updates | `on('game:state', (data) => ...)` |
| Show loading | `if (loading) return <Spinner />` |

---

Welcome to PlayArena 🚀
