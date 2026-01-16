'use client';

/**
 * Game over screen component
 * Displays winner/draw message and play again options
 * @module components/ui/GameOver
 */

import { useMemo } from 'react';
import { useGameStore, selectWinner } from '@/stores/gameStore';
import { RefreshCw, Home } from 'lucide-react';

/**
 * Game over screen with result and replay options
 */
export function GameOver() {
  const winner = useGameStore(selectWinner);
  const restartGame = useGameStore((state) => state.restartGame);
  const returnToMenu = useGameStore((state) => state.returnToMenu);

  const { message, color, glowClass } = useMemo(() => {
    if (winner === 'draw') {
      return {
        message: "It's a Draw!",
        color: 'text-white',
        glowClass: '',
      };
    }
    const isX = winner === 'X';
    return {
      message: `${winner} Wins!`,
      color: isX ? 'text-[var(--color-cyan)]' : 'text-[var(--color-magenta)]',
      glowClass: isX ? 'glow-cyan' : 'glow-magenta',
    };
  }, [winner]);

  return (
    <div className="pointer-events-auto flex h-full flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Winner message */}
      <h2
        className={`mb-8 text-6xl font-bold tracking-tight ${color} ${glowClass}`}
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {message}
      </h2>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={restartGame}
          className="btn btn-primary py-4 px-8 text-lg flex items-center gap-2"
          data-first-focus
        >
          <RefreshCw className="h-5 w-5" />
          Play Again
        </button>

        <button
          onClick={returnToMenu}
          className="btn btn-ghost py-4 px-8 text-lg flex items-center gap-2"
        >
          <Home className="h-5 w-5" />
          Main Menu
        </button>
      </div>
    </div>
  );
}

export default GameOver;
