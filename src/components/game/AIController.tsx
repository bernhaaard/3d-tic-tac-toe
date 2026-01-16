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
  const isMountedRef = useRef(true);

  // Track component mount state for cleanup during hot reload
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Get all necessary state from store
  const board = useGameStore((state) => state.board);
  const currentPlayer = useGameStore((state) => state.currentPlayer);
  const phase = useGameStore((state) => state.phase);
  const gameMode = useGameStore((state) => state.gameMode);
  const isAIThinking = useGameStore((state) => state.isAIThinking);
  const winner = useGameStore((state) => state.winner);
  const aiDifficulty = useGameStore((state) => state.settings.aiDifficulty);
  const humanPlayer = useGameStore((state) => state.settings.humanPlayer);
  const makeMove = useGameStore((state) => state.makeMove);
  const setAIThinking = useGameStore((state) => state.setAIThinking);

  // Determine if it's AI's turn
  // AI always plays the opposite symbol of what human chose
  const aiPlayer = humanPlayer === 'X' ? 'O' : 'X';
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
        // Ignore if component unmounted (hot reload or navigation)
        if (!isMountedRef.current) return;

        // Clear thinking state BEFORE making the move
        // (The store rejects moves while isAIThinking is true)
        setAIThinking(false);
        // Make the move
        makeMove(move);
      })
      .catch((error) => {
        // Ignore if component unmounted
        if (!isMountedRef.current) return;

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
    humanPlayer,
    getAIMove,
    makeMove,
    setAIThinking,
  ]);

  // This component renders nothing
  return null;
}

export default AIController;
