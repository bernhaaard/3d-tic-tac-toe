# System Integration Specification

**Last Updated:** January 2026
**Scope:** State flow, event system, Zustand store architecture, component communication, async operations

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   UIOverlay (HTML)                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │MainMenu  │  │ GameHUD  │  │GameOver  │           │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘           │  │
│  │       │             │              │                  │  │
│  │       └─────────────┼──────────────┘                 │  │
│  └───────────────────┬─┘──────────────────────────────  │  │
│                      │                                   │  │
│  ┌───────────────────▼────────────────────────────────┐  │  │
│  │              Zustand Game Store                    │  │  │
│  │    (Single source of truth for game state)        │  │  │
│  └───────────────────┬────────────────────────────────┘  │  │
│                      │                                   │  │
│  ┌───────────────────▼────────────────────────────────┐  │  │
│  │              Canvas (R3F)                          │  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐   │  │  │
│  │  │   Scene    │  │ GameBoard  │  │  Pieces    │   │  │  │
│  │  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘   │  │  │
│  │         │                │                │         │  │  │
│  │         └────────────────┼────────────────┘         │  │  │
│  └──────────────────────────┼──────────────────────────┘  │  │
│                             │                             │  │
│  ┌──────────────────────────▼──────────────────────────┐  │  │
│  │         Input System (Raycasting)                   │  │  │
│  └──────────────────────────┬──────────────────────────┘  │  │
│                             │                             │  │
│  ┌──────────────────────────▼──────────────────────────┐  │  │
│  │       AI Worker (Web Worker)                        │  │  │
│  │       - Minimax computation                         │  │  │
│  │       - Runs off main thread                        │  │  │
│  └─────────────────────────────────────────────────────┘  │  │
└─────────────────────────────────────────────────────────────┘
```

---

## Zustand Store Schema

### Complete Type Definitions

```typescript
// src/types/game.ts
export type CellState = 'empty' | 'X' | 'O';
export type Player = 'X' | 'O';
export type GamePhase = 'menu' | 'playing' | 'gameOver';
export type GameOutcome = Player | 'draw' | null;
export type GameMode = 'pvp' | 'ai';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'impossible';

export interface GameSettings {
  soundEnabled: boolean;
  aiDifficulty: Difficulty;
  firstPlayer: Player;
  animationSpeed: number;
}

export interface GameState {
  // Core game state
  board: CellState[];
  currentPlayer: Player;
  phase: GamePhase;
  winner: GameOutcome;
  winningLine: number[] | null;
  moveCount: number;

  // Game configuration
  gameMode: GameMode;
  settings: GameSettings;

  // UI state
  isSettingsOpen: boolean;
  isAIThinking: boolean;
  lastMove: number | null;

  // Input state
  hoveredCell: number | null;
  focusedCell: number | null;
}

export interface GameActions {
  // Game flow
  startGame: () => void;
  restartGame: () => void;
  returnToMenu: () => void;

  // Move handling
  makeMove: (index: number) => void;
  makeAIMove: () => Promise<void>;

  // Configuration
  setGameMode: (mode: GameMode) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;

  // UI control
  openSettings: () => void;
  closeSettings: () => void;
  setHoveredCell: (index: number | null) => void;
  setFocusedCell: (index: number | null) => void;
}

export type GameStore = GameState & GameActions;
```

### Store Implementation

```typescript
// src/stores/gameStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  createInitialGameState,
  makeMove as makeGameMove,
  canMakeMove,
  togglePlayer,
} from '@/lib/gameLogic';

const initialState: GameState = {
  board: Array(27).fill('empty') as CellState[],
  currentPlayer: 'X',
  phase: 'menu',
  winner: null,
  winningLine: null,
  moveCount: 0,
  gameMode: 'pvp',
  settings: {
    soundEnabled: true,
    aiDifficulty: 'medium',
    firstPlayer: 'X',
    animationSpeed: 1,
  },
  isSettingsOpen: false,
  isAIThinking: false,
  lastMove: null,
  hoveredCell: null,
  focusedCell: null,
};

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ========== Game Flow ==========

      startGame: () => {
        const { settings, gameMode } = get();
        set({
          ...createInitialGameState(),
          phase: 'playing',
          currentPlayer: settings.firstPlayer,
          gameMode,
          settings,
        });

        // If AI goes first
        if (gameMode === 'ai' && settings.firstPlayer === 'O') {
          get().makeAIMove();
        }
      },

      restartGame: () => {
        const { gameMode, settings } = get();
        set({
          ...createInitialGameState(),
          phase: 'playing',
          currentPlayer: settings.firstPlayer,
          gameMode,
          settings,
        });

        if (gameMode === 'ai' && settings.firstPlayer === 'O') {
          get().makeAIMove();
        }
      },

      returnToMenu: () => {
        set({ phase: 'menu', ...createInitialGameState() });
      },

      // ========== Move Handling ==========

      makeMove: (index: number) => {
        const state = get();

        // Validate move
        if (!canMakeMove(state, index) || state.isAIThinking) {
          return;
        }

        // Apply move using game logic
        const newState = makeGameMove(state, index);
        if (!newState) return;

        set({
          ...newState,
          lastMove: index,
        });

        // Trigger AI move if needed
        if (
          state.gameMode === 'ai' &&
          newState.phase === 'playing' &&
          newState.currentPlayer === 'O'
        ) {
          get().makeAIMove();
        }
      },

      makeAIMove: async () => {
        const state = get();

        set({ isAIThinking: true });

        try {
          const { getAIMove } = await import('@/lib/aiEngine');
          const move = await getAIMove(
            state.board,
            'O',
            state.settings.aiDifficulty
          );

          // Apply AI move
          const newState = makeGameMove(state, move);
          if (newState) {
            set({
              ...newState,
              lastMove: move,
              isAIThinking: false,
            });
          }
        } catch (error) {
          console.error('AI move failed:', error);
          set({ isAIThinking: false });
        }
      },

      // ========== Configuration ==========

      setGameMode: (mode) => set({ gameMode: mode }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // ========== UI Control ==========

      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),
      setHoveredCell: (index) => set({ hoveredCell: index }),
      setFocusedCell: (index) => set({ focusedCell: index }),
    }),
    { name: 'GameStore' }
  )
);
```

---

## Event Flow Diagrams

### Player Move Flow

```
┌─────────────┐
│    User     │
│  clicks/    │
│  taps cell  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  InteractiveCell    │
│  - onClick handler  │
│  - checks isEmpty   │
└──────┬──────────────┘
       │
       ▼
┌──────────────────────┐
│  Store.makeMove(i)   │
│  - validates move    │
│  - calls gameLogic   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  gameLogic.makeMove()│
│  - updates board     │
│  - checks winner     │
│  - returns newState  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Store updates       │
│  - board state       │
│  - currentPlayer     │
│  - winner/phase      │
└──────┬───────────────┘
       │
       ├────────────────────────┐
       │                        │
       ▼                        ▼
┌──────────────┐      ┌──────────────────┐
│ 3D Scene     │      │  UI Components   │
│ re-renders   │      │  re-render       │
│ - Pieces     │      │  - GameHUD       │
│ - WinLine    │      │  - GameOver      │
└──────────────┘      └──────────────────┘
```

### AI Move Flow

```
┌──────────────────────┐
│ Player makes move    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Store.makeMove()     │
│ - detects AI turn    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Store.makeAIMove()   │
│ - set isAIThinking   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ UI shows "thinking"  │
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ Post to Web Worker   │
│ - board state        │
│ - difficulty level   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Worker computes      │
│ - minimax algorithm  │
│ - alpha-beta pruning │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Worker returns move  │
│ - best move index    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Store.makeMove(i)    │
│ - set isAIThinking   │
│   = false            │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ UI/3D updates        │
└──────────────────────┘
```

### Game Phase Transitions

```
     ┌──────┐
     │ menu │
     └───┬──┘
         │ startGame()
         ▼
    ┌─────────┐
    │ playing │◄─────┐
    └────┬────┘      │
         │           │
         │ win/draw  │ restartGame()
         ▼           │
    ┌──────────┐    │
    │ gameOver ├────┘
    └────┬─────┘
         │ returnToMenu()
         ▼
     ┌──────┐
     │ menu │
     └──────┘
```

---

## Component Communication

### Component Props Interfaces

```typescript
// ========== 3D Components ==========

interface SceneProps {
  // No props - reads from store
}

interface GameBoardProps {
  // No props - reads from store
}

interface CellProps {
  position: [number, number, number];
  index: number;
  state: CellState;
  isHovered: boolean;
  isFocused: boolean;
  isPartOfWinningLine: boolean;
}

interface PieceProps {
  position: [number, number, number];
  player: Player;
  animateIn?: boolean;
}

interface WinLineProps {
  line: number[];
  player: Player;
}

// ========== UI Components ==========

interface UIOverlayProps {
  // No props - reads from store
}

interface MainMenuProps {
  // No props - dispatches actions
}

interface GameHUDProps {
  // No props - reads from store
}

interface GameOverProps {
  winner: GameOutcome;
  onRestart: () => void;
  onReturnToMenu: () => void;
}

interface SettingsProps {
  isOpen: boolean;
  settings: GameSettings;
  onClose: () => void;
  onUpdate: (settings: Partial<GameSettings>) => void;
}
```

### Component Data Flow

```typescript
// ========== Scene Component ==========
// Orchestrates entire 3D scene

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1.0} />
      <OrbitControls {...ORBIT_CONFIG} />
      <GameBoard />
    </>
  );
}

// ========== GameBoard Component ==========
// Renders grid + cells + pieces

function GameBoard() {
  const board = useGameStore(state => state.board);
  const winningLine = useGameStore(state => state.winningLine);
  const hoveredCell = useGameStore(state => state.hoveredCell);
  const focusedCell = useGameStore(state => state.focusedCell);

  return (
    <group>
      {/* Grid lines */}
      <GridLines />

      {/* Cells */}
      {CELL_POSITIONS.map((pos, i) => (
        <Cell
          key={i}
          position={pos}
          index={i}
          state={board[i]}
          isHovered={hoveredCell === i}
          isFocused={focusedCell === i}
          isPartOfWinningLine={winningLine?.includes(i) ?? false}
        />
      ))}

      {/* Pieces */}
      {board.map((cell, i) =>
        cell !== 'empty' ? (
          <Piece
            key={i}
            position={CELL_POSITIONS[i]}
            player={cell}
            animateIn={true}
          />
        ) : null
      )}

      {/* Win line visualization */}
      {winningLine && <WinLine line={winningLine} player={/* ... */} />}
    </group>
  );
}

// ========== Cell Component ==========
// Individual interactive cell

function Cell({
  position,
  index,
  state,
  isHovered,
  isFocused,
  isPartOfWinningLine,
}: CellProps) {
  const makeMove = useGameStore(state => state.makeMove);
  const setHoveredCell = useGameStore(state => state.setHoveredCell);
  const isAIThinking = useGameStore(state => state.isAIThinking);

  const isEmpty = state === 'empty';
  const canInteract = isEmpty && !isAIThinking;

  return (
    <group position={position}>
      {/* Invisible hit area */}
      <mesh
        visible={false}
        onClick={(e) => {
          e.stopPropagation();
          if (canInteract) makeMove(index);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (canInteract) {
            setHoveredCell(index);
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          setHoveredCell(null);
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[2.5, 2.5, 2.5]} />
      </mesh>

      {/* Visual cell */}
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          transparent
          opacity={isHovered ? 0.2 : 0.05}
          color={isPartOfWinningLine ? '#FFD700' : '#FFFFFF'}
        />
      </mesh>

      {/* Focus ring */}
      {isFocused && <FocusRing />}
    </group>
  );
}
```

---

## Hook Dependency Map

### Core Hooks

```typescript
// ========== useGameState ==========
// Simplifies store access for common patterns

export function useGameState() {
  const phase = useGameStore(state => state.phase);
  const winner = useGameStore(state => state.winner);
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const isAIThinking = useGameStore(state => state.isAIThinking);
  const gameMode = useGameStore(state => state.gameMode);

  return {
    phase,
    winner,
    currentPlayer,
    isAIThinking,
    gameMode,
    isPlaying: phase === 'playing',
    isGameOver: phase === 'gameOver',
    isPlayerTurn: currentPlayer === 'X' && !isAIThinking,
  };
}

// ========== useGameActions ==========
// Simplifies action dispatching

export function useGameActions() {
  return {
    startGame: useGameStore(state => state.startGame),
    restartGame: useGameStore(state => state.restartGame),
    returnToMenu: useGameStore(state => state.returnToMenu),
    makeMove: useGameStore(state => state.makeMove),
    openSettings: useGameStore(state => state.openSettings),
    closeSettings: useGameStore(state => state.closeSettings),
  };
}

// ========== useAI ==========
// Web Worker management

export function useAI() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/aiWorker.ts', import.meta.url)
    );

    return () => workerRef.current?.terminate();
  }, []);

  const getAIMove = useCallback(
    (
      board: CellState[],
      aiPlayer: Player,
      difficulty: Difficulty
    ): Promise<number> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'));
          return;
        }

        const timeout = setTimeout(() => {
          reject(new Error('AI timeout'));
        }, 5000);

        workerRef.current.onmessage = (e) => {
          clearTimeout(timeout);
          resolve(e.data.move);
        };

        workerRef.current.onerror = (error) => {
          clearTimeout(timeout);
          reject(error);
        };

        workerRef.current.postMessage({ board, aiPlayer, difficulty });
      });
    },
    []
  );

  return { getAIMove };
}

// ========== useAudio ==========
// Sound effect management

export function useAudio() {
  const soundEnabled = useGameStore(state => state.settings.soundEnabled);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (soundEnabled && !audioContext.current) {
      audioContext.current = new AudioContext();
    }
  }, [soundEnabled]);

  const playSound = useCallback(
    (soundType: 'move' | 'win' | 'draw' | 'invalid') => {
      if (!soundEnabled || !audioContext.current) return;

      // Play sound using Web Audio API
      const oscillator = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();

      const frequencies = {
        move: 440,
        win: 880,
        draw: 330,
        invalid: 220,
      };

      oscillator.frequency.value = frequencies[soundType];
      gainNode.gain.setValueAtTime(0.3, audioContext.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.current.currentTime + 0.2
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);
      oscillator.start();
      oscillator.stop(audioContext.current.currentTime + 0.2);
    },
    [soundEnabled]
  );

  return { playSound };
}

// ========== useKeyboardControls ==========
// Global keyboard shortcuts

export function useKeyboardControls() {
  const { phase } = useGameState();
  const { restartGame, returnToMenu, openSettings } = useGameActions();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case 'Escape':
          if (phase === 'playing') returnToMenu();
          break;
        case 'r':
        case 'R':
          if (phase === 'gameOver') restartGame();
          break;
        case 'm':
        case 'M':
          returnToMenu();
          break;
        case 's':
        case 'S':
          openSettings();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, restartGame, returnToMenu, openSettings]);
}
```

### Hook Usage Example

```typescript
// In a component
function GameHUD() {
  const { currentPlayer, isAIThinking, isPlaying } = useGameState();
  const { returnToMenu, openSettings } = useGameActions();
  const { playSound } = useAudio();

  useKeyboardControls(); // Attach global shortcuts

  useEffect(() => {
    playSound('move');
  }, [currentPlayer]);

  if (!isPlaying) return null;

  return (
    <div>
      {isAIThinking ? 'AI Thinking...' : `${currentPlayer}'s Turn`}
      <button onClick={returnToMenu}>Menu</button>
      <button onClick={openSettings}>Settings</button>
    </div>
  );
}
```

---

## Async Operation Handling

### AI Move with Loading State

```typescript
// In GameStore
makeAIMove: async () => {
  const state = get();

  // Set loading state
  set({ isAIThinking: true });

  try {
    // Import AI engine (code splitting)
    const { getAIMove } = await import('@/lib/aiEngine');

    // Get move from worker
    const move = await getAIMove(
      state.board,
      'O',
      state.settings.aiDifficulty
    );

    // Validate move is still valid (async race condition check)
    const currentState = get();
    if (currentState.phase !== 'playing' || currentState.isAIThinking === false) {
      return; // Game was reset or interrupted
    }

    // Apply move
    const newState = makeGameMove(currentState, move);
    if (newState) {
      set({
        ...newState,
        lastMove: move,
        isAIThinking: false,
      });
    }
  } catch (error) {
    console.error('AI move failed:', error);
    set({ isAIThinking: false });

    // Fallback to random move
    const emptyCells = getEmptyCells(state.board);
    if (emptyCells.length > 0) {
      const randomMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      get().makeMove(randomMove);
    }
  }
}
```

### Sound Effects (Fire and Forget)

```typescript
// In components
const { playSound } = useAudio();

// On move
useEffect(() => {
  if (lastMove !== null) {
    playSound('move');
  }
}, [lastMove]);

// On game over
useEffect(() => {
  if (winner) {
    playSound(winner === 'draw' ? 'draw' : 'win');
  }
}, [winner]);
```

### Animation Coordination

```typescript
// In Piece component
function Piece({ position, player, animateIn }: PieceProps) {
  const { scale, opacity } = useSpring({
    from: animateIn ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 },
    to: { scale: 1, opacity: 1 },
    config: { tension: 200, friction: 20 },
    onRest: () => {
      // Animation complete - could trigger sound here
    },
  });

  return (
    <animated.group position={position} scale={scale}>
      {player === 'X' ? <XPiece /> : <OPiece />}
    </animated.group>
  );
}
```

---

## State Update Patterns

### Selective Subscriptions (Performance)

```typescript
// ❌ BAD - Re-renders on ANY store change
function Cell({ index }: { index: number }) {
  const store = useGameStore();
  const cellState = store.board[index];
  // ...
}

// ✅ GOOD - Only re-renders when this cell changes
function Cell({ index }: { index: number }) {
  const cellState = useGameStore(state => state.board[index]);
  // ...
}

// ✅ GOOD - Only re-renders when hover state changes
function Cell({ index }: { index: number }) {
  const isHovered = useGameStore(state => state.hoveredCell === index);
  // ...
}
```

### Batched Updates

```typescript
// Multiple related state changes in one update
set((state) => ({
  board: newBoard,
  currentPlayer: newPlayer,
  winner: newWinner,
  phase: newPhase,
  moveCount: state.moveCount + 1,
  lastMove: index,
}));
```

### Immutable Updates

```typescript
// ❌ BAD - Mutates state
const newBoard = state.board;
newBoard[index] = 'X';
set({ board: newBoard });

// ✅ GOOD - Creates new array
const newBoard = [...state.board];
newBoard[index] = 'X';
set({ board: newBoard });

// ✅ BETTER - Functional update
set((state) => ({
  board: state.board.map((cell, i) => (i === index ? 'X' : cell)),
}));
```

---

## Cross-Component Communication Examples

### Example 1: User Makes Move

1. **User clicks cell** → `Cell.onClick`
2. **Cell validates** → checks `isEmpty` and `!isAIThinking`
3. **Cell dispatches** → `makeMove(index)`
4. **Store validates** → `canMakeMove()`
5. **Game logic** → `makeGameMove()` updates state
6. **Store updates** → new board, player, winner
7. **Components react**:
   - `GameBoard` re-renders (new board state)
   - `Piece` component animates in
   - `GameHUD` updates turn indicator
   - `useAudio` plays move sound
8. **If AI mode** → `makeAIMove()` triggered
9. **AI worker** → computes move
10. **Repeat from step 3** with AI's move

### Example 2: Game Over

1. **Move causes win** → `checkWinFromLastMove()` returns line
2. **Store updates** → `phase: 'gameOver'`, `winner: 'X'`, `winningLine: [...]`
3. **Components react**:
   - `UIOverlay` mounts `GameOver` component
   - `GameBoard` renders `WinLine` component
   - `Cell` components highlight winning line
   - `useAudio` plays win sound
4. **User clicks "Play Again"** → `restartGame()`
5. **Store resets** → `createInitialGameState()`
6. **Components reset** → UI returns to playing state

### Example 3: Settings Change

1. **User opens settings** → `openSettings()`
2. **Settings modal mounts** → reads `settings` from store
3. **User changes difficulty** → `updateSettings({ aiDifficulty: 'hard' })`
4. **Store updates settings** → persisted for next game
5. **User closes settings** → `closeSettings()`
6. **Modal unmounts** → no game state affected

---

## Performance Optimization

### Zustand Best Practices

```typescript
// ✅ Split large state into logical slices
const useGameStore = create(/* game state */);
const useUIStore = create(/* UI-only state */);
const useInputStore = create(/* input-only state */);

// ✅ Use selectors for derived state
const canPlaceMove = useGameStore(state =>
  state.phase === 'playing' &&
  !state.isAIThinking &&
  state.board[index] === 'empty'
);

// ✅ Use shallow comparison for arrays
import { shallow } from 'zustand/shallow';
const [board, winner] = useGameStore(
  state => [state.board, state.winner],
  shallow
);
```

### R3F Best Practices

```typescript
// ✅ Avoid setState in useFrame
useFrame(() => {
  // Use refs for animations, not state
  meshRef.current.rotation.y += 0.01;
});

// ❌ NEVER do this
useFrame(() => {
  setRotation(rotation + 0.01); // 60fps re-renders!
});

// ✅ Use selective subscriptions
const cellState = useGameStore(state => state.board[index]);

// ❌ Don't subscribe to entire board
const { board } = useGameStore();
```

---

## Error Handling

### AI Worker Failures

```typescript
try {
  const move = await getAIMove(board, 'O', difficulty);
  applyMove(move);
} catch (error) {
  console.error('AI failed:', error);

  // Fallback strategy
  const randomMove = getRandomEmptyCell(board);
  applyMove(randomMove);

  // Notify user
  showNotification('AI made a random move due to an error');
}
```

### Invalid Move Attempts

```typescript
makeMove: (index: number) => {
  const state = get();

  if (!canMakeMove(state, index)) {
    // Play error sound
    playSound('invalid');

    // Don't update state
    return;
  }

  // Proceed with move
}
```

---

## Testing Integration Points

### Store Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '@/stores/gameStore';

test('makeMove updates board and switches player', () => {
  const { result } = renderHook(() => useGameStore());

  act(() => {
    result.current.startGame();
    result.current.makeMove(0);
  });

  expect(result.current.board[0]).toBe('X');
  expect(result.current.currentPlayer).toBe('O');
});
```

### Component Integration Testing

```typescript
import { render, fireEvent } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import GameBoard from '@/components/game/GameBoard';

test('clicking empty cell makes move', async () => {
  const { container } = render(
    <Canvas>
      <GameBoard />
    </Canvas>
  );

  const cell = container.querySelector('[data-cell="0"]');
  fireEvent.click(cell);

  // Verify store was updated
  expect(useGameStore.getState().board[0]).toBe('X');
});
```

---

## Handoff Notes

### For Implementation Team

1. **Start with Store**: Implement `gameStore.ts` first - it's the foundation
2. **Then Game Logic**: Pure functions in `lib/gameLogic.ts` - easiest to test
3. **Then UI Components**: MainMenu, GameHUD, GameOver - no 3D complexity
4. **Then 3D Components**: Scene, GameBoard, Cell, Piece
5. **Finally AI**: Web Worker can be stubbed initially with random moves

### Critical Integration Points

| System A | System B | Integration Method | Notes |
|----------|----------|-------------------|-------|
| Input System | Game Logic | `makeMove(index)` | Validate before calling |
| Game Logic | 3D Scene | Zustand subscription | Use selective subscriptions |
| UI Components | Game Logic | Zustand subscription | Read-only, dispatch actions |
| AI System | Game Logic | Async `makeAIMove()` | Handle promises carefully |
| Animation | State Changes | React Spring + useEffect | Trigger on lastMove change |
| Audio | State Changes | useEffect on winner/lastMove | Fire-and-forget |

---

## File Structure Summary

```
src/
├── stores/
│   └── gameStore.ts          # Central state management
├── lib/
│   ├── gameLogic.ts          # Pure game functions
│   ├── aiEngine.ts           # AI move calculation
│   └── constants.ts          # WINNING_LINES, CELL_POSITIONS
├── hooks/
│   ├── useGameState.ts       # Simplified store access
│   ├── useGameActions.ts     # Action dispatchers
│   ├── useAI.ts              # Web Worker management
│   ├── useAudio.ts           # Sound effects
│   └── useKeyboardControls.ts # Global shortcuts
├── components/
│   ├── game/
│   │   ├── Scene.tsx         # R3F scene orchestrator
│   │   ├── GameBoard.tsx     # Grid + cells + pieces
│   │   ├── Cell.tsx          # Individual cell
│   │   ├── Piece.tsx         # X or O piece
│   │   ├── WinLine.tsx       # Winning line highlight
│   │   └── GridLines.tsx     # Visual grid
│   └── ui/
│       ├── UIOverlay.tsx     # Overlay container
│       ├── MainMenu.tsx      # Menu screen
│       ├── GameHUD.tsx       # In-game UI
│       ├── GameOver.tsx      # Game over screen
│       └── Settings.tsx      # Settings modal
├── workers/
│   └── aiWorker.ts           # Minimax computation
└── types/
    └── game.ts               # All TypeScript interfaces
```

---

## Sources

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Three Fiber State Management](https://r3f.docs.pmnd.rs/tutorials/loading-textures)
- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [React Spring](https://www.react-spring.dev/)
