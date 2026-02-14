# FlavorPrint - UI Components & Screen Specifications

> Detailed specifications for every screen, visualization component, and interactive element in the app.

---

## 1. Navigation Bar (`navbar.tsx`)

### Layout

```
+----------------------------------------------------------+
|  [Flame]  FlavorPrint    Home   Flavor Twins   Spectrum   |
+----------------------------------------------------------+
```

### Specification

| Property         | Value                                                |
| ---------------- | ---------------------------------------------------- |
| Position         | `sticky top-0 z-50`                                  |
| Background       | `bg-background/80 backdrop-blur`                     |
| Height           | `h-16` (64px)                                        |
| Border           | `border-b` (bottom)                                  |
| Container        | `max-w-6xl mx-auto px-4`                             |
| Brand icon       | Lucide `Flame`, `h-5 w-5`, `text-[#FF6F00]`         |
| Brand text       | "FlavorPrint", `font-semibold`                       |
| Nav links        | Home (`/`), Flavor Twins (`/twins`), Spectrum (`/spectrum`) |
| Active link      | `text-[#FF6F00]`                                     |
| Inactive link    | `text-muted-foreground hover:text-foreground`        |
| Link size        | `text-sm`                                            |

---

## 2. Home Page (`/`)

### Layout

```
+------------------------------------------+
|  [Navbar]                                |
+------------------------------------------+
|                                          |
|     Every dish has a                     |
|     molecular identity                   |  <- Gradient text
|                                          |
|  FlavorPrint fingerprints recipes at     |
|  the molecular level...                  |
|                                          |
|  +------------------------------------+  |
|  | [search] Search any recipe...      |  |  <- Search bar
|  +------------------------------------+  |
|                                          |
|  -- If not searched: Feature Cards --    |
|                                          |
|  +----------+ +----------+ +----------+  |
|  |[Flame]   | |[GitCmp]  | |[BarCht]  |  |
|  |FlavorPrnt| |Flvr Twins| |Philosophy|  |
|  |Generate  | |Find reci | |Classify  |  |
|  |a radial..| |pes from..| |recipes on|  |
|  +----------+ +----------+ +----------+  |
|                                          |
|  Powered by RecipeDB + FlavorDB          |
|                                          |
+------------------------------------------+
```

### Hero Section

| Element          | Style                                              |
| ---------------- | -------------------------------------------------- |
| Container        | `max-w-4xl mx-auto px-4 pt-20 pb-12 text-center`  |
| Title            | Playfair Display, `text-5xl sm:text-6xl font-bold` |
| Gradient text    | `bg-gradient-to-r from-[#FF6F00] to-[#E91E63] bg-clip-text text-transparent` |
| Subtitle         | `text-lg text-muted-foreground max-w-2xl mx-auto`  |
| Animation        | Framer Motion fade-up (0.7s)                       |

### Search Bar

| Element          | Style                                              |
| ---------------- | -------------------------------------------------- |
| Container        | `max-w-xl mx-auto mt-8 flex gap-2`                |
| Input            | shadcn Input with `pl-10` (icon space)             |
| Search icon      | `absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground` |
| Button           | `bg-[#FF6F00] hover:bg-[#E65100]`, text "Search"  |
| Placeholder      | "Search any recipe... (e.g. Butter Chicken, Ramen, Pad Thai)" |

### Search Results

| Element          | Style                                              |
| ---------------- | -------------------------------------------------- |
| Grid             | `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`         |
| Heading          | `"X recipes found"` or `"Searching..."`            |
| Card             | shadcn Card with `cursor-pointer hover:shadow-lg`  |
| Card image       | `h-36 w-full rounded-lg object-cover`              |
| Card title       | `font-semibold leading-tight`                      |
| Card metadata    | `text-xs text-muted-foreground` (region - continent - time) |
| Loading state    | 6x Skeleton cards                                  |
| Click action     | Navigate to `/recipe/{recipe_id}`                  |

### Feature Cards (shown when not searching)

| Element          | Style                                              |
| ---------------- | -------------------------------------------------- |
| Grid             | `grid gap-6 md:grid-cols-3`                        |
| Card             | shadcn Card, `h-full`                              |
| Icon             | `h-8 w-8`, colored per feature                     |
| Title            | `CardTitle mt-2 text-lg`                           |
| Description      | `text-sm text-muted-foreground`                    |

| Feature               | Icon               | Color     |
| --------------------- | ------------------ | --------- |
| FlavorPrint Visualizer | `Flame`           | `#FF6F00` |
| Cross-Cultural Twins   | `GitCompareArrows`| `#4CAF50` |
| Philosophy Spectrum    | `BarChart3`       | `#2196F3` |

---

## 3. Recipe Detail Page (`/recipe/[id]`)

### Layout

```
+------------------------------------------+
|  [Navbar]                                |
+------------------------------------------+
|  [< Back]                                |
|                                          |
|  +----------------+ +------------------+ |
|  |                | | Recipe Title     | |
|  |  [Hero Image]  | | [region] [cont.] | |
|  |  h-64/h-80     | | Clock 30min      | |
|  |                | | Users 4 servings | |
|  +----------------+ | Flame 490 cal    | |
|                     | MapPin Indian     | |
|                     |                    | |
|                     | [Cal] [Pro] [Crb] | |
|                     | [Fat]              | |
|                     |                    | |
|                     | Ingredients:       | |
|                     | [chkn] [btr] [tmt] | |
|                     +------------------+ |
|  -------- separator --------             |
|                                          |
|          FlavorPrint                     |
|     [   RadialChart 420px   ]            |
|                                          |
|  [Find Flavor Twins] [Analyze Philosophy]|
|                                          |
|  -------- separator --------             |
|                                          |
|      Philosophy Spectrum                 |
|  [    SpectrumGauge     ]                |
|                                          |
|  -------- separator --------             |
|                                          |
|  [    MoleculeTable     ]                |
+------------------------------------------+
```

### Header Grid

| Element          | Style                                              |
| ---------------- | -------------------------------------------------- |
| Layout           | `grid gap-6 md:grid-cols-[1fr_1.2fr]`              |
| Image            | `h-64 md:h-80 w-full rounded-xl object-cover`      |
| Title            | Playfair Display, `text-3xl font-bold`             |
| Badges           | shadcn Badge (default for region, outline for continent) |
| Metadata row     | `flex gap-4 text-sm text-muted-foreground`         |
| Nutrition grid   | `grid grid-cols-4 gap-3`, each a Card with centered stats |
| Ingredient list  | `flex flex-wrap gap-1.5` of Badge `variant="secondary"` |

### Action Buttons

| Button               | Style                                       |
| -------------------- | ------------------------------------------- |
| Find Flavor Twins    | `bg-[#4CAF50] hover:bg-[#388E3C]`          |
| Analyze Philosophy   | `variant="outline"`                         |
| Back                 | `variant="ghost" size="sm"` with ArrowLeft  |

---

## 4. FlavorPrint Radial Chart (`radial-chart.tsx`)

### Visual Specification

```
          sweet
           |
    cooling   bitter
       \      /
  warm  +----+  umami
       /|    |\
  citrus | ++ | floral
       \|    |/
  minty +----+  woody
       /      \
  earthy   smoky
           |
         spicy
```

### Specification

| Property         | Value                                              |
| ---------------- | -------------------------------------------------- |
| Size             | `420px` on recipe page, `300px` on spectrum page   |
| Background       | 4 concentric circles (25%, 50%, 75%, 100% radius)  |
| Circle stroke    | `#e5e5e5` (light gray)                             |
| Axis lines       | One per category, from center to edge              |
| Category labels  | Positioned outside the chart, `font-size: 10px`    |
| Data area        | Filled polygon, `rgba(255, 111, 0, 0.15)` fill    |
| Data stroke      | `#FF6F00`, 2px                                     |
| Data points      | 4px radius circles, `#FF6F00` fill                 |
| Animation        | 1000ms D3 transition for area, 500ms for points    |
| Container        | Framer Motion scale 0.8->1 + opacity fade          |

### Data Mapping

Each of the 19 flavor categories gets a spoke on the chart. The radius of each data point is:

```
radius = (categoryMoleculeCount / maxCategoryCount) * maxRadius
```

---

## 5. Molecule Table (`molecule-table.tsx`)

### Layout

```
+------------------------------------------+
|  Molecule Breakdown                      |
|  X unique molecules from Y/Z ingredients |
+------------------------------------------+
|  Molecule          | Flavor Profile | Cat |
|--------------------+----------------+-----|
|  linalool          | [floral][sweet]| flrl|
|  capsaicin         | [spicy]        | spcy|
|  cinnamaldehyde    | [warm][sweet]  | warm|
|  ...               |                |     |
+------------------------------------------+
```

### Specification

| Element          | Style                                              |
| ---------------- | -------------------------------------------------- |
| Header text      | "X unique molecules from Y/Z ingredients"          |
| Table header     | `text-left text-sm font-semibold`                  |
| Molecule name    | `font-mono text-sm` (monospace for scientific feel) |
| Flavor profile   | Array of `Badge variant="outline" text-xs`         |
| Category pill    | Colored inline block matching the flavor category color |
| Category text    | White text on colored background, `text-xs px-2 py-0.5 rounded-full` |

---

## 6. Spectrum Gauge (`spectrum-gauge.tsx`)

### Layout

```
  Contrast (East Asian)    Balanced    Pairing (Western)
  +---[============================|====]---+
  |   blue gradient        gray     orange  |
  +-------------------[marker]--------------+

  Avg shared: X.X molecules | Y pairing / Z contrast pairs
```

### Specification

| Property         | Value                                              |
| ---------------- | -------------------------------------------------- |
| Width            | Full width of container                            |
| Bar height       | ~12px with rounded corners                         |
| Gradient         | Left: blue (#2196F3) -> Center: gray -> Right: orange (#FF6F00) |
| Marker           | Animated position based on score (0-100)           |
| Labels           | Left: "Contrast (East Asian)", Right: "Pairing (Western)" |
| Center label     | "Balanced"                                         |
| Stats            | `text-xs text-muted-foreground text-center`        |
| Score display    | `{score}%` with colored background                 |

### Score-to-Color Mapping

| Score Range | Label      | Color Class                          |
| ----------- | ---------- | ------------------------------------ |
| 0-35        | Contrast   | `bg-blue-100 text-blue-700`          |
| 36-65       | Balanced   | `bg-gray-100 text-gray-700`          |
| 66-100      | Pairing    | `bg-orange-100 text-orange-700`      |

---

## 7. Twin Card (`twin-card.tsx`)

### Layout

```
+------------+     +--------+     +------------+
|  Source     |     |  87%   |     |  Twin      |
|  Recipe     |     | Molec  |     |  Recipe    |
|            |     | Match  |     |            |
| [image]    |     |        |     | [image]    |
| Title      |     | X shared|    | Title      |
| [region]   |     | molec.  |    | [region]   |
| [continent]|     | Y shared|    | [continent]|
| ingredients|     | ingred. |    | ingredients|
+------------+     +--------+     +------------+
```

### Specification

| Property         | Value                                              |
| ---------------- | -------------------------------------------------- |
| Layout           | `grid gap-6 md:grid-cols-[1fr_auto_1fr]`           |
| Source card      | Standard shadcn Card                               |
| Twin card        | shadcn Card with `border-[#FF6F00]/30`             |
| Score circle     | `h-24 w-24 rounded-full border-4 border-[#FF6F00] bg-[#FF6F00]/10` |
| Percentage text  | `text-2xl font-bold text-[#FF6F00]`                |
| "Molecular Match"| `text-sm font-semibold`                            |
| Stats            | `text-center text-xs text-muted-foreground`        |
| Card images      | `h-40 w-full rounded-lg object-cover`              |
| Card title       | `CardTitle text-lg`                                |
| Cuisine badges   | `Badge variant="secondary"` + `Badge variant="outline"` |
| Ingredients      | `text-sm text-muted-foreground`, comma-separated   |
| Animation        | Framer Motion fade-up (0.6s), score spring (0.3s delay) |

---

## 8. Loading States

### Recipe Detail Loading

```
+------------------------------------------+
|  [Navbar]                                |
|  [Skeleton h-8 w-48]        <- title    |
|  [Skeleton h-64 w-full]     <- image    |
|  [Skeleton h-[380px] w-[380px]          |
|   rounded-full mx-auto]     <- chart    |
+------------------------------------------+
```

### Home Search Loading

```
+----------+  +----------+  +----------+
|[Skel h36]|  |[Skel h36]|  |[Skel h36]|
|[Skel h5 ]|  |[Skel h5 ]|  |[Skel h5 ]|
|[Skel h4 ]|  |[Skel h4 ]|  |[Skel h4 ]|
+----------+  +----------+  +----------+
+----------+  +----------+  +----------+
|          |  |          |  |          |
+----------+  +----------+  +----------+
```

6 skeleton cards in 2-3 column grid.

### Twins/Spectrum Loading

```
+------------------------------------------+
|  [Loader2 animate-spin] Analyzing...     |
+------------------------------------------+
```

Centered `Loader2` spinner with "Analyzing..." or "Finding twins..." text.

---

## 9. Empty States

### No Search Results (Home)

After search completes with 0 results:

```
"0 recipes found"
```

Displayed as the heading text above the empty grid.

### No Twins Found

When no twins page has no results and is not loading:

```
Search for a recipe above, or click "Find Flavor Twins"
from any recipe detail page.
```

### No Spectrum Recipes

When spectrum page has no recipes and is not loading:

```
Search for recipes to see where they fall on the
Pairing-Contrast spectrum.

Compare dishes from different cuisines to discover
their cooking philosophy.
```

---

## 10. Responsive Behavior

### Breakpoints (Tailwind defaults)

| Breakpoint | Width    | Grid Changes                        |
| ---------- | -------- | ----------------------------------- |
| Default    | < 640px  | Single column, stacked layouts      |
| `sm`       | >= 640px | 2-column recipe grid                |
| `md`       | >= 768px | Twin card 3-column, recipe header side-by-side |
| `lg`       | >= 1024px| 3-column recipe grid                |

### Key Responsive Patterns

- Hero title: `text-5xl sm:text-6xl`
- Recipe header: stacked on mobile, `md:grid-cols-[1fr_1.2fr]` on desktop
- Twin comparison: stacked on mobile, `md:grid-cols-[1fr_auto_1fr]` on desktop
- Feature cards: stacked on mobile, `md:grid-cols-3` on desktop
- Recipe image: `h-64 md:h-80`
