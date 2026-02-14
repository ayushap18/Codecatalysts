# FlavorPrint - Application Structure & Architecture

> Complete project architecture, folder organization, and module responsibilities.

---

## 1. High-Level Architecture

```
+---------------------------------------------------+
|                   CLIENT LAYER                     |
|            Next.js 14+ (App Router)                |
|  [Pages] [Components] [Algorithms] [API Clients]  |
+----------------------------+-----------------------+
                             |
                         REST APIs
                             |
              +--------------+--------------+
              |                             |
     +--------+--------+         +---------+--------+
     |   RecipeDB v2   |         |    FlavorDB      |
     |  (CoSyLab API)  |         |  (CoSyLab API)   |
     |  118K recipes    |         |  25K molecules   |
     |  74 countries    |         |  936 ingredients |
     +--------+--------+         +---------+--------+
              |                             |
              +----+------------------------+
                   |
        +----------+----------+
        |  FlavorPrint Engine  |
        | (Client-side Algs)   |
        |  - generateFlavorPrint
        |  - calculateTwinScore
        |  - calculatePhilosophy
        +----------------------+
```

### Key Architecture Decisions

- **No custom backend** -- All API calls go directly to CoSyLab's servers from the client
- **Client-side algorithms** -- FlavorPrint generation, twin matching, and philosophy scoring run in the browser
- **Pre-cached molecule data** -- 22+ common ingredients have their FlavorDB molecules pre-cached in the algorithm file to ensure reliable demo performance
- **No auth required** -- RecipeDB v2 API works without authentication for most endpoints

---

## 2. Project Structure

```
foodoscope/
+-- app/                          # Next.js application
|   +-- public/                   # Static assets
|   +-- src/
|   |   +-- app/                  # Next.js App Router pages
|   |   |   +-- globals.css       # Tailwind + shadcn/ui theme
|   |   |   +-- layout.tsx        # Root layout (fonts, providers)
|   |   |   +-- page.tsx          # Home page (search + features)
|   |   |   +-- recipe/
|   |   |   |   +-- [id]/
|   |   |   |       +-- page.tsx  # Recipe detail + FlavorPrint
|   |   |   +-- twins/
|   |   |   |   +-- page.tsx      # Cross-Cultural Flavor Twins
|   |   |   +-- spectrum/
|   |   |       +-- page.tsx      # Philosophy Spectrum Analyzer
|   |   |
|   |   +-- components/
|   |   |   +-- ui/               # shadcn/ui base components
|   |   |   |   +-- badge.tsx
|   |   |   |   +-- button.tsx
|   |   |   |   +-- card.tsx
|   |   |   |   +-- dialog.tsx
|   |   |   |   +-- input.tsx
|   |   |   |   +-- select.tsx
|   |   |   |   +-- separator.tsx
|   |   |   |   +-- skeleton.tsx
|   |   |   |   +-- tabs.tsx
|   |   |   |   +-- tooltip.tsx
|   |   |   |
|   |   |   +-- flavorprint/      # FlavorPrint feature components
|   |   |   |   +-- radial-chart.tsx    # D3.js polar/radar visualization
|   |   |   |   +-- molecule-table.tsx  # Molecule breakdown table
|   |   |   |
|   |   |   +-- spectrum/         # Philosophy Spectrum components
|   |   |   |   +-- spectrum-gauge.tsx  # Pairing-Contrast gauge bar
|   |   |   |
|   |   |   +-- twins/            # Flavor Twins components
|   |   |   |   +-- twin-card.tsx       # Side-by-side twin comparison
|   |   |   |
|   |   |   +-- navbar.tsx         # Sticky navigation bar
|   |   |   +-- providers.tsx      # React Query + Tooltip provider
|   |   |
|   |   +-- lib/
|   |   |   +-- api/
|   |   |   |   +-- recipedb.ts    # RecipeDB v2 API client
|   |   |   |   +-- flavordb.ts    # FlavorDB API client (dual: old + v2)
|   |   |   +-- algorithms/
|   |   |   |   +-- flavorprint.ts # Core algorithms (fingerprint, twins, philosophy)
|   |   |   +-- utils.ts           # cn() utility for classNames
|   |   |
|   |   +-- stores/
|   |   |   +-- app-store.ts       # Zustand global state
|   |   |
|   |   +-- types/
|   |       +-- index.ts           # All TypeScript interfaces
|   |
|   +-- components.json            # shadcn/ui config
|   +-- next.config.ts             # Next.js configuration
|   +-- tailwind.config.ts         # Tailwind CSS v4 config
|   +-- tsconfig.json              # TypeScript config
|   +-- package.json
|
+-- docs/                          # Documentation (these files)
+-- README.md                      # Project README
+-- .gitignore
```

---

## 3. Page Responsibilities

### Home (`/`) -- `app/page.tsx`

- Hero section with animated gradient title
- Recipe search bar hitting RecipeDB `searchRecipesByTitle`
- Search results displayed as clickable recipe cards (2-3 column grid)
- Feature showcase cards (FlavorPrint, Twins, Spectrum) when not searching
- Skeleton loading states during search

### Recipe Detail (`/recipe/[id]`) -- `app/recipe/[id]/page.tsx`

- Fetches recipe via `getRecipeById(id)` from RecipeDB
- On load: generates FlavorPrint + PhilosophyScore from ingredient data
- Displays: recipe image, title, cuisine badges, nutrition grid, ingredient list
- Renders D3.js RadialChart for FlavorPrint visualization
- Shows SpectrumGauge for philosophy analysis
- Shows MoleculeTable for molecular breakdown
- "Find Flavor Twins" and "Analyze Philosophy" navigation buttons

### Flavor Twins (`/twins`) -- `app/twins/page.tsx`

- Accepts `?recipeId=` query parameter for source recipe
- Searches across 15 diverse cuisines (Ethiopian, Mexican, Japanese, etc.)
- For each cuisine: fetches recipes, generates FlavorPrints, calculates twin scores
- Twin Score = `molecularSimilarity * ingredientDifference`
- Displays top 5 twins sorted by score via TwinCard components
- Wrapped in `<Suspense>` for Next.js SSR compatibility

### Philosophy Spectrum (`/spectrum`) -- `app/spectrum/page.tsx`

- Accepts `?recipeId=` query parameter for initial recipe
- Allows adding multiple recipes to compare on the spectrum
- Each recipe shows: title, cuisine badges, SpectrumGauge, RadialChart
- Based on Ahn et al. food pairing hypothesis
- Wrapped in `<Suspense>` for Next.js SSR compatibility

---

## 4. Component Architecture

### Custom Feature Components

| Component        | File                                    | Purpose                                       |
| ---------------- | --------------------------------------- | --------------------------------------------- |
| `RadialChart`    | `components/flavorprint/radial-chart.tsx`| D3.js polar chart of flavor categories         |
| `MoleculeTable`  | `components/flavorprint/molecule-table.tsx`| Table of individual molecules with profiles  |
| `SpectrumGauge`  | `components/spectrum/spectrum-gauge.tsx` | Horizontal Pairing-Contrast gauge bar          |
| `TwinCard`       | `components/twins/twin-card.tsx`        | Side-by-side recipe comparison with score      |
| `Navbar`         | `components/navbar.tsx`                 | Sticky nav with brand + page links             |
| `Providers`      | `components/providers.tsx`              | QueryClient + TooltipProvider wrapper          |

### shadcn/ui Components Used

```
Badge, Button, Card (+ CardContent, CardHeader, CardTitle),
Dialog, Input, Select, Separator, Skeleton, Tabs, Tooltip
```

---

## 5. API Integration Layer

### RecipeDB v2 Client (`lib/api/recipedb.ts`)

| Function                  | Endpoint                                        | Returns           |
| ------------------------- | ----------------------------------------------- | ----------------- |
| `searchRecipesByTitle(q)` | `GET /recipe2-api/recipe-bytitle/{title}`        | `Recipe[]`        |
| `getRecipeById(id)`       | `GET /recipe2-api/search-recipe/{id}`            | `RecipeDetail`    |
| `getRecipeInstructions(id)`| `GET /recipe2-api/instructions/{recipe_id}`     | Instructions      |
| `getRecipeOfDay()`        | `GET /recipe2-api/recipeofday`                   | `Recipe`          |
| `getRecipesByCuisine(c)`  | `GET /recipe2-api/recipes_cuisine/{cuisine_name}`| `Recipe[]`        |
| `getRecipes(page, size)`  | `GET /recipe2-api/recipesinfo?pageNo=&pageSize=` | Paginated recipes |

Base URL: `https://cosylab.iiitd.edu.in`

### FlavorDB Client (`lib/api/flavordb.ts`)

Dual-mode client supporting both old (public) and new (campus-only) APIs:

| Function                   | API Version | Endpoint                              |
| -------------------------- | ----------- | ------------------------------------- |
| `searchMoleculesByName(q)` | Old (public)| `/flavordb/molecules_autocomplete`    |
| `searchMoleculesByFlavor(f)`| Old (public)| `/flavordb/molecules_autocomplete`   |
| `getEntitiesByName(name)`  | New (v2)    | `/api/entities/searchByName`          |
| `getEntitiesByCategory(c)` | New (v2)    | `/api/entities/searchByCategory`      |
| `getFoodPairings(entity)`  | New (v2)    | `/api/foodPairing/searchByEntity`     |
| `getMoleculesByFlavorProfile(f)` | New (v2) | `/api/molecules/searchByFlavorProfile` |

---

## 6. Algorithm Module (`lib/algorithms/flavorprint.ts`)

This is the core computational engine of the app.

### Functions

| Function                      | Input                                  | Output            | Description                                        |
| ----------------------------- | -------------------------------------- | ----------------- | -------------------------------------------------- |
| `generateFlavorPrint()`       | recipeId, title, cuisine, country, ingredients | `FlavorPrint` | Aggregates molecules, groups by 19 flavor categories |
| `calculateTwinScore()`        | source detail+fp, twin detail+fp       | `TwinResult`      | Twin = molecular similarity * ingredient difference |
| `calculatePhilosophyScore()` | ingredients array                       | `PhilosophyScore` | Avg shared molecules normalized 0-100               |
| `jaccardSimilarity()`         | setA, setB                             | `number (0-1)`    | Intersection / Union                                |
| `classifyFlavor()`            | flavor profile string                  | category string   | Maps "sweet, caramel" to "sweet" category           |
| `getMoleculesForIngredient()` | ingredient name                        | `FlavorMolecule[]`| Lookup with fuzzy matching in pre-cached data       |

### Pre-cached Data

22+ common ingredients with their FlavorDB molecules are stored directly in the algorithm file:

```
chicken, onion, garlic, tomato, cumin, coriander, yogurt, butter,
ginger, chili, lemon, cinnamon, rice, black pepper, milk, coconut,
basil, lentil, potato, carrot, olive oil, salt, water, sugar, flour, egg
```

---

## 7. State Management

### Zustand Store (`stores/app-store.ts`)

```typescript
interface AppState {
  selectedRecipe: Recipe | null;
  selectedFlavorPrint: FlavorPrint | null;
  searchResults: Recipe[];
  isSearching: boolean;
  // actions
  setSelectedRecipe: (r: Recipe | null) => void;
  setSelectedFlavorPrint: (fp: FlavorPrint | null) => void;
  setSearchResults: (r: Recipe[]) => void;
  setIsSearching: (v: boolean) => void;
}
```

### React Query (TanStack)

Configured in `providers.tsx` with:
- `staleTime: 30 * 60 * 1000` (30 minutes)
- Shared `QueryClient` across the app
- Wrapped in `QueryClientProvider`

---

## 8. TypeScript Interfaces

### Core Types (`types/index.ts`)

```typescript
Recipe              // Full recipe from RecipeDB (id, title, nutrition, region, etc.)
RecipeDetail        // { recipe: Recipe, ingredients: RecipeIngredient[] }
RecipeIngredient    // Ingredient with phrase, quantity, unit, ids
FlavorMolecule      // { common_name, flavor_profile, pubchem_id }
FlavorEntity        // FlavorDB entity with category and molecules
FlavorPrint         // Generated fingerprint: categories[], molecules[], stats
FlavorCategory      // { name, count, color, molecules[] }
TwinResult          // Twin match with scores and shared data
PhilosophyScore     // { score: 0-100, label, stats }
```

---

## 9. Environment Configuration

```env
# .env.local (optional -- app works without these)

# FlavorDB v2 API (campus-only, requires token)
NEXT_PUBLIC_FLAVORDB_V2_URL=http://cosylab.iiitd.edu.in:6969/flavordb
NEXT_PUBLIC_FLAVORDB_TOKEN=your-bearer-token

# RecipeDB v2 (works without auth)
# Base URL is hardcoded: https://cosylab.iiitd.edu.in
```

### No Auth Required

RecipeDB v2 endpoints work without authentication for the endpoints used in this app. FlavorDB v2 requires a Bearer token AND campus network access (port 6969), so the app relies on pre-cached molecule data for the demo.
