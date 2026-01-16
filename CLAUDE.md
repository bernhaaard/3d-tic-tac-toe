# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

3D Tic-Tac-Toe: A browser-based 3×3×3 cubic grid game with 27 positions and 49 winning lines. Built with Next.js (App Router), React Three Fiber, and TypeScript.

## Development Workflow

**CRITICAL**: This project follows a strict research-first methodology. The phases must be executed in order:

1. **Research Phase** - Web research on current best practices (2025-2026)
2. **Documentation Phase** - Generate comprehensive docs in `docs/`
3. **Planning Phase** - Technical specifications and architecture
4. **Asset Phase** - Identify/create visual and audio assets
5. **Implementation Phase** - Code only after all above are complete

## Subagent Tasks

Ten bounded subagent tasks exist for parallel research:
- Task 1: Next.js setup research → `docs/NEXTJS_SETUP.md`
- Task 2: 3D tech stack (R3F/Three.js) → `docs/3D_TECHNOLOGY.md`
- Task 3: 3D scene design → `docs/SCENE_DESIGN.md`
- Task 4: Input/interaction system → `docs/INPUT_SYSTEM.md`
- Task 5: Game logic & win detection → `docs/GAME_LOGIC.md`
- Task 6: AI opponent system → `docs/AI_SYSTEM.md`
- Task 7: UI/HUD design → `docs/UI_DESIGN.md`
- Task 8: Visual design system → `docs/VISUAL_DESIGN.md`
- Task 9: Animation & audio → `docs/ANIMATION_AUDIO.md`
- Task 10: Asset acquisition → `docs/ASSET_MANIFEST.md`

See `subagent-invocation-guide.md` for exact prompts to spawn each subagent.

## Commands

After project initialization:
```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Build & Lint
npm run build        # Production build
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix lint issues
npm run format       # Prettier formatting
npm run typecheck    # TypeScript strict check

# Testing
npm test             # Run all tests
npm test -- <file>   # Run single test file
```

## Architecture

```
src/
├── app/                 # Next.js App Router
├── components/
│   ├── game/           # 3D: GameBoard, Cell, Piece, Scene, WinLine
│   └── ui/             # 2D: MainMenu, GameHUD, Settings, GameOver
├── hooks/              # useGameState, useAI, useAudio
├── lib/
│   ├── gameLogic.ts    # Win detection (49 lines), move validation
│   ├── aiEngine.ts     # Minimax with alpha-beta, difficulty levels
│   └── constants.ts    # WINNING_LINES array, grid constants
├── stores/             # Zustand game state
└── types/              # TypeScript definitions
```

## Game Logic: 49 Winning Lines

The win detection must check all 49 lines:
- 9 rows (3 per layer × 3 layers)
- 9 columns (3 per layer × 3 layers)
- 6 layer diagonals (2 per layer × 3 layers)
- 9 vertical columns (3×3 positions through all layers)
- 6 vertical-face diagonals
- 6 vertical-face anti-diagonals
- 4 space diagonals (corner-to-corner through center)

Index mapping for 27-cell flat array: `index = x + y*3 + z*9` where x,y,z ∈ [0,2]

## Key Technical Decisions

- **State**: Zustand for game state management
- **3D**: React Three Fiber with @react-three/drei helpers
- **Interaction**: Raycasting for cell selection, OrbitControls for camera
- **AI**: Web Worker for minimax computation (prevents UI blocking)
- **Styling**: Tailwind CSS for UI, Three.js materials for 3D

## Quality Standards

- TypeScript strict mode, no `any` types without justification
- 60fps animation target
- Responsive: desktop (1920×1080), tablet (768×1024), mobile (375×667)
- WCAG accessibility compliance for UI elements

---

## Subagent Workflow

### Quality Gate Agents (Run After Code Changes)

| Agent | Purpose | Invoke When |
|-------|---------|-------------|
| `security-auditor` | OWASP, injection, auth flaws | Before any commit |
| `architecture-reviewer` | Design flaws, integration issues | Significant changes |
| `code-quality-reviewer` | Code smells, SOLID violations | All PRs |
| `r3f-domain-expert` | WebGL performance, R3F patterns | 3D code changes |
| `review-synthesizer` | Combine feedback, determine verdict | After parallel review |

### Review Verdicts

- **APPROVE**: Merge immediately - all standards met
- **REVISE**: Return to coder with specific fixes required
- **TICKET**: Create separate issue for out-of-scope work
- **REJECT**: Fundamental redesign required - close PR and restart

### Iterative Review Loop

```
[Coder] → [Code] → [PARALLEL REVIEW] → [VERDICT]
   ↑                                       │
   └───────────── REVISE ──────────────────┘
```

### Research Agents (Run in Parallel)

| Agent | Output File |
|-------|-------------|
| `nextjs-researcher` | `docs/NEXTJS_SETUP.md` |
| `r3f-researcher` | `docs/3D_TECHNOLOGY.md` |
| `game-logic-researcher` | `docs/GAME_LOGIC.md` |
| `ai-researcher` | `docs/AI_SYSTEM.md` |
| `scene-designer` | `docs/SCENE_DESIGN.md` |
| `input-researcher` | `docs/INPUT_SYSTEM.md` |
| `ui-researcher` | `docs/UI_DESIGN.md` |
| `visual-researcher` | `docs/VISUAL_DESIGN.md` |
| `animation-researcher` | `docs/ANIMATION_AUDIO.md` |
| `asset-researcher` | `docs/ASSET_MANIFEST.md` |

See `.claude/agents/` for full agent specifications.

### MCP Servers Available

| Server | Use Case |
|--------|----------|
| `mcp-three` | GLTF→JSX conversion, R3F optimization |
| `sequential-thinking` | Complex AI logic reasoning |
| `tailwind` | CSS class suggestions, conversions |
| `next-devtools` | Live error detection |

### Shared Context Files

```
.claude/review-context/
├── current-pr.md              # Current review context
├── architectural-decisions.md # ADRs
└── review-history.md          # Past review patterns
```

Update these files before running review agents to provide context.
