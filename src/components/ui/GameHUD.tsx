'use client';

/**
 * Game HUD component
 * Displays turn indicator, move count, and controls during gameplay
 * @module components/ui/GameHUD
 */

import { useGameStore, selectCurrentPlayer, selectMoveCount, selectIsAIThinking } from '@/stores/gameStore';
import { Home, Settings, RotateCcw } from 'lucide-react';

/**
 * Game HUD with turn indicator and controls
 */
export function GameHUD() {
  const currentPlayer = useGameStore(selectCurrentPlayer);
  const moveCount = useGameStore(selectMoveCount);
  const isAIThinking = useGameStore(selectIsAIThinking);
  const returnToMenu = useGameStore((state) => state.returnToMenu);
  const restartGame = useGameStore((state) => state.restartGame);
  const openSettings = useGameStore((state) => state.openSettings);

  const isX = currentPlayer === 'X';

  return (
    <>
      {/* Top bar */}
      <header className="pointer-events-auto flex items-center justify-between p-4">
        {/* Home button */}
        <button
          onClick={returnToMenu}
          className="rounded-full p-3 text-white hover:bg-white/10 transition-colors"
          aria-label="Return to menu"
        >
          <Home className="h-6 w-6" />
        </button>

        {/* Turn info */}
        <div className="text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            Move {moveCount + 1} of 27
          </p>
          <p className="text-lg font-semibold text-white">
            {isAIThinking ? (
              <span className="animate-pulse">AI Thinking...</span>
            ) : (
              <span>
                <span
                  className={isX ? 'text-[var(--color-cyan)]' : 'text-[var(--color-magenta)]'}
                >
                  {currentPlayer}
                </span>
                {"'s Turn"}
              </span>
            )}
          </p>
        </div>

        {/* Right side buttons */}
        <div className="flex gap-2">
          <button
            onClick={restartGame}
            className="rounded-full p-3 text-white hover:bg-white/10 transition-colors"
            aria-label="Restart game"
          >
            <RotateCcw className="h-6 w-6" />
          </button>
          <button
            onClick={openSettings}
            className="rounded-full p-3 text-white hover:bg-white/10 transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Turn indicator badge at bottom */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2">
        <div
          className={`
            rounded-full px-8 py-3 text-2xl font-bold
            ${isX
              ? 'bg-[var(--color-cyan)] text-black shadow-[0_0_20px_rgba(0,228,228,0.5)]'
              : 'bg-[var(--color-magenta)] text-black shadow-[0_0_20px_rgba(255,0,136,0.5)]'
            }
            transition-all duration-200
          `}
        >
          {currentPlayer}
        </div>
      </div>
    </>
  );
}

export default GameHUD;
