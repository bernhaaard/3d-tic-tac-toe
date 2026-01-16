'use client';

/**
 * AI Controller Component
 * Handles AI turn logic and triggers AI moves
 * This is a non-visual component that manages AI behavior
 * @module components/game/AIController
 */

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useAI } from '@/hooks/useAI';

/**
 * AI Controller - triggers AI moves when it's the AI's turn
 * Renders nothing, purely handles game logic
 */
export function AIController() {
  const { getAIMove } = useAI();
  const isProcessingRef = useRef(false);

  // Get all necessary state from store
  const board = useGameStore((state) => state.board);
  const currentPlayer = useGameStore((state) => state.currentPlayer);
  const phase = useGameStore((state) => state.phase);
  const gameMode = useGameStore((state) => state.gameMode);
  const isAIThinking = useGameStore((state) => state.isAIThinking);
  const winner = useGameStore((state) => state.winner);
  const aiDifficulty = useGameStore((state) => state.settings.aiDifficulty);
  const firstPlayer = useGameStore((state) => state.settings.firstPlayer);
  const makeMove = useGameStore((state) => state.makeMove);
  const setAIThinking = useGameStore((state) => state.setAIThinking);

  // Determine if it's AI's turn
  // AI always plays as 'O' if human is 'X' (firstPlayer), or 'X' if human is 'O'
  const aiPlayer = firstPlayer === 'X' ? 'O' : 'X';
  const isAITurn =
    gameMode === 'ai' &&
    phase === 'playing' &&
    currentPlayer === aiPlayer &&
    winner === null &&
    !isAIThinking;

  useEffect(() => {
    // Skip if not AI's turn or already processing
    if (!isAITurn || isProcessingRef.current) {
      return;
    }

    // Mark as processing to prevent duplicate calls
    isProcessingRef.current = true;

    // Set thinking state
    setAIThinking(true);

    // Request AI move
    getAIMove(board, aiPlayer, aiDifficulty)
      .then((move) => {
        // Make the move
        makeMove(move);
      })
      .catch((error) => {
        console.error('AI move error:', error);
        setAIThinking(false);
      })
      .finally(() => {
        isProcessingRef.current = false;
      });
  }, [
    isAITurn,
    board,
    aiPlayer,
    aiDifficulty,
    getAIMove,
    makeMove,
    setAIThinking,
  ]);

  // This component renders nothing
  return null;
}

export default AIController;
