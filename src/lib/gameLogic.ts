/**
 * Core game logic for 3D Tic-Tac-Toe
 * All functions are pure and return new state objects (immutable)
 * @module lib/gameLogic
 */

import type { CellState, GameState, Player, WinningLine } from '@/types/game';
import { CELL_TO_LINES, TOTAL_CELLS, WINNING_LINES } from './constants';

// ============================================================================
// COORDINATE CONVERSION UTILITIES
// ============================================================================

/**
 * Convert 3D coordinates to flat array index
 * @param x - X coordinate (0-2)
 * @param y - Y coordinate (0-2)
 * @param z - Z coordinate (0-2)
 * @returns Flat array index (0-26)
 */
export function toIndex(x: number, y: number, z: number): number {
  return x + y * 3 + z * 9;
}

/**
 * Convert flat array index to 3D coordinates
 * @param index - Flat array index (0-26)
 * @returns Tuple of [x, y, z] coordinates
 */
export function toCoord(index: number): [number, number, number] {
  const x = index % 3;
  const y = Math.floor(index / 3) % 3;
  const z = Math.floor(index / 9);
  return [x, y, z];
}

// ============================================================================
// INITIAL STATE CREATOR
// ============================================================================

/**
 * Create a fresh initial game state
 * @returns New GameState object ready for a new game
 */
export function createInitialGameState(): GameState {
  return {
    board: Array<CellState>(TOTAL_CELLS).fill('empty'),
    currentPlayer: 'X',
    phase: 'menu',
    winner: null,
    winningLine: null,
    moveCount: 0,
    gameMode: 'pvp',
    isAIThinking: false,
  };
}

/**
 * Create a game state in the playing phase
 * @param firstPlayer - Which player goes first
 * @returns New GameState ready for playing
 */
export function createPlayingState(firstPlayer: Player = 'X'): GameState {
  return {
    board: Array<CellState>(TOTAL_CELLS).fill('empty'),
    currentPlayer: firstPlayer,
    phase: 'playing',
    winner: null,
    winningLine: null,
    moveCount: 0,
    gameMode: 'pvp',
    isAIThinking: false,
  };
}

// ============================================================================
// MOVE VALIDATION
// ============================================================================

/**
 * Check if a move is valid
 * @param state - Current game state
 * @param index - Cell index to check (0-26)
 * @returns true if the move is valid
 */
export function canMakeMove(state: GameState, index: number): boolean {
  // Must be in playing phase
  if (state.phase !== 'playing') {
    return false;
  }

  // Game must not be over
  if (state.winner !== null) {
    return false;
  }

  // Index must be valid
  if (index < 0 || index >= TOTAL_CELLS) {
    return false;
  }

  // Cell must be empty
  const cell = state.board[index];
  if (cell === undefined || cell !== 'empty') {
    return false;
  }

  return true;
}

// ============================================================================
// WIN DETECTION
// ============================================================================

/**
 * Check if the last move resulted in a win
 * Optimized to only check lines containing the last move
 * @param board - Current board state
 * @param lastMoveIndex - Index of the last move
 * @returns Array of winning line indices, or null if no win
 */
export function checkWinFromLastMove(
  board: CellState[],
  lastMoveIndex: number
): number[] | null {
  // Get indices of lines containing this cell
  const relevantLineIndices = CELL_TO_LINES[lastMoveIndex];
  if (!relevantLineIndices) {
    return null;
  }

  for (const lineIndex of relevantLineIndices) {
    const line = WINNING_LINES[lineIndex];
    if (!line) continue;

    const [a, b, c] = line;
    const cellA = board[a];
    const cellB = board[b];
    const cellC = board[c];

    if (
      cellA !== undefined &&
      cellA !== 'empty' &&
      cellA === cellB &&
      cellB === cellC
    ) {
      return [a, b, c];
    }
  }

  return null;
}

/**
 * Check all lines for a win (less efficient, use for validation)
 * @param board - Current board state
 * @returns Winning line indices and winner, or null
 */
export function checkWinAllLines(
  board: CellState[]
): { line: number[]; winner: Player } | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const cellA = board[a];
    const cellB = board[b];
    const cellC = board[c];

    if (
      cellA !== undefined &&
      cellA !== 'empty' &&
      cellA === cellB &&
      cellB === cellC
    ) {
      return { line: [a, b, c], winner: cellA };
    }
  }

  return null;
}

// ============================================================================
// MAKE MOVE
// ============================================================================

/**
 * Toggle between players
 * @param player - Current player
 * @returns The other player
 */
export function togglePlayer(player: Player): Player {
  return player === 'X' ? 'O' : 'X';
}

/**
 * Make a move and return the new game state
 * This is an immutable operation - returns a new state object
 * @param state - Current game state
 * @param index - Cell index to place the piece
 * @returns New game state, or null if move is invalid
 */
export function makeMove(state: GameState, index: number): GameState | null {
  if (!canMakeMove(state, index)) {
    return null;
  }

  // Create new board with the move
  const newBoard = [...state.board];
  newBoard[index] = state.currentPlayer;

  // Check for win
  const winningLine = checkWinFromLastMove(newBoard, index);
  const winner = winningLine ? state.currentPlayer : null;

  // Update move count
  const moveCount = state.moveCount + 1;

  // Check for draw (all cells filled, no winner)
  const isDraw = !winner && moveCount === TOTAL_CELLS;

  // Determine next player (stays same if game is over)
  const nextPlayer =
    winner || isDraw ? state.currentPlayer : togglePlayer(state.currentPlayer);

  // Determine new phase
  const newPhase = winner || isDraw ? 'gameOver' : 'playing';

  return {
    board: newBoard,
    currentPlayer: nextPlayer,
    phase: newPhase,
    winner: winner ?? (isDraw ? 'draw' : null),
    winningLine,
    moveCount,
    gameMode: state.gameMode,
    isAIThinking: false,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get indices of all empty cells
 * @param board - Current board state
 * @returns Array of empty cell indices
 */
export function getEmptyCells(board: CellState[]): number[] {
  const emptyCells: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === 'empty') {
      emptyCells.push(i);
    }
  }
  return emptyCells;
}

/**
 * Check if the board is completely filled
 * @param board - Current board state
 * @returns true if no empty cells remain
 */
export function isBoardFull(board: CellState[]): boolean {
  return board.every((cell) => cell !== 'empty');
}

/**
 * Check if a line is threatened (2 of player's pieces, 1 empty)
 * Useful for AI evaluation
 * @param board - Current board state
 * @param line - The winning line to check
 * @param player - The player to check for
 * @returns true if the line is threatened by the player
 */
export function isLineThreatened(
  board: CellState[],
  line: WinningLine,
  player: Player
): boolean {
  const [a, b, c] = line;
  const cells = [board[a], board[b], board[c]];

  let playerCount = 0;
  let emptyCount = 0;

  for (const cell of cells) {
    if (cell === player) playerCount++;
    else if (cell === 'empty') emptyCount++;
  }

  return playerCount === 2 && emptyCount === 1;
}

/**
 * Find the empty cell in a threatened line
 * @param board - Current board state
 * @param line - The winning line to check
 * @returns Index of the empty cell, or -1 if not found
 */
export function findEmptyInLine(board: CellState[], line: WinningLine): number {
  for (const index of line) {
    if (board[index] === 'empty') {
      return index;
    }
  }
  return -1;
}

/**
 * Count the number of pieces a player has on the board
 * @param board - Current board state
 * @param player - The player to count
 * @returns Number of pieces the player has placed
 */
export function countPlayerPieces(board: CellState[], player: Player): number {
  return board.filter((cell) => cell === player).length;
}

/**
 * Get all lines that a cell is part of
 * @param cellIndex - The cell index to check
 * @returns Array of winning lines containing this cell
 */
export function getLinesForCell(cellIndex: number): WinningLine[] {
  const lineIndices = CELL_TO_LINES[cellIndex];
  if (!lineIndices) {
    return [];
  }
  return lineIndices
    .map((i) => WINNING_LINES[i])
    .filter((line): line is WinningLine => line !== undefined);
}

/**
 * Check if a position is strategically valuable
 * Center (13) > Face Centers > Edges > Corners
 * @param index - Cell index to evaluate
 * @returns Strategic value (higher is better)
 */
export function getStrategicValue(index: number): number {
  const lineCount = CELL_TO_LINES[index]?.length ?? 0;
  return lineCount;
}
