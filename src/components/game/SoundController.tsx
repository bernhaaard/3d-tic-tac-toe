'use client';

/**
 * Sound controller component
 * Plays sounds in response to game state changes (win, draw)
 * @module components/game/SoundController
 */

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useAudio } from '@/hooks/useAudio';

/**
 * Non-visual component that plays sounds based on game state
 */
export function SoundController() {
  const { playSound } = useAudio();
  const winner = useGameStore((state) => state.winner);
  const phase = useGameStore((state) => state.phase);
  const prevPhaseRef = useRef(phase);

  useEffect(() => {
    // Only trigger on phase change to 'gameOver'
    if (phase === 'gameOver' && prevPhaseRef.current !== 'gameOver') {
      if (winner === 'draw') {
        playSound('draw');
      } else if (winner === 'X' || winner === 'O') {
        playSound('win');
      }
    }
    prevPhaseRef.current = phase;
  }, [phase, winner, playSound]);

  return null;
}

export default SoundController;
