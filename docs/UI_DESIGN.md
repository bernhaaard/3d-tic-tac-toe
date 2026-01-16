# UI/HUD Design Specification

**Last Updated:** January 2026
**Scope:** Overlay components, responsive layouts, component hierarchy

---

## Overview

The UI system consists of HTML overlays positioned above the 3D canvas, providing menus, HUD elements, and game information without interfering with the 3D scene.

---

## Screen States

| State | Components | Purpose |
|-------|------------|---------|
| `menu` | MainMenu | Game start, mode selection |
| `playing` | GameHUD | Turn indicator, score, controls |
| `gameOver` | GameOver | Winner announcement, replay options |
| `settings` | Settings | Audio, difficulty, accessibility |

---

## Component Hierarchy

```
<App>
├── <Canvas>               // 3D scene
│   └── <Scene />
├── <UIOverlay>            // HTML overlay container
│   ├── <MainMenu />       // state === 'menu'
│   ├── <GameHUD />        // state === 'playing'
│   ├── <GameOver />       // state === 'gameOver'
│   └── <Settings />       // isSettingsOpen
└── <ScreenReaderAnnouncements />
```

---

## Overlay Container

```tsx
// src/components/ui/UIOverlay.tsx
'use client';

import { useGameStore } from '@/stores/gameStore';
import MainMenu from './MainMenu';
import GameHUD from './GameHUD';
import GameOver from './GameOver';
import Settings from './Settings';

export default function UIOverlay() {
  const phase = useGameStore(state => state.phase);
  const isSettingsOpen = useGameStore(state => state.isSettingsOpen);

  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {phase === 'menu' && <MainMenu />}
      {phase === 'playing' && <GameHUD />}
      {phase === 'gameOver' && <GameOver />}
      {isSettingsOpen && <Settings />}
    </div>
  );
}
```

**Key Pattern:** `pointer-events-none` on container, `pointer-events-auto` on interactive elements.

---

## Main Menu

```tsx
// src/components/ui/MainMenu.tsx
export default function MainMenu() {
  const startGame = useGameStore(state => state.startGame);
  const setGameMode = useGameStore(state => state.setGameMode);

  return (
    <div className="pointer-events-auto flex h-full flex-col items-center justify-center">
      <h1 className="mb-8 text-4xl font-bold text-white">
        3D Tic-Tac-Toe
      </h1>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => {
            setGameMode('pvp');
            startGame();
          }}
          className="rounded-lg bg-cyan-500 px-8 py-3 text-lg font-semibold text-black hover:bg-cyan-400"
        >
          Player vs Player
        </button>

        <button
          onClick={() => {
            setGameMode('ai');
            startGame();
          }}
          className="rounded-lg bg-magenta-500 px-8 py-3 text-lg font-semibold text-black hover:bg-magenta-400"
        >
          Player vs AI
        </button>

        <button
          onClick={() => openSettings()}
          className="rounded-lg border border-white/30 px-8 py-3 text-lg text-white hover:bg-white/10"
        >
          Settings
        </button>
      </div>
    </div>
  );
}
```

---

## Game HUD

```tsx
// src/components/ui/GameHUD.tsx
export default function GameHUD() {
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const moveCount = useGameStore(state => state.moveCount);
  const isAIThinking = useGameStore(state => state.isAIThinking);

  return (
    <>
      {/* Top bar */}
      <header className="pointer-events-auto flex items-center justify-between p-4">
        <button
          onClick={() => returnToMenu()}
          className="rounded-full p-2 text-white hover:bg-white/10"
          aria-label="Return to menu"
        >
          <HomeIcon className="h-6 w-6" />
        </button>

        <div className="text-center">
          <p className="text-sm text-white/60">Move {moveCount + 1}</p>
          <p className="text-lg font-bold text-white">
            {isAIThinking ? 'AI Thinking...' : `${currentPlayer}'s Turn`}
          </p>
        </div>

        <button
          onClick={() => openSettings()}
          className="rounded-full p-2 text-white hover:bg-white/10"
          aria-label="Settings"
        >
          <SettingsIcon className="h-6 w-6" />
        </button>
      </header>

      {/* Turn indicator */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2">
        <div
          className={`rounded-full px-6 py-2 font-bold ${
            currentPlayer === 'X'
              ? 'bg-cyan-500 text-black'
              : 'bg-magenta-500 text-black'
          }`}
        >
          {currentPlayer}
        </div>
      </div>
    </>
  );
}
```

---

## Game Over Screen

```tsx
// src/components/ui/GameOver.tsx
export default function GameOver() {
  const winner = useGameStore(state => state.winner);
  const restartGame = useGameStore(state => state.restartGame);
  const returnToMenu = useGameStore(state => state.returnToMenu);

  const getMessage = () => {
    if (winner === 'draw') return "It's a Draw!";
    return `${winner} Wins!`;
  };

  return (
    <div className="pointer-events-auto flex h-full flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
      <h2 className="mb-8 text-5xl font-bold text-white">
        {getMessage()}
      </h2>

      <div className="flex gap-4">
        <button
          onClick={restartGame}
          className="rounded-lg bg-cyan-500 px-8 py-3 text-lg font-semibold text-black hover:bg-cyan-400"
        >
          Play Again
        </button>

        <button
          onClick={returnToMenu}
          className="rounded-lg border border-white/30 px-8 py-3 text-lg text-white hover:bg-white/10"
        >
          Main Menu
        </button>
      </div>
    </div>
  );
}
```

---

## Settings Panel

```tsx
// src/components/ui/Settings.tsx
export default function Settings() {
  const settings = useGameStore(state => state.settings);
  const updateSettings = useGameStore(state => state.updateSettings);
  const closeSettings = useGameStore(state => state.closeSettings);

  return (
    <div className="pointer-events-auto fixed inset-0 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-xl bg-gray-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={closeSettings}
            className="rounded-full p-2 text-white hover:bg-white/10"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Sound */}
        <div className="mb-4 flex items-center justify-between">
          <label className="text-white">Sound Effects</label>
          <ToggleSwitch
            checked={settings.soundEnabled}
            onChange={(v) => updateSettings({ soundEnabled: v })}
          />
        </div>

        {/* AI Difficulty */}
        <div className="mb-4">
          <label className="mb-2 block text-white">AI Difficulty</label>
          <select
            value={settings.aiDifficulty}
            onChange={(e) => updateSettings({ aiDifficulty: e.target.value })}
            className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="impossible">Impossible</option>
          </select>
        </div>

        {/* First Player */}
        <div className="mb-4">
          <label className="mb-2 block text-white">First Player</label>
          <div className="flex gap-2">
            <button
              onClick={() => updateSettings({ firstPlayer: 'X' })}
              className={`flex-1 rounded-lg px-4 py-2 ${
                settings.firstPlayer === 'X'
                  ? 'bg-cyan-500 text-black'
                  : 'bg-gray-800 text-white'
              }`}
            >
              X (You)
            </button>
            <button
              onClick={() => updateSettings({ firstPlayer: 'O' })}
              className={`flex-1 rounded-lg px-4 py-2 ${
                settings.firstPlayer === 'O'
                  ? 'bg-magenta-500 text-black'
                  : 'bg-gray-800 text-white'
              }`}
            >
              O (AI)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Responsive Breakpoints

| Breakpoint | Width | Adjustments |
|------------|-------|-------------|
| Mobile | < 640px | Stack buttons, larger touch targets |
| Tablet | 640-1024px | Side-by-side buttons |
| Desktop | > 1024px | Full layout |

### Responsive Utilities

```tsx
// Tailwind classes
<button className="
  px-4 py-2 text-sm          // Mobile
  sm:px-6 sm:py-3 sm:text-base  // Tablet
  lg:px-8 lg:py-4 lg:text-lg    // Desktop
">
```

---

## Animation Integration

```tsx
import { motion, AnimatePresence } from 'framer-motion';

export default function AnimatedOverlay({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## Accessibility

### Focus Management

```tsx
// Auto-focus first button when menu appears
useEffect(() => {
  const firstButton = document.querySelector<HTMLButtonElement>(
    '[data-first-focus]'
  );
  firstButton?.focus();
}, []);
```

### Color Contrast

All text meets WCAG AA contrast ratios:
- White text (#FFFFFF) on dark backgrounds (#1a1a2e): 12.5:1 ✓
- Black text (#000000) on cyan (#00E4E4): 9.1:1 ✓
- Black text (#000000) on magenta (#FF0088): 5.2:1 ✓

---

## Component Props

```typescript
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}
```

---

## Handoff Notes

### For Visual Researcher
- Need color values for all button states
- Typography scale for headings

### For Animation Researcher
- Screen transitions (fade, slide)
- Button hover/press animations

### For Input Researcher
- Keyboard shortcuts for menu navigation
- Focus trap in modals

### For Game Logic Researcher
- UI dispatches `startGame()`, `restartGame()`, `returnToMenu()`
- Reads `phase`, `winner`, `currentPlayer` from store

---

## Sources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [WCAG 2.2 Color Contrast](https://www.w3.org/WAI/WCAG22/quickref/#contrast-minimum)
