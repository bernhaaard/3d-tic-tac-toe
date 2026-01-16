# Game Logic Specification

**Last Updated:** January 2026
**Scope:** 3D Tic-Tac-Toe on a 3×3×3 cubic grid with 27 cells and 49 winning lines

---

## Grid Representation

### Coordinate System

```
Y (up)
|
|
+---- X (right)
 \
  Z (forward)
```

### Index Mapping

**From 3D coordinates to flat array index:**
```typescript
const toIndex = (x: number, y: number, z: number): number => {
  return x + y * 3 + z * 9;
};
```

**From flat array index to 3D coordinates:**
```typescript
const toCoord = (index: number): [number, number, number] => {
  const x = index % 3;
  const y = Math.floor(index / 3) % 3;
  const z = Math.floor(index / 9);
  return [x, y, z];
};
```

### Visual Grid Layout

```
z=0 (front layer):     z=1 (middle layer):    z=2 (back layer):
[0]  [1]  [2]          [9]  [10] [11]         [18] [19] [20]
[3]  [4]  [5]          [12] [13] [14]         [21] [22] [23]
[6]  [7]  [8]          [15] [16] [17]         [24] [25] [26]
```

---

## All 49 Winning Lines

### Category Breakdown

| Category | Count | Description |
|----------|-------|-------------|
| Rows (X-axis) | 9 | Horizontal lines within each layer |
| Columns (Y-axis) | 9 | Vertical lines within each layer |
| Layer Diagonals | 6 | Diagonal lines within each layer |
| Vertical Columns (Z-axis) | 9 | Lines through all three layers |
| Vertical Face Diagonals | 12 | Diagonals on vertical faces |
| Space Diagonals | 4 | Corner-to-corner through center |
| **TOTAL** | **49** | |

### Complete WINNING_LINES Array

```typescript
export const WINNING_LINES: ReadonlyArray<readonly [number, number, number]> = [
  // ========== ROWS (9 lines) - Horizontal X-axis ==========
  // Layer z=0
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  // Layer z=1
  [9, 10, 11], [12, 13, 14], [15, 16, 17],
  // Layer z=2
  [18, 19, 20], [21, 22, 23], [24, 25, 26],

  // ========== COLUMNS (9 lines) - Vertical Y-axis ==========
  // Layer z=0
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  // Layer z=1
  [9, 12, 15], [10, 13, 16], [11, 14, 17],
  // Layer z=2
  [18, 21, 24], [19, 22, 25], [20, 23, 26],

  // ========== LAYER DIAGONALS (6 lines) - Within XY planes ==========
  // Layer z=0
  [0, 4, 8], [2, 4, 6],
  // Layer z=1
  [9, 13, 17], [11, 13, 15],
  // Layer z=2
  [18, 22, 26], [20, 22, 24],

  // ========== VERTICAL COLUMNS (9 lines) - Through Z-axis ==========
  // x=0
  [0, 9, 18], [3, 12, 21], [6, 15, 24],
  // x=1
  [1, 10, 19], [4, 13, 22], [7, 16, 25],
  // x=2
  [2, 11, 20], [5, 14, 23], [8, 17, 26],

  // ========== VERTICAL FACE DIAGONALS (12 lines) ==========
  // XZ face (Y constant)
  [0, 10, 20], [2, 10, 18],  // y=0
  [3, 13, 23], [5, 13, 21],  // y=1
  [6, 16, 26], [8, 16, 24],  // y=2
  // YZ face (X constant)
  [0, 12, 24], [6, 12, 18],  // x=0
  [1, 13, 25], [7, 13, 19],  // x=1
  [2, 14, 26], [8, 14, 20],  // x=2

  // ========== SPACE DIAGONALS (4 lines) - Through center ==========
  [0, 13, 26],  // (0,0,0) → (1,1,1) → (2,2,2)
  [2, 13, 24],  // (2,0,0) → (1,1,1) → (0,2,2)
  [6, 13, 20],  // (0,2,0) → (1,1,1) → (2,0,2)
  [8, 13, 18],  // (2,2,0) → (1,1,1) → (0,0,2)
] as const;
```

---

## Type Definitions

```typescript
export type CellState = 'empty' | 'X' | 'O';
export type Player = 'X' | 'O';
export type GamePhase = 'menu' | 'playing' | 'gameOver';
export type GameOutcome = Player | 'draw' | null;

export interface GameState {
  board: CellState[];
  currentPlayer: Player;
  phase: GamePhase;
  winner: GameOutcome;
  winningLine: number[] | null;
  moveCount: number;
}
```

---

## Core Game Functions

### Initial State

```typescript
export function createInitialGameState(): GameState {
  return {
    board: Array(27).fill('empty') as CellState[],
    currentPlayer: 'X',
    phase: 'menu',
    winner: null,
    winningLine: null,
    moveCount: 0,
  };
}
```

### Move Validation

```typescript
export function canMakeMove(state: GameState, index: number): boolean {
  return (
    state.phase === 'playing' &&
    state.winner === null &&
    index >= 0 &&
    index <= 26 &&
    state.board[index] === 'empty'
  );
}
```

### Win Detection (Optimized)

```typescript
export function checkWinFromLastMove(
  board: CellState[],
  lastMoveIndex: number
): number[] | null {
  // Only check lines containing the last move
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

### Make Move (Immutable)

```typescript
export function makeMove(state: GameState, index: number): GameState | null {
  if (!canMakeMove(state, index)) return null;

  const newBoard = [...state.board];
  newBoard[index] = state.currentPlayer;

  const winningLine = checkWinFromLastMove(newBoard, index);
  const winner = winningLine ? state.currentPlayer : null;
  const moveCount = state.moveCount + 1;
  const isDraw = !winner && moveCount === 27;

  return {
    board: newBoard,
    currentPlayer: winner || isDraw ? state.currentPlayer : togglePlayer(state.currentPlayer),
    phase: winner || isDraw ? 'gameOver' : 'playing',
    winner: winner || (isDraw ? 'draw' : null),
    winningLine,
    moveCount,
  };
}

export function togglePlayer(player: Player): Player {
  return player === 'X' ? 'O' : 'X';
}
```

---

## Helper Functions

```typescript
export function getEmptyCells(board: CellState[]): number[] {
  return board
    .map((cell, index) => (cell === 'empty' ? index : -1))
    .filter(index => index !== -1);
}

export function isBoardFull(board: CellState[]): boolean {
  return board.every(cell => cell !== 'empty');
}

export function isLineThreatened(
  board: CellState[],
  line: readonly [number, number, number],
  player: Player
): boolean {
  const cells = line.map(i => board[i]);
  const playerCells = cells.filter(c => c === player).length;
  const emptyCells = cells.filter(c => c === 'empty').length;
  return playerCells === 2 && emptyCells === 1;
}
```

---

## Strategic Cell Importance

| Cell Type | Count | Lines Through |
|-----------|-------|---------------|
| Center (13) | 1 | 16 lines |
| Face Centers | 6 | 13 lines each |
| Edge Cells | 12 | 10 lines each |
| Corners | 8 | 7 lines each |

**The center cell (index 13) is the most strategically important.**

---

## Pre-computed Line Lookup

```typescript
// Map cell index → array of line indices containing that cell
export const CELL_TO_LINES: ReadonlyArray<readonly number[]> = Array.from(
  { length: 27 },
  (_, cellIndex) =>
    WINNING_LINES
      .map((line, lineIndex) => (line.includes(cellIndex) ? lineIndex : -1))
      .filter(lineIndex => lineIndex !== -1)
);
```

---

## Handoff Notes

### For AI Researcher
- Use `getEmptyCells()` for available moves
- Center cell (13) should be highly valued
- Use `isLineThreatened()` for heuristic evaluation

### For Scene Designer
- Use `toCoord()` to convert indices to 3D positions
- `winningLine` array provides highlighting indices

### For UI Researcher
- `GamePhase` drives screen transitions
- `moveCount` for game progress display
- `winner` for game over messages

### For Input Researcher
- Use `canMakeMove()` for hover validation
- Pass cell index from raycasting to `makeMove()`

---

## Sources

- [3D tic-tac-toe - Wikipedia](https://en.wikipedia.org/wiki/3D_tic-tac-toe)
- [3-Dimensional Tic-Tac-Toe — Math Things](https://www.maththings.net/3dimensional-tictactoe)
