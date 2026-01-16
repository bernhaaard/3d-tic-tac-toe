# Subagent Invocation Guide

This document provides ready-to-use prompts for spawning subagents during the research and planning phases. Each subagent prompt is designed to constrain scope while maximizing output quality.

---

## Pre-Execution Checklist

Before beginning, ensure:
- [ ] GitHub CLI (`gh`) is authenticated with user's account
- [ ] Node.js and preferred package manager are installed
- [ ] Working directory is clear for new project creation
- [ ] Web search tools are available for research tasks

---

## Subagent Prompt Templates

### Subagent 1: Next.js 2026 Setup Research

```
TASK: Research current Next.js project initialization best practices as of 2026.

SCOPE: You are researching ONLY project setup and configuration. Do not research 3D libraries, game logic, or UI frameworks.

REQUIRED RESEARCH:
1. Search for "Next.js 15 project setup 2025 2026" to find current initialization commands
2. Search for "create-next-app latest version options typescript" for CLI options
3. Search for "Next.js App Router directory structure 2025" for file conventions
4. Search for "Next.js TypeScript configuration strict mode" for tsconfig best practices
5. Search for "React Three Fiber Next.js integration 2025" for 3D library compatibility

OUTPUT FORMAT: Produce a markdown document containing:
- Exact `npx create-next-app` or equivalent command with all recommended flags
- Complete `package.json` dependencies section with version numbers
- Recommended `tsconfig.json` configuration
- Directory structure diagram
- Any special configuration for Three.js/R3F integration

Do not write any code. Produce documentation only.
```

---

### Subagent 2: 3D Technology Stack Research

```
TASK: Research optimal 3D rendering stack for browser-based interactive games.

SCOPE: You are researching ONLY Three.js/React Three Fiber ecosystem. Do not research game logic, UI components, or project setup.

REQUIRED RESEARCH:
1. Search for "React Three Fiber version 2025 changelog" for current stable version
2. Search for "@react-three/drei documentation components list" for helper library capabilities
3. Search for "Three.js performance optimization 2025" for rendering best practices
4. Search for "React Three Fiber Zustand state management" for recommended state patterns
5. Search for "Three.js raycasting click detection" for interaction implementation

OUTPUT FORMAT: Produce a markdown document containing:
- Current version numbers for @react-three/fiber, @react-three/drei, three
- List of drei components relevant to this project (OrbitControls, etc.)
- Performance optimization checklist
- Code pattern examples for canvas setup (documentation excerpts only)
- Memory management recommendations

Do not write implementation code. Produce research documentation only.
```

---

### Subagent 3: 3D Scene Design

```
TASK: Design the complete 3D scene composition for a 3×3×3 Tic-Tac-Toe game.

SCOPE: You are designing ONLY visual scene elements. Do not design game logic, UI overlays, or input systems.

DESIGN DELIVERABLES:
1. Grid structure: How to visually represent 27 cells in 3D space
   - Cell dimensions and spacing (suggest specific units)
   - Layer separation distance
   - Transparency/material approach for visibility
   
2. Camera setup: 
   - Initial position coordinates [x, y, z]
   - Field of view recommendation
   - Near/far clipping planes
   - Orbital constraints (min/max polar angle, azimuth limits if any)

3. Lighting configuration:
   - Ambient light color and intensity
   - Directional/point light positions and parameters
   - Shadow settings if used

4. Environment:
   - Background approach (color, gradient, environment map)
   - Optional decorative elements

5. Piece designs:
   - X marker geometry description
   - O marker geometry description
   - Scale relative to cell size

OUTPUT FORMAT: Produce a scene specification document with exact numeric values where applicable, material descriptions, and a spatial diagram showing coordinate system orientation.
```

---

### Subagent 4: Input System Design

```
TASK: Design all user input mechanisms for the 3D Tic-Tac-Toe game.

SCOPE: You are designing ONLY input handling and interaction feedback. Do not design visual appearance, game logic, or AI.

DESIGN DELIVERABLES:
1. Raycasting system:
   - How to map screen coordinates to 3D cell positions
   - Cell hit detection approach (invisible collision meshes vs geometry bounds)
   - Index calculation from raycast hit

2. Hover feedback:
   - Visual change specification (color shift, scale, emission)
   - Transition timing

3. Click/tap handling:
   - Event binding approach (pointer events vs onClick)
   - Touch device considerations
   - Double-click prevention

4. Camera controls:
   - OrbitControls configuration parameters
   - Rotation speed, zoom limits, pan disable
   - Damping settings

5. Camera presets:
   - Define 4-6 preset camera positions with names
   - Transition animation duration
   - Trigger mechanism (keyboard shortcuts, buttons)

6. Accessibility:
   - Keyboard navigation pattern (if implemented)
   - Focus indication approach

OUTPUT FORMAT: Produce an interaction specification document with parameter values, event flow diagrams, and coordinate mappings.
```

---

### Subagent 5: Game Logic Design

```
TASK: Design complete game state management and win detection for 3D Tic-Tac-Toe.

SCOPE: You are designing ONLY game logic. Do not design visuals, UI, or AI opponent.

DESIGN DELIVERABLES:
1. Data structure:
   - Grid state representation (recommend array structure with index mapping)
   - Index-to-coordinate conversion formulas: given index i, calculate (x, y, z) and vice versa
   - Cell state type (empty, X, O)

2. All 49 winning lines enumeration:
   - List every winning line as array of three indices
   - Group by category (rows, columns, layer-diagonals, space-diagonals)
   - Verify total count: 9+9+6+9+6+6+4 = 49

3. Win detection algorithm:
   - Pseudocode for checking win after each move
   - Optimization: only check lines containing the last move

4. Game state machine:
   - States: menu, playing, gameOver
   - Transitions and triggers
   - Current player tracking

5. Move validation:
   - Check cell is empty
   - Check game is not over
   - Check it's this player's turn

OUTPUT FORMAT: Produce a game logic specification with TypeScript type definitions, algorithm pseudocode, and the complete winning lines array.
```

---

### Subagent 6: AI Opponent Design

```
TASK: Design AI opponent system with multiple difficulty levels.

SCOPE: You are designing ONLY AI decision-making. Do not design game logic infrastructure, visuals, or UI.

DESIGN DELIVERABLES:
1. Difficulty levels:
   - Easy: Random selection from valid moves, optional immediate-win/block
   - Medium: Minimax with depth limit (specify depth)
   - Hard: Full minimax with alpha-beta pruning

2. Minimax implementation:
   - State evaluation heuristic (how to score non-terminal positions)
   - Terminal state detection (win/loss/draw)
   - Move generation (finding empty cells)
   - Pseudocode for minimax with alpha-beta

3. Performance optimization:
   - Web Worker usage pattern
   - Move ordering for better pruning
   - Early termination conditions
   - Maximum computation time limit

4. Response timing:
   - Artificial delay range per difficulty (easy: 300-600ms, etc.)
   - Delay implementation approach

5. Edge cases:
   - First move optimization (center or corner preference)
   - Symmetric position handling (optional)

OUTPUT FORMAT: Produce an AI specification document with algorithm pseudocode, heuristic scoring rules, and difficulty parameter tables.
```

---

### Subagent 7: UI/HUD Design

```
TASK: Design all 2D user interface overlays for the game.

SCOPE: You are designing ONLY UI components and layouts. Do not design 3D elements, game logic, or visual styling.

DESIGN DELIVERABLES:
1. Component hierarchy:
   - List all UI components with parent-child relationships
   - State each component receives as props

2. Main menu layout:
   - Element arrangement (title, buttons, optional decorations)
   - Button labels and actions

3. In-game HUD:
   - Current player indicator position and content
   - Score display (if multi-round)
   - Settings/menu access button

4. Game over screen:
   - Winner/draw announcement
   - Final board state (keep visible or dim)
   - Action buttons (play again, main menu)

5. Settings panel:
   - Difficulty selector (single-player)
   - Audio toggle
   - Visual quality options (if applicable)

6. Responsive breakpoints:
   - Desktop (>1024px)
   - Tablet (768-1024px)
   - Mobile (<768px)
   - Layout adjustments per breakpoint

OUTPUT FORMAT: Produce a UI specification document with component diagrams, layout wireframes (ASCII or description), and responsive behavior notes.
```

---

### Subagent 8: Visual Design System

```
TASK: Create complete visual design system including colors, typography, and aesthetic direction.

SCOPE: You are designing ONLY visual styling. Do not design component structure, animations, or game logic.

DESIGN DELIVERABLES:
1. Aesthetic direction:
   - Describe overall visual mood (e.g., "neon-futuristic with soft glows and dark background")
   - Reference inspirations if helpful

2. Color palette (provide hex codes):
   - Background primary
   - Background secondary/accent
   - Player X color
   - Player O color
   - UI text color
   - UI button background
   - UI button hover
   - Success/win highlight
   - Error/invalid state
   - Disabled state

3. Accessibility check:
   - Verify X vs O colors are distinguishable for colorblind users
   - Contrast ratios for text

4. Typography:
   - Heading font family (suggest Google Font or system font)
   - Body font family
   - Font sizes (title, heading, body, small)
   - Font weights

5. Material properties:
   - Grid material (wireframe, solid, glass, etc.)
   - Piece materials (metallic, emissive, matte)
   - Environment material (if applicable)

OUTPUT FORMAT: Produce a design system document with exact hex codes, font specifications, and material property values.
```

---

### Subagent 9: Animation and Audio Design

```
TASK: Design all animations and sound effects for game feedback.

SCOPE: You are designing ONLY motion and audio. Do not design static visuals, game logic, or UI structure.

DESIGN DELIVERABLES:
1. Animations (specify duration, easing, property changes):
   - Piece placement: entry animation
   - Cell hover: feedback animation
   - Win detection: winning line highlight animation
   - Camera transitions: movement to presets
   - UI transitions: menu open/close, panel slide

2. Animation parameters:
   - Recommended easing functions (ease-out, spring, etc.)
   - Duration ranges in milliseconds
   - Stagger delays if applicable

3. Sound effects (describe characteristics):
   - Piece placement: describe sound quality (click, whoosh, chime, etc.)
   - Invalid move: subtle error indication
   - Win: celebratory fanfare style
   - Draw: neutral conclusion
   - UI interaction: button click feedback

4. Audio sources:
   - Recommend royalty-free sources (freesound.org, etc.)
   - Or recommend procedural audio generation approach
   - File format preference (mp3, ogg, wav)

5. Audio implementation:
   - Web Audio API vs Howler.js vs use-sound hook
   - Preloading strategy
   - Volume control structure

OUTPUT FORMAT: Produce an animation/audio specification with timing tables, effect descriptions, and implementation recommendations.
```

---

### Subagent 10: Asset Acquisition

```
TASK: Identify and document all required assets for the project.

SCOPE: You are ONLY cataloging and sourcing assets. Do not design systems or write implementation code.

DELIVERABLES:
1. Asset inventory with sources:
   - 3D models: List any needed, recommend procedural vs external
   - Textures: List any needed, suggest sources or generation
   - Icons: List UI icons needed, recommend icon library
   - Sounds: List all sounds, search for royalty-free options
   - Fonts: Confirm font availability and license

2. For each external asset:
   - Source URL
   - License type (MIT, CC0, etc.)
   - Attribution requirements
   - File size if known

3. For procedural assets:
   - Describe generation approach
   - Reference documentation or examples

4. Search for resources:
   - Search "royalty-free game sound effects 2025" for audio sources
   - Search "Three.js procedural geometry examples" for 3D generation

OUTPUT FORMAT: Produce an asset manifest document with URLs, licenses, and attribution text ready for use.
```

---

## GitHub Setup Commands

After research phase completion, execute these commands (adapt repository name as needed):

```bash
# Create new private repository on GitHub
gh repo create 3d-tictactoe --private --description "Interactive 3D Tic-Tac-Toe game built with Next.js and React Three Fiber"

# Clone the empty repository
gh repo clone 3d-tictactoe
cd 3d-tictactoe

# Initialize Next.js project (command from Subagent 1 research)
# Example: npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir

# Create documentation directory
mkdir -p docs

# Add documentation files from research
# (Copy subagent outputs to docs/)

# Initial commit
git add .
git commit -m "chore: initialize project with Next.js and documentation"
git push origin main
```

---

## Research Execution Order

1. Execute Subagent 1 → Save output to `docs/NEXTJS_SETUP.md`
2. Execute Subagent 2 → Save output to `docs/3D_TECHNOLOGY.md`
3. Execute Subagent 5 → Save output to `docs/GAME_LOGIC.md` (core logic before visuals)
4. Execute Subagent 3 → Save output to `docs/SCENE_DESIGN.md`
5. Execute Subagent 4 → Save output to `docs/INPUT_SYSTEM.md`
6. Execute Subagent 6 → Save output to `docs/AI_SYSTEM.md`
7. Execute Subagent 7 → Save output to `docs/UI_DESIGN.md`
8. Execute Subagent 8 → Save output to `docs/VISUAL_DESIGN.md`
9. Execute Subagent 9 → Save output to `docs/ANIMATION_AUDIO.md`
10. Execute Subagent 10 → Save output to `docs/ASSET_MANIFEST.md`

After all documentation is complete:
- Create `docs/ARCHITECTURE.md` synthesizing all research into implementation plan
- Create `README.md` with project overview
- Begin implementation following the documented specifications
