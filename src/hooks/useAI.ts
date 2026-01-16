'use client';

/**
 * React hook for AI opponent functionality
 * Uses direct computation (no web worker for simplicity and reliability)
 * @module hooks/useAI
 */

import { useCallback, useRef } from 'react';
import type { CellState, Difficulty, Player } from '@/types/game';
import { getBestMove, getThinkDelay } from '@/lib/aiEngine';

/**
 * Hook for AI opponent functionality
 * Computes AI moves with artificial delay for UX
 */
export function useAI() {
  const isComputingRef = useRef(false);

  const getAIMove = useCallback(
    async (
      board: CellState[],
      aiPlayer: Player,
      difficulty: Difficulty
    ): Promise<number> => {
      // Prevent concurrent calls
      if (isComputingRef.current) {
        throw new Error('AI is already computing');
      }

      isComputingRef.current = true;

      try {
        const startTime = performance.now();

        // Calculate the best move
        const move = getBestMove(board, aiPlayer, difficulty);

        const elapsed = performance.now() - startTime;

        // Add artificial delay for more natural UX
        const targetDelay = getThinkDelay(difficulty);
        const additionalDelay = Math.max(0, targetDelay - elapsed);

        if (additionalDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, additionalDelay));
        }

        return move;
      } finally {
        isComputingRef.current = false;
      }
    },
    []
  );

  return { getAIMove };
}

export default useAI;
