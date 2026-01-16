# Asset Manifest

**Last Updated:** January 2026
**Scope:** Fonts, sounds, icons, licensing, attribution

---

## Overview

| Category | Count | Source Type |
|----------|-------|-------------|
| Fonts | 2 | External (Google Fonts) |
| Sounds | 5 | External (CC0) or Procedural |
| Icons | 8 | Library (Lucide React) |
| 3D Models | 0 | Procedural |
| Textures | 0 | Material-based |

---

## Fonts

### Primary: Inter

| Property | Value |
|----------|-------|
| **Source** | Google Fonts |
| **URL** | https://fonts.google.com/specimen/Inter |
| **License** | SIL Open Font License 1.1 |
| **Attribution** | Not required |
| **Weights** | 400, 500, 600, 700 |
| **Usage** | Body text, UI elements |

### Secondary: Space Grotesk

| Property | Value |
|----------|-------|
| **Source** | Google Fonts |
| **URL** | https://fonts.google.com/specimen/Space+Grotesk |
| **License** | SIL Open Font License 1.1 |
| **Attribution** | Not required |
| **Weights** | 500, 600, 700 |
| **Usage** | Headings, titles |

### Implementation

```typescript
// src/app/layout.tsx
import { Inter, Space_Grotesk } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});
```

### Fallback Stack

```css
font-family: 'Inter', 'Space Grotesk', system-ui, -apple-system, sans-serif;
```

---

## Sound Effects

### Option A: External Files (CC0)

| Sound | Source | License | Format |
|-------|--------|---------|--------|
| piece_place | Freesound.org | CC0 | OGG/MP3 |
| win | Pixabay | Pixabay License | OGG/MP3 |
| draw | Mixkit | Mixkit License | OGG/MP3 |
| invalid_move | OpenGameArt | CC0 | OGG/MP3 |
| button_click | Freesound.org | CC0 | OGG/MP3 |

### Recommended Sources

1. **Freesound.org** - Large CC library, filter by CC0
2. **Pixabay** - Simple license, no attribution
3. **Mixkit** - Free tier, royalty-free
4. **OpenGameArt.org** - Game-focused

### Search Terms

- "UI click sound effect game"
- "victory fanfare short"
- "soft error beep"
- "pop place sound"

### Option B: Procedural Audio (Recommended)

Zero external dependencies using Web Audio API:

```typescript
// src/lib/proceduralAudio.ts
export class ProceduralAudio {
  private ctx: AudioContext | null = null;

  playPlace(): void { /* ... */ }
  playWin(): void { /* ... */ }
  playClick(): void { /* ... */ }
  playInvalid(): void { /* ... */ }
}
```

**Benefits:**
- No licensing concerns
- No external files
- Smaller bundle size
- Customizable parameters

---

## Icons

### Recommended: Lucide React

| Property | Value |
|----------|-------|
| **Package** | `lucide-react` |
| **Icons** | 1215+ |
| **License** | ISC |
| **Tree-shakable** | Yes |
| **Bundle Impact** | ~1KB per icon |

### Installation

```bash
npm install lucide-react
```

### Required Icons

| Icon | Name | Usage |
|------|------|-------|
| Menu | `Menu` | Mobile menu |
| Close | `X` | Close button |
| Settings | `Settings` | Settings button |
| Volume On | `Volume2` | Sound enabled |
| Volume Off | `VolumeX` | Sound disabled |
| Refresh | `RefreshCw` | Play again |
| Home | `Home` | Main menu |
| Info | `Info` | Help/About |

### Usage

```typescript
import { Menu, X, Settings, Volume2, VolumeX, RefreshCw, Home, Info } from 'lucide-react';

<button>
  <Settings className="h-6 w-6" />
</button>
```

### Alternative: Heroicons

```bash
npm install @heroicons/react
```

---

## 3D Models

### Approach: Procedural Generation

All 3D geometry created programmatically:

#### X Piece

```typescript
<group>
  <mesh rotation={[0, 0, Math.PI / 4]}>
    <cylinderGeometry args={[0.12, 0.12, 1.6, 8]} />
    <meshStandardMaterial color="#00E4E4" />
  </mesh>
  <mesh rotation={[0, 0, -Math.PI / 4]}>
    <cylinderGeometry args={[0.12, 0.12, 1.6, 8]} />
    <meshStandardMaterial color="#00E4E4" />
  </mesh>
</group>
```

#### O Piece

```typescript
<mesh>
  <torusGeometry args={[0.7, 0.15, 8, 24]} />
  <meshStandardMaterial color="#FF0088" />
</mesh>
```

#### Grid

```typescript
<mesh>
  <boxGeometry args={[2, 2, 2]} />
  <meshStandardMaterial transparent opacity={0.05} />
</mesh>
```

---

## Textures

### Approach: Material-Based

No external texture images required.

```typescript
// MeshStandardMaterial with color/emissive properties
<meshStandardMaterial
  color="#00E4E4"
  metalness={0.3}
  roughness={0.4}
  emissive="#00E4E4"
  emissiveIntensity={0.2}
/>
```

---

## Favicon & PWA Icons

### Required Files

| File | Size | Purpose |
|------|------|---------|
| `favicon.svg` | Vector | Modern browsers |
| `favicon.ico` | 16,32,48 | Legacy support |
| `apple-touch-icon.png` | 180×180 | iOS home screen |
| `icon-192.png` | 192×192 | PWA small |
| `icon-512.png` | 512×512 | PWA large |
| `icon-512-maskable.png` | 512×512 | PWA maskable |

### Generation

Use [RealFaviconGenerator](https://realfavicongenerator.net/) or create programmatically.

---

## File Organization

```
public/
├── sounds/
│   ├── place.ogg
│   ├── place.mp3
│   ├── win.ogg
│   ├── win.mp3
│   ├── click.ogg
│   ├── click.mp3
│   ├── invalid.ogg
│   └── invalid.mp3
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── icon-512-maskable.png
├── favicon.svg
├── favicon.ico
├── apple-touch-icon.png
└── manifest.json
```

---

## License Summary

| Asset | License | Attribution Required |
|-------|---------|---------------------|
| Inter | SIL OFL 1.1 | No |
| Space Grotesk | SIL OFL 1.1 | No |
| Lucide Icons | ISC | No |
| Sound Effects | CC0/Pixabay | No* |

*Check individual sound licenses - some may require attribution.

---

## Attribution Template

If attribution is needed:

```markdown
## Third-Party Assets

### Fonts
- Inter by Rasmus Andersson - SIL Open Font License 1.1
- Space Grotesk by Florian Karsten - SIL Open Font License 1.1

### Icons
- Lucide Icons - ISC License

### Sound Effects
- [Sound name] by [Author] ([URL]) - [License]
```

---

## Handoff Notes

### For Visual Researcher
- Fonts: Inter (body), Space Grotesk (headings)
- Icon library: Lucide React

### For Animation Researcher
- Sound files in `/public/sounds/`
- Or use procedural audio alternative

### For UI Researcher
- Icons available from Lucide
- PWA manifest needed

### For Scene Designer
- No external 3D models
- All geometry procedural

---

## Verification Checklist

- [ ] Fonts load correctly via `next/font`
- [ ] Icons render from Lucide
- [ ] Sound files play (or procedural works)
- [ ] Favicon displays in browser tab
- [ ] PWA icons work on mobile
- [ ] All licenses verified
- [ ] No attribution violations

---

## Sources

- [Google Fonts](https://fonts.google.com/)
- [Lucide Icons](https://lucide.dev/)
- [Freesound.org](https://freesound.org/)
- [Pixabay](https://pixabay.com/sound-effects/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
