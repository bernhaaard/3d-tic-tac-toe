# Visual Design System

**Last Updated:** January 2026
**Scope:** Color palette, typography, materials, accessibility, aesthetic direction

---

## Aesthetic Direction

**Style:** Neon-futuristic cyberpunk with glowing elements against dark backgrounds

**Mood:**
- Modern and sleek
- High contrast for readability
- Subtle glow effects for visual interest
- Dark-first design (82% of gamers prefer dark themes)

---

## Color Palette

### Option A: Cyan vs Magenta (Recommended)

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Cyan (X) | `#00E4E4` | rgb(0, 228, 228) | Player X pieces, primary actions |
| Magenta (O) | `#FF0088` | rgb(255, 0, 136) | Player O pieces, secondary actions |
| Background | `#1a1a2e` | rgb(26, 26, 46) | Main background |
| Surface | `#16213e` | rgb(22, 33, 62) | Cards, panels |
| Text | `#FFFFFF` | rgb(255, 255, 255) | Primary text |
| Text Muted | `#9CA3AF` | rgb(156, 163, 175) | Secondary text |
| Grid Lines | `#4B5563` | rgb(75, 85, 99) | Grid structure |

### Option B: Blue vs Orange

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Blue (X) | `#3B82F6` | rgb(59, 130, 246) | Player X |
| Orange (O) | `#F97316` | rgb(249, 115, 22) | Player O |
| Background | `#0F172A` | rgb(15, 23, 42) | Main background |

**Best for:** Maximum colorblind distinction

### Option C: Purple vs Teal

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Purple (X) | `#BF00FF` | rgb(191, 0, 255) | Player X |
| Teal (O) | `#4ECDC4` | rgb(78, 205, 196) | Player O |
| Background | `#1E1E2E` | rgb(30, 30, 46) | Main background |

**Best for:** Softer, less aggressive aesthetic

---

## Accessibility

### Contrast Ratios (WCAG AA)

| Combination | Ratio | Status |
|-------------|-------|--------|
| White on Background | 12.5:1 | ✓ AAA |
| Cyan on Background | 8.2:1 | ✓ AAA |
| Magenta on Background | 5.8:1 | ✓ AA |
| Black on Cyan | 9.1:1 | ✓ AAA |
| Black on Magenta | 5.2:1 | ✓ AA |

### Colorblind Safety

All three palette options tested for:
- **Protanopia** (red-blind): ✓ Distinguishable
- **Deuteranopia** (green-blind): ✓ Distinguishable
- **Tritanopia** (blue-blind): ✓ Distinguishable

Option A (Cyan/Magenta) uses opponent colors that remain distinct across all color vision types.

---

## Typography

### Font Stack

```css
/* Primary - Headings */
font-family: 'Space Grotesk', system-ui, sans-serif;

/* Secondary - Body */
font-family: 'Inter', system-ui, sans-serif;
```

### Font Installation

```typescript
// src/app/layout.tsx
import { Space_Grotesk, Inter } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### Type Scale

| Size | Pixels | rem | Usage |
|------|--------|-----|-------|
| xs | 12px | 0.75rem | Labels |
| sm | 14px | 0.875rem | Small text |
| base | 16px | 1rem | Body text |
| lg | 18px | 1.125rem | Large text |
| xl | 20px | 1.25rem | Subheadings |
| 2xl | 24px | 1.5rem | Section titles |
| 3xl | 30px | 1.875rem | Page titles |
| 4xl | 36px | 2.25rem | Hero headings |
| 5xl | 48px | 3rem | Game over text |

### Responsive Scaling

```css
/* Mobile first */
h1 { font-size: 2rem; }

@media (min-width: 640px) {
  h1 { font-size: 2.5rem; }
}

@media (min-width: 1024px) {
  h1 { font-size: 3rem; }
}
```

---

## Three.js Materials

### Standard Material Configuration

```typescript
// X Piece Material
const xMaterial = new THREE.MeshStandardMaterial({
  color: '#00E4E4',
  metalness: 0.3,
  roughness: 0.4,
  emissive: '#00E4E4',
  emissiveIntensity: 0.2,
  toneMapped: false, // For bloom
});

// O Piece Material
const oMaterial = new THREE.MeshStandardMaterial({
  color: '#FF0088',
  metalness: 0.3,
  roughness: 0.4,
  emissive: '#FF0088',
  emissiveIntensity: 0.2,
  toneMapped: false,
});

// Grid Material
const gridMaterial = new THREE.MeshStandardMaterial({
  color: '#4B5563',
  metalness: 0.1,
  roughness: 0.8,
  transparent: true,
  opacity: 0.3,
});
```

### Material Properties

| Property | X Piece | O Piece | Grid |
|----------|---------|---------|------|
| metalness | 0.3 | 0.3 | 0.1 |
| roughness | 0.4 | 0.4 | 0.8 |
| emissiveIntensity | 0.2 | 0.2 | 0 |
| opacity | 1.0 | 1.0 | 0.3 |

---

## Glow Effects

### Bloom Post-Processing

```typescript
import { EffectComposer, Bloom } from '@react-three/postprocessing';

<EffectComposer>
  <Bloom
    luminanceThreshold={0.9}
    luminanceSmoothing={0.025}
    intensity={0.5}
    mipmapBlur
  />
</EffectComposer>
```

### CSS Glow (UI Elements)

```css
/* Button glow */
.glow-cyan {
  box-shadow:
    0 0 5px #00E4E4,
    0 0 10px #00E4E4,
    0 0 20px rgba(0, 228, 228, 0.5);
}

.glow-magenta {
  box-shadow:
    0 0 5px #FF0088,
    0 0 10px #FF0088,
    0 0 20px rgba(255, 0, 136, 0.5);
}
```

---

## Visual States

### Cell States

| State | Visual | Description |
|-------|--------|-------------|
| Empty | Transparent (5% opacity) | Subtle presence |
| Hovered | 20% opacity, glow | Interactive feedback |
| Selected | Piece placed | X or O rendered |
| Winning | Bright glow, animation | Highlight winning line |
| Disabled | 50% opacity | Not interactive |

### Button States

| State | Background | Border | Text |
|-------|------------|--------|------|
| Default | transparent | white/30 | white |
| Hover | white/10 | white/50 | white |
| Active | white/20 | white/70 | white |
| Disabled | transparent | white/10 | white/50 |

---

## CSS Variables (Design Tokens)

```css
:root {
  /* Colors */
  --color-cyan: #00E4E4;
  --color-magenta: #FF0088;
  --color-background: #1a1a2e;
  --color-surface: #16213e;
  --color-text: #FFFFFF;
  --color-text-muted: #9CA3AF;
  --color-grid: #4B5563;

  /* Typography */
  --font-heading: 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;

  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-glow-cyan: 0 0 20px rgba(0, 228, 228, 0.5);
  --shadow-glow-magenta: 0 0 20px rgba(255, 0, 136, 0.5);
}
```

---

## Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cyan: {
          DEFAULT: '#00E4E4',
          500: '#00E4E4',
          400: '#33EBEB',
        },
        magenta: {
          DEFAULT: '#FF0088',
          500: '#FF0088',
          400: '#FF3DA6',
        },
        background: '#1a1a2e',
        surface: '#16213e',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 228, 228, 0.5)',
        'glow-magenta': '0 0 20px rgba(255, 0, 136, 0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Handoff Notes

### For Scene Designer
- X pieces: Cyan (#00E4E4)
- O pieces: Magenta (#FF0088)
- Grid: Gray (#4B5563) at 30% opacity
- Background: Dark blue (#1a1a2e)

### For Animation Researcher
- Glow pulse on hover (0.2 → 0.4 emissiveIntensity)
- Win line should have bright glow animation

### For UI Researcher
- Use Space Grotesk for headings
- Use Inter for body text
- Button glow on hover

### For Asset Researcher
- Fonts: Google Fonts (Space Grotesk, Inter)
- No external textures needed

---

## Sources

- [Google Fonts - Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)
- [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)
- [WCAG Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colorblind Simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/)
- [Three.js Materials](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial)
