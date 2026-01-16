'use client';

/**
 * Main menu component
 * Game mode selection and settings access
 * @module components/ui/MainMenu
 */

import { useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Settings } from 'lucide-react';

/**
 * Main menu with game mode buttons
 */
export function MainMenu() {
  const startGame = useGameStore((state) => state.startGame);
  const setGameMode = useGameStore((state) => state.setGameMode);
  const openSettings = useGameStore((state) => state.openSettings);

  const handlePvP = useCallback(() => {
    setGameMode('pvp');
    startGame();
  }, [setGameMode, startGame]);

  const handlePvAI = useCallback(() => {
    setGameMode('ai');
    startGame();
  }, [setGameMode, startGame]);

  return (
    <div className="pointer-events-auto flex h-full flex-col items-center justify-center">
      {/* Title */}
      <h1
        className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-6xl"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        3D Tic-Tac-Toe
      </h1>

      {/* Subtitle */}
      <p className="mb-12 text-lg text-[var(--color-text-muted)]">
        A 3×3×3 cubic challenge
      </p>

      {/* Game mode buttons */}
      <div className="flex flex-col gap-4 w-72">
        <button
          onClick={handlePvP}
          className="btn btn-primary w-full py-4 text-lg"
          data-first-focus
        >
          Player vs Player
        </button>

        <button
          onClick={handlePvAI}
          className="btn btn-secondary w-full py-4 text-lg"
        >
          Player vs AI
        </button>

        <button
          onClick={openSettings}
          className="btn btn-ghost w-full py-4 text-lg flex items-center justify-center gap-2"
        >
          <Settings className="h-5 w-5" />
          Settings
        </button>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-sm text-[var(--color-text-muted)]">
        Use mouse or touch to rotate • Click cells to play
      </div>
    </div>
  );
}

export default MainMenu;
