'use client';

/**
 * Settings panel component
 * Sound, AI difficulty, and first player settings
 * @module components/ui/Settings
 */

import { useCallback } from 'react';
import { useGameStore, selectSettings } from '@/stores/gameStore';
import { X, Volume2, VolumeX } from 'lucide-react';
import type { Difficulty, Player } from '@/types/game';

/**
 * Settings modal panel
 */
export function Settings() {
  const settings = useGameStore(selectSettings);
  const updateSettings = useGameStore((state) => state.updateSettings);
  const closeSettings = useGameStore((state) => state.closeSettings);

  const handleSoundToggle = useCallback(() => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  }, [settings.soundEnabled, updateSettings]);

  const handleDifficultyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateSettings({ aiDifficulty: e.target.value as Difficulty });
    },
    [updateSettings]
  );

  const handleFirstPlayerChange = useCallback(
    (player: Player) => {
      updateSettings({ firstPlayer: player });
    },
    [updateSettings]
  );

  return (
    <div className="pointer-events-auto fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-[var(--color-surface)] p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Settings
          </h2>
          <button
            onClick={closeSettings}
            className="rounded-full p-2 text-white hover:bg-white/10 transition-colors"
            aria-label="Close settings"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Sound toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <label className="text-white font-medium">Sound Effects</label>
            <button
              onClick={handleSoundToggle}
              className={`
                relative w-14 h-8 rounded-full transition-colors
                ${settings.soundEnabled ? 'bg-[var(--color-cyan)]' : 'bg-gray-600'}
              `}
              role="switch"
              aria-checked={settings.soundEnabled}
            >
              <span
                className={`
                  absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform
                  ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'}
                `}
              />
              <span className="sr-only">
                {settings.soundEnabled ? 'Sound on' : 'Sound off'}
              </span>
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            {settings.soundEnabled ? (
              <>
                <Volume2 className="h-4 w-4" />
                <span>Sound enabled</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                <span>Sound disabled</span>
              </>
            )}
          </div>
        </div>

        {/* AI Difficulty */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">
            AI Difficulty
          </label>
          <select
            value={settings.aiDifficulty}
            onChange={handleDifficultyChange}
            className="w-full rounded-lg bg-[var(--color-background)] px-4 py-3 text-white border border-white/20 focus:border-[var(--color-cyan)] focus:outline-none transition-colors"
          >
            <option value="easy">Easy - Random moves</option>
            <option value="medium">Medium - Basic strategy</option>
            <option value="hard">Hard - Strong play</option>
            <option value="impossible">Impossible - Perfect play</option>
          </select>
        </div>

        {/* First Player (for AI mode) */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">
            First Player (vs AI)
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleFirstPlayerChange('X')}
              className={`
                flex-1 rounded-lg px-4 py-3 font-semibold transition-all
                ${settings.firstPlayer === 'X'
                  ? 'bg-[var(--color-cyan)] text-black shadow-[0_0_15px_rgba(0,228,228,0.4)]'
                  : 'bg-[var(--color-background)] text-white border border-white/20 hover:border-white/40'
                }
              `}
            >
              X (You First)
            </button>
            <button
              onClick={() => handleFirstPlayerChange('O')}
              className={`
                flex-1 rounded-lg px-4 py-3 font-semibold transition-all
                ${settings.firstPlayer === 'O'
                  ? 'bg-[var(--color-magenta)] text-black shadow-[0_0_15px_rgba(255,0,136,0.4)]'
                  : 'bg-[var(--color-background)] text-white border border-white/20 hover:border-white/40'
                }
              `}
            >
              O (AI First)
            </button>
          </div>
        </div>

        {/* Done button */}
        <button
          onClick={closeSettings}
          className="btn btn-primary w-full py-3 text-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default Settings;
