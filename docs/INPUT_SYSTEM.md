# Input System Specification

**Last Updated:** January 2026
**Scope:** Raycasting, camera controls, keyboard navigation, touch support, accessibility

---

## Overview

The input system handles cell selection via raycasting, camera manipulation with OrbitControls, and comprehensive accessibility support including keyboard navigation and screen reader announcements.

---

## Raycasting System

### Built-in R3F Events

R3F provides built-in raycasting - no manual setup required.

```typescript
function InteractiveCell({
  position,
  index,
  isEmpty,
}: {
  position: [number, number, number];
  index: number;
  isEmpty: boolean;
}) {
  const makeMove = useGameStore(state => state.makeMove);
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        if (isEmpty) makeMove(index);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (isEmpty) {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial
        transparent
        opacity={hovered ? 0.2 : 0.05}
      />
    </mesh>
  );
}
```

### Event Properties

| Property | Type | Description |
|----------|------|-------------|
| `e.stopPropagation()` | Function | Prevent events reaching objects behind |
| `e.object` | Object3D | The mesh that was clicked |
| `e.point` | Vector3 | World position of intersection |
| `e.distance` | number | Distance from camera |
| `e.face` | Face | Face that was intersected |

---

## Camera Controls

### OrbitControls Configuration

```typescript
import { OrbitControls } from '@react-three/drei';

const ORBIT_CONFIG = {
  // Rotation limits
  minPolarAngle: Math.PI * 0.2,
  maxPolarAngle: Math.PI * 0.8,

  // Zoom limits
  minDistance: 10,
  maxDistance: 25,

  // Behavior
  enablePan: false,
  enableDamping: true,
  dampingFactor: 0.05,
  enableZoom: true,
  zoomSpeed: 0.8,

  // Touch settings
  touches: {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN,
  },
};

<OrbitControls {...ORBIT_CONFIG} />
```

### Mouse Controls

| Action | Control |
|--------|---------|
| Rotate | Left-click + drag |
| Zoom | Scroll wheel |
| Pan | Disabled (keeps grid centered) |

### Touch Controls

| Action | Gesture |
|--------|---------|
| Rotate | One-finger drag |
| Zoom | Two-finger pinch |
| Select | Tap |

---

## Keyboard Navigation

### Focus System

```typescript
function AccessibleCell({
  index,
  position,
  isEmpty,
  isFocused,
  onFocus,
}: CellProps) {
  const ref = useRef<THREE.Mesh>(null);

  return (
    <mesh
      ref={ref}
      position={position}
      tabIndex={0}
      onFocus={() => onFocus(index)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (isEmpty) makeMove(index);
        }
      }}
    >
      {/* ... */}
    </mesh>
  );
}
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Navigate between cells |
| `Enter` / `Space` | Select cell |
| `Arrow Keys` | Move focus in grid |
| `Escape` | Cancel / Menu |
| `R` | Restart game |
| `M` | Toggle menu |

### Arrow Key Navigation (3D Grid)

```typescript
function getNextCell(current: number, direction: string): number {
  const x = current % 3;
  const y = Math.floor(current / 3) % 3;
  const z = Math.floor(current / 9);

  switch (direction) {
    case 'ArrowRight': return x < 2 ? current + 1 : current;
    case 'ArrowLeft': return x > 0 ? current - 1 : current;
    case 'ArrowUp': return y < 2 ? current + 3 : current;
    case 'ArrowDown': return y > 0 ? current - 3 : current;
    case 'PageUp': return z < 2 ? current + 9 : current;
    case 'PageDown': return z > 0 ? current - 9 : current;
    default: return current;
  }
}
```

---

## Touch Support

### Touch-Friendly Hit Areas

```typescript
// Minimum touch target: 44x44 CSS pixels (WCAG 2.2)
const TOUCH_HITBOX_SIZE = 2.5; // Slightly larger than visual cell

function TouchFriendlyCell({ position, index }: CellProps) {
  return (
    <group position={position}>
      {/* Invisible hit area */}
      <mesh visible={false}>
        <boxGeometry args={[TOUCH_HITBOX_SIZE, TOUCH_HITBOX_SIZE, TOUCH_HITBOX_SIZE]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Visual cell */}
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial />
      </mesh>
    </group>
  );
}
```

### Gesture Handling

```typescript
// Prevent double-tap zoom on iOS
<Canvas
  style={{ touchAction: 'manipulation' }}
>
```

---

## Accessibility (WCAG 2.2)

### Screen Reader Announcements

```typescript
import { Html } from '@react-three/drei';

function ScreenReaderAnnouncements() {
  const { winner, currentPlayer, lastMove } = useGameStore();

  useEffect(() => {
    if (lastMove !== null) {
      announce(`${currentPlayer} placed at position ${lastMove + 1}`);
    }
  }, [lastMove]);

  useEffect(() => {
    if (winner) {
      announce(
        winner === 'draw'
          ? "Game over. It's a draw!"
          : `Game over. ${winner} wins!`
      );
    }
  }, [winner]);

  return (
    <Html>
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {/* Announcements inserted here */}
      </div>
    </Html>
  );
}

function announce(message: string) {
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'assertive');
  el.className = 'sr-only';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}
```

### Focus Indicators

```typescript
function FocusRing({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <mesh>
      <ringGeometry args={[1.1, 1.2, 32]} />
      <meshBasicMaterial color="#00E4E4" side={THREE.DoubleSide} />
    </mesh>
  );
}
```

### ARIA Attributes

```typescript
// In 2D overlay
<div
  role="application"
  aria-label="3D Tic-Tac-Toe game board"
  aria-describedby="game-instructions"
>
  <p id="game-instructions" className="sr-only">
    Use arrow keys to navigate the 3D grid. Press Enter to place your piece.
    Page Up and Page Down move between layers.
  </p>
</div>
```

---

## Input State Management

```typescript
interface InputState {
  focusedCell: number | null;
  hoveredCell: number | null;
  isDragging: boolean;
  lastTouchTime: number;
}

const useInputStore = create<InputState>((set) => ({
  focusedCell: null,
  hoveredCell: null,
  isDragging: false,
  lastTouchTime: 0,

  setFocusedCell: (index: number | null) => set({ focusedCell: index }),
  setHoveredCell: (index: number | null) => set({ hoveredCell: index }),
  setIsDragging: (dragging: boolean) => set({ isDragging: dragging }),
}));
```

---

## Event Debouncing

### Prevent Rapid Clicks

```typescript
function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]) as T;
}

// Usage
const debouncedMove = useDebounce(makeMove, 100);
```

### Prevent Double-Click Issues

```typescript
function useSingleClick(callback: () => void, delay = 300) {
  const lastClick = useRef(0);

  return useCallback(() => {
    const now = Date.now();
    if (now - lastClick.current > delay) {
      lastClick.current = now;
      callback();
    }
  }, [callback, delay]);
}
```

---

## Mobile Optimizations

### Prevent Default Behaviors

```css
/* globals.css */
canvas {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
```

### Responsive Hit Detection

```typescript
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const HITBOX_SCALE = isMobile ? 1.3 : 1.0;
```

---

## Handoff Notes

### For Scene Designer
- OrbitControls configured - interaction system uses same controls
- Cell positions from `CELL_POSITIONS` array

### For UI Researcher
- Keyboard shortcut overlay needed
- Accessibility settings panel

### For Animation Researcher
- Hover effects should animate
- Focus ring should pulse

### For Game Logic Researcher
- Input passes cell index to `makeMove()`
- Uses `canMakeMove()` for validation

---

## Sources

- [React Three Fiber Events](https://r3f.docs.pmnd.rs/api/events)
- [OrbitControls - Drei](https://drei.docs.pmnd.rs/controls/orbit-controls)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Touch Events - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
