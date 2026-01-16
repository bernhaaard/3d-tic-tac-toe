'use client';

/**
 * Inspect mode HUD component
 * Displays winner info and navigation buttons while reviewing completed game
 * @module components/ui/InspectHUD
 */

import { useMemo } from 'react';
import { useGameStore, selectWinner } from '@/stores/gameStore';
import { RefreshCw, Home } from 'lucide-react';

/**
 * HUD shown during inspect mode
 * Allows user to review the completed game board before restarting
 */
export function InspectHUD() {
  const winner = useGameStore(selectWinner);
  const restartGame = useGameStore((state) => state.restartGame);
  const returnToMenu = useGameStore((state) => state.returnToMenu);

  const { message, color, glowClass } = useMemo(() => {
    if (winner === 'draw') {
      return {
        message: "Draw",
        color: 'text-white',
        glowClass: '',
      };
    }
    const isX = winner === 'X';
    return {
      message: `${winner} Won`,
      color: isX ? 'text-[var(--color-cyan)]' : 'text-[var(--color-magenta)]',
      glowClass: isX ? 'glow-cyan' : 'glow-magenta',
    };
  }, [winner]);

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Top bar with result */}
      <div className="pointer-events-auto absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--color-text-muted)] uppercase tracking-wider">
            Inspect Mode
          </span>
          <span className={`text-xl font-bold ${color} ${glowClass}`}>
            {message}
          </span>
        </div>
      </div>

      {/* Bottom bar with actions */}
      <div className="pointer-events-auto absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 py-6 bg-gradient-to-t from-black/50 to-transparent">
        <button
          onClick={restartGame}
          className="btn btn-primary py-3 px-6 text-base flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Restart Game
        </button>

        <button
          onClick={returnToMenu}
          className="btn btn-ghost py-3 px-6 text-base flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Main Menu
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-20 left-0 right-0 text-center text-sm text-[var(--color-text-muted)]">
        Drag to rotate and explore the final board
      </div>
    </div>
  );
}

export default InspectHUD;
