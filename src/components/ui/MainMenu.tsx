'use client';

/**
 * Main menu component
 * Three-column layout: title/info on left, grid visible in center, buttons on right
 * @module components/ui/MainMenu
 */

import { useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Settings, Gamepad2, Users, Bot } from 'lucide-react';

/**
 * Main menu with game mode buttons
 * Uses three-column layout to keep the 3D grid visible in the center
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
    <div className="pointer-events-auto h-full grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center px-8 py-12">
      {/* Left column - Title and info with dark backdrop for readability */}
      <div className="flex flex-col items-center lg:items-start justify-center lg:pl-8 order-1 lg:order-1">
        <div className="bg-[var(--color-background)]/90 backdrop-blur-sm rounded-xl p-6 lg:p-8">
          <h1
            className="mb-3 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white text-center lg:text-left"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            3D Tic-Tac-Toe
          </h1>

          <p className="mb-4 text-base sm:text-lg text-[var(--color-text-muted)] text-center lg:text-left">
            A 3×3×3 cubic challenge
          </p>

          {/* Instructions - hidden on mobile, shown on larger screens */}
          <div className="hidden lg:flex flex-col gap-3 text-sm text-[var(--color-text-muted)] mt-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-[var(--color-cyan)]" />
              <span>Drag to rotate the grid</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 flex items-center justify-center text-[var(--color-cyan)]">⊕</span>
              <span>Click cells to place your symbol</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 flex items-center justify-center text-[var(--color-cyan)]">🏆</span>
              <span>Get 3 in a row to win!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center column - Spacer for the 3D grid */}
      <div className="hidden lg:block w-[400px] h-[400px]" />

      {/* Right column - Action buttons */}
      <div className="flex flex-col items-center lg:items-end justify-center lg:pr-8 order-2 lg:order-3 mt-8 lg:mt-0">
        <div className="flex flex-col gap-3 w-64">
          <button
            onClick={handlePvP}
            className="btn btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
            data-first-focus
          >
            <Users className="h-5 w-5" />
            Player vs Player
          </button>

          <button
            onClick={handlePvAI}
            className="btn btn-secondary w-full py-4 text-lg flex items-center justify-center gap-3"
          >
            <Bot className="h-5 w-5" />
            Player vs AI
          </button>

          <button
            onClick={openSettings}
            className="btn btn-ghost w-full py-3 text-base flex items-center justify-center gap-2"
          >
            <Settings className="h-5 w-5" />
            Settings
          </button>
        </div>
      </div>

      {/* Footer - shown on mobile only */}
      <div className="lg:hidden absolute bottom-6 left-0 right-0 text-center text-sm text-[var(--color-text-muted)]">
        Drag to rotate • Tap to play
      </div>
    </div>
  );
}

export default MainMenu;
