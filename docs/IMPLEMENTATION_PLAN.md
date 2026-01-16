# Implementation Plan

**Last Updated:** January 2026
**Status:** Ready for Implementation
**Estimated Total Complexity:** High (7 phases, 43 tasks)

---

## Overview

This document provides a comprehensive, dependency-ordered implementation plan for the 3D Tic-Tac-Toe project. Each task includes complexity ratings, dependencies, and notes about parallelization opportunities.

**Complexity Scale:**
- **Low:** Simple, straightforward implementation (1-2 hours)
- **Medium:** Moderate complexity, requires careful implementation (3-6 hours)
- **High:** Complex, requires deep understanding and testing (6+ hours)

---

## Phase 1: Project Foundation & Setup

**Goal:** Establish the development environment and project structure
**Estimated Complexity:** Medium
**Can Start:** Immediately
**Blocking:** All subsequent phases

### Tasks

- [ ] **Task 1.1:** Initialize Next.js project with TypeScript (Complexity: Low)
  - **Depends on:** None
  - **Command:** `npx create-next-app@latest 3d-tic-tac-toe --typescript --eslint --tailwind --app --src-dir --import-alias "@/*" --turbopack`
  - **Verify:** Project starts with `npm run dev`

- [ ] **Task 1.2:** Configure TypeScript strict mode (Complexity: Low)
  - **Depends on:** Task 1.1
  - **Files:** `tsconfig.json`
  - **Config:** Enable strict, strictNullChecks, noUncheckedIndexedAccess, noImplicitReturns
  - **Verify:** `npm run typecheck` passes

- [ ] **Task 1.3:** Install core dependencies (Complexity: Low)
  - **Depends on:** Task 1.1
  - **Packages:**
    - `three@^0.182.0`
    - `@react-three/fiber@^9.5.0`
    - `@react-three/drei@^10.7.7`
    - `@types/three@^0.182.0`
    - `zustand@^5.0.10`
  - **Verify:** No peer dependency warnings

- [ ] **Task 1.4:** Configure Next.js for Three.js (Complexity: Low)
  - **Depends on:** Task 1.3
  - **Files:** `next.config.ts`
  - **Add:** `transpilePackages: ['three']`, `serverExternalPackages: ['three']`
  - **Verify:** Build succeeds

- [ ] **Task 1.5:** Set up directory structure (Complexity: Low)
  - **Depends on:** Task 1.1
  - **Create:**
    - `src/components/game/`
    - `src/components/ui/`
    - `src/hooks/`
    - `src/lib/`
    - `src/stores/`
    - `src/types/`
    - `src/workers/`
  - **Verify:** Folders exist

- [ ] **Task 1.6:** Configure Tailwind with design tokens (Complexity: Low)
  - **Depends on:** Task 1.1
  - **Files:** `tailwind.config.ts`
  - **Add:** Cyan/Magenta colors, Space Grotesk/Inter fonts, glow shadows
  - **Verify:** Custom classes work in components

- [ ] **Task 1.7:** Set up ESLint/Biome (Complexity: Low)
  - **Depends on:** Task 1.1
  - **Choose:** Biome (recommended) or ESLint 9
  - **Files:** `biome.json` or `eslint.config.mjs`
  - **Verify:** `npm run lint` passes

- [ ] **Task 1.8:** Install Google Fonts (Complexity: Low)
  - **Depends on:** Task 1.1
  - **Files:** `src/app/layout.tsx`
  - **Add:** Inter (body), Space Grotesk (headings)
  - **Verify:** Fonts render correctly

**Parallelization:** Tasks 1.3, 1.5, 1.6, 1.7, 1.8 can run in parallel after 1.2 completes.

---

## Phase 2: Type Definitions & Constants

**Goal:** Define all TypeScript types and game constants
**Estimated Complexity:** Medium
**Can Start:** After Phase 1
**Blocking:** Phase 3, 4, 5, 6

### Tasks

- [ ] **Task 2.1:** Create game type definitions (Complexity: Low)
  - **Depends on:** Task 1.5
  - **Files:** `src/types/game.ts`
  - **Define:** `CellState`, `Player`, `GamePhase`, `GameOutcome`, `GameState`, `Difficulty`
  - **Verify:** No type errors

- [ ] **Task 2.2:** Define WINNING_LINES constant (Complexity: Medium)
  - **Depends on:** Task 2.1
  - **Files:** `src/lib/constants.ts`
  - **Implement:** All 49 winning lines (9 rows, 9 columns, 6 layer diagonals, 9 vertical columns, 12 vertical face diagonals, 4 space diagonals)
  - **Verify:** Array has exactly 49 elements, each with 3 indices

- [ ] **Task 2.3:** Define grid constants (Complexity: Low)
  - **Depends on:** None
  - **Files:** `src/lib/constants.ts`
  - **Define:** `CELL_SIZE`, `CELL_SPACING`, `LAYER_SEPARATION`, `CELL_POSITIONS`
  - **Verify:** Math checks out (27 positions)

- [ ] **Task 2.4:** Create animation constants (Complexity: Low)
  - **Depends on:** None
  - **Files:** `src/lib/constants.ts`
  - **Define:** `ANIMATION_CONFIG` with spring configs, durations
  - **Verify:** Values match animation spec

- [ ] **Task 2.5:** Create CELL_TO_LINES lookup (Complexity: Medium)
  - **Depends on:** Task 2.2
  - **Files:** `src/lib/constants.ts`
  - **Implement:** Pre-computed map of cell index → line indices
  - **Verify:** Center cell (13) maps to 16 lines

**Parallelization:** Tasks 2.3 and 2.4 can run in parallel. Tasks 2.1 and 2.2 are sequential.

---

## Phase 3: Core Game Logic

**Goal:** Implement pure game logic functions
**Estimated Complexity:** High
**Can Start:** After Phase 2
**Blocking:** Phase 4, 5, 6

### Tasks

- [ ] **Task 3.1:** Implement coordinate conversion utilities (Complexity: Low)
  - **Depends on:** Task 2.1, 2.3
  - **Files:** `src/lib/gameLogic.ts`
  - **Functions:** `toIndex(x, y, z)`, `toCoord(index)`
  - **Verify:** Round-trip conversion works for all 27 cells

- [ ] **Task 3.2:** Implement initial state creator (Complexity: Low)
  - **Depends on:** Task 2.1
  - **Files:** `src/lib/gameLogic.ts`
  - **Function:** `createInitialGameState()`
  - **Verify:** Returns correct initial state

- [ ] **Task 3.3:** Implement move validation (Complexity: Medium)
  - **Depends on:** Task 2.1
  - **Files:** `src/lib/gameLogic.ts`
  - **Function:** `canMakeMove(state, index)`
  - **Verify:** Rejects invalid moves (out of bounds, occupied, wrong phase)

- [ ] **Task 3.4:** Implement win detection (Complexity: High)
  - **Depends on:** Task 2.2, 2.5
  - **Files:** `src/lib/gameLogic.ts`
  - **Function:** `checkWinFromLastMove(board, lastMoveIndex)`
  - **Optimize:** Only check lines containing the last move
  - **Verify:** Detects all winning conditions, including space diagonals

- [ ] **Task 3.5:** Implement makeMove function (Complexity: Medium)
  - **Depends on:** Task 3.3, 3.4
  - **Files:** `src/lib/gameLogic.ts`
  - **Function:** `makeMove(state, index)` - immutable
  - **Verify:** Returns new state or null, detects wins and draws

- [ ] **Task 3.6:** Implement helper functions (Complexity: Low)
  - **Depends on:** Task 2.1
  - **Files:** `src/lib/gameLogic.ts`
  - **Functions:** `getEmptyCells()`, `isBoardFull()`, `isLineThreatened()`, `togglePlayer()`
  - **Verify:** Each function tested individually

- [ ] **Task 3.7:** Write unit tests for game logic (Complexity: Medium)
  - **Depends on:** Tasks 3.1-3.6
  - **Files:** `src/lib/__tests__/gameLogic.test.ts`
  - **Test:** All 49 winning lines, draw detection, move validation
  - **Verify:** 100% code coverage on game logic

**Parallelization:** Tasks 3.1, 3.2 can start immediately. Task 3.6 can run parallel to 3.3-3.5.

---

## Phase 4: State Management

**Goal:** Set up Zustand store for global state
**Estimated Complexity:** Medium
**Can Start:** After Phase 3
**Blocking:** Phase 5, 6

### Tasks

- [ ] **Task 4.1:** Create game store structure (Complexity: Medium)
  - **Depends on:** Task 2.1, 3.2
  - **Files:** `src/stores/gameStore.ts`
  - **State:** `board`, `currentPlayer`, `phase`, `winner`, `winningLine`, `moveCount`, `gameMode`, `isAIThinking`
  - **Verify:** Store initializes correctly

- [ ] **Task 4.2:** Implement game actions (Complexity: Medium)
  - **Depends on:** Task 4.1, Phase 3
  - **Files:** `src/stores/gameStore.ts`
  - **Actions:** `startGame()`, `makeMove()`, `restartGame()`, `returnToMenu()`, `setGameMode()`
  - **Integrate:** Use game logic functions from Phase 3
  - **Verify:** Actions update state correctly

- [ ] **Task 4.3:** Create settings store (Complexity: Low)
  - **Depends on:** Task 1.3
  - **Files:** `src/stores/gameStore.ts` (or separate)
  - **State:** `soundEnabled`, `aiDifficulty`, `firstPlayer`
  - **Actions:** `updateSettings()`, `openSettings()`, `closeSettings()`
  - **Verify:** Settings persist correctly

- [ ] **Task 4.4:** Add state selectors (Complexity: Low)
  - **Depends on:** Task 4.1, 4.2
  - **Files:** `src/stores/gameStore.ts`
  - **Create:** Computed selectors for derived state
  - **Verify:** Selective subscriptions work (no unnecessary re-renders)

**Parallelization:** Task 4.3 can run parallel to 4.1-4.2.

---

## Phase 5: 3D Scene & Rendering

**Goal:** Build the 3D game board and pieces
**Estimated Complexity:** High
**Can Start:** After Phase 2, 4
**Blocking:** Phase 6, 7

### Tasks

- [ ] **Task 5.1:** Create Canvas wrapper component (Complexity: Low)
  - **Depends on:** Task 1.3, 1.4
  - **Files:** `src/components/game/Scene.tsx`
  - **Add:** `'use client'` directive, Canvas configuration
  - **Config:** Camera position [8,8,8], FOV 50, dpr [1,2]
  - **Verify:** Canvas renders without errors

- [ ] **Task 5.2:** Configure lighting (Complexity: Low)
  - **Depends on:** Task 5.1
  - **Files:** `src/components/game/Scene.tsx`
  - **Add:** Ambient (0.4), directional (10,15,10, 0.8), point (-8,5,-8, 0.3)
  - **Verify:** Scene is well-lit

- [ ] **Task 5.3:** Set up OrbitControls (Complexity: Low)
  - **Depends on:** Task 5.1
  - **Files:** `src/components/game/Scene.tsx`
  - **Config:** Polar angle limits, distance limits, damping
  - **Verify:** Camera rotation/zoom works smoothly

- [ ] **Task 5.4:** Create GridCell component (Complexity: Medium)
  - **Depends on:** Task 2.3, 5.1
  - **Files:** `src/components/game/GridCell.tsx`
  - **Render:** Transparent box (opacity 0.05) + edge lines (opacity 0.3)
  - **Position:** Use `CELL_POSITIONS` array
  - **Verify:** All 27 cells render correctly

- [ ] **Task 5.5:** Create X piece geometry (Complexity: Medium)
  - **Depends on:** Task 5.1
  - **Files:** `src/components/game/XPiece.tsx`
  - **Implement:** Two crossed cylinders (radius 0.12, length 1.6)
  - **Material:** Cyan (#00E4E4), metalness 0.3, roughness 0.4, emissive
  - **Verify:** X renders correctly

- [ ] **Task 5.6:** Create O piece geometry (Complexity: Medium)
  - **Depends on:** Task 5.1
  - **Files:** `src/components/game/OPiece.tsx`
  - **Implement:** Torus (radius 0.7, tube 0.15)
  - **Material:** Magenta (#FF0088), metalness 0.3, roughness 0.4, emissive
  - **Verify:** O renders correctly

- [ ] **Task 5.7:** Create GameBoard component (Complexity: Medium)
  - **Depends on:** Task 5.4, 5.5, 5.6, 4.1
  - **Files:** `src/components/game/GameBoard.tsx`
  - **Render:** Map board state to pieces
  - **Subscribe:** Selective Zustand subscription
  - **Verify:** Board updates when state changes

- [ ] **Task 5.8:** Add background color (Complexity: Low)
  - **Depends on:** Task 5.1
  - **Files:** `src/components/game/Scene.tsx`
  - **Add:** `<color attach="background" args={['#1a1a2e']} />`
  - **Verify:** Dark blue background renders

- [ ] **Task 5.9:** Implement dynamic import for SSR compatibility (Complexity: Low)
  - **Depends on:** Task 5.1, 5.7
  - **Files:** `src/app/game/page.tsx`
  - **Use:** `next/dynamic` with `ssr: false`
  - **Verify:** No SSR errors

**Parallelization:** Tasks 5.2, 5.3, 5.8 can run after 5.1. Tasks 5.5 and 5.6 can run in parallel.

---

## Phase 6: Interaction & Input

**Goal:** Implement raycasting, hover effects, and controls
**Estimated Complexity:** High
**Can Start:** After Phase 5
**Blocking:** Phase 7

### Tasks

- [ ] **Task 6.1:** Add click handlers to cells (Complexity: Medium)
  - **Depends on:** Task 5.4, 4.2
  - **Files:** `src/components/game/GridCell.tsx`
  - **Implement:** `onClick` with `e.stopPropagation()`
  - **Call:** `makeMove(index)` from store
  - **Verify:** Clicking empty cell places piece

- [ ] **Task 6.2:** Implement hover effects (Complexity: Medium)
  - **Depends on:** Task 6.1
  - **Files:** `src/components/game/GridCell.tsx`
  - **Use:** `useFrame` for smooth lerp
  - **Effect:** Opacity 0.05 → 0.2, scale 1.0 → 1.1
  - **Verify:** Smooth hover animation

- [ ] **Task 6.3:** Add cursor pointer on hover (Complexity: Low)
  - **Depends on:** Task 6.2
  - **Files:** `src/components/game/GridCell.tsx`
  - **Implement:** `onPointerOver/Out` sets `document.body.style.cursor`
  - **Verify:** Cursor changes on empty cells only

- [ ] **Task 6.4:** Prevent interaction on occupied cells (Complexity: Low)
  - **Depends on:** Task 6.1
  - **Files:** `src/components/game/GridCell.tsx`
  - **Check:** `canMakeMove()` before handling events
  - **Verify:** Occupied cells don't respond to clicks

- [ ] **Task 6.5:** Implement keyboard navigation (Complexity: High)
  - **Depends on:** Task 6.1
  - **Files:** `src/hooks/useKeyboardNav.ts`, `src/components/game/GameBoard.tsx`
  - **Support:** Arrow keys (X/Y), Page Up/Down (Z), Enter/Space (select)
  - **Verify:** Full keyboard navigation works

- [ ] **Task 6.6:** Add accessibility attributes (Complexity: Medium)
  - **Depends on:** Task 6.5
  - **Files:** `src/components/game/GridCell.tsx`
  - **Add:** ARIA labels, roles, screen reader announcements
  - **Verify:** Screen reader accessibility

- [ ] **Task 6.7:** Add touch-friendly hit areas (Complexity: Medium)
  - **Depends on:** Task 6.1
  - **Files:** `src/components/game/GridCell.tsx`
  - **Implement:** Larger invisible hit box (2.5 units) for mobile
  - **Verify:** Easy tapping on mobile devices

**Parallelization:** Tasks 6.2, 6.3, 6.4 can run in parallel after 6.1. Task 6.5 is independent after 6.1.

---

## Phase 7: AI Opponent

**Goal:** Implement minimax AI with Web Worker
**Estimated Complexity:** High
**Can Start:** After Phase 3
**Blocking:** Phase 8 (AI mode testing)

### Tasks

- [ ] **Task 7.1:** Implement minimax algorithm (Complexity: High)
  - **Depends on:** Phase 3
  - **Files:** `src/lib/aiEngine.ts`
  - **Implement:** Minimax with alpha-beta pruning
  - **Add:** Position evaluation heuristic
  - **Verify:** AI finds optimal moves in test positions

- [ ] **Task 7.2:** Implement difficulty levels (Complexity: Medium)
  - **Depends on:** Task 7.1
  - **Files:** `src/lib/aiEngine.ts`
  - **Easy:** Random + 30% blocking
  - **Medium:** Depth-limited minimax + 20% random
  - **Hard:** Full minimax depth 6-8
  - **Impossible:** Unlimited depth
  - **Verify:** Different difficulty levels play differently

- [ ] **Task 7.3:** Add opening book optimization (Complexity: Low)
  - **Depends on:** Task 7.1
  - **Files:** `src/lib/aiEngine.ts`
  - **Implement:** First move takes center, second move takes corner
  - **Verify:** AI starts optimally

- [ ] **Task 7.4:** Create Web Worker (Complexity: Medium)
  - **Depends on:** Task 7.1, 7.2
  - **Files:** `src/workers/aiWorker.ts`
  - **Implement:** Message-based communication
  - **Add:** Artificial think delay (300-1500ms based on difficulty)
  - **Verify:** Worker doesn't block UI

- [ ] **Task 7.5:** Create useAI hook (Complexity: Medium)
  - **Depends on:** Task 7.4
  - **Files:** `src/hooks/useAI.ts`
  - **Implement:** Worker lifecycle, promise-based API
  - **Cleanup:** Terminate worker on unmount
  - **Verify:** AI moves trigger correctly

- [ ] **Task 7.6:** Integrate AI into game store (Complexity: Medium)
  - **Depends on:** Task 7.5, 4.2
  - **Files:** `src/stores/gameStore.ts`
  - **Add:** `isAIThinking` state, AI move trigger on player move
  - **Verify:** AI plays automatically in AI mode

- [ ] **Task 7.7:** Add move ordering optimization (Complexity: Medium)
  - **Depends on:** Task 7.1
  - **Files:** `src/lib/aiEngine.ts`
  - **Implement:** Prioritize center, corners, then edges
  - **Verify:** Performance improvement

**Parallelization:** Tasks 7.2 and 7.3 can run after 7.1. Task 7.5 can start immediately after 7.4.

---

## Phase 8: UI Overlay Components

**Goal:** Build all 2D HTML overlay components
**Estimated Complexity:** Medium
**Can Start:** After Phase 4
**Blocking:** Phase 9

### Tasks

- [ ] **Task 8.1:** Create UIOverlay container (Complexity: Low)
  - **Depends on:** Task 4.1
  - **Files:** `src/components/ui/UIOverlay.tsx`
  - **Pattern:** `pointer-events-none` container with phase-based rendering
  - **Verify:** Overlay doesn't block 3D interactions

- [ ] **Task 8.2:** Build MainMenu component (Complexity: Medium)
  - **Depends on:** Task 8.1, 4.2
  - **Files:** `src/components/ui/MainMenu.tsx`
  - **Buttons:** PvP, PvAI, Settings
  - **Style:** Cyan/Magenta color scheme
  - **Verify:** Buttons trigger correct actions

- [ ] **Task 8.3:** Build GameHUD component (Complexity: Medium)
  - **Depends on:** Task 8.1, 4.1
  - **Files:** `src/components/ui/GameHUD.tsx`
  - **Display:** Current player, move count, AI thinking indicator
  - **Buttons:** Menu, Settings
  - **Verify:** HUD updates in real-time

- [ ] **Task 8.4:** Build GameOver component (Complexity: Low)
  - **Depends on:** Task 8.1, 4.2
  - **Files:** `src/components/ui/GameOver.tsx`
  - **Display:** Winner or draw message
  - **Buttons:** Play Again, Main Menu
  - **Verify:** Shows correct winner/draw message

- [ ] **Task 8.5:** Build Settings panel (Complexity: Medium)
  - **Depends on:** Task 8.1, 4.3
  - **Files:** `src/components/ui/Settings.tsx`
  - **Controls:** Sound toggle, AI difficulty dropdown, first player selector
  - **Verify:** Settings persist and apply

- [ ] **Task 8.6:** Install and configure Lucide icons (Complexity: Low)
  - **Depends on:** Task 1.3
  - **Package:** `lucide-react`
  - **Icons:** Menu, X, Settings, Volume2, VolumeX, RefreshCw, Home, Info
  - **Verify:** Icons render in buttons

- [ ] **Task 8.7:** Add responsive breakpoints (Complexity: Low)
  - **Depends on:** Tasks 8.2-8.5
  - **Files:** All UI components
  - **Breakpoints:** Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)
  - **Verify:** UI adapts to different screen sizes

- [ ] **Task 8.8:** Add focus management (Complexity: Low)
  - **Depends on:** Tasks 8.2-8.5
  - **Files:** All UI components
  - **Implement:** Auto-focus first button, focus trap in modals
  - **Verify:** Keyboard navigation works

**Parallelization:** Tasks 8.2, 8.3, 8.4, 8.5 can all run in parallel after 8.1.

---

## Phase 9: Animation & Polish

**Goal:** Add animations, transitions, and visual polish
**Estimated Complexity:** High
**Can Start:** After Phase 5, 6
**Blocking:** Phase 10

### Tasks

- [ ] **Task 9.1:** Install animation libraries (Complexity: Low)
  - **Depends on:** Task 1.3
  - **Packages:** `@react-spring/three`, `framer-motion`
  - **Verify:** No version conflicts

- [ ] **Task 9.2:** Implement piece placement animation (Complexity: Medium)
  - **Depends on:** Task 9.1, 5.5, 5.6
  - **Files:** `src/components/game/XPiece.tsx`, `src/components/game/OPiece.tsx`
  - **Animation:** Scale 0 → 1, opacity 0 → 1, spring config
  - **Verify:** Smooth appearance animation

- [ ] **Task 9.3:** Implement hover glow effect (Complexity: Medium)
  - **Depends on:** Task 6.2
  - **Files:** `src/components/game/GridCell.tsx`
  - **Use:** `useFrame` with emissiveIntensity lerp
  - **Effect:** 0.0 → 0.2 on hover
  - **Verify:** Subtle glow on hover

- [ ] **Task 9.4:** Create WinLine component (Complexity: High)
  - **Depends on:** Task 9.1, 4.1
  - **Files:** `src/components/game/WinLine.tsx`
  - **Render:** Line geometry connecting 3 winning cells
  - **Animation:** Draw animation + pulsing glow
  - **Verify:** Win line appears on victory

- [ ] **Task 9.5:** Add screen transitions (Complexity: Low)
  - **Depends on:** Task 9.1, Phase 8
  - **Files:** All UI components
  - **Use:** Framer Motion for fade/slide transitions
  - **Verify:** Smooth transitions between screens

- [ ] **Task 9.6:** Add button hover animations (Complexity: Low)
  - **Depends on:** Phase 8
  - **Files:** All UI components
  - **CSS:** Scale + glow on hover
  - **Verify:** Interactive feedback on all buttons

- [ ] **Task 9.7:** Implement AI thinking indicator (Complexity: Low)
  - **Depends on:** Task 8.3, 7.6
  - **Files:** `src/components/ui/GameHUD.tsx`
  - **Animation:** Pulsing text/spinner
  - **Verify:** Shows when AI is computing

- [ ] **Task 9.8:** Add focus ring for accessibility (Complexity: Low)
  - **Depends on:** Task 6.5
  - **Files:** `src/components/game/GridCell.tsx`
  - **Render:** Ring geometry on focused cell
  - **Verify:** Visible keyboard focus indicator

**Parallelization:** Tasks 9.2, 9.3, 9.4 can run in parallel after 9.1. Tasks 9.5, 9.6 are independent.

---

## Phase 10: Audio System

**Goal:** Implement sound effects and audio controls
**Estimated Complexity:** Medium
**Can Start:** After Phase 4
**Blocking:** None (optional for MVP)

### Tasks

- [ ] **Task 10.1:** Choose audio approach (Complexity: Low)
  - **Depends on:** None
  - **Options:** A) External files (use-sound + howler), B) Procedural (Web Audio API)
  - **Decision:** Procedural recommended (no licensing, smaller bundle)
  - **Verify:** Decision documented

- [ ] **Task 10.2:** Implement procedural audio engine (Complexity: Medium)
  - **Depends on:** Task 10.1 (if procedural chosen)
  - **Files:** `src/lib/proceduralAudio.ts`
  - **Methods:** `playPlace()`, `playWin()`, `playDraw()`, `playClick()`, `playInvalid()`
  - **Verify:** All sounds work

- [ ] **Task 10.3:** Create useGameSounds hook (Complexity: Low)
  - **Depends on:** Task 10.2
  - **Files:** `src/hooks/useGameSounds.ts`
  - **Integrate:** Check `soundEnabled` setting before playing
  - **Verify:** Sounds respect settings

- [ ] **Task 10.4:** Integrate sounds into game actions (Complexity: Low)
  - **Depends on:** Task 10.3, 4.2
  - **Files:** `src/stores/gameStore.ts`
  - **Trigger:** Sound on piece placement, win, draw, invalid move
  - **Verify:** Sound plays at correct moments

- [ ] **Task 10.5:** Add sound toggle in Settings (Complexity: Low)
  - **Depends on:** Task 8.5
  - **Files:** `src/components/ui/Settings.tsx`
  - **Add:** Toggle switch for sound
  - **Verify:** Toggle persists and works

**Alternative Path (External Files):**
- [ ] **Task 10.2-alt:** Source CC0 sound files (Complexity: Medium)
  - Find on Freesound.org, Pixabay, Mixkit
  - Place in `public/sounds/`
- [ ] **Task 10.3-alt:** Install use-sound + howler (Complexity: Low)
  - `npm install use-sound howler`

**Parallelization:** All tasks after 10.2 can run in parallel.

---

## Phase 11: Testing & Quality Assurance

**Goal:** Comprehensive testing and bug fixes
**Estimated Complexity:** High
**Can Start:** After Phase 9
**Blocking:** Phase 12

### Tasks

- [ ] **Task 11.1:** Write unit tests for game logic (Complexity: Medium)
  - **Depends on:** Phase 3
  - **Files:** `src/lib/__tests__/gameLogic.test.ts`
  - **Coverage:** All 49 winning lines, edge cases, draw detection
  - **Verify:** 100% coverage on game logic

- [ ] **Task 11.2:** Write unit tests for AI engine (Complexity: Medium)
  - **Depends on:** Phase 7
  - **Files:** `src/lib/__tests__/aiEngine.test.ts`
  - **Test:** Known positions, difficulty levels, performance
  - **Verify:** AI plays optimally

- [ ] **Task 11.3:** Test responsive design (Complexity: Low)
  - **Depends on:** Phase 8
  - **Devices:** Desktop (1920×1080), Tablet (768×1024), Mobile (375×667)
  - **Verify:** UI works on all breakpoints

- [ ] **Task 11.4:** Accessibility audit (Complexity: Medium)
  - **Depends on:** Phase 6, 8
  - **Tools:** Lighthouse, axe DevTools
  - **Check:** WCAG AA compliance, keyboard navigation, screen reader
  - **Verify:** Score >90

- [ ] **Task 11.5:** Performance testing (Complexity: Medium)
  - **Depends on:** Phase 5, 9
  - **Target:** 60 FPS on all devices
  - **Check:** Draw calls <50, memory <100MB, frame time <16ms
  - **Verify:** Performance targets met

- [ ] **Task 11.6:** Cross-browser testing (Complexity: Low)
  - **Depends on:** Phase 9
  - **Browsers:** Chrome, Firefox, Safari, Edge
  - **Verify:** Works on all major browsers

- [ ] **Task 11.7:** Bug triage and fixes (Complexity: High)
  - **Depends on:** Tasks 11.1-11.6
  - **Process:** Log bugs, prioritize, fix critical issues
  - **Verify:** No critical bugs remaining

**Parallelization:** Tasks 11.1, 11.2 can run early. Tasks 11.3-11.6 can run in parallel.

---

## Phase 12: Deployment & Documentation

**Goal:** Prepare for production deployment
**Estimated Complexity:** Medium
**Can Start:** After Phase 11
**Blocking:** None (project complete)

### Tasks

- [ ] **Task 12.1:** Generate production build (Complexity: Low)
  - **Depends on:** Phase 11
  - **Command:** `npm run build`
  - **Verify:** Build succeeds with no errors/warnings

- [ ] **Task 12.2:** Create PWA manifest (Complexity: Low)
  - **Depends on:** None
  - **Files:** `public/manifest.json`
  - **Icons:** Generate 192×192, 512×512, maskable
  - **Verify:** PWA installable

- [ ] **Task 12.3:** Generate favicons (Complexity: Low)
  - **Depends on:** None
  - **Files:** `public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`
  - **Tool:** RealFaviconGenerator
  - **Verify:** Icons display correctly

- [ ] **Task 12.4:** Write user documentation (Complexity: Low)
  - **Depends on:** None
  - **Files:** `README.md`
  - **Sections:** How to play, controls, features
  - **Verify:** Clear and complete

- [ ] **Task 12.5:** Add license and attribution (Complexity: Low)
  - **Depends on:** None
  - **Files:** `LICENSE`, `ATTRIBUTION.md`
  - **List:** All third-party assets (fonts, icons, sounds)
  - **Verify:** All licenses documented

- [ ] **Task 12.6:** Set up deployment (Complexity: Low)
  - **Depends on:** Task 12.1
  - **Platform:** Vercel (recommended for Next.js)
  - **Config:** Environment variables, domain
  - **Verify:** Live deployment works

- [ ] **Task 12.7:** Add analytics (optional) (Complexity: Low)
  - **Depends on:** Task 12.6
  - **Tool:** Vercel Analytics or Google Analytics
  - **Privacy:** Add privacy policy if collecting data
  - **Verify:** Analytics tracking works

**Parallelization:** Tasks 12.2, 12.3, 12.4, 12.5 can all run in parallel.

---

## Dependency Graph Summary

```
Phase 1 (Setup)
    ↓
Phase 2 (Types) ────┐
    ↓               │
Phase 3 (Logic) ────┼───→ Phase 7 (AI)
    ↓               │         ↓
Phase 4 (State) ────┘    (integrates later)
    ↓
Phase 5 (3D Scene)
    ↓
Phase 6 (Input)
    ↓
Phase 8 (UI) ←── Phase 4
    ↓
Phase 9 (Animation) ←── Phase 5, 6
    ↓
Phase 10 (Audio) ←── Phase 4 (can run earlier)
    ↓
Phase 11 (Testing)
    ↓
Phase 12 (Deployment)
```

---

## Critical Path

The **critical path** (longest dependency chain):
1. Phase 1 (Setup)
2. Phase 2 (Types)
3. Phase 3 (Logic)
4. Phase 4 (State)
5. Phase 5 (3D Scene)
6. Phase 6 (Input)
7. Phase 9 (Animation)
8. Phase 11 (Testing)
9. Phase 12 (Deployment)

**Optimization:** Phase 7 (AI), Phase 8 (UI), and Phase 10 (Audio) can start earlier and run in parallel with other phases.

---

## Parallelization Opportunities

### Early Parallel Work (After Phase 1)
- Phase 2 (Types)
- Phase 10 (Audio) - can start implementation

### Mid-Project Parallelization (After Phase 3)
- Phase 7 (AI) - independent of rendering
- Phase 4 (State) - can work alongside AI

### Late-Project Parallelization (After Phase 5)
- Phase 8 (UI) - 2D overlays independent of 3D interactions
- Phase 9 (Animation) - can start with pieces while UI is being built

### Testing Phase Parallelization
- Unit tests (11.1, 11.2) can run early
- Integration tests (11.3-11.6) can run in parallel

---

## MVP Scope (Minimum Viable Product)

For fastest path to working game:
- ✅ Phase 1-6 (Core functionality)
- ✅ Phase 8 (Basic UI)
- ⚠️ Phase 7 (Optional: PvP only initially)
- ⚠️ Phase 9 (Minimal: Skip fancy animations)
- ❌ Phase 10 (Skip: Silent game)
- ✅ Phase 11 (Reduced: Critical tests only)
- ✅ Phase 12 (Deploy)

**MVP Complexity:** ~35 tasks instead of 43

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| R3F v9 compatibility issues | Medium | High | Test early, have v8 fallback plan |
| AI performance on mobile | High | Medium | Depth limiting, Web Worker isolation |
| Win detection bugs | Medium | Critical | Comprehensive unit tests (Task 11.1) |
| 3D performance <60fps | Medium | High | Profile early, reduce draw calls |
| Accessibility gaps | Low | Medium | Regular audits with automated tools |

---

## Success Criteria

### Technical
- [ ] 60 FPS on desktop, 30+ FPS on mobile
- [ ] All 49 winning lines detected correctly
- [ ] AI responds within 1.5 seconds on Hard difficulty
- [ ] TypeScript strict mode with zero errors
- [ ] WCAG AA accessibility compliance

### User Experience
- [ ] Intuitive 3D navigation (OrbitControls)
- [ ] Clear visual feedback on hover/click
- [ ] Accessible keyboard navigation
- [ ] Responsive on mobile/tablet/desktop
- [ ] Smooth animations and transitions

### Quality
- [ ] 80%+ unit test coverage on game logic
- [ ] Zero critical bugs
- [ ] Clean console (no errors/warnings)
- [ ] Production build <2MB gzipped
- [ ] Lighthouse score >90

---

## Time Estimates (Rough)

| Phase | Complexity | Estimated Hours |
|-------|------------|----------------|
| Phase 1 | Medium | 2-4 hours |
| Phase 2 | Medium | 3-4 hours |
| Phase 3 | High | 8-12 hours |
| Phase 4 | Medium | 4-6 hours |
| Phase 5 | High | 10-14 hours |
| Phase 6 | High | 8-10 hours |
| Phase 7 | High | 12-16 hours |
| Phase 8 | Medium | 6-8 hours |
| Phase 9 | High | 8-12 hours |
| Phase 10 | Medium | 4-6 hours |
| Phase 11 | High | 10-14 hours |
| Phase 12 | Medium | 3-5 hours |
| **TOTAL** | | **78-111 hours** |

**Note:** These are rough estimates. Actual time will vary based on experience level and unforeseen issues.

---

## Next Steps

1. **Review this plan** with all stakeholders
2. **Set up project** (Phase 1)
3. **Create sprint schedule** (2-week sprints recommended)
4. **Assign tasks** if working in a team
5. **Start with MVP scope** for fastest iteration
6. **Run quality gate agents** before each commit (see CLAUDE.md)

---

## References

- NEXTJS_SETUP.md - Phase 1 details
- 3D_TECHNOLOGY.md - Phase 5 details
- GAME_LOGIC.md - Phase 3 details
- AI_SYSTEM.md - Phase 7 details
- SCENE_DESIGN.md - Phase 5 geometry details
- INPUT_SYSTEM.md - Phase 6 details
- UI_DESIGN.md - Phase 8 details
- VISUAL_DESIGN.md - Colors and materials
- ANIMATION_AUDIO.md - Phase 9, 10 details
- ASSET_MANIFEST.md - Phase 12 asset requirements
