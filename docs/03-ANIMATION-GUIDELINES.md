# FlavorPrint - Animation & Motion Guidelines

> Scientific data made tangible through smooth, purposeful motion using Framer Motion and D3.js.

---

## 1. Animation Principles

### The Four Rules

1. **Purposeful** - Every animation guides attention to data: entering content, revealing scores, highlighting molecular connections
2. **Fast** - Users never wait for an animation to complete; all animations are non-blocking
3. **Scientific** - Motion should feel like data being revealed, not decoration
4. **Accessible** - Framer Motion natively respects `prefers-reduced-motion`

---

## 2. Libraries Used

| Library         | Purpose                                | Bundle Impact |
| --------------- | -------------------------------------- | ------------- |
| **Framer Motion** | Page transitions, card entries, hover effects, spring physics | ~30kb |
| **D3.js**       | Radial chart data transitions, animated path drawing | ~30kb (selectAll) |
| **Native CSS**  | Gradient animations, skeleton shimmer  | 0kb           |

---

## 3. Framer Motion Patterns

### 3.1 Page Content Entrance

Used on every page for the primary content block:

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5-0.7 }}
>
```

**Where used:** Hero section, search form, section titles, recipe headers, spectrum header

### 3.2 Staggered Card Entrance

Used for search results and feature cards with progressive delay:

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.5 + index * 0.15, duration: 0.5 }}
>
```

**Where used:** Feature cards on home page (3 cards, 0.15s stagger), spectrum recipe list (0.2s stagger)

### 3.3 Search Result Cards

Individual recipe cards with hover lift:

```jsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ y: -4 }}
  transition={{ duration: 0.3 }}
>
```

**Where used:** Recipe card grid on home page search results

### 3.4 Twin Score Circle

Spring physics for the molecular match percentage ring:

```jsx
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
/>
```

**Where used:** Center score circle in TwinCard component -- scales from 0 to full size with a satisfying spring bounce

### 3.5 Twin Card Entrance

The full twin comparison row slides up:

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
/>
```

**Where used:** TwinCard wrapper in twins page results

### 3.6 Fade-In Footer/Credits

Delayed simple opacity fade:

```jsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 1, duration: 0.5 }}
/>
```

**Where used:** "Powered by RecipeDB + FlavorDB" footer text on home page

---

## 4. D3.js Chart Animations

### 4.1 Radial Chart (`radial-chart.tsx`)

The FlavorPrint radial/polar chart uses D3 transitions for data visualization:

#### Background Elements (Instant)

```
Concentric circles:  No animation, drawn immediately
Axis lines:          No animation, drawn immediately
Category labels:     No animation, positioned at chart periphery
```

#### Data Area Fill

```
Selection:   svg path (filled area connecting all category data points)
Transition:  1000ms ease-in-out
From:        All points at center (radius = 0)
To:          Points at their calculated radii based on molecule counts
Fill:        rgba(255, 111, 0, 0.15) with #FF6F00 stroke
```

#### Data Points

```
Selection:   svg circles at each category vertex
Transition:  500ms with 200ms delay (after area starts)
From:        radius 0, opacity 0
To:          radius 4px, opacity 1, fill #FF6F00
```

#### Framer Motion Wrapper

The entire SVG container uses Framer Motion for entrance:

```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.6 }}
>
```

---

## 5. Timing Reference

### Duration Scale

| Token             | Value   | Usage                                          |
| ----------------- | ------- | ---------------------------------------------- |
| Instant           | 0ms     | Background circles, axis lines                 |
| Fast              | 300ms   | Card hover, search result entrance             |
| Normal            | 500ms   | Content sections, data point fade-in           |
| Slow              | 600-700ms | Hero text, page-level content blocks         |
| Data transition   | 1000ms  | D3 radial chart area fill                      |

### Delay Patterns

| Pattern                    | Value              | Usage                               |
| -------------------------- | ------------------ | ----------------------------------- |
| Hero -> Search form        | 0.3s               | Sequential reveal on home page      |
| Feature cards stagger      | 0.5s + i * 0.15s   | Progressive card reveal             |
| Twin score spring          | 0.3s               | After twin card container appears   |
| D3 data points             | 0.2s after area    | Points appear after area draws      |
| Footer credit text         | 1.0s               | Last element to appear              |

---

## 6. Specific Page Animations

### Home Page (`/`)

```
1. Hero title + subtitle     -> fade up (0.7s)
2. Search bar                -> fade up (0.5s, delay 0.3s)
3. Feature cards (if shown)  -> staggered fade up (0.5s each, stagger 0.15s, start 0.5s)
4. Footer text               -> fade in (0.5s, delay 1.0s)
5. Search results (if shown) -> fade up per card (0.3s)
6. Recipe card hover         -> translateY(-4px)
```

### Recipe Detail (`/recipe/[id]`)

```
1. Header section (image + info)  -> fade up (default, no explicit config)
2. RadialChart wrapper             -> scale 0.8->1 + fade (0.6s)
3. D3 data area fill              -> 1000ms transition
4. D3 data points                  -> 500ms fade-in, 200ms delay
```

### Twins Page (`/twins`)

```
1. Page header                -> fade up (0.7s)
2. Search form                -> no animation (immediate)
3. Twin results               -> fade up per TwinCard (0.6s)
4. Score circles              -> spring scale (stiffness: 200, delay: 0.3s)
```

### Spectrum Page (`/spectrum`)

```
1. Page header                -> fade up (default)
2. Recipe cards               -> staggered fade up (delay: i * 0.2s)
3. SpectrumGauge marker       -> animated left position (Framer Motion)
4. RadialChart (per recipe)   -> same D3 transitions as recipe page
```

---

## 7. Skeleton Loading States

Skeleton screens use shadcn/ui's `<Skeleton>` component with native CSS animation:

### Recipe Detail Loading

```
[Skeleton h-8  w-48]          <- Title
[Skeleton h-64 w-full]        <- Hero image
[Skeleton h-[380px] w-[380px] rounded-full]  <- RadialChart placeholder
```

### Home Search Loading

```
6x Card skeletons in 2-3 column grid:
  [Skeleton h-36 w-full]      <- Image
  [Skeleton h-5  w-3/4]       <- Title
  [Skeleton h-4  w-1/2]       <- Metadata
```

---

## 8. Reduced Motion Fallback

Framer Motion handles `prefers-reduced-motion` automatically by reducing animations to instant transitions.

For D3.js custom transitions, add this check:

```typescript
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const duration = prefersReducedMotion ? 0 : 1000;
```

---

## 9. Performance Notes

1. **Framer Motion** - Only `transform` and `opacity` are animated (GPU-accelerated)
2. **D3.js** - SVG transitions use `requestAnimationFrame` internally
3. **No layout animations** - We never animate `width`, `height`, `top`, or `left`
4. **Spring physics** - Used sparingly (twin score circle only) to avoid excessive recalculation
5. **Stagger limits** - Maximum stagger index is ~5-6 cards; no infinite scroll animation
