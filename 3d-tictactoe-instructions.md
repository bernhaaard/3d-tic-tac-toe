# 3D Tic-Tac-Toe Development Master Instructions

## Project Overview

This document provides comprehensive instructions for building a robust, interactive, and visually engaging three-dimensional Tic-Tac-Toe game using modern web technologies. The game operates on a 3×3×3 cubic grid comprising 27 discrete placement positions, supporting both single-player (versus AI opponent) and two-player (local multiplayer) game modes with complete win condition detection across all 49 possible winning lines.

## Critical Pre-Implementation Directive

**BEFORE WRITING ANY CODE**, the AI assistant must complete the following phases in strict sequential order:

1. **Research Phase**: Conduct thorough web research on current best practices, library versions, and implementation patterns
2. **Documentation Phase**: Generate comprehensive project documentation based on research findings
3. **Planning Phase**: Create detailed technical specifications and architecture documents
4. **Asset Phase**: Identify, download, or create all required visual and audio assets
5. **Implementation Phase**: Begin coding only after all preceding phases are complete and documented

## Subagent Task Definitions

The following subagent tasks must be executed with clear scope boundaries. Each subagent should produce a written report documenting findings, recommendations, and implementation specifications.

---

### SUBAGENT TASK 1: Next.js 2026 Modern Setup Research

**Scope**: Research and document the most current Next.js project initialization approach as of 2026.

**Research Questions**:
- What is the current stable version of Next.js and what are its recommended project initialization commands?
- What is the current recommended directory structure (App Router patterns, file conventions)?
- What are the current best practices for TypeScript configuration in Next.js projects?
- What is the recommended approach for integrating Three.js or React Three Fiber with Next.js in 2026?
- What are the current ESLint and Prettier configurations recommended for Next.js projects?
- What package manager is currently recommended (npm, pnpm, yarn, bun)?
- What are the current Tailwind CSS integration patterns for Next.js?

**Deliverable**: A written specification document detailing exact commands, configuration files, and directory structure for project initialization.

---

### SUBAGENT TASK 2: 3D Rendering Technology Stack Research

**Scope**: Research and recommend the optimal 3D rendering technology stack for browser-based interactive games.

**Research Questions**:
- What is the current stable version of Three.js and React Three Fiber (@react-three/fiber)?
- What are the current best practices for integrating @react-three/drei helper components?
- What physics engine (if any) is recommended for simple interactive 3D applications (Rapier, Cannon, etc.)?
- What post-processing effects are performant and visually appealing for game interfaces?
- What are current shader best practices for stylized visual effects?
- How should 3D canvas components handle responsive design and mobile compatibility?
- What are the memory management and performance optimization patterns for React Three Fiber?

**Deliverable**: A technology recommendation document with version numbers, import patterns, and performance considerations.

---

### SUBAGENT TASK 3: 3D Environment and Scene Design

**Scope**: Design the complete 3D scene composition including all visual elements, lighting, and spatial arrangement.

**Design Requirements**:
- Central game grid: A 3×3×3 cubic structure with clearly visible layer separation, transparent or semi-transparent boundaries allowing visibility of all 27 positions, and visual indicators for each cell
- Camera positioning: Optimal default viewing angle that displays all three layers simultaneously with intuitive spatial comprehension
- Lighting scheme: Ambient and directional lighting that creates depth without harsh shadows, with potential accent lighting for interactive elements
- Background environment: Stylized backdrop that provides visual context without distracting from gameplay (gradient, subtle particles, abstract geometry, etc.)
- Grid visualization: How to represent the 27 cells (wireframe, solid with transparency, floating platforms, etc.)
- Piece representation: Visual design for X and O markers in 3D space (geometric shapes, animated elements, particle effects on placement)

**Deliverable**: A scene composition document with spatial coordinates, lighting parameters, material specifications, and visual hierarchy diagram.

---

### SUBAGENT TASK 4: Input System and Interaction Design

**Scope**: Design all user input mechanisms for piece placement and camera manipulation.

**Design Requirements**:
- Cell selection: Raycasting implementation for detecting which of the 27 cells the user is hovering over or clicking
- Hover feedback: Visual indication when hovering over a valid empty cell (glow, scale change, color shift)
- Click/tap placement: Confirmation mechanism for placing pieces (immediate on click, or click-to-select then confirm?)
- Camera controls: Orbital camera rotation allowing players to view the grid from any angle, with optional constraints to prevent disorienting orientations
- Camera presets: Quick-access buttons or keyboard shortcuts to snap to optimal viewing angles (top-down per layer, isometric, front/side views)
- Touch support: Mobile-friendly interaction patterns for touch devices
- Keyboard accessibility: Optional keyboard navigation for accessibility compliance

**Deliverable**: An interaction specification document detailing input handlers, raycasting logic, camera control parameters, and feedback mechanisms.

---

### SUBAGENT TASK 5: Game Logic and Win Condition System

**Scope**: Design the complete game state management and win detection algorithm.

**Logic Requirements**:
- Game state structure: Data representation for the 27-cell grid (3D array, flat array with index mapping, or object structure)
- Turn management: Tracking current player, enforcing alternating turns, preventing invalid moves
- Win condition detection: Algorithm to check all 49 winning lines after each move
  - 27 horizontal lines (9 per layer × 3 axes)
  - 18 vertical lines (9 columns through all layers)
  - 4 space diagonals (corner to corner through center)
- Draw detection: Recognizing when all 27 cells are filled with no winner
- Game reset: State initialization and cleanup for new games
- Move history: Optional undo functionality and move replay capability

**The 49 Winning Lines Enumeration**:
- Rows within each layer: 9 lines (3 layers × 3 rows)
- Columns within each layer: 9 lines (3 layers × 3 columns)  
- Diagonals within each layer: 6 lines (3 layers × 2 diagonals)
- Vertical columns: 9 lines (connecting same position across layers)
- Vertical-layer diagonals: 6 lines (diagonals going through layers on each face)
- Vertical-layer anti-diagonals: 6 lines
- Space diagonals: 4 lines (corner to opposite corner through center)

**Deliverable**: A game logic specification document with data structures, algorithm pseudocode, and state transition diagrams.

---

### SUBAGENT TASK 6: AI Opponent System Design

**Scope**: Design the single-player AI opponent with multiple difficulty levels.

**AI Requirements**:
- Easy mode: Random valid move selection with basic blocking (prevents immediate opponent wins)
- Medium mode: Minimax algorithm with limited depth (2-3 moves ahead) for reasonable challenge without perfect play
- Hard mode: Full minimax with alpha-beta pruning, or optimized lookup for known positions
- AI response timing: Artificial delay to simulate "thinking" and prevent jarring instant responses
- Difficulty selection: UI for players to choose AI difficulty before starting single-player games

**Algorithmic Considerations**:
- State space analysis: 3^27 theoretical states (though many unreachable), requiring efficient pruning
- Evaluation heuristics: Scoring partially complete lines, center control, fork creation
- Performance optimization: Web Worker implementation for AI computation to prevent UI blocking

**Deliverable**: An AI system specification document with algorithm descriptions, difficulty parameters, and performance strategies.

---

### SUBAGENT TASK 7: User Interface and HUD Design

**Scope**: Design all 2D user interface elements overlaying the 3D game.

**UI Components**:
- Main menu: Game title, single-player button, two-player button, settings access, optional how-to-play section
- In-game HUD: Current player indicator, score tracking (for multi-round sessions), game status messages
- Layer navigation: Visual indicators or buttons showing which layer is currently highlighted or selected
- Settings panel: Difficulty selection, visual options (quality settings), audio toggle, control sensitivity
- Game over screen: Winner announcement, final state display, play again button, return to menu button
- Responsive design: UI adaptation for desktop, tablet, and mobile screen sizes

**Deliverable**: A UI/UX specification document with component hierarchy, responsive breakpoints, and interaction states.

---

### SUBAGENT TASK 8: Visual Design and Color System

**Scope**: Establish the complete visual identity including color palette, typography, and aesthetic direction.

**Design Requirements**:
- Aesthetic direction: Modern, playful, and visually distinctive (neon-futuristic, minimalist geometric, soft gradient, retro arcade, etc.)
- Primary color palette: 4-6 colors for consistent theming across UI and 3D elements
- Player colors: Distinct, accessible colors for X and O that maintain visibility against all backgrounds
- Interactive state colors: Hover, selected, disabled, and error state colorations
- Typography: Font selection for UI text (game title, buttons, status messages)
- Visual effects: Particle systems, glow effects, animations for piece placement and win highlighting

**Accessibility Considerations**:
- Color contrast ratios meeting WCAG guidelines
- Colorblind-friendly palette with distinguishable player markers
- Optional high-contrast mode

**Deliverable**: A visual design system document with hex codes, font specifications, and effect parameters.

---

### SUBAGENT TASK 9: Animation and Audio Design

**Scope**: Design all animations and sound effects for game feedback.

**Animation Requirements**:
- Piece placement animation: Entry animation when X or O appears (scale up, fade in, particle burst)
- Hover feedback animation: Subtle indication when hovering valid cells
- Win line highlight: Animated emphasis of the winning three cells (glow pulse, particle trail, etc.)
- Camera transitions: Smooth interpolation when using camera presets
- UI transitions: Menu open/close, panel slide, button feedback animations
- Victory celebration: Screen-wide effect when game is won

**Audio Requirements**:
- Piece placement sound: Satisfying confirmation sound for successful moves
- Invalid move sound: Gentle error indication
- Hover sound: Optional subtle feedback (may be disabled by default)
- Win fanfare: Celebratory sound for victory
- Draw sound: Neutral game-end indication
- Background music: Optional ambient music (low priority, can be omitted)
- Volume controls: Master volume, separate SFX and music controls if applicable

**Deliverable**: An animation and audio specification document with timing curves, asset requirements, and trigger conditions.

---

### SUBAGENT TASK 10: Asset Acquisition and Creation

**Scope**: Identify, source, or create all required visual and audio assets.

**Asset Inventory**:
- 3D models: If using pre-made X and O models versus procedural geometry
- Textures: Any texture maps for materials (noise maps, gradients, patterns)
- Icons: UI icons for buttons, player indicators, settings
- Sound effects: All required audio files (royalty-free sources or AI-generated)
- Fonts: Web font files or CDN links for typography
- Environment maps: If using HDR environment mapping for reflections

**Source Requirements**:
- All assets must be royalty-free, MIT-licensed, or created original
- Prefer procedural generation over external assets where feasible
- Document source attribution for any third-party assets

**Deliverable**: An asset manifest document listing all required assets with sources, licenses, and file specifications.

---

## Project Structure Specification

After research completion, establish the following directory structure (adjust based on Next.js 2026 conventions):

```
3d-tictactoe/
├── .github/
│   └── workflows/          # CI/CD if desired
├── public/
│   ├── assets/
│   │   ├── audio/          # Sound effects
│   │   ├── textures/       # Texture images
│   │   └── models/         # 3D model files if any
│   └── fonts/              # Web fonts if self-hosted
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── game/           # 3D game components
│   │   │   ├── GameBoard.tsx
│   │   │   ├── Cell.tsx
│   │   │   ├── Piece.tsx
│   │   │   ├── WinLine.tsx
│   │   │   └── Scene.tsx
│   │   └── ui/             # 2D UI components
│   │       ├── MainMenu.tsx
│   │       ├── GameHUD.tsx
│   │       ├── SettingsPanel.tsx
│   │       └── GameOverScreen.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useGameState.ts
│   │   ├── useAI.ts
│   │   └── useAudio.ts
│   ├── lib/                # Utility functions
│   │   ├── gameLogic.ts    # Win detection, move validation
│   │   ├── aiEngine.ts     # AI opponent logic
│   │   └── constants.ts    # Game constants, winning lines
│   ├── stores/             # State management (Zustand or similar)
│   │   └── gameStore.ts
│   └── types/              # TypeScript type definitions
│       └── game.ts
├── docs/                   # Generated documentation
│   ├── RESEARCH.md
│   ├── ARCHITECTURE.md
│   ├── GAME_LOGIC.md
│   └── VISUAL_DESIGN.md
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## GitHub Repository Setup

Execute the following steps for version control initialization:

1. Create a new private repository on the user's personal GitHub account named `3d-tictactoe` (or similar)
2. Initialize local git repository with `git init`
3. Create comprehensive `.gitignore` for Next.js projects
4. Make initial commit with project scaffolding
5. Set up remote origin and push initial commit
6. Use conventional commit messages throughout development
7. Create feature branches for major development phases

---

## Implementation Phase Order

After all research and documentation is complete, implement in this sequence:

1. **Project Initialization**: Next.js setup with all dependencies
2. **Core Game Logic**: State management, win detection (pure TypeScript, testable in isolation)
3. **Basic 3D Scene**: Canvas setup, grid visualization, camera controls
4. **Piece Placement**: Raycasting, click handling, piece rendering
5. **Turn System**: Two-player local functionality complete
6. **AI Opponent**: Single-player mode with difficulty levels
7. **UI Components**: Menus, HUD, settings
8. **Visual Polish**: Animations, effects, color theming
9. **Audio Integration**: Sound effects and feedback
10. **Responsive Design**: Mobile optimization
11. **Testing and Bug Fixes**: Comprehensive testing across devices
12. **Documentation Update**: Final README and code documentation

---

## Quality Requirements

- Full TypeScript strict mode compliance
- No `any` types except where absolutely necessary with documented justification
- Responsive design supporting desktop (1920×1080), tablet (768×1024), and mobile (375×667) viewports
- 60fps target for all animations on mid-range hardware
- Accessibility compliance with keyboard navigation and screen reader considerations
- Clean, documented code with JSDoc comments for all public functions

---

## Execution Command

To begin the project, execute the subagent tasks sequentially, documenting all findings before proceeding to implementation. Use web search tools to gather current documentation, version numbers, and best practices for each subagent task scope. Create the documentation files in the `docs/` directory as each research phase completes.

Only after all 10 subagent tasks have produced their deliverables and the project documentation is complete should code implementation begin.
