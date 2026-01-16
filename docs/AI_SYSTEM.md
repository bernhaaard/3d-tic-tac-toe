# AI Opponent System

**Last Updated:** January 2026
**Scope:** Minimax with alpha-beta pruning, difficulty levels, Web Worker architecture

---

## Overview

The AI opponent uses the minimax algorithm with alpha-beta pruning for optimal decision-making, running in a Web Worker to prevent UI blocking.

---

## Difficulty Levels

| Level | Algorithm | Max Depth | Think Time | Behavior |
|-------|-----------|-----------|------------|----------|
| **Easy** | Random + Basic Blocking | 1-2 | 300-600ms | 70% random, 30% blocks threats |
| **Medium** | Minimax | 3-4 | 400-800ms | Good play with occasional mistakes |
| **Hard** | Minimax + Alpha-Beta | 6-8 | 500-1000ms | Near-optimal play |
| **Impossible** | Full Minimax | Unlimited | 500-1500ms | Perfect play |

---

## Minimax Algorithm

### Basic Implementation

```typescript
function minimax(
  board: CellState[],
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiPlayer: Player
): number {
  // Check terminal states
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

### Get Best Move

```typescript
function getBestMove(board: CellState[], aiPlayer: Player): number {
  const emptyCells = getEmptyCells(board);
  let bestMove = emptyCells[0];
  let bestValue = -Infinity;

  for (const index of emptyCells) {
    const newBoard = [...board];
    newBoard[index] = aiPlayer;
    const moveValue = minimax(newBoard, 0, false, -Infinity, Infinity, aiPlayer);

    if (moveValue > bestValue) {
      bestValue = moveValue;
      bestMove = index;
    }
  }

  return bestMove;
}
```

---

## Position Evaluation Heuristic

```typescript
function evaluateBoard(board: CellState[], aiPlayer: Player): number {
  let score = 0;
  const opponent = getOpponent(aiPlayer);

  for (const line of WINNING_LINES) {
    const aiCount = line.filter(i => board[i] === aiPlayer).length;
    const oppCount = line.filter(i => board[i] === opponent).length;
    const emptyCount = line.filter(i => board[i] === 'empty').length;

    // AI advantage
    if (oppCount === 0) {
      if (aiCount === 2) score += 10;
      else if (aiCount === 1) score += 1;
    }

    // Opponent threat
    if (aiCount === 0) {
      if (oppCount === 2) score -= 10;
      else if (oppCount === 1) score -= 1;
    }
  }

  // Center control bonus
  if (board[13] === aiPlayer) score += 5;
  else if (board[13] === opponent) score -= 5;

  return score;
}
```

---

## Strategic Position Values

```typescript
const POSITION_VALUES: Record<number, number> = {
  13: 100,  // Center (16 lines)

  // Face centers (13 lines each)
  4: 50, 10: 50, 12: 50, 14: 50, 16: 50, 22: 50,

  // Edge centers (10 lines each)
  1: 30, 3: 30, 5: 30, 7: 30,
  9: 30, 11: 30, 15: 30, 17: 30,
  19: 30, 21: 30, 23: 30, 25: 30,

  // Corners (7 lines each)
  0: 40, 2: 40, 6: 40, 8: 40,
  18: 40, 20: 40, 24: 40, 26: 40,
};
```

---

## Web Worker Architecture

### Worker File (aiWorker.ts)

```typescript
// src/workers/aiWorker.ts
self.onmessage = (e: MessageEvent) => {
  const { board, aiPlayer, difficulty } = e.data;

  const startTime = performance.now();
  const bestMove = calculateBestMove(board, aiPlayer, difficulty);
  const elapsed = performance.now() - startTime;

  // Add artificial delay for UX (min 300ms thinking time)
  const delay = Math.max(0, 300 - elapsed);

  setTimeout(() => {
    self.postMessage({ move: bestMove });
  }, delay);
};
```

### Hook for AI

```typescript
// src/hooks/useAI.ts
import { useCallback, useRef, useEffect } from 'react';

export function useAI() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/aiWorker.ts', import.meta.url)
    );

    return () => workerRef.current?.terminate();
  }, []);

  const getAIMove = useCallback((
    board: CellState[],
    aiPlayer: Player,
    difficulty: Difficulty
  ): Promise<number> => {
    return new Promise((resolve) => {
      if (!workerRef.current) return;

      workerRef.current.onmessage = (e) => resolve(e.data.move);
      workerRef.current.postMessage({ board, aiPlayer, difficulty });
    });
  }, []);

  return { getAIMove };
}
```

---

## Difficulty Implementation

### Easy Mode

```typescript
function getEasyMove(board: CellState[], aiPlayer: Player): number {
  const empty = getEmptyCells(board);

  // 30% chance to block obvious threat
  if (Math.random() < 0.3) {
    const threat = findImmediateThreat(board, getOpponent(aiPlayer));
    if (threat !== null) return threat;
  }

  // Otherwise random
  return empty[Math.floor(Math.random() * empty.length)];
}
```

### Medium Mode

```typescript
function getMediumMove(board: CellState[], aiPlayer: Player): number {
  // 20% chance to make suboptimal move
  if (Math.random() < 0.2) {
    const empty = getEmptyCells(board);
    return empty[Math.floor(Math.random() * empty.length)];
  }

  // Otherwise use minimax with limited depth
  return minimaxWithDepth(board, aiPlayer, 3);
}
```

---

## Opening Book (Optimization)

```typescript
const OPENING_MOVES: Record<number, number[]> = {
  // If center is empty, take it
  0: [13],
  // If center is taken, take a corner
  1: [0, 2, 6, 8, 18, 20, 24, 26],
};

function getOpeningMove(board: CellState[], moveCount: number): number | null {
  if (moveCount >= 2) return null;

  if (moveCount === 0) return 13; // Always take center first

  if (moveCount === 1 && board[13] !== 'empty') {
    // Take a corner if center is taken
    const corners = [0, 2, 6, 8, 18, 20, 24, 26];
    return corners[Math.floor(Math.random() * corners.length)];
  }

  return null;
}
```

---

## Performance Optimizations

### Move Ordering

```typescript
function orderMoves(board: CellState[], emptyCells: number[]): number[] {
  return emptyCells.sort((a, b) => {
    // Prioritize center
    if (a === 13) return -1;
    if (b === 13) return 1;

    // Then corners
    const corners = [0, 2, 6, 8, 18, 20, 24, 26];
    const aIsCorner = corners.includes(a);
    const bIsCorner = corners.includes(b);
    if (aIsCorner && !bIsCorner) return -1;
    if (!aIsCorner && bIsCorner) return 1;

    return 0;
  });
}
```

### Transposition Table

```typescript
const transpositionTable = new Map<string, number>();

function getBoardKey(board: CellState[]): string {
  return board.join('');
}

function minimax(/* ... */): number {
  const key = getBoardKey(board);
  if (transpositionTable.has(key)) {
    return transpositionTable.get(key)!;
  }

  // ... calculation ...

  transpositionTable.set(key, result);
  return result;
}
```

---

## Think Time UX

```typescript
const THINK_TIMES: Record<Difficulty, [number, number]> = {
  easy: [300, 600],
  medium: [400, 800],
  hard: [500, 1000],
  impossible: [500, 1500],
};

function getThinkDelay(difficulty: Difficulty): number {
  const [min, max] = THINK_TIMES[difficulty];
  return min + Math.random() * (max - min);
}
```

---

## Handoff Notes

### For Game Logic Researcher
- Uses `getEmptyCells()`, `checkWinner()`, `isBoardFull()` from game logic
- Expects `WINNING_LINES` constant

### For UI Researcher
- Show "AI is thinking..." during computation
- Display AI difficulty level in settings

### For Scene Designer
- AI move should trigger piece placement animation
- Consider highlighting AI's last move

---

## Sources

- [Minimax Algorithm - Wikipedia](https://en.wikipedia.org/wiki/Minimax)
- [Alpha-Beta Pruning - Wikipedia](https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning)
- [Web Workers API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Game Theory for 3D Tic-Tac-Toe](https://www.sciencedirect.com/topics/computer-science/game-tree)
