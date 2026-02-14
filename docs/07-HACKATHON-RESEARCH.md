# FlavorPrint - ForkIT Challenge 2025 Hackathon Research & Strategy

> Complete research, API documentation, and winning strategy for the ForkIT Challenge 3rd Edition.

---

## Table of Contents

1. [Event Overview](#1-event-overview)
2. [The Organizers: CoSyLab, IIIT Delhi](#2-the-organizers-cosylab-iiit-delhi)
3. [The APIs: RecipeDB & FlavorDB Deep Dive](#3-the-apis-recipedb--flavordb-deep-dive)
4. [Other CoSyLab Tools](#4-other-cosylab-tools)
5. [Our Build: FlavorPrint -- Molecular Recipe Fingerprinting](#5-our-build-flavorprint----molecular-recipe-fingerprinting)
6. [Core Algorithms](#6-core-algorithms)
7. [Tech Stack](#7-tech-stack)
8. [Judging Criteria & How We Score High](#8-judging-criteria--how-we-score-high)
9. [Presentation & Demo Strategy](#9-presentation--demo-strategy)
10. [API Quick Reference](#10-api-quick-reference)
11. [Research Papers to Reference](#11-research-papers-to-reference)

---

## 1. Event Overview

| Detail              | Info                                                            |
| ------------------- | --------------------------------------------------------------- |
| **Event**           | FoodOScope ForkIT Challenge 2025 (3rd Edition)                  |
| **Type**            | 24-hour Hackathon                                               |
| **Date**            | 14-15 February 2026                                             |
| **Host**            | IIIT Delhi's CoSyLab (Complex Systems Laboratory)               |
| **Domain**          | Computational Gastronomy                                         |
| **Required APIs**   | RecipeDB + FlavorDB (by CoSyLab)                                |
| **Output**          | Web or Mobile application                                        |
| **Perks**           | Refreshments, overnight accommodation, internship opportunity    |
| **Showcase**        | Winning projects at Symposium on Computational Gastronomy        |

### What "Computational Gastronomy" Means

Computational gastronomy is the application of data science, machine learning, and AI to understand food -- its flavors, nutrition, cultural patterns, health impacts, and sustainability. CoSyLab pioneered this field and their APIs are the primary datasets in this domain globally.

### Why This Hackathon Matters

- **Niche domain** -- most competitors will be generalists; deep domain knowledge = huge advantage
- **Proprietary APIs** -- you cannot replicate this data elsewhere; the project must use RecipeDB/FlavorDB
- **Research visibility** -- winning projects get showcased at an academic symposium
- **Internship pipeline** -- exceptional work may lead to research internship at CoSyLab

---

## 2. The Organizers: CoSyLab, IIIT Delhi

### Lab Profile

| Detail              | Info                                                   |
| ------------------- | ------------------------------------------------------ |
| **Full Name**       | Complex Systems Laboratory                             |
| **Institution**     | IIIT Delhi (Indraprastha Institute of Information Technology) |
| **Director**        | Prof. Ganesh Bagler                                    |
| **Focus**           | Computational Gastronomy via data science and AI       |
| **Track Record**    | 50+ publications, 10+ databases, 15+ years of research|
| **Team**            | 7 PhD scholars + research interns (from Columbia, Harvard, CMU, etc.) |

### What Judges Will Look For

Based on CoSyLab's published research themes:

1. **Use both APIs deeply** -- not just a recipe search; interconnect RecipeDB + FlavorDB data
2. **Address real problems** -- nutrition, health, dietary restrictions, sustainability
3. **Apply novel algorithms** -- the lab is ML-heavy; computational approaches score high
4. **Show scientific rigor** -- reference their research, use proper food science terminology
5. **Have cultural sensitivity** -- their data spans 74 countries; cross-cultural analysis impresses
6. **Be novel** -- they've already built basic recipe search; your project must go beyond that

### CoSyLab's Existing Tools (Don't Replicate These)

| Tool             | What It Does                                    | Implication for Us                         |
| ---------------- | ----------------------------------------------- | ------------------------------------------ |
| RecipeDB         | 118K recipes across 74 countries                | Don't just rebuild recipe search           |
| FlavorDB         | 25K flavor molecules, 936 ingredients           | Use flavor chemistry as a differentiator   |
| Ratatouille      | AI recipe generation from ingredients           | Don't just make "recipe from ingredients"  |
| BitterSweet      | Predicts bitter/sweet taste of molecules        | They value taste prediction ML models      |
| DietRx           | Dietary health impact analysis                  | Health-focused projects will resonate      |
| SpiceRx          | Spice-health associations                       | Spice/herb health angle is well-researched |
| AllerStack       | Allergenicity prediction                        | Allergy-awareness features will stand out  |
| Foodle           | Culinary word game                              | Gamification of food knowledge is valued   |

---

## 3. The APIs: RecipeDB & FlavorDB Deep Dive

### 3.1 RecipeDB v2

#### Overview

| Metric            | Value                                                  |
| ----------------- | ------------------------------------------------------ |
| **Recipes**       | 118,000+                                                |
| **Continents**    | 6                                                       |
| **Regions**       | 26 geo-cultural regions                                 |
| **Countries**     | 74                                                      |
| **Ingredients**   | 23,500+                                                 |
| **Cooking Processes** | 268 (heat, boil, bake, simmer, fry, etc.)           |
| **Data Sources**  | Recipes + FlavorDB (flavors) + USDA (nutrition) + Medline (health) |
| **License**       | CC BY-NC-SA 3.0                                         |

#### Working API Endpoints

Base URL: `https://cosylab.iiitd.edu.in`

```
GET  /recipe2-api/recipe-bytitle/{title}
     -> Returns: Recipe[] (search by title substring)

GET  /recipe2-api/search-recipe/{id}
     -> Returns: { recipe: Recipe, ingredients: RecipeIngredient[] }

GET  /recipe2-api/instructions/{recipe_id}
     -> Returns: Cooking instructions

GET  /recipe2-api/recipeofday
     -> Returns: Featured recipe

GET  /recipe2-api/recipes_cuisine/{cuisine_name}
     -> Returns: Recipe[] filtered by cuisine

GET  /recipe2-api/recipesinfo?pageNo={n}&pageSize={s}
     -> Returns: Paginated recipe list
```

#### Actual Data Model (Verified from API responses)

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
  img_url?: string;
  "energy (kcal)": number;
  "protein (g)": number;
  "carbohydrate, by difference (g)": number;
  "total lipid (fat) (g)": number;
  processes: string;
  utensils?: string;
  vegan: string;
  pescetarian: string;
  ovo_vegetarian: string;
  lacto_vegetarian: string;
  ovo_lacto_vegetarian: string;
}

interface RecipeIngredient {
  recipe_no: number;
  ingredient_phrase: string;
  ingredient: string;
  quantity: string;
  unit?: string;
  ing_id: number;
  ndb_id?: number;
  state?: string;
}
```

---

### 3.2 FlavorDB

#### Overview

| Metric                | Value                                     |
| --------------------- | ----------------------------------------- |
| **Flavor Molecules**  | 25,595 total                              |
| **Mapped Molecules**  | 2,254 linked to ingredients               |
| **Natural Ingredients** | 936                                     |
| **Ingredient Categories** | 34                                   |
| **Data Includes**     | Physicochemical properties, sensory data  |
| **License**           | CC BY-NC-SA 3.0                           |
| **Cited In**          | Nucleic Acids Research (2017)             |

#### Access Situation

| Version      | Base URL                                        | Access          |
| ------------ | ----------------------------------------------- | --------------- |
| Old (Flask)  | `https://cosylab.iiitd.edu.in/flavordb`        | Public HTTPS    |
| New (Spring) | `http://cosylab.iiitd.edu.in:6969/flavordb`    | Campus only     |

Old API (works publicly):
```
GET  /flavordb/molecules_autocomplete?common_name={query}
GET  /flavordb/molecules_autocomplete?flavor_profile={query}
```

New API v2 (campus network only, requires Bearer token):
```
GET  /api/entities/searchByName?name={name}
GET  /api/entities/searchByCategory?category={category}
GET  /api/foodPairing/searchByEntity?entity={entity}
GET  /api/molecules/searchByFlavorProfile?profile={profile}
GET  /api/molecules/searchByCommonName?name={name}
```

#### The Flavor Network Concept

FlavorDB contains an implicit **Flavor Network** where:
- **Nodes** = ingredients
- **Edges** = shared flavor molecules between ingredients
- **Weight** = number of shared molecules

This network is the basis for **food pairing theory**: ingredients that share more flavor molecules tend to pair well together. Western cuisines tend to pair ingredients that share compounds; East Asian cuisines tend to pair ingredients that DON'T share compounds.

**This is our most powerful differentiator.** Most hackathon teams will ignore the flavor network.

---

## 4. Other CoSyLab Tools

| Tool          | Concept We Borrowed                                             |
| ------------- | --------------------------------------------------------------- |
| **BitterSweet** | Taste prediction -- our flavor classification draws on this   |
| **DietRx**    | Disease-diet associations -- health context for recipes         |
| **SpiceRx**   | Spice health benefits -- referenced in research                |
| **Foodle**    | Gamification -- our "twin discovery" makes exploration fun      |

---

## 5. Our Build: FlavorPrint -- Molecular Recipe Fingerprinting

### Vision

FlavorPrint treats every recipe as a unique molecular fingerprint. By analyzing the flavor molecules present in each ingredient, we create a visual "FlavorPrint" that reveals the hidden molecular identity of any dish.

### Three Core Features

#### Feature 1: FlavorPrint Visualizer

A D3.js radial/polar chart that fingerprints any recipe's molecular composition across 19 flavor categories (sweet, bitter, umami, floral, woody, smoky, spicy, fruity, sour, nutty, meaty, creamy, herbal, earthy, minty, citrus, warm, cooling, other).

**Why it impresses judges:** Novel visualization that makes FlavorDB data tangible. No one else will have this.

#### Feature 2: Cross-Cultural Flavor Twins

Find recipes from different countries that taste molecularly similar despite using completely different ingredients. Searches across 15 diverse cuisines.

Twin Score formula: `molecularSimilarity * ingredientDifference`

This means two recipes score highest when they share many flavor molecules but use different ingredients -- true "flavor twins."

**Why it impresses judges:** Uses both APIs deeply, applies the flavor network concept from their research, demonstrates cross-cultural food analysis across 74 countries.

#### Feature 3: Philosophy Spectrum

Classify any recipe on the Pairing-vs-Contrast spectrum based on Ahn et al.'s food pairing hypothesis.

- **Pairing (Western):** Ingredients share many flavor molecules
- **Contrast (East Asian):** Ingredients share few flavor molecules
- Score 0 = pure contrast, 100 = pure pairing

**Why it impresses judges:** Directly references their most important research paper. Shows deep domain understanding.

### Screen Flow

```
Home (Search + Features)
  |
  +-> Recipe Results Grid
  |     |
  |     +-> Recipe Detail (/recipe/[id])
  |           |
  |           +-> FlavorPrint RadialChart
  |           +-> Philosophy Spectrum Gauge
  |           +-> Molecule Breakdown Table
  |           +-> [Find Flavor Twins] -> /twins?recipeId=X
  |           +-> [Analyze Philosophy] -> /spectrum?recipeId=X
  |
  +-> Flavor Twins (/twins)
  |     +-> Search across 15 cuisines
  |     +-> Top 5 twins with TwinCard comparison
  |
  +-> Spectrum (/spectrum)
        +-> Add multiple recipes
        +-> Compare on Pairing-Contrast spectrum
```

---

## 6. Core Algorithms

### FlavorPrint Generation

```
1. For each ingredient in recipe:
   -> Look up pre-cached flavor molecules
   -> Each molecule has a flavor_profile (e.g., "sweet, caramel")
   -> Classify into one of 19 categories
2. Aggregate all molecules by category
3. Count unique molecules per category
4. Output: FlavorPrint { categories[], totalMolecules, molecules[] }
```

### Flavor Twin Matching

```
1. Source: Generate FlavorPrint for input recipe
2. For each of 15 diverse cuisines:
   -> Search RecipeDB for top recipes
   -> Generate FlavorPrint for each candidate
3. Calculate TwinScore:
   -> molecularSimilarity = Jaccard(sourceMolecules, twinMolecules)
   -> ingredientDifference = 1 - Jaccard(sourceIngredients, twinIngredients)
   -> twinScore = molecularSimilarity * ingredientDifference
4. Return top 5 by twinScore
```

### Philosophy Spectrum Score

```
1. For each pair of ingredients in recipe:
   -> Get molecule sets for both ingredients
   -> Count shared molecules
2. Calculate average shared molecules per pair
3. Normalize to 0-100 scale:
   -> 0-35 = "Contrast" (East Asian style)
   -> 36-65 = "Balanced"
   -> 66-100 = "Pairing" (Western style)
```

### Jaccard Similarity

```
J(A, B) = |A ∩ B| / |A ∪ B|
```

Used for both molecular overlap and ingredient overlap calculations.

---

## 7. Tech Stack

```
FRAMEWORK:        Next.js 14+ (App Router) + TypeScript
STYLING:          Tailwind CSS v4 + shadcn/ui
VISUALIZATION:    D3.js (FlavorPrint radial chart)
ANIMATION:        Framer Motion (page transitions, spring physics)
API CACHING:      TanStack React Query (30min staleTime)
STATE:            Zustand (minimal global state)
ICONS:            Lucide React
DEPLOYMENT:       Vercel (one-click, free tier)
```

### Why This Stack

| Choice          | Reason                                                   |
| --------------- | -------------------------------------------------------- |
| Next.js         | No separate backend needed; file-based routing           |
| Tailwind + shadcn| Pre-built components, instant professional UI           |
| D3.js           | Best for custom polar/radar visualization                |
| Framer Motion   | Smooth transitions with minimal code                     |
| TanStack Query  | Handles RecipeDB/FlavorDB caching automatically          |
| Vercel          | Deploy in 30 seconds; free; no DevOps                    |

---

## 8. Judging Criteria & How We Score High

### Innovation / Novelty (30%)

| What They Want                        | How We Score                                     |
| ------------------------------------- | ------------------------------------------------ |
| Something they haven't seen before    | FlavorPrint radial visualization (unique visual)  |
| Creative use of both APIs together    | Molecular fingerprinting combines RecipeDB + FlavorDB |
| Novel algorithms                      | Twin score, philosophy spectrum, Jaccard similarity |
| Goes beyond simple CRUD               | Scientific data visualization, not just recipe search |

### Technical Complexity (25%)

| What They Want                        | How We Score                                     |
| ------------------------------------- | ------------------------------------------------ |
| Sophisticated engineering             | D3.js custom visualization, client-side algorithms |
| Algorithm design                      | Jaccard similarity, twin matching across 15 cuisines |
| API integration depth                 | RecipeDB search + detail + FlavorDB molecules    |
| Code quality                          | TypeScript, clean component architecture         |

### UI/UX & Design (20%)

| What They Want                        | How We Score                                     |
| ------------------------------------- | ------------------------------------------------ |
| Polished, professional look           | shadcn/ui + Tailwind = instant polish            |
| Intuitive user flow                   | Search -> Recipe -> FlavorPrint -> Twins/Spectrum |
| Visual storytelling                   | RadialChart + SpectrumGauge + TwinCard           |
| Responsive                            | Tailwind responsive grid on all pages            |

### Impact & Usefulness (15%)

| What They Want                        | How We Score                                     |
| ------------------------------------- | ------------------------------------------------ |
| Solves a real problem                 | Makes molecular gastronomy accessible to everyone |
| Practical use                         | Discover hidden connections between cuisines     |
| Cultural angle                        | Cross-cultural twin discovery across 74 countries |
| Scalable concept                      | Can extend to all 118K recipes + full FlavorDB   |

### Presentation & Demo (10%)

| What They Want                        | How We Score                                     |
| ------------------------------------- | ------------------------------------------------ |
| Clear problem statement               | "Every dish has a molecular identity"            |
| Live demo that works                  | Pre-cached data ensures reliability              |
| Technical depth in Q&A                | Know algorithms cold; reference their papers     |
| Visual wow factor                     | RadialChart animation is the "wow moment"        |

---

## 9. Presentation & Demo Strategy

### The 5-Minute Pitch

```
[0:00 - 0:30]  THE HOOK
  "Did you know Indian Butter Chicken and Mexican Mole share 47
   flavor molecules despite having zero ingredients in common?
   FlavorPrint reveals these hidden molecular connections."

[0:30 - 1:00]  THE PROBLEM
  "118,000 recipes. 25,595 flavor molecules. The data exists,
   but no one can SEE the molecular identity of their food.
   FlavorPrint makes the invisible, visible."

[1:00 - 3:30]  LIVE DEMO
  1. Search "Butter Chicken" -> click a result
  2. Show the RadialChart -> "This is its molecular fingerprint"
  3. Scroll to Philosophy Spectrum -> "It's a Pairing-style dish"
  4. Click "Find Flavor Twins" -> show cross-cultural matches
  5. Show a surprising twin from a different continent

[3:30 - 4:15]  TECHNICAL DEPTH
  "Under the hood, we use Jaccard similarity on FlavorDB molecule
   sets to compute molecular overlap. Twin Score multiplies
   molecular similarity by ingredient difference -- so two recipes
   score highest when they taste the same but use completely
   different ingredients. The Philosophy Spectrum references
   Ahn et al.'s food pairing hypothesis from Scientific Reports."

[4:15 - 5:00]  IMPACT & VISION
  "FlavorPrint makes computational gastronomy tangible.
   A home cook discovers why their favorite spices work.
   A chef finds inspiration from a cuisine they've never tried.
   A researcher sees cross-cultural patterns at molecular scale.
   This is what CoSyLab's data was meant to reveal."
```

### Demo Tips

- **Pre-load data**: The 22+ pre-cached ingredients ensure instant FlavorPrint generation
- **Have a scripted path**: Follow the exact demo steps above
- **Show the RadialChart**: The animated D3 visualization is the "wow moment"
- **Mention their research**: Name-drop FlavorDB, RecipeDB, and the Ahn et al. paper
- **Backup plan**: Record a demo video beforehand in case live demo has issues

---

## 10. API Quick Reference

### RecipeDB Calls (Used in the App)

```typescript
const BASE = "https://cosylab.iiitd.edu.in";

// Search by title
fetch(`${BASE}/recipe2-api/recipe-bytitle/${title}`)

// Get recipe + ingredients
fetch(`${BASE}/recipe2-api/search-recipe/${id}`)

// Get recipes by cuisine
fetch(`${BASE}/recipe2-api/recipes_cuisine/${cuisine}`)

// Recipe of the day
fetch(`${BASE}/recipe2-api/recipeofday`)
```

### FlavorDB Calls (Partially Used)

```typescript
// Old API (works publicly)
fetch(`https://cosylab.iiitd.edu.in/flavordb/molecules_autocomplete?common_name=${query}`)

// New API (campus only, requires Bearer token)
fetch(`http://cosylab.iiitd.edu.in:6969/flavordb/api/entities/searchByName?name=${name}`, {
  headers: { Authorization: `Bearer ${token}` }
})
```

---

## 11. Research Papers to Reference

Mentioning these in the presentation shows domain understanding and will impress the judges:

### Must-Reference

1. **"FlavorDB: a database of flavor molecules"**
   - Neelansh Garg et al., Nucleic Acids Research, 2017
   - The core FlavorDB paper; explains flavor network theory

2. **"Flavor network and the principles of food pairing"**
   - Ahn et al., Scientific Reports, 2011
   - The famous paper behind our Philosophy Spectrum
   - Key finding: Western cuisines pair shared compounds; East Asian cuisines contrast

3. **"RecipeDB: a resource for exploring recipes"**
   - CoSyLab publication
   - Describes the 118K recipe dataset

4. **"Computational Gastronomy: A Data Science Approach to Food"**
   - Ganesh Bagler et al.
   - Foundational paper defining the field

### How to Reference in the Pitch

> "Our FlavorPrint algorithm is built on the flavor network concept described in Garg et al.'s FlavorDB paper -- where ingredients sharing more volatile compounds tend to pair well. Our Philosophy Spectrum directly implements the Ahn et al. finding from Scientific Reports 2011: Western cuisines maximize shared compounds while East Asian cuisines minimize them."

---

## Key Differentiators (What Makes Us Stand Out)

```
1. UNIQUE VISUALIZATION    -- No one else will have a molecular fingerprint radial chart
2. DEEP API INTEGRATION    -- We cross-reference RecipeDB ingredients with FlavorDB molecules
3. NOVEL ALGORITHMS        -- Twin score, philosophy spectrum, Jaccard-based molecular overlap
4. SCIENTIFIC GROUNDING    -- We reference their actual research papers
5. CROSS-CULTURAL INSIGHT  -- Twin discovery across 15 cuisines and 74 countries
6. POLISHED UI             -- shadcn/ui + D3.js + Framer Motion = professional quality
7. RELIABLE DEMO           -- Pre-cached molecule data means no API failures during demo
8. CLEAR NARRATIVE          -- "Every dish has a molecular identity"
```
