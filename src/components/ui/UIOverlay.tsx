'use client';

/**
 * UI Overlay container
 * Renders HTML UI components above the 3D canvas
 * @module components/ui/UIOverlay
 */

import { useGameStore, selectPhase, selectIsSettingsOpen } from '@/stores/gameStore';
import { MainMenu } from './MainMenu';
import { GameHUD } from './GameHUD';
import { GameOver } from './GameOver';
import { Settings } from './Settings';

/**
 * UI Overlay component
 * Uses pointer-events-none on container, pointer-events-auto on interactive elements
 */
export function UIOverlay() {
  const phase = useGameStore(selectPhase);
  const isSettingsOpen = useGameStore(selectIsSettingsOpen);

  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {/* Main menu screen */}
      {phase === 'menu' && <MainMenu />}

      {/* In-game HUD */}
      {phase === 'playing' && <GameHUD />}

      {/* Game over screen */}
      {phase === 'gameOver' && <GameOver />}

      {/* Settings modal (can appear on any screen) */}
      {isSettingsOpen && <Settings />}
    </div>
  );
}

export default UIOverlay;
