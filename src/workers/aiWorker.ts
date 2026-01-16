/**
 * Web Worker for AI computation
 * Runs minimax algorithm without blocking UI thread
 * @module workers/aiWorker
 */

import type { CellState, Difficulty, Player } from '@/types/game';
import { getBestMove, getThinkDelay } from '@/lib/aiEngine';

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export interface AIWorkerRequest {
  type: 'calculateMove';
  board: CellState[];
  aiPlayer: Player;
  difficulty: Difficulty;
}

export interface AIWorkerResponse {
  type: 'moveCalculated';
  move: number;
  thinkTime: number;
}

// ============================================================================
// WORKER MESSAGE HANDLER
// ============================================================================

self.onmessage = (event: MessageEvent<AIWorkerRequest>) => {
  const { type, board, aiPlayer, difficulty } = event.data;

  if (type === 'calculateMove') {
    const startTime = performance.now();

    try {
      // Calculate the best move
      const bestMove = getBestMove(board, aiPlayer, difficulty);
      const elapsed = performance.now() - startTime;

      // Add artificial delay for UX (minimum think time based on difficulty)
      const targetDelay = getThinkDelay(difficulty);
      const additionalDelay = Math.max(0, targetDelay - elapsed);

      setTimeout(() => {
        const response: AIWorkerResponse = {
          type: 'moveCalculated',
          move: bestMove,
          thinkTime: elapsed + additionalDelay,
        };
        self.postMessage(response);
      }, additionalDelay);
    } catch (error) {
      console.error('AI Worker error:', error);
      // Fall back to first empty cell
      const emptyCells = board
        .map((cell, i) => (cell === 'empty' ? i : -1))
        .filter((i) => i !== -1);

      const fallbackMove = emptyCells[0] ?? 0;

      const response: AIWorkerResponse = {
        type: 'moveCalculated',
        move: fallbackMove,
        thinkTime: 0,
      };
      self.postMessage(response);
    }
  }
};

// TypeScript needs this for Web Worker
export {};
