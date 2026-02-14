# FlavorPrint - Molecular Recipe Fingerprinting

## ForkIT Challenge 2025 | IIIT Delhi CoSyLab
**Team:** CodeCatalysts
**Repository:** [github.com/ayushap18/Codecatalysts](https://github.com/ayushap18/Codecatalysts)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Setup and Installation](#4-setup-and-installation)
5. [Environment Variables](#5-environment-variables)
6. [Project Structure](#6-project-structure)
7. [Pages and Routes](#7-pages-and-routes)
8. [API Integration](#8-api-integration)
   - [RecipeDB Endpoints](#81-recipedb-endpoints)
   - [FlavorDB Endpoints](#82-flavordb-endpoints)
   - [API Proxy](#83-api-proxy)
9. [Core Algorithms](#9-core-algorithms)
   - [FlavorPrint Generation](#91-flavorprint-generation)
   - [Flavor Twin Detection](#92-flavor-twin-detection)
   - [Philosophy Spectrum](#93-philosophy-spectrum-scoring)
   - [Cuisine DNA](#94-cuisine-dna-computation)
   - [Ingredient Substitution](#95-ingredient-substitution-engine)
10. [Caching and Credit Optimization](#10-caching-and-credit-optimization)
11. [Data Types](#11-data-types)
12. [Components](#12-components)
13. [Features Summary](#13-features-summary)

---

## 1. Project Overview

FlavorPrint is a molecular gastronomy analysis platform that generates unique "molecular fingerprints" for recipes. It analyzes the flavor molecules present in each ingredient to reveal hidden connections between dishes across cultures.

**Core Idea:** Every dish has a molecular identity. Two recipes from completely different cuisines can share the same underlying flavor molecules despite using entirely different ingredients. FlavorPrint quantifies this.

**Key Capabilities:**
- Generate radial molecular fingerprints for any recipe
- Discover cross-cultural "Flavor Twins" (same molecules, different ingredients)
- Analyze cooking philosophy on the Pairing-Contrast spectrum (based on Ahn et al. 2011)
- Build custom recipes with real-time molecular analysis
- Compare world cuisine DNA at the molecular level
- Find molecularly-equivalent ingredient substitutions

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.1.6 |
| Language | TypeScript | 5.x |
| UI Library | React | 19.2.3 |
| Styling | Tailwind CSS | 4.x |
| Component Library | shadcn/ui (Radix UI) | 1.4.3 |
| Visualization | D3.js | 7.9.0 |
| Animation | Framer Motion | 12.34.0 |
| State Management | Zustand | 5.0.11 |
| Data Fetching | TanStack React Query | 5.90.21 |
| Icons | Lucide React | 0.564.0 |
| Fonts | Inter (body), Playfair Display (headings) | Google Fonts |

**Scripts:**
```bash
npm run dev     # Development server (Turbopack)
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

---

## 3. Architecture

```
Browser (HTTPS)
    |
    v
Next.js App (Vercel)
    |
    ├── Static Pages (/, /builder, /cuisine, /explore, /spectrum, /twins)
    ├── Dynamic Pages (/recipe/[id])
    |
    ├── Client-Side Cache (localStorage, 24h TTL)
    |   ├── Recipe data
    |   ├── FlavorDB molecules
    |   ├── Search results
    |   └── User history
    |
    └── /api/proxy (Server Route)
            |
            v
        CoSyLab API (HTTP)
        http://cosylab.iiitd.edu.in:6969
            ├── RecipeDB (/recipe2-api/...)
            └── FlavorDB (/flavordb/...)
```

**Data flow:**
1. User interacts with a page (search, view recipe, etc.)
2. Client checks localStorage cache for existing data
3. On cache miss, request goes through `/api/proxy` (production) or direct HTTP (development)
4. Proxy adds authentication headers and forwards to CoSyLab API
5. Response is cached in localStorage with TTL for future use
6. Algorithms process the API data into FlavorPrints, scores, and visualizations

---

## 4. Setup and Installation

```bash
# Clone the repository
git clone https://github.com/ayushap18/Codecatalysts.git
cd Codecatalysts

# Install dependencies
cd app
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API key

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

**Requirements:**
- Node.js 18+
- npm 9+
- Network access to CoSyLab API (IIIT Delhi campus or VPN)

---

## 5. Environment Variables

File: `app/.env.local`

| Variable | Purpose | Used By |
|----------|---------|---------|
| `NEXT_PUBLIC_API_KEY` | API authentication token (client-side, for direct HTTP calls during development) | `flavordb.ts`, `recipedb.ts` |
| `API_BASE` | CoSyLab API base URL | `api/proxy/route.ts` |
| `API_KEY` | API authentication token (server-side, for proxy route) | `api/proxy/route.ts` |

```env
NEXT_PUBLIC_API_KEY=SEx5uuPyDMUeD1BYdK0Xk_Oe_ziUPOl2s8Pubc62oaFXQ3NA
API_BASE=http://cosylab.iiitd.edu.in:6969
API_KEY=SEx5uuPyDMUeD1BYdK0Xk_Oe_ziUPOl2s8Pubc62oaFXQ3NA
```

---

## 6. Project Structure

```
app/src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (fonts, providers)
│   ├── page.tsx                  # Home page
│   ├── globals.css               # Global styles
│   ├── api/proxy/route.ts        # HTTPS-to-HTTP API proxy
│   ├── recipe/[id]/page.tsx      # Recipe detail (dynamic)
│   ├── explore/page.tsx          # Ingredient explorer
│   ├── twins/page.tsx            # Flavor twin finder
│   ├── spectrum/page.tsx         # Philosophy spectrum
│   ├── builder/page.tsx          # Recipe builder
│   └── cuisine/page.tsx          # Cuisine DNA dashboard
│
├── components/                   # React components
│   ├── navbar.tsx                # Navigation bar
│   ├── footer.tsx                # Footer
│   ├── theme-provider.tsx        # Dark/light theme
│   ├── providers.tsx             # App-level providers
│   ├── ui/                       # shadcn/ui primitives
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── tabs.tsx
│   │   └── tooltip.tsx
│   ├── flavorprint/              # FlavorPrint visualizations
│   │   ├── radial-chart.tsx      # D3 radial/radar chart
│   │   ├── flavor-network.tsx    # D3 force-directed graph
│   │   └── molecule-table.tsx    # Molecule data table
│   ├── spectrum/
│   │   └── spectrum-gauge.tsx    # Pairing-Contrast gauge
│   ├── substitution/
│   │   └── substitution-panel.tsx # Ingredient swap UI
│   └── twins/
│       └── twin-card.tsx         # Twin result card
│
├── lib/                          # Business logic
│   ├── api/
│   │   ├── recipedb.ts           # RecipeDB API client
│   │   ├── flavordb.ts           # FlavorDB API client
│   │   └── cache.ts              # localStorage cache + history
│   ├── algorithms/
│   │   ├── flavorprint.ts        # Core FlavorPrint engine
│   │   ├── cuisine-dna.ts        # Cuisine DNA aggregation
│   │   └── substitution.ts       # Ingredient substitution
│   ├── utils.ts                  # Utility functions (cn)
│   └── stores/
│       └── app-store.ts          # Zustand store
│
└── types/
    └── index.ts                  # TypeScript interfaces
```

---

## 7. Pages and Routes

### `/` — Home

Search recipes by title, view the Recipe of the Day, browse recent activity history, and access all features.

### `/recipe/[id]` — Recipe Detail

Full recipe analysis with 6 tabs:

| Tab | Description |
|-----|-------------|
| **FlavorPrint** | D3 radial chart showing molecular fingerprint across 19 flavor categories |
| **Philosophy** | Pairing vs Contrast spectrum gauge with pair statistics |
| **Molecules** | Full table of detected flavor molecules |
| **Network** | Interactive D3 force-directed graph of ingredient-molecule relationships |
| **Substitutes** | Molecular similarity-based ingredient swap suggestions |
| **Steps** | Cooking instructions (when available) |

Also displays: nutritional info, dietary tags, cooking methods, ingredient list, cuisine origin.

### `/explore` — Ingredient Explorer

Search any ingredient to see its flavor molecules, categorized by flavor type. Uses async FlavorDB lookup to analyze ingredients beyond the static cache.

### `/twins` — Flavor Twins

Enter a recipe to find its cross-cultural "twin" from a different cuisine that shares the same flavor molecules despite using different ingredients. Shows molecular similarity score and shared molecule list.

### `/spectrum` — Philosophy Spectrum

Analyze recipes on the Pairing-Contrast spectrum. Western cuisines tend to pair ingredients sharing flavor molecules; East Asian cuisines tend to contrast ingredients with different molecules (Ahn et al. 2011).

### `/builder` — Recipe Builder

Add ingredients interactively to construct a recipe. The FlavorPrint radial chart and Philosophy Spectrum gauge update in real-time. On-demand FlavorDB pairing suggestions help discover complementary ingredients.

### `/cuisine` — Cuisine DNA Dashboard

Select up to 3 world cuisines to compare their molecular DNA. Aggregates FlavorPrints across sample recipes to reveal each cuisine's dominant flavor categories. Visualized with grouped bar chart, heatmap, and summary cards.

**Available cuisines:** Indian, Japanese, Mexican, Italian, Thai, French, Ethiopian, Korean, Chinese, American.

---

## 8. API Integration

All API requests go to the CoSyLab server at `http://cosylab.iiitd.edu.in:6969`. In production (HTTPS), requests are proxied through `/api/proxy` to avoid mixed content.

### 8.1 RecipeDB Endpoints

**File:** `src/lib/api/recipedb.ts`

All functions return cached data when available (localStorage with TTL).

#### `searchRecipesByTitle(title: string)`
- **Path:** `GET /recipe2-api/recipe-bytitle/recipeByTitle?title={title}`
- **Returns:** `Recipe[]` — Array of matching recipes
- **Cache TTL:** 6 hours
- **Used by:** Home page search

#### `getRecipeById(id: number | string)`
- **Path:** `GET /recipe2-api/search-recipe/{id}`
- **Returns:** `{ recipe: Recipe, ingredients: RecipeIngredient[] }`
- **Cache TTL:** 24 hours
- **Used by:** Recipe detail page, Twins, Spectrum, Cuisine DNA

#### `getRecipeInstructions(recipeId: number | string)`
- **Path:** `GET /recipe2-api/instructions/{recipeId}`
- **Returns:** `string[]` — Array of cooking steps
- **Cache TTL:** 24 hours
- **Used by:** Recipe detail "Steps" tab

#### `getRecipeOfDay()`
- **Path:** `GET /recipe2-api/recipe/recipeofday`
- **Returns:** `Recipe | null`
- **Cache TTL:** 24 hours
- **Used by:** Home page

#### `getRecipesByCuisine(region, opts?)`
- **Path:** `GET /recipe2-api/recipes_cuisine/cuisine/{region}?page={page}&page_size={limit}`
- **Parameters:** `region: string`, optional `{ continent, subRegion, page, limit }`
- **Returns:** `Recipe[]`
- **Cache TTL:** 6 hours
- **Used by:** Twins (finding twins from other cuisines), Cuisine DNA

#### `getRecipes(page?, limit?)`
- **Path:** `GET /recipe2-api/recipe/recipesinfo?page={page}&limit={limit}`
- **Returns:** `{ recipes: Recipe[], pagination }`
- **Cache TTL:** 6 hours

---

### 8.2 FlavorDB Endpoints

**File:** `src/lib/api/flavordb.ts`

All functions return cached data when available (localStorage, 24-hour TTL).

#### `getEntitiesByName(name, page?, size?)`
- **Path:** `GET /flavordb/entities/by-entity-alias-readable?entity_alias_readable={name}&page={page}&size={size}`
- **Returns:** `{ content: FlavorEntity[] }` — Entities matching the name, each with a `molecules` array
- **Used by:** `getMoleculesForIngredientAsync()` in flavorprint.ts (the core molecule lookup)

#### `getEntitiesByCategory(name, category, page?, size?)`
- **Path:** `GET /flavordb/entities/by-name-and-category?name={name}&category={category}&page={page}&size={size}`
- **Returns:** `{ content: FlavorEntity[] }`

#### `getEntitiesByNaturalSource(source, page?, size?)`
- **Path:** `GET /flavordb/entities/by-natural-source?naturalSource={source}&page={page}&size={size}`
- **Returns:** `{ content: FlavorEntity[] }`

#### `getFoodPairings(ingredient)`
- **Path:** `GET /flavordb/food/by-alias?food_pair={ingredient}`
- **Returns:** Array of food pairing objects with `entity_alias_readable`
- **Used by:** Builder (pairing suggestions), Substitution engine (candidate discovery)

#### `getMoleculesByFlavorProfile(flavor, page?, size?)`
- **Path:** `GET /flavordb/molecules_data/by-flavorProfile?flavorProfile={flavor}&page={page}&size={size}`
- **Returns:** `{ content: FlavorMolecule[] }`

#### `getMoleculesByCommonName(name, page?, size?)`
- **Path:** `GET /flavordb/molecules_data/by-commonName?commonName={name}&page={page}&size={size}`
- **Returns:** `{ content: FlavorMolecule[] }`

#### `getMoleculesByType(type, page?, size?)`
- **Path:** `GET /flavordb/molecules_data/filter-by-type?type={type}&page={page}&size={size}`
- **Returns:** `{ content: FlavorMolecule[] }`

#### `getPropertiesByDescription(description, page?, size?)`
- **Path:** `GET /flavordb/properties/by-description?description={description}&page={page}&size={size}`
- **Returns:** `{ content: [...] }`

#### `getPropertiesByTasteThreshold(values, page?, size?)`
- **Path:** `GET /flavordb/properties/taste-threshold?values={values}&page={page}&size={size}`
- **Returns:** `{ content: [...] }`

---

### 8.3 API Proxy

**File:** `src/app/api/proxy/route.ts`

Solves the HTTPS (Vercel) to HTTP (CoSyLab) mixed content problem.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/proxy?path=/...&param=value` | Forwards GET request to CoSyLab API |
| `POST` | `/api/proxy?path=/...` | Forwards POST request with JSON body |
| `OPTIONS` | `/api/proxy` | CORS preflight (returns 204) |

**Configuration:**
- Timeout: 15 seconds (AbortController)
- CORS: Allows all origins, `GET`/`POST`/`OPTIONS`
- Auth: Adds `Authorization: Bearer {API_KEY}` header
- Error: Returns 502 with message on failure

---

## 9. Core Algorithms

**File:** `src/lib/algorithms/flavorprint.ts`

### 9.1 FlavorPrint Generation

A FlavorPrint is a molecular fingerprint for a recipe. It maps each ingredient to its known flavor molecules, then categorizes those molecules into 19 flavor categories.

**19 Flavor Categories:**

| Category | Color | Category | Color |
|----------|-------|----------|-------|
| Sweet | #FFB74D | Nutty | #A1887F |
| Bitter | #8D6E63 | Meaty | #D32F2F |
| Umami | #EF5350 | Creamy | #FFF176 |
| Floral | #BA68C8 | Herbal | #81C784 |
| Woody | #795548 | Earthy | #6D4C41 |
| Smoky | #78909C | Minty | #4DD0E1 |
| Spicy | #FF7043 | Citrus | #FFD54F |
| Fruity | #66BB6A | Warm | #FF8A65 |
| Sour | #FDD835 | Cooling | #4FC3F7 |
| Other | #90A4AE | | |

**Molecule Lookup — 3-Tier System:**

```
getMoleculesForIngredientAsync(name)
    │
    ├─ Tier 1: Static Cache (22+ pre-cached ingredients) → instant, 0 API calls
    │
    ├─ Tier 2: Runtime Cache (in-memory) → instant, 0 API calls
    │
    └─ Tier 3: FlavorDB API (getEntitiesByName) → cached 24h in localStorage
```

**Pre-cached ingredients (Tier 1):** chicken, onion, garlic, tomato, cumin, coriander, yogurt, butter, ginger, chili, lemon, cinnamon, rice, black pepper, milk, coconut, basil, lentil, potato, carrot, olive oil, salt, water, sugar, flour, egg.

**Functions:**

| Function | Sync/Async | Description |
|----------|-----------|-------------|
| `getMoleculesForIngredient(name)` | Sync | Static cache only |
| `getMoleculesForIngredientAsync(name)` | Async | 3-tier lookup |
| `generateFlavorPrint(id, title, cuisine, country, ingredients)` | Sync | FlavorPrint from static cache |
| `generateFlavorPrintAsync(id, title, cuisine, country, ingredients)` | Async | FlavorPrint with FlavorDB fallback |
| `classifyFlavor(profile)` | Sync | Maps a flavor descriptor to one of 19 categories |

**Algorithm:**
1. For each ingredient, look up its flavor molecules
2. For each molecule, classify its `flavor_profile` into categories (e.g., "green, fatty" maps to herbal + creamy)
3. Aggregate unique molecule counts per category
4. Return categories sorted by count, plus total unique molecule count

---

### 9.2 Flavor Twin Detection

Finds recipes from different cuisines that share the same flavor molecules but use different ingredients.

**Function:** `calculateTwinScore(sourceDetail, sourceFP, twinDetail, twinFP) -> TwinResult`

**Twin Score Formula:**
```
twinScore = molecularSimilarity x ingredientDifference
```

Where:
- `molecularSimilarity` = Jaccard similarity of molecule name sets
- `ingredientDifference` = 1 - Jaccard similarity of ingredient name sets

**Jaccard Similarity:**
```
J(A, B) = |A ∩ B| / |A ∪ B|
```

A high twin score means the recipes share many molecules but use different ingredients — a true flavor twin.

---

### 9.3 Philosophy Spectrum Scoring

Based on the Ahn et al. (2011) food pairing hypothesis. Western cuisines tend to combine ingredients sharing flavor compounds (Pairing), while East Asian cuisines tend to avoid shared compounds (Contrast).

**Functions:** `calculatePhilosophyScore(ingredients)`, `calculatePhilosophyScoreAsync(ingredients)`

**Algorithm:**
1. For each pair (i, j) of ingredients with known molecules:
   - Count shared molecules between ingredients i and j
   - If shared > 0: increment `pairingPairs`
   - If shared = 0: increment `contrastPairs`
2. Compute average shared molecules across all pairs
3. Normalize to 0-100 scale (baseline: 0.5 shared per pair = 50%)
4. Classify:
   - Score < 35: **Contrast** (East Asian style)
   - Score 35-65: **Balanced**
   - Score > 65: **Pairing** (Western style)

---

### 9.4 Cuisine DNA Computation

**File:** `src/lib/algorithms/cuisine-dna.ts`

Computes the aggregate molecular flavor profile of an entire cuisine by sampling recipes.

**Function:** `computeCuisineDNA(cuisineName, color, sampleSize=3) -> CuisineDNA`

**Algorithm:**
1. Fetch `sampleSize` recipes from the cuisine via `getRecipesByCuisine()`
2. For each recipe, get full details (ingredients) via `getRecipeById()`
3. Generate FlavorPrint for each recipe (capped at 8 ingredients per recipe for credit efficiency)
4. Aggregate: sum category counts across all valid recipes, then average
5. Normalize: divide each category by the maximum average to get 0-1 scores
6. Extract top 5 dominant categories

---

### 9.5 Ingredient Substitution Engine

**File:** `src/lib/algorithms/substitution.ts`

Finds molecularly-equivalent ingredient swaps for any ingredient in a recipe.

**Function:** `findSubstitutions(ingredientName, existingIngredients, maxResults=5) -> SubstitutionResult[]`

**Algorithm:**
1. Get molecules for the original ingredient
2. Get candidate substitutes from FlavorDB food pairings (`getFoodPairings()`)
3. For each candidate (max 8), fetch its molecules
4. Score using Jaccard similarity between the original and candidate molecule sets
5. Calculate flavor impact: which categories are gained or lost by the swap
6. Sort by match score descending, return top results

**Output per substitution:**
- Match score (0-1, higher = more similar molecules)
- List of shared molecules
- Flavor impact: gained categories (new flavors added) and lost categories (flavors removed)
- Overall flavor categories of the substitute

---

## 10. Caching and Credit Optimization

**File:** `src/lib/api/cache.ts`

The CoSyLab API has a limited credit budget. FlavorPrint uses aggressive caching to minimize API calls.

### Cache Architecture

| Layer | Storage | Scope | TTL |
|-------|---------|-------|-----|
| Static ingredient cache | In-memory (bundled) | 22+ ingredients | Permanent |
| Runtime molecule cache | In-memory (JS variable) | Session | Until page refresh |
| localStorage cache | Browser localStorage | Persistent | Configurable TTL |

### Cache TTLs

| Data Type | TTL | Rationale |
|-----------|-----|-----------|
| Recipe detail | 24 hours | Recipe data is static |
| Recipe search results | 6 hours | Rarely changes |
| Recipe of the Day | 24 hours | Changes daily |
| Recipe instructions | 24 hours | Static |
| Cuisine recipe list | 6 hours | Rarely changes |
| FlavorDB molecule data | 24 hours | Static |

### Credit Optimization Measures

| Feature | Optimization | Credits Saved |
|---------|-------------|---------------|
| Builder suggestions | On-demand button (not auto-fetch) | ~5 calls per ingredient add |
| Builder suggestions | 4 candidates (not 6) | 2 molecule lookups |
| Cuisine DNA | 3 sample recipes (not 5) | ~40% fewer recipe+molecule calls |
| Cuisine DNA | Max 8 ingredients per recipe | ~20% fewer molecule lookups |
| Substitution | 8 candidates (not 15) | 7 molecule lookups |
| Substitution | No fallback guessing list | Up to 23 wasted lookups |
| All features | 24h localStorage cache | 0 calls on repeat visits |

**First-visit budget estimate (full demo):** ~30-50 unique API calls
**Repeat visits within 24h:** 0 API calls

### Cache API

```typescript
cachedFetch<T>(key, fetchFn, ttlMs)  // Fetch with automatic cache
clearCache()                          // Clear all cached API data
getCacheStats()                       // Get entry count and size in KB
```

### History System

```typescript
addToHistory(entry)         // Track search/view activity
getHistory()                // Get all history entries (newest first)
removeFromHistory(path)     // Remove specific entry
clearHistory()              // Clear all history
clearAll()                  // Clear cache + history
```

---

## 11. Data Types

**File:** `src/types/index.ts`

### Recipe

```typescript
interface Recipe {
  recipe_id: number;
  recipe_title: string;
  calories: number;
  cook_time: string;
  prep_time: string;
  total_time: string;
  servings: string;
  region: string;
  sub_region: string;
  continent: string;
  source: string;
  url?: string;
  img_url?: string;
  "carbohydrate, by difference (g)": number;
  "energy (kcal)": number;
  "protein (g)": number;
  "total lipid (fat) (g)": number;
  processes: string;
  utensils?: string;
  vegan: string;
  pescetarian: string;
  ovo_vegetarian: string;
  lacto_vegetarian: string;
  ovo_lacto_vegetarian: string;
}
```

### RecipeDetail

```typescript
interface RecipeDetail {
  recipe: Recipe;
  ingredients: RecipeIngredient[];
}
```

### RecipeIngredient

```typescript
interface RecipeIngredient {
  recipe_no: number;
  ingredient_phrase: string;
  ingredient: string;
  quantity: string;
  unit?: string;
  ing_id: number;
  ndb_id?: number;
  state?: string;
  size?: string;
}
```

### FlavorMolecule

```typescript
interface FlavorMolecule {
  common_name: string;
  flavor_profile: string;
  pubchem_id?: number;
  functional_groups?: string;
}
```

### FlavorPrint

```typescript
interface FlavorPrint {
  recipeId: number;
  recipeTitle: string;
  cuisine: string;
  country: string;
  categories: FlavorCategory[];
  totalMolecules: number;
  ingredientCount: number;
  analyzedCount: number;
  molecules: FlavorMolecule[];
}
```

### FlavorCategory

```typescript
interface FlavorCategory {
  name: string;
  count: number;
  color: string;
  molecules: string[];
}
```

### PhilosophyScore

```typescript
interface PhilosophyScore {
  score: number;        // 0 = pure contrast, 100 = pure pairing
  label: "Contrast" | "Balanced" | "Pairing";
  avgSharedMolecules: number;
  totalPairs: number;
  pairingPairs: number;
  contrastPairs: number;
}
```

### TwinResult

```typescript
interface TwinResult {
  source: RecipeDetail;
  twin: RecipeDetail;
  sourceFlavorPrint: FlavorPrint;
  twinFlavorPrint: FlavorPrint;
  twinScore: number;
  molecularSimilarity: number;
  ingredientDifference: number;
  sharedMolecules: string[];
  sharedIngredients: string[];
}
```

### CuisineDNA

```typescript
interface CuisineDNA {
  name: string;
  recipeCount: number;
  profile: Record<string, number>;  // category -> normalized score 0-1
  topCategories: string[];
  color: string;
}
```

### SubstitutionResult

```typescript
interface SubstitutionResult {
  original: string;
  substitute: string;
  matchScore: number;              // 0-1
  sharedMolecules: string[];
  flavorImpact: {
    gained: string[];              // New flavor categories added
    lost: string[];                // Flavor categories removed
  };
  categories: string[];
}
```

---

## 12. Components

### Visualizations

| Component | File | Description |
|-----------|------|-------------|
| **RadialChart** | `flavorprint/radial-chart.tsx` | D3 radial/radar chart showing molecule counts per flavor category. Animated entry, interactive hover tooltips, glow effects. |
| **FlavorNetwork** | `flavorprint/flavor-network.tsx` | D3 force-directed graph. Ingredient nodes (orange, large) connected to molecule nodes (colored by category). Shared molecules glow. Supports drag, zoom/pan, hover highlight. |
| **SpectrumGauge** | `spectrum/spectrum-gauge.tsx` | Visual gauge showing Pairing vs Contrast score on a 0-100 scale. |
| **MoleculeTable** | `flavorprint/molecule-table.tsx` | Sortable table of all detected flavor molecules with names, profiles, and categories. |
| **SubstitutionPanel** | `substitution/substitution-panel.tsx` | Click an ingredient to see molecular substitutes ranked by Jaccard similarity with flavor impact indicators. |
| **TwinCard** | `twins/twin-card.tsx` | Side-by-side display of source and twin recipes with shared molecule counts. |

### Layout

| Component | File | Description |
|-----------|------|-------------|
| **Navbar** | `navbar.tsx` | Top navigation with links: Home, Flavor Twins, Spectrum, Explore, Builder, Cuisine DNA. Includes dark/light theme toggle and mobile hamburger menu. |
| **Footer** | `footer.tsx` | Page footer with project info. |
| **ThemeProvider** | `theme-provider.tsx` | Dark/light mode context provider. |
| **Providers** | `providers.tsx` | Wraps app with ThemeProvider and React Query QueryClientProvider. |

### UI Primitives (shadcn/ui)

Badge, Button, Card, CardContent, Dialog, Input, Select, Separator, Skeleton, Tabs, TabsList, TabsTrigger, TabsContent, Tooltip.

---

## 13. Features Summary

| # | Feature | Route | Algorithms Used | API Endpoints Used |
|---|---------|-------|----------------|-------------------|
| 1 | Recipe Search | `/` | — | `searchRecipesByTitle`, `getRecipeOfDay` |
| 2 | Recipe FlavorPrint | `/recipe/[id]` | `generateFlavorPrintAsync`, `calculatePhilosophyScoreAsync` | `getRecipeById`, `getRecipeInstructions`, `getEntitiesByName` |
| 3 | Flavor Network | `/recipe/[id]` (Network tab) | `getMoleculesForIngredient`, `classifyFlavor` | — (uses pre-fetched data) |
| 4 | Ingredient Explorer | `/explore` | `getMoleculesForIngredientAsync`, `classifyFlavor` | `getEntitiesByName` |
| 5 | Flavor Twins | `/twins` | `generateFlavorPrintAsync`, `calculateTwinScore` | `getRecipeById`, `getRecipesByCuisine`, `getEntitiesByName` |
| 6 | Philosophy Spectrum | `/spectrum` | `generateFlavorPrintAsync`, `calculatePhilosophyScoreAsync` | `getRecipeById`, `getEntitiesByName` |
| 7 | Recipe Builder | `/builder` | `generateFlavorPrintAsync`, `calculatePhilosophyScoreAsync`, `classifyFlavor` | `getEntitiesByName`, `getFoodPairings` |
| 8 | Cuisine DNA | `/cuisine` | `computeCuisineDNA` | `getRecipesByCuisine`, `getRecipeById`, `getEntitiesByName` |
| 9 | Ingredient Substitution | `/recipe/[id]` (Substitutes tab) | `findSubstitutions`, `jaccardSimilarity` | `getFoodPairings`, `getEntitiesByName` |
| 10 | Search & View History | `/` | — | — (localStorage only) |
| 11 | Smart Caching | All pages | — | — (wraps all API calls) |
| 12 | Dark/Light Theme | All pages | — | — |

---

*Built for the ForkIT Challenge 2025 by Team CodeCatalysts.*
