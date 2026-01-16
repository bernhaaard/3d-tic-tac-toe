# 3D Technology Stack Specification

**Last Updated:** January 2026
**Target:** React Three Fiber v9 with Three.js and Drei ecosystem

---

## Package Versions (Current)

| Package | Version | Notes |
|---------|---------|-------|
| `@react-three/fiber` | ^9.5.0 | Required for React 19 |
| `@react-three/drei` | ^10.7.7 | Helper components |
| `three` | ^0.182.0 | Core 3D library |
| `zustand` | ^5.0.10 | State management |

**CRITICAL:** R3F v8 is INCOMPATIBLE with React 19/Next.js 15. Must use v9 RC.

---

## Canvas Configuration

### Basic Setup

```typescript
import { Canvas } from '@react-three/fiber';

<Canvas
  camera={{ position: [5, 5, 5], fov: 75, near: 0.1, far: 1000 }}
  dpr={[1, 2]}  // Cap device pixel ratio for performance
  shadows={false}  // Disable for 60fps target
>
  {/* Scene content */}
</Canvas>
```

### Performance Settings

| Setting | Value | Reason |
|---------|-------|--------|
| `dpr` | `[1, 2]` | Mobile devices can have 4+ DPR |
| `shadows` | `false` | Performance optimization |
| `flat` | `false` | Use tone mapping |

---

## Recommended Drei Components

### For 3D Tic-Tac-Toe

| Component | Purpose | Usage |
|-----------|---------|-------|
| `OrbitControls` | Camera rotation | Intuitive navigation |
| `RoundedBox` | Cell geometry | Smooth edges |
| `Html` | 3D-positioned UI | Tooltips, labels |
| `useProgress` | Loading screen | Asset loading |
| `Environment` | Lighting presets | Quick setup |

### OrbitControls Configuration

```typescript
import { OrbitControls } from '@react-three/drei';

<OrbitControls
  minPolarAngle={Math.PI * 0.1}  // Prevent top view
  maxPolarAngle={Math.PI * 0.9}  // Prevent bottom view
  minDistance={5}
  maxDistance={15}
  enablePan={false}
  enableDamping={true}
  dampingFactor={0.05}
/>
```

---

## State Management with Zustand

Created by the R3F team specifically for this use case.

### Store Pattern

```typescript
import { create } from 'zustand';

interface GameStore {
  board: CellState[];
  currentPlayer: Player;
  makeMove: (index: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  board: Array(27).fill('empty'),
  currentPlayer: 'X',
  makeMove: (index) => {
    const { board, currentPlayer } = get();
    if (board[index] !== 'empty') return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;

    set({
      board: newBoard,
      currentPlayer: currentPlayer === 'X' ? 'O' : 'X',
    });
  },
}));
```

### Usage in Components

```typescript
// GOOD: Selective subscription
const cell = useGameStore(state => state.board[index]);

// BAD: Subscribes to entire store (causes re-renders)
const { board } = useGameStore();
```

**CRITICAL:** Never use `setState` in `useFrame` - causes 60fps re-renders!

---

## Event Handling

R3F has built-in raycasting - no manual setup needed.

### Click Detection

```typescript
function Cell({ position, index }: CellProps) {
  const makeMove = useGameStore(state => state.makeMove);

  return (
    <mesh
      position={position}
      onClick={(e) => {
        e.stopPropagation();  // Prevent events reaching objects behind
        makeMove(index);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial />
    </mesh>
  );
}
```

---

## Memory Management

**CRITICAL:** Three.js does NOT auto-dispose GPU resources.

### Disposal Pattern

```typescript
import { useEffect } from 'react';
import * as THREE from 'three';

function GameBoard() {
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      // Most Drei components auto-dispose
    };
  }, []);

  return <mesh>{/* ... */}</mesh>;
}
```

### Monitoring

```typescript
// In development
console.log(renderer.info.memory);
// { geometries: X, textures: Y }
```

---

## TypeScript Changes in v9

### Old (v8) - NO LONGER AVAILABLE
```typescript
import { MeshProps } from '@react-three/fiber';
```

### New (v9)
```typescript
import { ThreeElements } from '@react-three/fiber';

type MeshProps = ThreeElements['mesh'];
```

---

## Performance Optimization

### For 27 Cells + Pieces

```typescript
// Individual meshes are fine (no instancing needed)
// Target: 60 FPS on all devices

// Use MeshStandardMaterial for realistic PBR
<meshStandardMaterial
  color="#00E4E4"
  metalness={0.1}
  roughness={0.5}
/>
```

### Lighting Setup

```typescript
<ambientLight intensity={0.3} />
<directionalLight
  position={[10, 10, 5]}
  intensity={1.0}
  castShadow={false}  // Performance
/>
```

---

## Animation Strategies

### Option A: useFrame + Lerp (Simple Effects)

```typescript
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function HoverCell() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!meshRef.current) return;
    // Direct ref mutation - no state updates
    meshRef.current.scale.lerp(
      hovered ? new THREE.Vector3(1.1, 1.1, 1.1) : new THREE.Vector3(1, 1, 1),
      0.1
    );
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* ... */}
    </mesh>
  );
}
```

### Option B: React Spring (Complex Animations)

```typescript
import { useSpring, animated } from '@react-spring/three';

function AnimatedPiece({ position }: { position: [number, number, number] }) {
  const { scale } = useSpring({
    from: { scale: 0 },
    to: { scale: 1 },
    config: { tension: 200, friction: 20 },
  });

  return (
    <animated.mesh position={position} scale={scale}>
      {/* ... */}
    </animated.mesh>
  );
}
```

---

## Geometry Recommendations

### X Piece (Two Crossed Cylinders)

```typescript
function XPiece({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
        <meshStandardMaterial color="#00E4E4" />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
        <meshStandardMaterial color="#00E4E4" />
      </mesh>
    </group>
  );
}
```

### O Piece (Torus)

```typescript
function OPiece({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <torusGeometry args={[0.3, 0.08, 16, 32]} />
      <meshStandardMaterial color="#FF0088" />
    </mesh>
  );
}
```

---

## Handoff Notes

### For Next.js Researcher
- Canvas must be client-side only (`'use client'`)
- Use `dynamic` import with `ssr: false`

### For Game Logic Researcher
- Zustand store should expose `checkWinner()` method
- Use `useGameStore.getState()` in non-reactive contexts

### For AI Researcher
- Use `useGameStore.getState()` to avoid re-renders
- Consider Web Worker for minimax computation

### For UI Researcher
- Drei's `Html` component renders HTML in 3D space
- Use for tooltips, floating labels

---

## Sources

- [React Three Fiber v9 Documentation](https://r3f.docs.pmnd.rs/)
- [v9 Migration Guide](https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide)
- [Drei Documentation](https://drei.docs.pmnd.rs/)
- [Performance Pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
