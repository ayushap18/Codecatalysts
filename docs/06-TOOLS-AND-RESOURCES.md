# FlavorPrint - Tools, Libraries & Resources

> Complete reference of every library, tool, API, and resource used in the FlavorPrint project.

---

## 1. Tech Stack Overview

```
+------------------------------------------------------+
|  FRONTEND                                            |
|  Next.js 14+ (App Router) + React 19 + TypeScript    |
+------------------------------------------------------+
|  STYLING                                             |
|  Tailwind CSS v4 + shadcn/ui + CSS Variables (oklch) |
+------------------------------------------------------+
|  VISUALIZATION                                       |
|  D3.js (radial chart) + Framer Motion (transitions)  |
+------------------------------------------------------+
|  STATE & DATA                                        |
|  Zustand (global) + TanStack React Query (API cache) |
+------------------------------------------------------+
|  APIS                                                |
|  RecipeDB v2 (CoSyLab) + FlavorDB (CoSyLab)         |
+------------------------------------------------------+
```

---

## 2. Framework & Runtime

| Library              | Version | Purpose                                | Docs                                      |
| -------------------- | ------- | -------------------------------------- | ----------------------------------------- |
| **Next.js**          | 15+     | React framework with App Router, SSR   | nextjs.org/docs                           |
| **React**            | 19      | UI component library                   | react.dev                                 |
| **TypeScript**       | 5.x     | Static type checking                   | typescriptlang.org                        |
| **Node.js**          | 20 LTS  | JavaScript runtime                     | nodejs.org                                |

### Why Next.js

- App Router for file-based routing (`/recipe/[id]`, `/twins`, `/spectrum`)
- Built-in optimization (font loading, image optimization)
- Vercel deployment with zero config
- No need for a separate backend -- API clients call CoSyLab directly

---

## 3. Styling & UI

| Library                      | Version | Purpose                              |
| ---------------------------- | ------- | ------------------------------------ |
| **Tailwind CSS**             | v4      | Utility-first CSS                    |
| **shadcn/ui**                | latest  | Pre-built accessible UI components   |
| **@radix-ui/react-***       | various | Headless UI primitives (via shadcn)  |
| **class-variance-authority** | 0.7+    | Component variant management         |
| **clsx**                     | 2.x     | Conditional className utility        |
| **tailwind-merge**           | 2.x     | Tailwind class deduplication         |
| **tw-animate-css**           | latest  | Tailwind animation utilities         |

### shadcn/ui Components Used

```
Badge, Button, Card (CardContent, CardHeader, CardTitle),
Dialog, Input, Select, Separator, Skeleton, Tabs, Tooltip
```

### Key Styling Decisions

- **oklch color space** for CSS custom properties (modern, perceptually uniform)
- **CSS custom properties** for theming (light/dark mode ready)
- **No custom CSS files** except `globals.css` -- everything via Tailwind utilities
- **Inter + Playfair Display** fonts loaded via `next/font/google`

---

## 4. Visualization

| Library              | Version | Purpose                                    |
| -------------------- | ------- | ------------------------------------------ |
| **D3.js**            | 7.x     | Radial/polar chart for FlavorPrint         |
| **Framer Motion**    | 11+     | Page transitions, card animations, springs |

### D3.js Usage

D3 is used specifically for the radial chart visualization in `radial-chart.tsx`:
- `d3.select` / `d3.selectAll` for SVG manipulation
- `d3.scaleLinear` for radius scaling
- `d3.lineRadial` for the data area path
- `d3.transition` for animated data reveal

### Framer Motion Usage

- `<motion.div>` with `initial` / `animate` / `transition` for entrances
- `whileHover={{ y: -4 }}` for card hover lift
- `type: "spring"` with `stiffness: 200` for twin score circle
- Automatic `prefers-reduced-motion` handling

---

## 5. State Management & Data Fetching

| Library                  | Version | Purpose                            |
| ------------------------ | ------- | ---------------------------------- |
| **Zustand**              | 4.x     | Lightweight global state           |
| **@tanstack/react-query**| 5.x     | API caching, loading states        |

### Zustand Store

Manages app-wide state: selected recipe, FlavorPrint, search results, loading flags.

### React Query Configuration

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000,  // 30 minutes
    },
  },
});
```

---

## 6. Icons

| Library          | Version | Purpose                  |
| ---------------- | ------- | ------------------------ |
| **lucide-react** | 0.4+    | SVG icon library         |

### Icons Used in the App

| Icon               | Usage                                |
| ------------------ | ------------------------------------ |
| `Flame`            | Brand icon, FlavorPrint feature      |
| `Search`           | Search input prefix                  |
| `GitCompareArrows` | Flavor Twins feature                 |
| `BarChart3`        | Philosophy Spectrum feature          |
| `Clock`            | Cook time display                    |
| `Users`            | Servings display                     |
| `MapPin`           | Region display                       |
| `ArrowLeft`        | Back navigation                      |
| `Loader2`          | Loading spinner (with `animate-spin`)|

---

## 7. External APIs

### RecipeDB v2 (CoSyLab, IIIT Delhi)

| Detail           | Value                                     |
| ---------------- | ----------------------------------------- |
| Recipes          | 118,000+                                  |
| Countries        | 74                                        |
| Regions          | 26 geo-cultural regions                   |
| Ingredients      | 23,500+                                   |
| Base URL         | `https://cosylab.iiitd.edu.in`            |
| Auth Required    | No (for used endpoints)                   |
| License          | CC BY-NC-SA 3.0                           |

### FlavorDB (CoSyLab, IIIT Delhi)

| Detail              | Value                                  |
| ------------------- | -------------------------------------- |
| Flavor Molecules    | 25,595                                 |
| Mapped Molecules    | 2,254 linked to ingredients            |
| Natural Ingredients | 936                                    |
| Categories          | 34 ingredient categories               |
| Old API Base URL    | `https://cosylab.iiitd.edu.in/flavordb`|
| New API Base URL    | `http://cosylab.iiitd.edu.in:6969/flavordb` (campus only) |
| License             | CC BY-NC-SA 3.0                        |

---

## 8. Development Tools

| Tool            | Purpose                                          |
| --------------- | ------------------------------------------------ |
| **npm**         | Package manager (used over pnpm for compatibility)|
| **ESLint**      | Code linting (Next.js default config)            |
| **TypeScript**  | Type checking (strict mode)                      |
| **Git**         | Version control                                  |
| **GitHub**      | Repository hosting (ayushap18/Codecatalysts)     |
| **Postman**     | API testing with included collection files       |
| **VS Code**     | Recommended editor                               |
| **Vercel**      | Deployment platform                              |

---

## 9. Research Papers Referenced

These papers inform the algorithms and concepts used in FlavorPrint:

### Core References

1. **"FlavorDB: a database of flavor molecules"**
   - Neelansh Garg et al., Nucleic Acids Research, 2017
   - Foundation for the FlavorDB API and molecule classification

2. **"Flavor network and the principles of food pairing"**
   - Ahn et al., Scientific Reports, 2011
   - Basis for the Philosophy Spectrum feature (Western pairing vs East Asian contrast)

3. **"RecipeDB: a resource for exploring recipes"**
   - CoSyLab publication
   - Describes the RecipeDB dataset and data model

4. **"Computational Gastronomy: A Data Science Approach to Food"**
   - Ganesh Bagler et al.
   - Foundational paper defining the field of computational gastronomy

### Algorithm Concepts

- **Jaccard Similarity**: Used for molecular overlap calculation between ingredients
- **Food Pairing Hypothesis**: Western cuisines pair ingredients sharing flavor compounds; East Asian cuisines pair contrasting compounds
- **Flavor Network**: Bipartite graph of ingredients connected by shared flavor molecules

---

## 10. Useful Links

| Resource                   | URL                                              |
| -------------------------- | ------------------------------------------------ |
| CoSyLab                   | cosylab.iiitd.edu.in                             |
| RecipeDB                  | cosylab.iiitd.edu.in/recipedb                    |
| FlavorDB                  | cosylab.iiitd.edu.in/flavordb                    |
| Next.js Docs              | nextjs.org/docs                                  |
| shadcn/ui Docs            | ui.shadcn.com                                    |
| Tailwind CSS v4 Docs      | tailwindcss.com/docs                             |
| D3.js Docs                | d3js.org                                         |
| Framer Motion Docs        | framer.com/motion                                |
| Zustand GitHub            | github.com/pmndrs/zustand                        |
| TanStack Query Docs       | tanstack.com/query                               |
| Lucide Icons              | lucide.dev                                       |
| Vercel Dashboard          | vercel.com                                       |
| GitHub Repo               | github.com/ayushap18/Codecatalysts               |
