# FlavorPrint - Design System

> A data-driven, science-forward design language that makes molecular gastronomy feel intuitive and beautiful.

---

## 1. Design Philosophy

```
"Make the invisible world of flavor molecules visible and accessible."
```

The FlavorPrint design system is built on three pillars:

- **Scientific Clarity** - Visualizations that make complex molecular data understandable at a glance
- **Warmth** - Food-inspired colors and motion that evoke appetite and curiosity
- **Delight** - Micro-interactions and transitions that reward exploration

---

## 2. Color Palette

### Brand Colors

| Token               | Hex       | Usage                                           |
| -------------------- | --------- | ----------------------------------------------- |
| `--color-saffron`    | `#FF6F00` | Primary brand, CTAs, FlavorPrint accents         |
| `--color-saffron-dk` | `#E65100` | Hover states, active buttons                     |
| `--color-green`      | `#4CAF50` | Flavor Twins feature, success states             |
| `--color-green-dk`   | `#388E3C` | Green hover states                               |
| `--color-blue`       | `#2196F3` | Spectrum feature, analytical elements            |
| `--color-blue-dk`    | `#1976D2` | Blue hover states                                |
| `--color-pink`       | `#E91E63` | Gradient endpoint, hero title accent             |

### Hero Gradient

```css
background: linear-gradient(to right, #FF6F00, #E91E63);
/* Applied via: bg-gradient-to-r from-[#FF6F00] to-[#E91E63] bg-clip-text text-transparent */
```

### 19 Flavor Category Colors

These colors represent the molecular flavor categories in the radial chart visualization:

| Category  | Hex       | Category  | Hex       |
| --------- | --------- | --------- | --------- |
| sweet     | `#FFB74D` | herbal    | `#81C784` |
| bitter    | `#8D6E63` | earthy    | `#6D4C41` |
| umami     | `#EF5350` | minty     | `#4DD0E1` |
| floral    | `#BA68C8` | citrus    | `#FFD54F` |
| woody     | `#795548` | warm      | `#FF8A65` |
| smoky     | `#78909C` | cooling   | `#4FC3F7` |
| spicy     | `#FF7043` | other     | `#90A4AE` |
| fruity    | `#66BB6A` |           |           |
| sour      | `#FDD835` |           |           |
| nutty     | `#A1887F` |           |           |
| meaty     | `#D32F2F` |           |           |
| creamy    | `#FFF176` |           |           |

### Feature Page Backgrounds

Each feature page uses a subtle tinted gradient:

| Page       | Background Gradient                          |
| ---------- | -------------------------------------------- |
| Home       | `from-orange-50/50 to-background`            |
| Recipe     | `from-orange-50/30 to-background`            |
| Twins      | `from-green-50/30 to-background`             |
| Spectrum   | `from-blue-50/30 to-background`              |

### shadcn/ui Theme (oklch)

The app uses shadcn/ui's CSS variable system with oklch color space. Key tokens:

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --border: oklch(1 0 0 / 10%);
}
```

---

## 3. Typography

### Font Stack

```css
--font-display:  'Playfair Display', Georgia, serif;    /* Headlines, section titles */
--font-body:     'Inter', system-ui, sans-serif;         /* Body text, UI elements */
--font-mono:     'Geist Mono', monospace;                /* Molecule names, data values */
```

### Font Loading (Next.js)

Fonts are loaded via `next/font`:

```typescript
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
```

### Usage Patterns

| Element               | Font                                            | Size/Weight   |
| --------------------- | ----------------------------------------------- | ------------- |
| Hero headline         | `font-[family-name:var(--font-playfair)]`       | text-5xl bold |
| Section titles        | `font-[family-name:var(--font-playfair)]`       | text-2xl bold |
| Card titles           | Default (Inter via shadcn)                      | text-lg       |
| Body text             | Default (Inter)                                 | text-sm/base  |
| Muted text            | `text-muted-foreground`                         | text-sm/xs    |
| Molecule names        | `font-mono`                                     | text-sm       |
| Data stats            | Default                                         | text-xs       |

---

## 4. Iconography

### Icon Library

- **Primary:** Lucide Icons (`lucide-react`)
- **Style:** 1.5px stroke, rounded joins

### Core Icons Used

```
Navigation:   Home, GitCompareArrows, BarChart3, Flame
Recipe:       Clock, Users, MapPin, Flame, ArrowLeft
Search:       Search, Loader2
Feature:      Flame (FlavorPrint), GitCompareArrows (Twins), BarChart3 (Spectrum)
```

### Icon Sizing

| Context           | Class        | Size   |
| ----------------- | ------------ | ------ |
| Feature cards     | `h-8 w-8`   | 32px   |
| Nav/header        | `h-5 w-5`   | 20px   |
| Inline text       | `h-4 w-4`   | 16px   |
| Loading spinner   | `h-5 w-5`   | 20px   |

---

## 5. Spacing & Layout

### Container Widths

| Context         | Max Width       | Tailwind Class           |
| --------------- | --------------- | ------------------------ |
| Hero section    | `max-w-4xl`     | 896px                    |
| Content areas   | `max-w-5xl`     | 1024px                   |
| Wide sections   | `max-w-6xl`     | 1152px                   |
| Search form     | `max-w-xl`      | 576px                    |

### Grid Patterns

| Layout              | Classes                                     |
| ------------------- | ------------------------------------------- |
| Recipe card grid    | `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`  |
| Feature cards       | `grid gap-6 md:grid-cols-3`                 |
| Recipe header       | `grid gap-6 md:grid-cols-[1fr_1.2fr]`       |
| Twin comparison     | `grid gap-6 md:grid-cols-[1fr_auto_1fr]`    |
| Nutrition grid      | `grid grid-cols-4 gap-3`                    |

---

## 6. Border Radius

Defined via shadcn's `--radius` variable (base: `0.625rem` / 10px):

```
--radius-sm:   calc(var(--radius) - 4px)    /* 6px  - tags, small badges */
--radius-md:   calc(var(--radius) - 2px)    /* 8px  - inputs */
--radius-lg:   var(--radius)                /* 10px - cards, buttons */
--radius-xl:   calc(var(--radius) + 4px)    /* 14px - images */
--radius-full: 9999px                       /* circular elements */
```

### Usage

| Element              | Radius                           |
| -------------------- | -------------------------------- |
| Cards                | `rounded-lg` (shadcn default)    |
| Recipe images        | `rounded-lg` or `rounded-xl`     |
| Badges               | shadcn Badge default             |
| Score circle (twins) | `rounded-full`                   |
| Radial chart         | `rounded-full` (circular)        |

---

## 7. Component Token Map

### Buttons

| Variant        | Background                    | Text     | Border                     |
| -------------- | ----------------------------- | -------- | -------------------------- |
| Primary CTA    | `bg-[#FF6F00]`                | white    | none                       |
| Primary Hover  | `hover:bg-[#E65100]`         | white    | none                       |
| Twins CTA      | `bg-[#4CAF50]`                | white    | none                       |
| Twins Hover    | `hover:bg-[#388E3C]`         | white    | none                       |
| Spectrum CTA   | `bg-[#2196F3]`                | white    | none                       |
| Spectrum Hover | `hover:bg-[#1976D2]`         | white    | none                       |
| Outline        | `transparent`                 | inherit  | `variant="outline"`        |
| Ghost          | `transparent`                 | inherit  | `variant="ghost"`          |

### Cards

```
Background:   var(--card) via shadcn Card component
Border:       var(--border) via shadcn Card
Shadow:       Tailwind hover:shadow-lg for interactive cards
Twin border:  border-[#FF6F00]/30 for twin recipe card
```

### Navigation

```
Background:   sticky bg-background/80 backdrop-blur
Active link:  text-[#FF6F00]
Inactive:     text-muted-foreground hover:text-foreground
Brand icon:   Flame with text-[#FF6F00]
Height:       h-16 (64px)
```

---

## 8. Accessibility

### Contrast

- All text follows WCAG AA minimum contrast ratios
- `text-muted-foreground` provides sufficient contrast against backgrounds
- Flavor category colors are paired with text labels (not color-alone)

### Interactive Elements

- All buttons use shadcn/ui components with built-in focus states
- Focus rings use `--ring` CSS variable
- Minimum touch target: 44x44px (shadcn Button defaults)

### Reduced Motion

Framer Motion respects `prefers-reduced-motion` natively. D3.js transitions should check:

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## 9. Brand Voice in Design

| Attribute   | Do                                                 | Don't                                 |
| ----------- | -------------------------------------------------- | ------------------------------------- |
| Tone        | Scientific yet approachable                        | Overly academic or jargon-heavy       |
| Labels      | "Molecular Match" (clear)                          | "Jaccard Coefficient" (technical)     |
| Empty State | "Search for recipes to see..." + helpful hint      | Blank screen                          |
| Loading     | Skeleton screens matching layout                   | Generic spinner with no context       |
| Data        | "42 shared molecules" (concrete)                   | "High similarity" (vague)             |
