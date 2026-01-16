# 3D Tic-Tac-Toe Architecture

**Version:** 1.0
**Last Updated:** January 2026
**Status:** Synthesis of 10 research documents

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Diagram](#architecture-diagram)
4. [Component Hierarchy](#component-hierarchy)
5. [State Management Strategy](#state-management-strategy)
6. [Data Flow Patterns](#data-flow-patterns)
7. [Integration Points](#integration-points)
8. [Module Specifications](#module-specifications)
9. [Performance Budget](#performance-budget)
10. [Development Workflow](#development-workflow)

---

## System Overview

3D Tic-Tac-Toe is a browser-based game featuring a 3×3×3 cubic grid with 27 playable positions and 49 winning lines. The architecture separates concerns into distinct layers:

- **Presentation Layer:** React Three Fiber for 3D, HTML overlays for UI
- **State Layer:** Zustand stores for game state and settings
- **Logic Layer:** Pure functions for game rules and AI computation
- **Service Layer:** Web Worker for AI, Web Audio API for sound

### Design Principles

1. **Separation of Concerns:** 3D scene, 2D UI, game logic, and AI are decoupled
2. **Immutable State:** All state updates return new objects
3. **Performance First:** 60 FPS target on all devices
4. **Accessibility:** WCAG 2.2 AA compliance
5. **Type Safety:** Strict TypeScript throughout

---

## Technology Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.5+ | App Router, SSR framework |
| React | 19.0+ | UI library |
| TypeScript | 5.6+ | Type safety |
| Turbopack | Latest | Build system (76% faster) |

### 3D Rendering

| Technology | Version | Purpose |
|------------|---------|---------|
| Three.js | 0.182.0 | WebGL renderer |
| @react-three/fiber | 9.5.0 | React reconciler for Three.js |
| @react-three/drei | 10.7.7 | Helper components |
| @react-spring/three | Latest | 3D animations |

### State & Logic

| Technology | Version | Purpose |
|------------|---------|---------|
| Zustand | 5.0.10 | State management |
| Web Workers | Native | AI computation offloading |

### UI & Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | 3.x | Utility-first styling |
| Framer Motion | Latest | 2D UI animations |
| Lucide React | Latest | Icon library |

### Audio

| Technology | Version | Purpose |
|------------|---------|---------|
| Web Audio API | Native | Procedural sound generation |
| use-sound | Latest | (Optional) Sound file playback |

### Development Tools

| Tool | Purpose |
|------|---------|
| ESLint 9 / Biome | Linting (Biome 15-20x faster) |
| Prettier | Code formatting |
| TypeScript | Type checking |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER WINDOW                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │               HTML OVERLAY (z-index: 10)                  │ │
│  │  ┌──────────────┬──────────────┬──────────────────────┐  │ │
│  │  │  MainMenu    │   GameHUD    │     GameOver         │  │ │
│  │  │  Settings    │  (2D React)  │  ScreenReaderAnnounce│  │ │
│  │  └──────────────┴──────────────┴──────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌───────────────────────────▼───────────────────────────────┐ │
│  │                 REACT THREE FIBER CANVAS                  │ │
│  │  ┌──────────────────────────────────────────────────────┐│ │
│  │  │                    3D SCENE                          ││ │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    ││ │
│  │  │  │ GameBoard  │  │ XPiece(s)  │  │ OPiece(s)  │    ││ │
│  │  │  │  (27 Cells)│  │            │  │            │    ││ │
│  │  │  └────────────┘  └────────────┘  └────────────┘    ││ │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    ││ │
│  │  │  │  Camera    │  │  Lighting  │  │  WinLine   │    ││ │
│  │  │  │OrbitControl│  │            │  │            │    ││ │
│  │  │  └────────────┘  └────────────┘  └────────────┘    ││ │
│  │  └──────────────────────────────────────────────────────┘│ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
        ┌──────────────────────┴───────────────────────┐
        │                                              │
   ┌────▼────┐                                   ┌────▼────┐
   │ Zustand │                                   │  Web    │
   │  Store  │                                   │ Worker  │
   │         │                                   │  (AI)   │
   │ ┌─────┐ │                                   │         │
   │ │Game │ │◄──────────────────────────────────┤ minimax │
   │ │State│ │                                   │ alpha-  │
   │ └─────┘ │                                   │ beta    │
   │ ┌─────┐ │                                   └─────────┘
   │ │Input│ │
   │ │State│ │
   │ └─────┘ │
   │ ┌─────┐ │
   │ │Setng│ │
   │ └─────┘ │
   └─────────┘
       │
   ┌───▼────────────────────────────────────┐
   │        GAME LOGIC LIBRARY             │
   │  ┌──────────────────────────────────┐ │
   │  │ gameLogic.ts                     │ │
   │  │  • checkWinFromLastMove()        │ │
   │  │  • makeMove()                    │ │
   │  │  • canMakeMove()                 │ │
   │  │  • WINNING_LINES (49 lines)      │ │
   │  └──────────────────────────────────┘ │
   │  ┌──────────────────────────────────┐ │
   │  │ aiEngine.ts                      │ │
   │  │  • minimax()                     │ │
   │  │  • evaluateBoard()               │ │
   │  │  • getBestMove()                 │ │
   │  └──────────────────────────────────┘ │
   └────────────────────────────────────────┘
```

---

## Component Hierarchy

### Application Root

```
<App> (Next.js App Router)
├── <RootLayout>
│   ├── <head> (fonts, metadata)
│   └── <body>
│       ├── <GamePage>
│       │   ├── <Canvas> (R3F)
│       │   │   └── <Scene>
│       │   │       ├── <PerspectiveCamera>
│       │   │       ├── <OrbitControls>
│       │   │       ├── <Lighting>
│       │   │       ├── <GameBoard>
│       │   │       │   └── <GridCell> × 27
│       │   │       │       └── <InteractiveCell>
│       │   │       ├── <Pieces>
│       │   │       │   ├── <XPiece> × n
│       │   │       │   └── <OPiece> × n
│       │   │       └── <WinLineVisualizer>
│       │   └── <UIOverlay>
│       │       ├── <MainMenu> (phase === 'menu')
│       │       ├── <GameHUD> (phase === 'playing')
│       │       ├── <GameOver> (phase === 'gameOver')
│       │       ├── <Settings> (isSettingsOpen)
│       │       └── <ScreenReaderAnnouncements>
│       └── <AudioSystem>
└── <WebWorker> (aiWorker.ts, separate thread)
```

### Component Organization

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with fonts
│   ├── page.tsx                  # Landing page
│   └── game/
│       └── page.tsx              # Main game page
│
├── components/
│   ├── game/                     # 3D Components (client-side)
│   │   ├── Scene.tsx             # Canvas wrapper
│   │   ├── GameBoard.tsx         # Grid structure
│   │   ├── GridCell.tsx          # Individual cell
│   │   ├── InteractiveCell.tsx   # Click/hover handling
│   │   ├── XPiece.tsx            # X marker geometry
│   │   ├── OPiece.tsx            # O marker geometry
│   │   ├── WinLineVisualizer.tsx # Winning line highlight
│   │   ├── Lighting.tsx          # Scene lighting
│   │   └── CameraSetup.tsx       # Camera + controls
│   │
│   └── ui/                       # 2D UI Components
│       ├── UIOverlay.tsx         # Overlay container
│       ├── MainMenu.tsx          # Start screen
│       ├── GameHUD.tsx           # In-game HUD
│       ├── GameOver.tsx          # End screen
│       ├── Settings.tsx          # Settings panel
│       ├── Button.tsx            # Reusable button
│       ├── ToggleSwitch.tsx      # Toggle component
│       └── ScreenReaderAnnouncements.tsx
│
├── hooks/                        # Custom React Hooks
│   ├── useGameState.ts           # Game state management
│   ├── useAI.ts                  # AI worker interface
│   ├── useAudio.ts               # Sound effects
│   ├── useKeyboardNav.ts         # Keyboard controls
│   └── useResponsive.ts          # Responsive helpers
│
├── lib/                          # Pure Logic (no React)
│   ├── gameLogic.ts              # Core game rules
│   ├── aiEngine.ts               # Minimax algorithm
│   ├── constants.ts              # WINNING_LINES, config
│   ├── proceduralAudio.ts        # Web Audio API
│   └── utils.ts                  # Helper functions
│
├── stores/                       # Zustand State Management
│   ├── gameStore.ts              # Game state + actions
│   ├── inputStore.ts             # Input state
│   └── settingsStore.ts          # User settings
│
├── types/                        # TypeScript Definitions
│   ├── game.ts                   # Game types
│   ├── ai.ts                     # AI types
│   └── three.d.ts                # R3F type extensions
│
└── workers/                      # Web Workers
    └── aiWorker.ts               # AI computation thread
```

---

## State Management Strategy

### Zustand Store Architecture

**Why Zustand?**
- Created by the R3F team for this exact use case
- No provider hell, no context re-renders
- Minimal API surface (4KB bundle)
- Selective subscriptions prevent unnecessary re-renders

### Game Store (`gameStore.ts`)

```typescript
interface GameState {
  // Core Game State
  board: CellState[];              // 27-element array
  currentPlayer: Player;           // 'X' | 'O'
  phase: GamePhase;                // 'menu' | 'playing' | 'gameOver'
  winner: GameOutcome;             // Player | 'draw' | null
  winningLine: number[] | null;    // Indices of winning line
  moveCount: number;               // Total moves made

  // Game Configuration
  gameMode: 'pvp' | 'ai';
  aiDifficulty: 'easy' | 'medium' | 'hard' | 'impossible';
  isAIThinking: boolean;

  // Actions
  startGame: () => void;
  makeMove: (index: number) => void;
  restartGame: () => void;
  returnToMenu: () => void;
  setGameMode: (mode: 'pvp' | 'ai') => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  board: Array(27).fill('empty'),
  currentPlayer: 'X',
  phase: 'menu',
  winner: null,
  winningLine: null,
  moveCount: 0,
  gameMode: 'pvp',
  aiDifficulty: 'medium',
  isAIThinking: false,

  startGame: () => set({ phase: 'playing', board: Array(27).fill('empty') }),

  makeMove: (index: number) => {
    const state = get();
    const newState = makeMove(state, index);
    if (newState) {
      set(newState);

      // Trigger AI move if needed
      if (newState.gameMode === 'ai' &&
          newState.currentPlayer === 'O' &&
          newState.phase === 'playing') {
        get().triggerAIMove();
      }
    }
  },

  // ... other actions
}));
```

### Settings Store (`settingsStore.ts`)

```typescript
interface SettingsState {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  accessibilityMode: boolean;
  firstPlayer: Player;

  updateSettings: (partial: Partial<SettingsState>) => void;
}
```

### Input Store (`inputStore.ts`)

```typescript
interface InputState {
  focusedCell: number | null;
  hoveredCell: number | null;
  isDragging: boolean;

  setFocusedCell: (index: number | null) => void;
  setHoveredCell: (index: number | null) => void;
}
```

### Selective Subscriptions (CRITICAL)

```typescript
// ✅ GOOD: Only subscribes to specific cell
const cell = useGameStore(state => state.board[index]);

// ❌ BAD: Subscribes to entire store (re-renders on every change)
const { board } = useGameStore();

// ✅ GOOD: Selector function
const currentPlayer = useGameStore(state => state.currentPlayer);

// ✅ GOOD: Multiple specific subscriptions
const phase = useGameStore(state => state.phase);
const winner = useGameStore(state => state.winner);
```

---

## Data Flow Patterns

### User Move Flow

```
1. User clicks 3D cell
   └─> InteractiveCell.onClick()
       └─> useGameStore.getState().makeMove(index)
           └─> gameLogic.makeMove(state, index)
               ├─> Validates move
               ├─> Updates board
               ├─> Checks for winner (checkWinFromLastMove)
               └─> Returns new state
                   └─> Zustand updates store
                       ├─> Board re-renders (new piece appears)
                       ├─> HUD updates (turn indicator)
                       ├─> Audio plays (place sound)
                       └─> IF (gameMode === 'ai' && currentPlayer === 'O')
                           └─> Trigger AI move

2. AI Move Flow (if applicable)
   └─> useGameStore.triggerAIMove()
       └─> set({ isAIThinking: true })
           └─> aiWorker.postMessage({ board, player, difficulty })
               └─> [Web Worker Thread]
                   └─> minimax(board, depth, alpha, beta)
                       └─> getBestMove() → returns index
                           └─> postMessage({ move: index })
                               └─> [Main Thread]
                                   └─> useGameStore.makeMove(index)
                                       └─> (same flow as user move)
```

### Win Detection Flow

```
makeMove(state, index)
  └─> newBoard = [...state.board]
  └─> newBoard[index] = currentPlayer
  └─> winningLine = checkWinFromLastMove(newBoard, index)
      └─> relevantLines = WINNING_LINES.filter(line => line.includes(index))
      └─> for each line:
          └─> if (all three cells === currentPlayer):
              └─> return line
      └─> return null
  └─> if (winningLine):
      └─> phase = 'gameOver'
      └─> winner = currentPlayer
      └─> audio.playWin()
      └─> animate WinLine component
```

### Input Event Flow

```
Mouse Click
  └─> R3F Raycasting (automatic)
      └─> mesh.onClick(event)
          └─> event.stopPropagation()
          └─> if (canMakeMove(state, index)):
              └─> makeMove(index)

Keyboard Navigation
  └─> useKeyboardNav hook
      └─> useEffect(() => {
          document.addEventListener('keydown', handleKeyDown)
          })
      └─> handleKeyDown(e):
          ├─> ArrowKeys → navigate focus
          ├─> Enter/Space → makeMove(focusedCell)
          ├─> R → restartGame()
          └─> Esc → returnToMenu()
```

### Animation Data Flow

```
State Change (e.g., piece placed)
  └─> Component re-renders with new prop
      └─> useSpring({ from: { scale: 0 }, to: { scale: 1 } })
          └─> animated.mesh renders with interpolated values
              └─> 60 FPS animation via RAF (requestAnimationFrame)

Win Line Animation
  └─> winningLine changes from null → [a, b, c]
      └─> WinLineVisualizer mounts
          └─> useSpring({ progress: 0 → 1, glow: 0.2 ↔ 0.5 })
              └─> Line draws from start to end
              └─> Glow pulses in infinite loop
```

---

## Integration Points

### 1. React Three Fiber ↔ Game Logic

**Interface:** Zustand Store

```typescript
// 3D Component reads from store
function GridCell({ index }: { index: number }) {
  const cellState = useGameStore(state => state.board[index]);
  const makeMove = useGameStore(state => state.makeMove);

  return (
    <InteractiveCell
      isEmpty={cellState === 'empty'}
      onClick={() => makeMove(index)}
    />
  );
}
```

**Key Considerations:**
- 3D components are client-side only (`'use client'`)
- Use dynamic imports with `ssr: false` in Next.js pages
- Store access via `useGameStore.getState()` for non-reactive reads

### 2. AI Worker ↔ Main Thread

**Interface:** Web Worker postMessage API

```typescript
// Main Thread → Worker
aiWorker.postMessage({
  board: state.board,
  aiPlayer: 'O',
  difficulty: state.aiDifficulty,
});

// Worker → Main Thread
aiWorker.onmessage = (e: MessageEvent) => {
  const { move } = e.data;
  useGameStore.getState().makeMove(move);
};
```

**Key Considerations:**
- Worker receives serializable data only (no functions, DOM nodes)
- AI computation never blocks UI thread
- Add artificial delay (300-1500ms) for UX

### 3. UI Overlay ↔ 3D Scene

**Interface:** Fixed positioning with z-index layers

```css
/* 3D Canvas */
.r3f-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
}

/* UI Overlay */
.ui-overlay {
  position: fixed;
  inset: 0;
  z-index: 10;
  pointer-events: none; /* Allow clicks through to canvas */
}

.ui-overlay button {
  pointer-events: auto; /* Re-enable for interactive elements */
}
```

**Key Considerations:**
- UI and 3D are completely decoupled
- Both read from same Zustand store
- No direct component communication needed

### 4. Input System ↔ Game Logic

**Interface:** Store actions

```typescript
// Raycasting (3D)
<mesh onClick={() => makeMove(index)} />

// Keyboard (global)
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') makeMove(focusedCell);
  };
  window.addEventListener('keydown', handleKey);
  return () => window.removeEventListener('keydown', handleKey);
}, [focusedCell]);
```

**Key Considerations:**
- All input ultimately calls `makeMove(index)`
- Input validation happens in game logic, not input handlers
- Hover/focus state tracked in separate `inputStore`

### 5. Animation System ↔ State Changes

**Interface:** React Spring + useFrame

```typescript
// State-driven animation
function AnimatedPiece({ position }: { position: [number, number, number] }) {
  const { scale } = useSpring({
    from: { scale: 0 },
    to: { scale: 1 },
  });

  return <animated.mesh position={position} scale={scale} />;
}

// Frame-driven animation (hover)
function HoverCell() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    // Direct mutation (no state updates)
    meshRef.current.scale.lerp(targetScale, 0.1);
  });

  return <mesh ref={meshRef} />;
}
```

**Key Considerations:**
- **Never** update state in `useFrame` (causes 60 FPS re-renders)
- Use refs for smooth animations without React re-renders
- State-driven for mount/unmount animations
- Frame-driven for continuous effects

### 6. Audio System ↔ Game Events

**Interface:** Hook listening to store changes

```typescript
function useGameAudio() {
  const phase = useGameStore(state => state.phase);
  const winner = useGameStore(state => state.winner);
  const moveCount = useGameStore(state => state.moveCount);
  const soundEnabled = useSettingsStore(state => state.soundEnabled);

  const prevMoveCount = useRef(moveCount);

  useEffect(() => {
    if (moveCount > prevMoveCount.current && soundEnabled) {
      audio.playPlace();
    }
    prevMoveCount.current = moveCount;
  }, [moveCount, soundEnabled]);

  useEffect(() => {
    if (phase === 'gameOver' && soundEnabled) {
      winner === 'draw' ? audio.playDraw() : audio.playWin();
    }
  }, [phase, winner, soundEnabled]);
}
```

---

## Module Specifications

### 1. Game Logic Module (`lib/gameLogic.ts`)

**Purpose:** Pure functions for game rules, no side effects

**Exports:**
- `WINNING_LINES: ReadonlyArray<[number, number, number]>` - All 49 winning combinations
- `createInitialGameState(): GameState` - Factory function
- `makeMove(state, index): GameState | null` - Immutable state transition
- `canMakeMove(state, index): boolean` - Validation
- `checkWinFromLastMove(board, index): number[] | null` - Win detection
- `getEmptyCells(board): number[]` - Available moves
- `toIndex(x, y, z): number` - 3D → 1D mapping
- `toCoord(index): [number, number, number]` - 1D → 3D mapping

**Key Algorithm:**
```typescript
export function checkWinFromLastMove(
  board: CellState[],
  lastMoveIndex: number
): number[] | null {
  // Only check lines containing the last move (optimization)
  const relevantLines = WINNING_LINES.filter(line =>
    line.includes(lastMoveIndex)
  );

  for (const line of relevantLines) {
    const [a, b, c] = line;
    if (
      board[a] !== 'empty' &&
      board[a] === board[b] &&
      board[b] === board[c]
    ) {
      return [...line];
    }
  }

  return null;
}
```

### 2. AI Engine Module (`lib/aiEngine.ts`)

**Purpose:** Minimax algorithm with alpha-beta pruning

**Exports:**
- `getBestMove(board, player, difficulty): number` - Main entry point
- `minimax(board, depth, alpha, beta, player): number` - Recursive algorithm
- `evaluateBoard(board, player): number` - Heuristic evaluation
- `POSITION_VALUES: Record<number, number>` - Strategic position weights

**Key Algorithm:**
```typescript
function minimax(
  board: CellState[],
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiPlayer: Player
): number {
  // Terminal conditions
  const winner = checkWinner(board);
  if (winner === aiPlayer) return 10 - depth;
  if (winner === getOpponent(aiPlayer)) return depth - 10;
  if (isBoardFull(board)) return 0;
  if (depth >= MAX_DEPTH) return evaluateBoard(board, aiPlayer);

  const emptyCells = getEmptyCells(board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const index of emptyCells) {
      const newBoard = [...board];
      newBoard[index] = aiPlayer;
      const evaluation = minimax(newBoard, depth + 1, false, alpha, beta, aiPlayer);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const index of emptyCells) {
      const newBoard = [...board];
      newBoard[index] = getOpponent(aiPlayer);
      const evaluation = minimax(newBoard, depth + 1, true, alpha, beta, aiPlayer);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return minEval;
  }
}
```

**Complexity:**
- Without pruning: O(b^d) where b = branching factor, d = depth
- With alpha-beta: O(b^(d/2)) in best case
- For 3D tic-tac-toe: ~27! worst case, reduced to ~10^6 with pruning at depth 6

### 3. Scene Configuration (`lib/constants.ts`)

**Purpose:** Centralized configuration constants

**Exports:**
```typescript
// Grid dimensions
export const CELL_SIZE = 2.0;
export const CELL_SPACING = 0.3;
export const LAYER_SEPARATION = 2.3;

// Camera settings
export const CAMERA_CONFIG = {
  position: [8, 8, 8] as [number, number, number],
  fov: 50,
  near: 0.1,
  far: 1000,
};

// Orbit controls
export const ORBIT_CONFIG = {
  minPolarAngle: Math.PI * 0.2,
  maxPolarAngle: Math.PI * 0.8,
  minDistance: 10,
  maxDistance: 25,
  enablePan: false,
  enableDamping: true,
  dampingFactor: 0.05,
};

// Cell positions (pre-computed)
export const CELL_POSITIONS: [number, number, number][] = Array.from(
  { length: 27 },
  (_, i) => {
    const x = i % 3;
    const y = Math.floor(i / 3) % 3;
    const z = Math.floor(i / 9);
    return [
      (x - 1) * LAYER_SEPARATION,
      (y - 1) * LAYER_SEPARATION,
      (z - 1) * LAYER_SEPARATION,
    ];
  }
);

// Animation timings
export const ANIMATION_CONFIG = {
  pieceSpring: { tension: 200, friction: 20 },
  hoverDuration: 150,
  transitionDuration: 200,
};
```

### 4. Web Worker (`workers/aiWorker.ts`)

**Purpose:** Offload AI computation to separate thread

```typescript
// aiWorker.ts
self.onmessage = (e: MessageEvent) => {
  const { board, aiPlayer, difficulty } = e.data;

  const startTime = performance.now();
  const bestMove = calculateBestMove(board, aiPlayer, difficulty);
  const elapsed = performance.now() - startTime;

  // Artificial delay for UX (min 300ms)
  const delay = Math.max(0, 300 - elapsed);

  setTimeout(() => {
    self.postMessage({ move: bestMove });
  }, delay);
};

function calculateBestMove(
  board: CellState[],
  aiPlayer: Player,
  difficulty: string
): number {
  switch (difficulty) {
    case 'easy':
      return getEasyMove(board, aiPlayer);
    case 'medium':
      return getMediumMove(board, aiPlayer);
    case 'hard':
      return minimaxWithDepth(board, aiPlayer, 6);
    case 'impossible':
      return getBestMove(board, aiPlayer); // Full minimax
    default:
      return getRandomMove(board);
  }
}
```

---

## Performance Budget

### Target Metrics

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Frame Rate | 60 FPS | 30 FPS |
| Initial Load | < 2s | < 3s |
| Time to Interactive | < 3s | < 5s |
| Bundle Size (JS) | < 300KB | < 500KB |
| Draw Calls | < 50 | < 100 |
| Memory Usage | < 100MB | < 200MB |

### Performance Strategies

1. **3D Rendering**
   - Cap DPR at 2 (`dpr={[1, 2]}`)
   - Disable shadows (`shadows={false}`)
   - Use low-poly geometry (< 10k triangles total)
   - No instancing needed (only 27 cells)

2. **State Management**
   - Selective Zustand subscriptions
   - Never update state in `useFrame`
   - Use refs for animation values

3. **Code Splitting**
   - Dynamic import for 3D scene (`ssr: false`)
   - Lazy load settings panel
   - Web Worker for AI

4. **Bundle Optimization**
   - Tree-shake Drei helpers
   - Use Biome instead of ESLint (15-20x faster)
   - Turbopack for dev server (76% faster)

### Monitoring

```typescript
// Development only
if (process.env.NODE_ENV === 'development') {
  useFrame(({ gl }) => {
    console.log('Memory:', gl.info.memory);
    console.log('Render calls:', gl.info.render.calls);
  });
}
```

---

## Development Workflow

### Phase-Based Development

**CRITICAL:** Must follow in order:

1. ✅ **Research Phase** (Complete)
   - All 10 research documents created
   - Technology decisions finalized

2. ✅ **Documentation Phase** (Complete)
   - This ARCHITECTURE.md synthesizes all research

3. **Planning Phase** (Next)
   - Create technical specifications
   - Define component interfaces
   - Write acceptance criteria

4. **Asset Phase**
   - Set up fonts (Google Fonts)
   - Create/acquire sound effects
   - Generate favicons

5. **Implementation Phase** (Only after above)
   - Project initialization
   - Component development
   - Testing and refinement

### Git Workflow

```bash
# Feature branches
git checkout -b feature/game-logic
git checkout -b feature/3d-scene
git checkout -b feature/ai-system

# Commit conventions
git commit -m "feat: implement win detection algorithm"
git commit -m "fix: resolve hover state memory leak"
git commit -m "docs: update architecture diagrams"
```

### Testing Strategy

```typescript
// Unit tests for game logic
describe('checkWinFromLastMove', () => {
  it('detects horizontal win', () => {
    const board = ['X', 'X', 'X', ...];
    expect(checkWinFromLastMove(board, 2)).toEqual([0, 1, 2]);
  });
});

// Integration tests for store
describe('gameStore', () => {
  it('updates state after valid move', () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.startGame());
    act(() => result.current.makeMove(0));
    expect(result.current.board[0]).toBe('X');
  });
});
```

### Code Quality Gates

Before any commit:
1. `npm run typecheck` - TypeScript strict mode
2. `npm run lint` - ESLint/Biome
3. `npm run format` - Prettier
4. `npm test` - All tests pass

---

## Key Technical Decisions

### Decision Log

| Decision | Chosen | Rationale |
|----------|--------|-----------|
| **Framework** | Next.js 15 App Router | Required for modern Next.js, better DX |
| **3D Library** | React Three Fiber v9 | Only version compatible with React 19 |
| **State Management** | Zustand | Created by R3F team, minimal overhead |
| **Linter** | Biome (2026) | 15-20x faster than ESLint |
| **Bundler** | Turbopack | 76% faster startup than Webpack |
| **Animation** | @react-spring/three | Best R3F integration, small bundle |
| **Audio** | Procedural Web Audio | No licensing, no external files |
| **Typography** | Space Grotesk + Inter | Modern, legible, open license |
| **Colors** | Cyan + Magenta | High contrast, colorblind-safe |
| **AI Algorithm** | Minimax + Alpha-Beta | Industry standard for perfect play |
| **AI Threading** | Web Worker | Prevents UI blocking |

---

## Integration Checklist

Before implementation, verify:

- [ ] All research documents read and understood
- [ ] Component interfaces defined
- [ ] State shape finalized
- [ ] Type definitions created
- [ ] Asset sources identified
- [ ] Performance budgets set
- [ ] Testing strategy documented
- [ ] Accessibility requirements clear
- [ ] Browser compatibility confirmed
- [ ] Deployment strategy planned

---

## References

### Internal Documents

1. `NEXTJS_SETUP.md` - Project initialization, dependencies, configuration
2. `3D_TECHNOLOGY.md` - R3F, Drei, Zustand, event handling
3. `GAME_LOGIC.md` - 49 winning lines, move validation, win detection
4. `AI_SYSTEM.md` - Minimax algorithm, difficulty levels, Web Worker
5. `SCENE_DESIGN.md` - Camera, lighting, geometry, spatial layout
6. `INPUT_SYSTEM.md` - Raycasting, keyboard nav, accessibility
7. `UI_DESIGN.md` - Overlay components, responsive design
8. `VISUAL_DESIGN.md` - Color palette, typography, materials
9. `ANIMATION_AUDIO.md` - Spring animations, sound effects
10. `ASSET_MANIFEST.md` - Fonts, icons, licensing

### External Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React Three Fiber v9 Docs](https://r3f.docs.pmnd.rs/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Three.js Manual](https://threejs.org/docs/)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)

---

**Document Status:** Complete
**Next Steps:** Proceed to Planning Phase
**Approval Required:** Before implementation begins
