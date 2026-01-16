/**
 * AI Engine for 3D Tic-Tac-Toe
 * Implements minimax algorithm with alpha-beta pruning
 * @module lib/aiEngine
 */

import type { CellState, Difficulty, Player } from '@/types/game';
import { WINNING_LINES, CENTER_CELL, CORNER_CELLS, TOTAL_CELLS } from './constants';
import { getEmptyCells, isBoardFull, togglePlayer } from './gameLogic';

// ============================================================================
// TYPES
// ============================================================================

export interface AIMove {
  index: number;
  score: number;
}

export interface AIConfig {
  maxDepth: number;
  errorRate: number;
  useOpeningBook: boolean;
}

// ============================================================================
// DIFFICULTY CONFIGURATIONS
// ============================================================================

const DIFFICULTY_CONFIG: Record<Difficulty, AIConfig> = {
  easy: {
    maxDepth: 1,
    errorRate: 0.7,   // 70% chance of random move
    useOpeningBook: false,
  },
  medium: {
    maxDepth: 2,
    errorRate: 0.2,   // 20% chance of suboptimal move
    useOpeningBook: true,
  },
  hard: {
    maxDepth: 3,
    errorRate: 0.05,  // 5% chance of error
    useOpeningBook: true,
  },
  impossible: {
    maxDepth: 4,      // Limited depth for responsive play
    errorRate: 0,     // Perfect play within depth limit
    useOpeningBook: true,
  },
};

// ============================================================================
// POSITION VALUES
// ============================================================================

/**
 * Strategic value of each position based on number of winning lines through it
 * Center (13) is most valuable - part of 16 winning lines
 */
const POSITION_VALUES: Record<number, number> = {
  13: 100,  // Center (16 lines)
  // Face centers (13 lines each)
  4: 50, 10: 50, 12: 50, 14: 50, 16: 50, 22: 50,
  // Corners (7 lines each)
  0: 40, 2: 40, 6: 40, 8: 40, 18: 40, 20: 40, 24: 40, 26: 40,
  // Edge centers (10 lines each)
  1: 30, 3: 30, 5: 30, 7: 30,
  9: 30, 11: 30, 15: 30, 17: 30,
  19: 30, 21: 30, 23: 30, 25: 30,
};

// ============================================================================
// THINK TIME (for UX)
// ============================================================================

const THINK_TIMES: Record<Difficulty, [number, number]> = {
  easy: [200, 400],
  medium: [300, 500],
  hard: [400, 700],
  impossible: [500, 1500],
};

/**
 * Get artificial delay for more human-like thinking
 */
export function getThinkDelay(difficulty: Difficulty): number {
  const [min, max] = THINK_TIMES[difficulty];
  return min + Math.random() * (max - min);
}

// ============================================================================
// WIN DETECTION (for AI)
// ============================================================================

/**
 * Check if there's a winner
 */
function checkWinner(board: CellState[]): Player | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const cellA = board[a];
    const cellB = board[b];
    const cellC = board[c];

    if (cellA && cellA !== 'empty' && cellA === cellB && cellB === cellC) {
      return cellA;
    }
  }
  return null;
}

/**
 * Find immediate winning or blocking move
 */
function findImmediateMove(board: CellState[], player: Player): number | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const cells = [board[a], board[b], board[c]];
    const playerCount = cells.filter(c => c === player).length;
    const emptyCount = cells.filter(c => c === 'empty').length;

    if (playerCount === 2 && emptyCount === 1) {
      // Found a line with 2 player pieces and 1 empty - return the empty cell
      if (board[a] === 'empty') return a;
      if (board[b] === 'empty') return b;
      if (board[c] === 'empty') return c;
    }
  }
  return null;
}

// ============================================================================
// BOARD EVALUATION HEURISTIC
// ============================================================================

/**
 * Evaluate the board position for the AI player
 * Positive scores favor AI, negative favor opponent
 */
function evaluateBoard(board: CellState[], aiPlayer: Player): number {
  const opponent = togglePlayer(aiPlayer);
  let score = 0;

  // Evaluate each winning line
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const cellA = board[a];
    const cellB = board[b];
    const cellC = board[c];

    let aiCount = 0;
    let oppCount = 0;

    for (const cell of [cellA, cellB, cellC]) {
      if (cell === aiPlayer) aiCount++;
      else if (cell === opponent) oppCount++;
    }

    // Evaluate line potential
    if (oppCount === 0) {
      // AI has potential in this line
      if (aiCount === 3) score += 1000;      // Win
      else if (aiCount === 2) score += 10;   // One move from win
      else if (aiCount === 1) score += 1;    // Started
    }

    if (aiCount === 0) {
      // Opponent has potential
      if (oppCount === 3) score -= 1000;     // Loss
      else if (oppCount === 2) score -= 10;  // Threat
      else if (oppCount === 1) score -= 1;
    }
  }

  // Position bonuses
  if (board[CENTER_CELL] === aiPlayer) score += 5;
  else if (board[CENTER_CELL] === opponent) score -= 5;

  return score;
}

// ============================================================================
// MOVE ORDERING (for better alpha-beta pruning)
// ============================================================================

/**
 * Order moves by strategic priority for better pruning
 */
function orderMoves(emptyCells: number[]): number[] {
  return [...emptyCells].sort((a, b) => {
    const valueA = POSITION_VALUES[a] ?? 0;
    const valueB = POSITION_VALUES[b] ?? 0;
    return valueB - valueA;  // Higher value first
  });
}

// ============================================================================
// MINIMAX WITH ALPHA-BETA PRUNING
// ============================================================================

/**
 * Minimax algorithm with alpha-beta pruning
 */
function minimax(
  board: CellState[],
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiPlayer: Player,
  maxDepth: number
): number {
  // Check terminal states
  const winner = checkWinner(board);
  if (winner === aiPlayer) return 100 - depth;  // Prefer quicker wins
  if (winner !== null) return depth - 100;       // Opponent won

  if (isBoardFull(board)) return 0;              // Draw

  // Depth limit - use heuristic evaluation
  if (depth >= maxDepth) {
    return evaluateBoard(board, aiPlayer) * 0.01; // Scale down heuristic
  }

  const emptyCells = orderMoves(getEmptyCells(board));
  const currentPlayer = isMaximizing ? aiPlayer : togglePlayer(aiPlayer);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const index of emptyCells) {
      const newBoard = [...board];
      newBoard[index] = currentPlayer;
      const evaluation = minimax(
        newBoard,
        depth + 1,
        false,
        alpha,
        beta,
        aiPlayer,
        maxDepth
      );
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;  // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const index of emptyCells) {
      const newBoard = [...board];
      newBoard[index] = currentPlayer;
      const evaluation = minimax(
        newBoard,
        depth + 1,
        true,
        alpha,
        beta,
        aiPlayer,
        maxDepth
      );
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;  // Alpha cutoff
    }
    return minEval;
  }
}

// ============================================================================
// OPENING BOOK
// ============================================================================

/**
 * Get an opening move for the first few moves
 */
function getOpeningMove(board: CellState[], moveCount: number): number | null {
  // First move: take center
  if (moveCount === 0 && board[CENTER_CELL] === 'empty') {
    return CENTER_CELL;
  }

  // Second move: if center is taken, take a random corner
  if (moveCount === 1) {
    if (board[CENTER_CELL] !== 'empty') {
      // Opponent took center, take a corner
      const availableCorners = CORNER_CELLS.filter(i => board[i] === 'empty');
      if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)] ?? null;
      }
    } else {
      // We have center, take a corner for flexibility
      const availableCorners = CORNER_CELLS.filter(i => board[i] === 'empty');
      if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)] ?? null;
      }
    }
  }

  return null;
}

// ============================================================================
// MAIN AI FUNCTION
// ============================================================================

/**
 * Get the best move for the AI player
 */
export function getBestMove(
  board: CellState[],
  aiPlayer: Player,
  difficulty: Difficulty
): number {
  const config = DIFFICULTY_CONFIG[difficulty];
  const emptyCells = getEmptyCells(board);

  // No valid moves
  if (emptyCells.length === 0) {
    throw new Error('No valid moves available');
  }

  // Single move - no choice
  if (emptyCells.length === 1) {
    return emptyCells[0]!;
  }

  // Calculate move count
  const moveCount = TOTAL_CELLS - emptyCells.length;

  // Check for error rate (random move chance)
  if (Math.random() < config.errorRate) {
    return getRandomMove(board, aiPlayer, difficulty);
  }

  // Opening book
  if (config.useOpeningBook && moveCount < 2) {
    const openingMove = getOpeningMove(board, moveCount);
    if (openingMove !== null) {
      return openingMove;
    }
  }

  // Check for immediate win
  const winningMove = findImmediateMove(board, aiPlayer);
  if (winningMove !== null) {
    return winningMove;
  }

  // Check for immediate block
  const opponent = togglePlayer(aiPlayer);
  const blockingMove = findImmediateMove(board, opponent);
  if (blockingMove !== null) {
    return blockingMove;
  }

  // Use minimax to find best move
  const orderedMoves = orderMoves(emptyCells);
  let bestMove = orderedMoves[0]!;
  let bestValue = -Infinity;

  for (const index of orderedMoves) {
    const newBoard = [...board];
    newBoard[index] = aiPlayer;

    const moveValue = minimax(
      newBoard,
      0,
      false,  // Now opponent's turn (minimizing)
      -Infinity,
      Infinity,
      aiPlayer,
      config.maxDepth
    );

    if (moveValue > bestValue) {
      bestValue = moveValue;
      bestMove = index;
    }
  }

  return bestMove;
}

/**
 * Get a random but somewhat sensible move (for easy mode)
 */
function getRandomMove(
  board: CellState[],
  aiPlayer: Player,
  difficulty: Difficulty
): number {
  const emptyCells = getEmptyCells(board);

  // Easy mode has 30% chance to block threats
  if (difficulty === 'easy' && Math.random() < 0.3) {
    const opponent = togglePlayer(aiPlayer);
    const blockingMove = findImmediateMove(board, opponent);
    if (blockingMove !== null) {
      return blockingMove;
    }
  }

  // Otherwise random from empty cells
  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomIndex]!;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  DIFFICULTY_CONFIG,
  checkWinner,
  evaluateBoard,
  minimax,
};
