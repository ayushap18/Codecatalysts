# FlavorPrint - API Integration & Setup Guide

> How the app connects to RecipeDB and FlavorDB APIs, environment configuration, and deployment.

---

## Table of Contents

1. [Prerequisites & Software](#1-prerequisites--software)
2. [Project Setup](#2-project-setup)
3. [RecipeDB v2 API](#3-recipedb-v2-api)
4. [FlavorDB API](#4-flavordb-api)
5. [API Access Notes](#5-api-access-notes)
6. [Pre-cached Molecule Data](#6-pre-cached-molecule-data)
7. [Environment Configuration](#7-environment-configuration)
8. [Running the App](#8-running-the-app)
9. [Deployment](#9-deployment)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites & Software

### Required

| Software         | Version  | Purpose                    | Install                              |
| ---------------- | -------- | -------------------------- | ------------------------------------ |
| **Node.js**      | >= 20 LTS| Runtime                    | `brew install node` or nodejs.org    |
| **npm**          | >= 10    | Package manager            | Included with Node.js                |
| **Git**          | >= 2.40  | Version control            | `brew install git`                   |

### Recommended

| Software             | Purpose                        |
| -------------------- | ------------------------------ |
| **VS Code**          | Code editor                    |
| **Postman**          | API testing                    |

### VS Code Extensions

```
Tailwind CSS IntelliSense, ESLint, Prettier, Error Lens
```

---

## 2. Project Setup

### Step 1: Clone and Install

```bash
git clone https://github.com/ayushap18/Codecatalysts.git
cd Codecatalysts/app
npm install
```

### Step 2: Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Step 3: Build for Production

```bash
npm run build
npm start
```

### Dependencies

Core runtime dependencies:

```
next, react, react-dom                -- Framework
d3                                    -- Radial chart visualization
framer-motion                         -- Animations and transitions
zustand                               -- State management
@tanstack/react-query                 -- API data fetching/caching
lucide-react                          -- Icon library
class-variance-authority, clsx,
tailwind-merge                        -- shadcn/ui utilities
@radix-ui/*                           -- shadcn/ui primitives
```

---

## 3. RecipeDB v2 API

### Base URL

```
https://cosylab.iiitd.edu.in
```

### Endpoints Used

| Endpoint                                     | Method | Description                 | Auth Required |
| -------------------------------------------- | ------ | --------------------------- | ------------- |
| `/recipe2-api/recipe-bytitle/{title}`        | GET    | Search recipes by title     | No            |
| `/recipe2-api/search-recipe/{id}`            | GET    | Get recipe + ingredients    | No            |
| `/recipe2-api/instructions/{recipe_id}`      | GET    | Get cooking instructions    | No            |
| `/recipe2-api/recipeofday`                   | GET    | Random featured recipe      | No            |
| `/recipe2-api/recipes_cuisine/{cuisine}`     | GET    | Recipes by cuisine name     | No            |
| `/recipe2-api/recipesinfo?pageNo=&pageSize=` | GET    | Paginated recipe list       | No            |

### Response Format: Search by Title

```
GET /recipe2-api/recipe-bytitle/butter%20chicken
```

Returns an array of `Recipe` objects:

```json
[
  {
    "recipe_id": 12345,
    "recipe_title": "Butter Chicken",
    "calories": 490,
    "cook_time": "30",
    "prep_time": "15",
    "total_time": "45",
    "servings": "4",
    "region": "South Asia",
    "sub_region": "Indian",
    "continent": "Asia",
    "img_url": "https://...",
    "energy (kcal)": 490,
    "protein (g)": 32,
    "carbohydrate, by difference (g)": 12,
    "total lipid (fat) (g)": 35,
    "processes": "bake,fry,simmer",
    "vegan": "0",
    "pescetarian": "0",
    "ovo_vegetarian": "0",
    "lacto_vegetarian": "0",
    "ovo_lacto_vegetarian": "0"
  }
]
```

### Response Format: Get Recipe by ID

```
GET /recipe2-api/search-recipe/12345
```

Returns:

```json
{
  "recipe": { ... },          // Recipe object (same fields as above)
  "ingredients": [
    {
      "recipe_no": 12345,
      "ingredient_phrase": "500g chicken thigh, diced",
      "ingredient": "chicken",
      "quantity": "500",
      "unit": "g",
      "ing_id": 101,
      "ndb_id": 5064
    }
  ]
}
```

### Client Implementation

Located in `src/lib/api/recipedb.ts`:

```typescript
const BASE = "https://cosylab.iiitd.edu.in";

export async function searchRecipesByTitle(title: string) {
  const res = await fetch(`${BASE}/recipe2-api/recipe-bytitle/${encodeURIComponent(title)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function getRecipeById(id: string | number) {
  const res = await fetch(`${BASE}/recipe2-api/search-recipe/${id}`);
  if (!res.ok) throw new Error("Recipe not found");
  return res.json();
}
```

---

## 4. FlavorDB API

### Two API Versions

FlavorDB has two API versions:

| Version | Base URL | Access | Status |
| ------- | -------- | ------ | ------ |
| Old (Flask) | `https://cosylab.iiitd.edu.in/flavordb` | Public HTTPS | Partially working |
| New (Spring Boot) | `http://cosylab.iiitd.edu.in:6969/flavordb` | Campus network only | Full API |

### Old API Endpoints (Public)

| Endpoint                                | Method | Description                    |
| --------------------------------------- | ------ | ------------------------------ |
| `/flavordb/molecules_autocomplete?common_name={q}` | GET | Search molecules by name |
| `/flavordb/molecules_autocomplete?flavor_profile={q}` | GET | Search by flavor profile |

### New API v2 Endpoints (Campus Only)

| Endpoint                                          | Method | Description                   |
| ------------------------------------------------- | ------ | ----------------------------- |
| `/api/entities/searchByName?name={name}`          | GET    | Search food entities          |
| `/api/entities/searchByCategory?category={cat}`   | GET    | Entities by category          |
| `/api/foodPairing/searchByEntity?entity={entity}` | GET    | Food pairing suggestions      |
| `/api/molecules/searchByFlavorProfile?profile={p}`| GET    | Molecules by flavor profile   |
| `/api/molecules/searchByCommonName?name={name}`   | GET    | Molecules by name             |

### Authentication (v2 Only)

```
Authorization: Bearer {token}
```

The Bearer token is provided during the hackathon for campus network access.

### Client Implementation

Located in `src/lib/api/flavordb.ts`:

```typescript
// Old API (works publicly)
const OLD_BASE = "https://cosylab.iiitd.edu.in/flavordb";

export async function searchMoleculesByName(query: string) {
  const res = await fetch(`${OLD_BASE}/molecules_autocomplete?common_name=${encodeURIComponent(query)}`);
  return res.json();
}

// New API (campus only, requires token)
const V2_BASE = process.env.NEXT_PUBLIC_FLAVORDB_V2_URL || "http://cosylab.iiitd.edu.in:6969/flavordb";
const TOKEN = process.env.NEXT_PUBLIC_FLAVORDB_TOKEN || "";
```

---

## 5. API Access Notes

### RecipeDB v2 -- Works Without Auth

- All `/recipe2-api/` endpoints work over HTTPS without authentication
- No API key needed for the endpoints used in this app
- Responses are JSON with consistent structure

### FlavorDB -- Campus-Only for Full Access

- **Old API** (`/flavordb/molecules_autocomplete`): Works publicly on HTTPS but limited to molecule search
- **New API** (port 6969): Only accessible from IIIT Delhi campus network
- Port 6969 is blocked for external access -- requests will timeout from outside campus

### CORS Considerations

- RecipeDB v2 generally allows cross-origin requests
- If CORS issues arise, Next.js API routes can proxy the requests:

```typescript
// app/api/recipe/[...path]/route.ts
export async function GET(req: NextRequest) {
  const url = `https://cosylab.iiitd.edu.in/recipe2-api/${path}`;
  const res = await fetch(url);
  return NextResponse.json(await res.json());
}
```

---

## 6. Pre-cached Molecule Data

Since FlavorDB v2 requires campus access, the app includes pre-cached flavor molecule data for 22+ common ingredients directly in `src/lib/algorithms/flavorprint.ts`.

### How It Works

1. When `generateFlavorPrint()` is called with a recipe's ingredients
2. For each ingredient, `getMoleculesForIngredient()` looks up the pre-cached data
3. Fuzzy matching handles variations (e.g., "chicken thigh" matches "chicken")
4. If an ingredient isn't in the cache, it's skipped (the `analyzedCount` will be less than `ingredientCount`)

### Cached Ingredients

```
chicken, onion, garlic, tomato, cumin, coriander, yogurt, butter,
ginger, chili, lemon, cinnamon, rice, black pepper, milk, coconut,
basil, lentil, potato, carrot, olive oil, salt, water, sugar, flour, egg
```

Each entry includes an array of `FlavorMolecule` objects with `common_name`, `flavor_profile`, and optionally `pubchem_id`.

### Extending the Cache

To add more ingredients:

1. Look up the ingredient on FlavorDB (flavordb.org or via API)
2. Get the list of associated molecules and their flavor profiles
3. Add an entry to the `INGREDIENT_MOLECULES` object in `flavorprint.ts`

---

## 7. Environment Configuration

### `.env.local` (Optional)

```env
# FlavorDB v2 -- only needed on campus network
NEXT_PUBLIC_FLAVORDB_V2_URL=http://cosylab.iiitd.edu.in:6969/flavordb
NEXT_PUBLIC_FLAVORDB_TOKEN=your-bearer-token-here
```

### No Secrets Required

The app works fully without any environment variables. RecipeDB v2 endpoints work without auth, and FlavorDB molecule data is pre-cached.

---

## 8. Running the App

### Development

```bash
cd app
npm install
npm run dev
# Open http://localhost:3000
```

### Production Build

```bash
npm run build    # Creates optimized build in .next/
npm start        # Runs production server on port 3000
```

### Quick Verification

1. Open `http://localhost:3000`
2. Search for "Butter Chicken"
3. Click a recipe card
4. Verify RadialChart renders with flavor data
5. Click "Find Flavor Twins" -- verify twin search works
6. Click "Analyze Philosophy" -- verify spectrum gauge renders

---

## 9. Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect GitHub repo at vercel.com for auto-deploy
```

Vercel is the recommended deployment target because:
- Native Next.js support (built by the same team)
- Free tier is sufficient
- Auto-deploys from GitHub pushes
- No configuration needed

### Alternative: Any Node.js Host

The app is a standard Next.js application. Deploy to any platform that supports Node.js:

| Platform         | Notes                                    |
| ---------------- | ---------------------------------------- |
| **Vercel**       | Best for Next.js, free tier              |
| **Netlify**      | Good Next.js support                     |
| **Railway**      | Simple PaaS deployment                   |
| **Render**       | Free tier available                      |
| **Cloudflare Pages** | Edge deployment                      |

---

## 10. Troubleshooting

### Common Issues

**RecipeDB returns empty results:**
- Check the search query -- the API needs a reasonably specific title
- The API uses exact substring matching, not fuzzy search

**FlavorDB v2 times out:**
- Expected behavior off-campus -- port 6969 is campus-only
- The app falls back to pre-cached molecule data automatically

**CORS errors in browser:**
- RecipeDB v2 should work without CORS issues
- If blocked, create a Next.js API route proxy (see Section 5)

**RadialChart shows few categories:**
- The recipe's ingredients may not all be in the pre-cached molecule data
- Check `analyzedCount` vs `ingredientCount` in the FlavorPrint object
- Add missing ingredients to the `INGREDIENT_MOLECULES` cache

**Build errors with Suspense:**
- Pages using `useSearchParams()` must be wrapped in `<Suspense>`
- Both `/twins` and `/spectrum` pages have this wrapper

### Postman Collections

Two Postman collection JSON files are included in the repo root:

- `FlavorDB API - Complete Collection.postman_collection.json` -- 39 FlavorDB endpoints
- `rdb2_postman_collection.json` -- RecipeDB v2 endpoints

Import these into Postman to test API endpoints directly.
