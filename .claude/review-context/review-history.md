# Review History

## Purpose
Track patterns from past reviews to improve code quality over time.

---

## Common Issues Found

### Memory Management
| Date | Issue | Resolution |
|------|-------|------------|
| [date] | Geometry not disposed | Added cleanup in useEffect |
| [date] | Texture leak on unmount | Implemented disposal pattern |

### Performance
| Date | Issue | Resolution |
|------|-------|------------|
| [date] | Re-render in useFrame | Used useMemo for vectors |
| [date] | New objects in render loop | Moved to refs |

### Security
| Date | Issue | Resolution |
|------|-------|------------|
| [date] | [Issue] | [Resolution] |

### Architecture
| Date | Issue | Resolution |
|------|-------|------------|
| [date] | [Issue] | [Resolution] |

---

## Recurring Patterns to Watch

### Pattern 1: Object Creation in Render Loop
**Why it matters:** Creates garbage, triggers GC, causes frame drops
**What to look for:** `new THREE.Vector3()` inside useFrame
**Standard fix:** Create once with useMemo, reuse in loop

### Pattern 2: Missing Disposal
**Why it matters:** WebGL memory leaks, eventual crash
**What to look for:** useLoader, manually created geometries/materials
**Standard fix:** Return cleanup function from useEffect

### Pattern 3: [Add patterns as discovered]
**Why it matters:** [Explanation]
**What to look for:** [Code pattern]
**Standard fix:** [Solution]

---

## Review Statistics

### By Verdict
| Period | APPROVE | REVISE | TICKET | REJECT |
|--------|---------|--------|--------|--------|
| Week 1 | 0 | 0 | 0 | 0 |
| Week 2 | 0 | 0 | 0 | 0 |

### By Category
| Period | Security | Architecture | Quality | R3F |
|--------|----------|--------------|---------|-----|
| Week 1 | 0 | 0 | 0 | 0 |
| Week 2 | 0 | 0 | 0 | 0 |

---

## Lessons Learned

### [Date]: [Title]
**Context:** [What happened]
**Learning:** [What we learned]
**Action:** [What we changed]

---

*Update this file after each review cycle to build institutional knowledge.*
