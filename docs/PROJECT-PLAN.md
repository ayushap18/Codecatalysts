# FlavorPrint - Complete Project Plan

> **Team:** CodeCatalysts | **Hackathon:** ForkIT Challenge 2025 | **Date:** 14-15 Feb 2026
> **Domain:** Computational Gastronomy | **APIs:** RecipeDB + FlavorDB (CoSyLab, IIIT Delhi)

---

## 1. Project Vision

**FlavorPrint** is a molecular recipe fingerprinting platform. Every dish has a unique molecular identity — a "FlavorPrint" — composed of all the flavor molecules from its ingredients. We use this to discover hidden connections between the world's cuisines that are invisible to the naked eye but encoded in the chemistry of food.

**One-liner for judges:** *"We fingerprint recipes at the molecular level to discover that cuisine boundaries are an illusion — flavor is universal."*

---

## 2. Problem Statement

- 118,000+ recipes exist across 74 countries in RecipeDB
- 25,595 flavor molecules are cataloged in FlavorDB
- Yet NO tool connects these datasets to reveal **cross-cultural molecular relationships**
- People eat within their comfort zone; they don't know that their favorite Indian dish has a molecular twin in Ethiopian cuisine
- Existing tools search by ingredients/cuisine — nobody searches by **molecular fingerprint**
- The East-West food pairing divide (Ahn et al., 2011) has never been turned into an interactive, user-facing tool

---

## 3. Target Users

| User | Need | FlavorPrint Solution |
|------|------|---------------------|
| **Home Cook** | "I like butter chicken, what else would I enjoy?" | Cross-Cultural Flavor Twins |
| **Chef** | "How can I create a novel fusion dish grounded in science?" | Philosophy Spectrum Flipper |
| **Food Scientist** | "What molecular patterns exist across cuisines?" | Cuisine FlavorPrint Atlas |
| **Curious Eater** | "Why do I like what I like?" | FlavorPrint Visualizer |
| **Hackathon Judges** | "Show me something I haven't seen" | All of the above |

---

## 4. Core Features - Detailed Specifications

### 4.1 FlavorPrint Visualizer

**What:** A radial/polar chart that shows any recipe's complete molecular fingerprint, grouped by flavor category.

**How it works:**
```
1. User searches for a recipe (RecipeDB autocomplete API)
2. App fetches recipe details (RecipeDB search_recipeInfo)
3. App extracts all ingredients from the recipe
4. For each ingredient, query FlavorDB entity_details to get its flavor molecules
5. Aggregate all molecules across all ingredients
6. Group molecules by flavor_profile (sweet, bitter, umami, floral, woody, smoky, etc.)
7. Calculate molecule count per flavor category
8. Render as a D3.js radial/polar area chart
```

**Data flow:**
```
RecipeDB: /search_recipeInfo/{id}
  → ingredients: ["chicken", "cumin", "yogurt", "chili", ...]

FlavorDB: /entity_details?id={ingredient_id}  (for each ingredient)
  → molecules: [
      { common_name: "Linalool", flavor_profile: "floral, sweet" },
      { common_name: "Capsaicin", flavor_profile: "spicy, warm" },
      ...
    ]

Aggregated FlavorPrint:
  {
    sweet: 12 molecules,
    floral: 8 molecules,
    spicy: 6 molecules,
    umami: 15 molecules,
    bitter: 3 molecules,
    woody: 7 molecules,
    smoky: 4 molecules,
    fruity: 2 molecules
  }
```

**Visualization:** D3.js polar/radar chart with:
- Each axis = one flavor category
- Radius = molecule count (normalized)
- Filled area = the "fingerprint"
- Color gradient from center (light) to edge (saturated)
- Tooltip on hover showing contributing molecules/ingredients
- Animate on load (grow from center outward)

**UI Component:**
- Search bar with autocomplete at the top
- Recipe info card (name, cuisine, country, image)
- Radial fingerprint chart (center of page, large)
- Molecule breakdown table below (molecule name, flavor profile, source ingredient)
- "Find Twins" button → leads to Feature 4.2
- "Analyze Philosophy" button → leads to Feature 4.3

---

### 4.2 Cross-Cultural Flavor Twins

**What:** Given a recipe, find recipes from DIFFERENT countries that have the highest molecular overlap but use different ingredients.

**How it works:**
```
1. Start with Recipe A's FlavorPrint (set of molecule IDs)
2. Search RecipeDB for recipes in different cuisines
3. For each candidate recipe, generate its FlavorPrint
4. Calculate Twin Score:
   - Molecular Similarity = Jaccard(moleculesA, moleculesB)
   - Ingredient Difference = 1 - Jaccard(ingredientsA, ingredientsB)
   - Twin Score = Molecular Similarity × Ingredient Difference
5. Rank by Twin Score (high = same flavor, different ingredients)
6. Return top 5 twins with comparison data
```

**Twin Score formula:**
```
Twin Score = (|molecules_A ∩ molecules_B| / |molecules_A ∪ molecules_B|)
           × (1 - |ingredients_A ∩ ingredients_B| / |ingredients_A ∪ ingredients_B|)

Range: 0.0 (no match) to 1.0 (perfect twin: identical molecules, zero shared ingredients)
```

**UI Component:**
- Source recipe card on the left
- "VS" divider in the middle (animated)
- Twin recipe card on the right
- Between them: Twin Score (large percentage), shared molecules list, Venn diagram of ingredients
- Below: world map with a line connecting the two countries (animated arc)
- List of top 5 twins as selectable cards

**Optimization for 24h hackathon:**
- Pre-compute FlavorPrints for ~500 popular recipes across diverse cuisines
- Cache FlavorDB responses aggressively (936 entities = cacheable)
- Don't compare against all 118K recipes; sample 50-100 per cuisine

---

### 4.3 Philosophy Spectrum Analyzer

**What:** Classify any recipe on the "Pairing ↔ Contrast" spectrum based on the Ahn et al. food pairing hypothesis.

**The Science:**
- **Pairing philosophy (Western):** Ingredients share many flavor molecules → familiar, harmonious flavor
- **Contrast philosophy (East Asian):** Ingredients share few flavor molecules → complex, layered flavor
- Most cuisines fall somewhere on this spectrum
- The score reveals the cooking philosophy encoded in the recipe

**How it works:**
```
1. Take a recipe's ingredient list (from RecipeDB)
2. Get FlavorDB molecules for each ingredient
3. For every pair of ingredients (n choose 2):
   a. Count shared flavor molecules between the pair
   b. Record the count
4. Calculate average shared molecules per ingredient pair
5. Compare to a baseline (average across random ingredient pairs)
6. Score:
   - > baseline = "Pairing" leaning (Western)
   - < baseline = "Contrast" leaning (Eastern)
   - Normalize to 0-100 scale (0 = pure contrast, 100 = pure pairing)
```

**Algorithm:**
```typescript
function calculatePhilosophyScore(ingredients: Ingredient[]): number {
  const pairs = getAllPairs(ingredients); // n choose 2
  const sharedCounts = pairs.map(([a, b]) => {
    const molA = getFlavorMolecules(a);
    const molB = getFlavorMolecules(b);
    return intersection(molA, molB).length;
  });

  const avgShared = mean(sharedCounts);
  const baseline = getGlobalBaseline(); // pre-computed average

  // Normalize: 0 = maximum contrast, 100 = maximum pairing
  return normalize(avgShared, 0, baseline * 2) * 100;
}
```

**UI Component:**
- Horizontal gauge/slider showing the spectrum: CONTRAST ← → PAIRING
- Recipe's score marked on the gauge with animation
- Labels: "East Asian Style" (left), "Western Style" (right)
- Below: ingredient pair matrix showing which pairs share molecules and which contrast
- "Flip Philosophy" button: suggests ingredient swaps to move the score in the opposite direction
- Cuisine comparison: where does this recipe's cuisine typically fall?

---

## 5. API Integration Plan

### 5.1 RecipeDB Endpoints Used

| Endpoint | Purpose | When |
|----------|---------|------|
| `GET /recipedb/autocomplete_recipe?q={query}` | Search recipes by name | Search bar |
| `GET /recipedb/autocomplete_cuisine?q={query}` | Search/filter by cuisine | Twin finder (get cuisines) |
| `GET /recipedb/autocomplete_region?q={query}` | Search/filter by region | Atlas feature |
| `GET /recipedb/search_recipeInfo/{id}` | Full recipe detail | Core - every recipe view |
| `GET /recipedb/static/metadata.json` | Database metadata | Initial load |

### 5.2 FlavorDB Endpoints Used

| Endpoint | Purpose | When |
|----------|---------|------|
| `GET /flavordb/entities` | List all 936 food entities | App startup (cache all) |
| `GET /flavordb/entity_details?id={id}` | Get ingredient's molecules | FlavorPrint generation |
| `GET /flavordb/food_pairing?entity={name}` | Pairing suggestions | Twin finder validation |
| `GET /flavordb/molecules_autocomplete?{params}` | Search molecules by property | Molecule explorer |

### 5.3 Proxy Layer (CORS)

```
app/api/recipedb/[...path]/route.ts → proxies to cosylab.iiitd.edu.in/recipedb
app/api/flavordb/[...path]/route.ts → proxies to cosylab.iiitd.edu.in/flavordb
```

### 5.4 Caching Strategy

```
Layer 1: FlavorDB entities (all 936) → cached at app startup → stored in Zustand/memory
Layer 2: FlavorDB entity_details → cached per ingredient → TanStack Query staleTime: 1 hour
Layer 3: RecipeDB responses → cached per query → TanStack Query staleTime: 30 min
Layer 4: Computed FlavorPrints → cached per recipe_id → in-memory Map
Demo: Pre-compute top 50 demo recipes → JSON file in /public → zero latency during demo
```

---

## 6. Tech Stack Details

### Frontend
```
next@14           - App Router, API routes, SSR/SSG
typescript@5      - Strict mode
tailwindcss@3     - Utility-first styling
@shadcn/ui        - Button, Card, Dialog, Input, Select, Tabs, Tooltip, Skeleton
framer-motion@11  - Page transitions, chart animations, hover effects
d3@7              - Radial fingerprint chart, force-directed graph
recharts@2        - Bar charts, pie charts for nutrition
@tanstack/react-query@5 - Server state management, caching
zustand@4         - Client state (selected recipe, cached entities)
lucide-react      - Icons
```

### Backend (Next.js API Routes)
```
app/api/recipedb/  - Proxy to RecipeDB with caching headers
app/api/flavordb/  - Proxy to FlavorDB with caching headers
app/api/flavorprint/generate - Compute FlavorPrint for a recipe
app/api/flavorprint/twins    - Find cross-cultural twins
app/api/flavorprint/spectrum - Calculate philosophy score
```

### Deployment
```
Vercel            - Frontend + API routes (edge functions)
No database       - Everything computed from RecipeDB + FlavorDB + in-memory cache
No auth           - Public app, no login required (keeps it simple for hackathon)
```

---

## 7. Page Structure

### Page 1: Landing / Home (`/`)
```
- Hero section with animated radial fingerprint background
- Tagline: "Every dish has a molecular identity"
- Search bar (prominent, center): "Search any recipe..."
- 3 feature cards: Fingerprint | Twins | Spectrum
- "Powered by RecipeDB + FlavorDB" footer badge
```

### Page 2: FlavorPrint Viewer (`/recipe/[id]`)
```
- Recipe header (name, cuisine, country flag, image)
- FlavorPrint radial chart (D3.js, animated)
- Ingredient list with flavor molecule badges
- Molecule breakdown table
- Action buttons: "Find Twins" | "Analyze Philosophy"
- Nutrition summary (calories, protein, carbs, fat)
```

### Page 3: Flavor Twins (`/twins`)
```
- Source recipe card (left)
- Twin recipe card (right)
- Twin Score display (center, animated percentage)
- Shared molecules Venn/overlap visualization
- World map with arc connecting countries
- Top 5 twin carousel below
```

### Page 4: Philosophy Spectrum (`/spectrum`)
```
- Recipe name and cuisine
- Horizontal spectrum gauge (Contrast ← → Pairing)
- Animated score marker
- Ingredient pair matrix (which pairs share molecules?)
- "Flip Philosophy" suggestions
- Cuisine benchmark comparison
```

### Page 5: Cuisine Atlas (`/atlas`)  [stretch goal]
```
- World map colored by average philosophy score per country
- Click a country → see its aggregate FlavorPrint
- Compare two countries side by side
- Surprise findings section ("Did you know...?")
```

---

## 8. Design System

### Colors
```
Primary:     #FF6F00 (Saffron) - CTAs, highlights, brand
Secondary:   #4CAF50 (Basil Green) - success, compatibility scores
Accent:      #E91E63 (Berry Pink) - contrast scores, alerts
Background:  #FFFDF7 (Cream) - main background
Surface:     #FFFFFF - cards
Text:        #1A1A1A - primary text
Text Light:  #666666 - secondary text
```

### Flavor Category Colors (for radial chart)
```
Sweet:    #FFB74D (warm orange)
Bitter:   #8D6E63 (brown)
Umami:    #EF5350 (red)
Floral:   #BA68C8 (purple)
Woody:    #795548 (dark brown)
Smoky:    #78909C (blue-grey)
Spicy:    #FF7043 (deep orange)
Fruity:   #66BB6A (green)
Sour:     #FDD835 (yellow)
Nutty:    #A1887F (tan)
```

### Typography
```
Headings:  "Playfair Display" (serif, elegant, food-appropriate)
Body:      "Inter" (clean, readable, modern)
Code/Data: "JetBrains Mono" (molecule names, scores)
```

---

## 9. 24-Hour Execution Timeline

### Phase 1: Foundation (Hours 0-3)

| Hour | Task | Owner | Deliverable |
|------|------|-------|-------------|
| 0-0.5 | Repo setup, Next.js + Tailwind + shadcn init | Full-Stack | Running dev server |
| 0.5-1 | Test ALL RecipeDB & FlavorDB endpoints | Data | Documented response formats |
| 1-2 | Build API proxy routes + FlavorDB entity cache | Full-Stack | Working proxy layer |
| 2-3 | FlavorPrint algorithm (molecule aggregation) | Data | Working fingerprint generation |
| 0-3 | Landing page + search bar UI | Frontend | Styled home page |

### Phase 2: Core Features (Hours 3-12)

| Hour | Task | Owner | Deliverable |
|------|------|-------|-------------|
| 3-5 | Recipe search + detail page | Frontend + Full-Stack | Search → recipe detail flow |
| 3-5 | D3.js radial fingerprint chart component | Viz | Interactive polar chart |
| 5-7 | FlavorPrint page assembly (recipe + chart + molecules) | Frontend | Complete Feature 1 |
| 7-9 | Twin detection algorithm | Data | Working twin scoring |
| 7-9 | Twin comparison UI (split view + Venn diagram) | Frontend | Twin display component |
| 9-10 | Twin page assembly | Full-Stack | Complete Feature 2 |
| 10-12 | Philosophy spectrum algorithm + UI | Data + Frontend | Complete Feature 3 |

### Phase 3: Polish & Presentation (Hours 12-22)

| Hour | Task | Owner | Deliverable |
|------|------|-------|-------------|
| 12-14 | Animations (Framer Motion page transitions, chart animations) | Frontend | Smooth UX |
| 12-14 | Pre-compute demo data (top 50 recipes cached) | Data | Zero-latency demo |
| 14-16 | Responsive design pass (mobile + desktop) | Frontend | Works everywhere |
| 14-16 | Error states, loading skeletons, empty states | Frontend | Production-quality feel |
| 16-18 | World map for twins (optional) | Viz | Geographic visualization |
| 18-20 | Demo script + presentation slides | Product | Rehearsed pitch |
| 20-22 | Deploy to Vercel + final testing | Full-Stack | Live URL |

### Phase 4: Buffer (Hours 22-24)

| Hour | Task | Owner | Deliverable |
|------|------|-------|-------------|
| 22-23 | Record backup demo video | Team | Safety net |
| 23-24 | Rehearse 3x + Q&A prep | Team | Ready to present |

---

## 10. Demo Script

### The 5-Minute Pitch

**[0:00-0:30] THE HOOK**
> "Did you know that Butter Chicken and Ethiopian Doro Wat share 82% of their flavor molecules — despite having almost no ingredients in common? We built FlavorPrint to reveal hidden connections like this, encoded in the chemistry of food."

**[0:30-1:00] THE PROBLEM**
> "RecipeDB has 118,000 recipes across 74 countries. FlavorDB has 25,595 flavor molecules. But no tool connects them to answer: which dishes from opposite sides of the world actually taste the same? FlavorPrint does."

**[1:00-3:30] LIVE DEMO**
1. Search "Butter Chicken" → show recipe detail
2. FlavorPrint appears (animated radial chart) → "Notice the peaks in 'warm', 'sweet', and 'umami'"
3. Click "Find Flavor Twins" → loading animation → Ethiopian Doro Wat appears
4. Side-by-side comparison: 78% molecular match, only 2 shared ingredients
5. Click "Analyze Philosophy" → Butter Chicken scores 71% "Pairing"
6. Show that South Indian Sambar scores 34% → "Indian cuisine contains BOTH Western and Eastern cooking philosophies"

**[3:30-4:15] TECHNICAL DEPTH**
> "Under the hood, we compute Jaccard similarity on FlavorDB molecule sets and maximize molecular overlap while minimizing ingredient overlap. Our philosophy analyzer calculates average shared molecules per ingredient pair against a global baseline, implementing the Ahn et al. food pairing hypothesis computationally for the first time in a user-facing tool."

**[4:15-5:00] IMPACT + VISION**
> "FlavorPrint makes computational gastronomy personal. A home cook discovers new cuisines through molecular twins. A chef creates scientifically grounded fusion. A researcher explores cross-cultural flavor patterns interactively. We believe the 'cross-cultural twinning' finding could extend the FlavorDB and food pairing research in a publishable direction."

### Demo Safety
- Pre-cache all demo recipes in `/public/demo-data/`
- If live API fails, fallback to cached data seamlessly
- Record 3-minute video as backup

---

## 11. Judging Criteria Alignment

| Criteria | Weight | Our Strategy | Expected Score |
|----------|--------|-------------|----------------|
| **Innovation** | 30% | Molecular fingerprinting + cross-cultural twins = never been done | 9/10 |
| **Technical Complexity** | 25% | D3.js radial viz, Jaccard similarity, dual API integration, caching | 8/10 |
| **UI/UX** | 20% | shadcn/ui + Framer Motion + D3.js custom viz = polished & unique | 8/10 |
| **Impact** | 15% | Discover new cuisines, understand food science, create novel fusions | 8/10 |
| **Presentation** | 10% | Scripted demo with "wow moment" (twin reveal) + research references | 9/10 |

---

## 12. Risk Mitigation

| Risk | Probability | Mitigation |
|------|------------|------------|
| CoSyLab APIs are slow/down | Medium | Pre-cache 936 FlavorDB entities + 50 demo recipes |
| CORS blocks API calls | High | Next.js API route proxy (already planned) |
| FlavorDB doesn't have data for some RecipeDB ingredients | High | Graceful fallback: show "X of Y ingredients analyzed" |
| D3.js radial chart is hard to build | Medium | Start with simpler radar chart (Recharts), upgrade if time |
| Twin computation is slow (too many comparisons) | Medium | Pre-compute + limit search to 50 recipes per cuisine |
| WiFi issues during demo | Low | Pre-cached demo data, backup video recording |

---

## 13. What Makes This Win (Against 70 Teams)

### What others will build:
- Recipe search (RecipeDB UI clone) — 20+ teams
- "Input ingredients, get recipes" (Ratatouille clone) — 15+ teams
- Basic flavor pairing display — 10+ teams
- Nutrition planner — 5+ teams
- Food quiz/game — 5+ teams

### What we build that NOBODY else will:
1. **Molecular fingerprinting** — treating recipes as molecular identities, not ingredient lists
2. **Cross-cultural twins** — finding dishes that taste the same across different countries/cultures
3. **Philosophy spectrum** — making the Ahn et al. food pairing hypothesis interactive and user-facing
4. **Novel research insight** — "cuisine boundaries dissolve at the molecular level"

### Why judges will remember us:
- We reference their research (FlavorDB paper, food pairing hypothesis)
- We produce NOVEL FINDINGS from their data
- We have the best visualization in the room (radial fingerprint)
- Our demo has a "wow moment" (the twin reveal)
- We show the internship potential (publishable insight)

---

## 14. Research References

1. Garg, N. et al. "FlavorDB: a database of flavor molecules" — *Nucleic Acids Research*, 2017
2. Ahn, Y-Y. et al. "Flavor network and the principles of food pairing" — *Scientific Reports*, 2011
3. Bagler, G. et al. "Computational Gastronomy: A Data Science Approach to Food"
4. CoSyLab publications on RecipeDB, DietRx, SpiceRx, BitterSweet, Ratatouille

---

## 15. Pre-Hackathon Checklist

```
[x] Research RecipeDB + FlavorDB APIs (documented response formats)
[x] Identify unique angle (molecular fingerprinting + twins + philosophy)
[x] Create project plan (this document)
[x] Create README with project overview
[ ] Set up Next.js + Tailwind + shadcn/ui boilerplate
[ ] Build API proxy routes and test
[ ] Prototype D3.js radial chart with dummy data
[ ] Cache FlavorDB entity list (936 entries)
[ ] Test FlavorPrint algorithm with 5 recipes
[ ] Prepare demo dataset (50 pre-cached recipes)
[ ] Set up Vercel deployment pipeline
[ ] Assign team roles
```

---

*This plan is the internal strategy document for CodeCatalysts. The README.md in the repo root is the public-facing version.*
