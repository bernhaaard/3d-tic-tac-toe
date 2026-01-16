# Next.js 15+ Project Setup Guide (2026)

**Last Updated:** January 2026
**Target:** Next.js 15.x with App Router, TypeScript, and React Three Fiber integration

---

## Table of Contents
1. [Quick Start Command](#quick-start-command)
2. [Installation Options](#installation-options)
3. [Dependencies](#dependencies)
4. [Directory Structure](#directory-structure)
5. [Configuration Files](#configuration-files)
6. [Linter & Formatter Setup](#linter--formatter-setup)
7. [Environment Variables](#environment-variables)
8. [NPM Scripts](#npm-scripts)
9. [React Three Fiber Integration](#react-three-fiber-integration)

---

## Quick Start Command

### Recommended: Interactive Setup
```bash
npx create-next-app@latest my-3d-tictactoe
```

**Interactive Prompts (2026):**
```
✓ What is your project named? my-3d-tictactoe
✓ Would you like to use TypeScript? Yes
✓ Which linter would you like to use? Biome (or ESLint)
✓ Would you like to use Tailwind CSS? Yes
✓ Would you like your code inside a `src/` directory? Yes
✓ Would you like to use App Router? Yes (recommended)
✓ Would you like to customize the import alias? No (@/* is good default)
```

### Non-Interactive: Full Command
```bash
npx create-next-app@latest my-3d-tictactoe \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --turbopack
```

---

## Installation Options

### Create-Next-App CLI Flags (Complete Reference)

| Flag | Type | Description | Default (2026) |
|------|------|-------------|---------------|
| `--ts`, `--typescript` | Boolean | TypeScript project | ✓ Enabled |
| `--js`, `--javascript` | Boolean | JavaScript project | Disabled |
| `--tailwind` | Boolean | Tailwind CSS config | ✓ Enabled |
| `--eslint` | Boolean | ESLint config | ✓ Enabled |
| `--biome` | Boolean | Biome config | Disabled |
| `--app` | Boolean | App Router | ✓ Enabled |
| `--src-dir` | Boolean | Use src/ directory | Disabled |
| `--turbopack` | Boolean | Turbopack bundler | ✓ Enabled |
| `--import-alias <alias>` | String | Import alias | `@/*` |
| `--yes` | Boolean | Skip prompts, use defaults | - |

**Recommendation for 3D Game Project:**
- **Use `--src-dir`**: Better organization for components, hooks, lib folders
- **Use `--typescript`**: Strict typing essential for game logic
- **Use `--app`**: App Router is required for modern Next.js
- **Use `--turbopack`**: 76.7% faster startup, 96.3% faster refresh

---

## Dependencies

### Core Dependencies (Auto-installed)

```json
{
  "dependencies": {
    "next": "^15.5.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^9.26.0",
    "eslint-config-next": "^15.5.0",
    "typescript": "^5.6.0"
  }
}
```

### React Three Fiber Dependencies

**CRITICAL:** React Three Fiber v8 is **INCOMPATIBLE** with React 19 / Next.js 15. Use v9 RC:

```json
{
  "dependencies": {
    "three": "^0.171.0",
    "@react-three/fiber": "^9.0.0-rc.2",
    "@react-three/drei": "^9.121.0"
  },
  "devDependencies": {
    "@types/three": "^0.171.0"
  }
}
```

**Installation Command:**
```bash
npm install three @react-three/fiber@rc @react-three/drei
npm install --save-dev @types/three
```

### Recommended Additional Packages

```json
{
  "dependencies": {
    "zustand": "^5.0.0",              // State management (by R3F team)
    "clsx": "^2.1.0",                 // Conditional classNames
    "tailwind-merge": "^2.5.0"        // Merge Tailwind classes safely
  }
}
```

---

## Directory Structure

### Recommended Structure for 3D Game Project

```
my-3d-tictactoe/
├── public/                          # Static assets
│   ├── sounds/                      # Audio files
│   └── favicon.ico
│
├── src/                             # Application source
│   ├── app/                         # App Router
│   │   ├── layout.tsx               # Root layout (required)
│   │   ├── page.tsx                 # Home page (/)
│   │   ├── globals.css              # Global styles
│   │   └── game/
│   │       └── page.tsx             # /game route
│   │
│   ├── components/                  # Reusable components
│   │   ├── game/                    # 3D: GameBoard, Cell, Piece, Scene
│   │   └── ui/                      # 2D: MainMenu, GameHUD, Settings
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useGameState.ts
│   │   ├── useAI.ts
│   │   └── useAudio.ts
│   │
│   ├── lib/                         # Utility functions
│   │   ├── gameLogic.ts             # Win detection, move validation
│   │   ├── aiEngine.ts              # Minimax algorithm
│   │   └── constants.ts             # WINNING_LINES, grid constants
│   │
│   ├── stores/                      # Zustand state management
│   │   └── gameStore.ts
│   │
│   └── types/                       # TypeScript definitions
│       └── game.ts
│
├── .env.local                       # Environment variables
├── eslint.config.mjs                # ESLint 9 flat config
├── next.config.ts                   # Next.js config
├── package.json
├── tsconfig.json                    # TypeScript config
└── tailwind.config.ts               # Tailwind config
```

---

## Configuration Files

### 1. tsconfig.json (TypeScript Configuration)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,

    "strict": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    "allowJs": true,
    "skipLibCheck": true,
    "noEmit": true,
    "incremental": true,
    "isolatedModules": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", ".next/types/**/*.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", ".next", "out"]
}
```

### 2. next.config.ts (Next.js Configuration)

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Required for Three.js ecosystem
  transpilePackages: ['three'],
  serverExternalPackages: ['three'],

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },

  poweredByHeader: false,
};

export default nextConfig;
```

---

## Linter & Formatter Setup

### ESLint vs Biome Comparison (2026)

| Feature | ESLint + Prettier | Biome |
|---------|-------------------|-------|
| **Speed** | 3-5s (10k lines) | ~200ms |
| **Setup** | 4 config files | 1 file |
| **Rules** | Thousands | ~200 |
| **Next.js 15.5+** | Manual setup | Official support |

**Recommendation:** Use Biome for new projects (15-20x faster)

### Option A: ESLint 9 (Flat Config)

```javascript
// eslint.config.mjs
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const compat = new FlatCompat({
  recommendedConfig: js.configs.recommended,
});

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
```

### Option B: Biome

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

---

## Environment Variables

### File Structure

```
.env                 # Default values (committed)
.env.local           # Local overrides (git-ignored)
.env.development     # Development-only
.env.production      # Production-only
```

### Example .env.local

```bash
# Public Variables (Exposed to Browser)
NEXT_PUBLIC_APP_NAME="3D Tic-Tac-Toe"
NEXT_PUBLIC_ENABLE_AI=true

# Server-Only Variables
API_SECRET_KEY="your-secret-key"
```

---

## NPM Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "check": "npm run typecheck && npm run lint"
  }
}
```

---

## React Three Fiber Integration

### Client Component Wrapper (Required)

R3F requires browser APIs - must use `'use client'`:

```typescript
// src/components/game/Scene.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export default function Scene() {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <OrbitControls />
      {/* 3D content here */}
    </Canvas>
  );
}
```

### Dynamic Import (SSR-friendly)

```typescript
// src/app/game/page.tsx
import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('@/components/game/Scene'), {
  ssr: false,
  loading: () => <div>Loading 3D scene...</div>,
});

export default function GamePage() {
  return <Scene />;
}
```

---

## Key Architectural Decisions

| Decision | Chosen | Rationale |
|----------|--------|-----------|
| **Routing** | App Router | Required for Next.js 15+ |
| **Directory** | src/ | Better organization |
| **TypeScript** | Strict mode | Essential for game logic |
| **Linter** | Biome (2026) | 15-20x faster |
| **Bundler** | Turbopack | 76% faster startup |
| **State** | Zustand | Lightweight, no provider hell |
| **R3F Version** | v9 RC | Required for React 19 |

---

## Sources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Three Fiber v9 Migration Guide](https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide)
- [Biome Documentation](https://biomejs.dev/)
- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15)
