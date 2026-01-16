'use client';

/**
 * React hook for AI opponent functionality
 * Manages Web Worker lifecycle and AI move requests
 * @module hooks/useAI
 */

import { useCallback, useEffect, useRef } from 'react';
import type { CellState, Difficulty, Player } from '@/types/game';
import type { AIWorkerRequest, AIWorkerResponse } from '@/workers/aiWorker';

// ============================================================================
// HOOK INTERFACE
// ============================================================================

interface UseAIReturn {
  /** Request AI to calculate and return best move */
  getAIMove: (
    board: CellState[],
    aiPlayer: Player,
    difficulty: Difficulty
  ) => Promise<number>;
  /** Check if AI worker is ready */
  isReady: boolean;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for AI opponent functionality
 * Creates a Web Worker for non-blocking AI computation
 */
export function useAI(): UseAIReturn {
  const workerRef = useRef<Worker | null>(null);
  const isReadyRef = useRef(false);

  // Initialize worker on mount
  useEffect(() => {
    // Create worker using dynamic import URL pattern
    // This works with Next.js webpack configuration
    workerRef.current = new Worker(
      new URL('../workers/aiWorker.ts', import.meta.url)
    );
    isReadyRef.current = true;

    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        isReadyRef.current = false;
      }
    };
  }, []);

  // Function to request AI move
  const getAIMove = useCallback(
    (
      board: CellState[],
      aiPlayer: Player,
      difficulty: Difficulty
    ): Promise<number> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          // Fallback: if worker isn't ready, import and run directly
          import('@/lib/aiEngine').then(({ getBestMove }) => {
            const move = getBestMove(board, aiPlayer, difficulty);
            resolve(move);
          }).catch(reject);
          return;
        }

        // Handler for worker response
        const handleMessage = (event: MessageEvent<AIWorkerResponse>) => {
          if (event.data.type === 'moveCalculated') {
            workerRef.current?.removeEventListener('message', handleMessage);
            resolve(event.data.move);
          }
        };

        // Handler for worker error
        const handleError = (error: ErrorEvent) => {
          workerRef.current?.removeEventListener('error', handleError);
          console.error('AI Worker error:', error);
          // Fallback to synchronous calculation
          import('@/lib/aiEngine').then(({ getBestMove }) => {
            const move = getBestMove(board, aiPlayer, difficulty);
            resolve(move);
          }).catch(reject);
        };

        // Add event listeners
        workerRef.current.addEventListener('message', handleMessage);
        workerRef.current.addEventListener('error', handleError);

        // Send request to worker
        const request: AIWorkerRequest = {
          type: 'calculateMove',
          board,
          aiPlayer,
          difficulty,
        };
        workerRef.current.postMessage(request);
      });
    },
    []
  );

  return {
    getAIMove,
    isReady: isReadyRef.current,
  };
}

export default useAI;
