'use client';

/**
 * UI Overlay container
 * Renders HTML UI components above the 3D canvas
 * @module components/ui/UIOverlay
 */

import { useGameStore, selectPhase, selectIsSettingsOpen, selectGameMode } from '@/stores/gameStore';
import { MainMenu } from './MainMenu';
import { GameHUD } from './GameHUD';
import { GameOver } from './GameOver';
import { Settings } from './Settings';
import { AIController } from '@/components/game/AIController';

/**
 * UI Overlay component
 * Uses pointer-events-none on container, pointer-events-auto on interactive elements
 */
export function UIOverlay() {
  const phase = useGameStore(selectPhase);
  const isSettingsOpen = useGameStore(selectIsSettingsOpen);
  const gameMode = useGameStore(selectGameMode);

  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {/* AI Controller - handles AI moves (renders nothing) */}
      {gameMode === 'ai' && phase === 'playing' && <AIController />}

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
