# Architectural Decision Records

## ADR-001: State Management with Zustand

### Status
Accepted

### Context
Need a state management solution for game state (board, turns, winner) that integrates well with React Three Fiber.

### Decision
Use Zustand for state management.

### Consequences
- **Positive:** Simple API, no boilerplate, works well with R3F
- **Negative:** Less structured than Redux for complex apps
- **Neutral:** Team needs to learn Zustand patterns

---

## ADR-002: React Three Fiber for 3D

### Status
Accepted

### Context
Need to render a 3D tic-tac-toe board with interactions.

### Decision
Use React Three Fiber (@react-three/fiber) with drei helpers.

### Consequences
- **Positive:** Declarative React syntax for Three.js, excellent ecosystem
- **Negative:** Abstraction over Three.js may limit some optimizations
- **Neutral:** Need to understand both React and Three.js concepts

---

## ADR-003: Next.js App Router

### Status
Accepted

### Context
Need a React framework for the application.

### Decision
Use Next.js 15+ with App Router.

### Consequences
- **Positive:** Server components, good DX, easy deployment
- **Negative:** App Router has learning curve
- **Neutral:** Most 3D content is client-side anyway

---

## ADR-004: AI in Web Worker

### Status
Accepted

### Context
Minimax AI can be computationally expensive, especially at higher depths.

### Decision
Run AI calculations in a Web Worker to prevent UI blocking.

### Consequences
- **Positive:** Smooth UI during AI thinking
- **Negative:** Additional complexity in communication
- **Neutral:** Need to handle worker lifecycle

---

## ADR-005: [Template for New Decisions]

### Status
Proposed / Accepted / Deprecated / Superseded

### Context
[What is the issue we're addressing?]

### Decision
[What is the decision we made?]

### Alternatives Considered
1. [Alternative 1] - Why rejected
2. [Alternative 2] - Why rejected

### Consequences
- **Positive:** [Good outcomes]
- **Negative:** [Bad outcomes]
- **Neutral:** [Trade-offs]

---

*Update this file when making significant architectural decisions. Reviewers reference this to understand project conventions.*
