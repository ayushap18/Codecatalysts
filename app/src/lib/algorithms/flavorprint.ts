import type { FlavorCategory, FlavorPrint, FlavorMolecule, RecipeIngredient, PhilosophyScore, TwinResult, RecipeDetail } from "@/types";
import { getEntitiesByName } from "@/lib/api/flavordb";

// Flavor categories with assigned colors
const FLAVOR_CATEGORIES: Record<string, string> = {
  sweet: "#FFB74D",
  bitter: "#8D6E63",
  umami: "#EF5350",
  floral: "#BA68C8",
  woody: "#795548",
  smoky: "#78909C",
  spicy: "#FF7043",
  fruity: "#66BB6A",
  sour: "#FDD835",
  nutty: "#A1887F",
  meaty: "#D32F2F",
  creamy: "#FFF176",
  herbal: "#81C784",
  earthy: "#6D4C41",
  minty: "#4DD0E1",
  citrus: "#FFD54F",
  warm: "#FF8A65",
  cooling: "#4FC3F7",
  other: "#90A4AE",
};

// Map a flavor profile string to its category
export function classifyFlavor(profile: string): string {
  const lower = profile.toLowerCase();
  for (const [cat] of Object.entries(FLAVOR_CATEGORIES)) {
    if (lower.includes(cat)) return cat;
  }
  if (lower.includes("roast") || lower.includes("toast")) return "warm";
  if (lower.includes("green") || lower.includes("grass")) return "herbal";
  if (lower.includes("butter") || lower.includes("cream") || lower.includes("fat")) return "creamy";
  if (lower.includes("pepper") || lower.includes("pungent")) return "spicy";
  if (lower.includes("lemon") || lower.includes("orange") || lower.includes("lime")) return "citrus";
  if (lower.includes("meat") || lower.includes("broth")) return "meaty";
  if (lower.includes("mushroom") || lower.includes("soil")) return "earthy";
  if (lower.includes("camphor") || lower.includes("menthol")) return "cooling";
  if (lower.includes("smoke") || lower.includes("char")) return "smoky";
  if (lower.includes("rose") || lower.includes("violet") || lower.includes("jasmine")) return "floral";
  if (lower.includes("apple") || lower.includes("berry") || lower.includes("banana")) return "fruity";
  if (lower.includes("nut") || lower.includes("almond") || lower.includes("hazel")) return "nutty";
  if (lower.includes("wood") || lower.includes("cedar") || lower.includes("oak")) return "woody";
  return "other";
}

// Known ingredient → molecules mapping for demo (pre-cached)
const INGREDIENT_MOLECULES: Record<string, FlavorMolecule[]> = {
  chicken: [
    { common_name: "Hexanal", flavor_profile: "green, fatty, grassy" },
    { common_name: "Nonanal", flavor_profile: "fatty, citrus, green" },
    { common_name: "2-Methylfuran", flavor_profile: "meaty, earthy" },
    { common_name: "Octanal", flavor_profile: "fatty, soapy, citrus" },
  ],
  onion: [
    { common_name: "Dipropyl disulfide", flavor_profile: "onion, spicy" },
    { common_name: "Propanethiol", flavor_profile: "onion, meaty" },
    { common_name: "Thiopropanal S-oxide", flavor_profile: "pungent, spicy" },
    { common_name: "Dimethyl trisulfide", flavor_profile: "meaty, sulfurous" },
  ],
  garlic: [
    { common_name: "Allicin", flavor_profile: "garlic, pungent, spicy" },
    { common_name: "Diallyl disulfide", flavor_profile: "garlic, warm" },
    { common_name: "Allyl methyl sulfide", flavor_profile: "garlic, herbal" },
    { common_name: "Dimethyl trisulfide", flavor_profile: "meaty, sulfurous" },
  ],
  tomato: [
    { common_name: "Hexanal", flavor_profile: "green, fatty, grassy" },
    { common_name: "cis-3-Hexenal", flavor_profile: "green, fresh" },
    { common_name: "Beta-ionone", flavor_profile: "floral, woody, fruity" },
    { common_name: "2-Isobutylthiazole", flavor_profile: "green, tomato" },
    { common_name: "Geranial", flavor_profile: "citrus, lemon" },
  ],
  cumin: [
    { common_name: "Cuminaldehyde", flavor_profile: "spicy, cumin, warm" },
    { common_name: "Gamma-terpinene", flavor_profile: "herbal, citrus" },
    { common_name: "Beta-pinene", flavor_profile: "woody, green" },
    { common_name: "p-Cymene", flavor_profile: "citrus, woody, spicy" },
  ],
  coriander: [
    { common_name: "Linalool", flavor_profile: "floral, sweet, citrus" },
    { common_name: "(E)-2-Decenal", flavor_profile: "fatty, green" },
    { common_name: "2-Dodecenal", flavor_profile: "fatty, soapy" },
    { common_name: "Decanal", flavor_profile: "sweet, citrus, floral" },
  ],
  yogurt: [
    { common_name: "Diacetyl", flavor_profile: "butter, creamy, sweet" },
    { common_name: "Acetaldehyde", flavor_profile: "fruity, fresh, sweet" },
    { common_name: "Acetoin", flavor_profile: "butter, creamy" },
    { common_name: "Lactic acid", flavor_profile: "sour, mild" },
  ],
  butter: [
    { common_name: "Diacetyl", flavor_profile: "butter, creamy, sweet" },
    { common_name: "Delta-decalactone", flavor_profile: "creamy, peach" },
    { common_name: "Butyric acid", flavor_profile: "butter, sour, cheesy" },
    { common_name: "Acetoin", flavor_profile: "butter, creamy" },
  ],
  ginger: [
    { common_name: "Gingerol", flavor_profile: "spicy, warm, pungent" },
    { common_name: "Zingiberene", flavor_profile: "warm, woody" },
    { common_name: "Beta-sesquiphellandrene", flavor_profile: "woody, spicy" },
    { common_name: "Citral", flavor_profile: "citrus, lemon, sweet" },
  ],
  chili: [
    { common_name: "Capsaicin", flavor_profile: "spicy, hot, pungent" },
    { common_name: "Dihydrocapsaicin", flavor_profile: "spicy, hot" },
    { common_name: "Beta-carotene", flavor_profile: "earthy" },
  ],
  lemon: [
    { common_name: "Limonene", flavor_profile: "citrus, lemon, fresh" },
    { common_name: "Citral", flavor_profile: "citrus, lemon, sweet" },
    { common_name: "Linalool", flavor_profile: "floral, sweet, citrus" },
    { common_name: "Alpha-terpineol", flavor_profile: "floral, sweet" },
  ],
  cinnamon: [
    { common_name: "Cinnamaldehyde", flavor_profile: "sweet, warm, spicy" },
    { common_name: "Eugenol", flavor_profile: "spicy, warm, woody" },
    { common_name: "Coumarin", flavor_profile: "sweet, warm, nutty" },
    { common_name: "Linalool", flavor_profile: "floral, sweet, citrus" },
  ],
  rice: [
    { common_name: "2-Acetyl-1-pyrroline", flavor_profile: "nutty, warm, popcorn" },
    { common_name: "Hexanal", flavor_profile: "green, fatty, grassy" },
    { common_name: "Nonanal", flavor_profile: "fatty, citrus, green" },
  ],
  "black pepper": [
    { common_name: "Piperine", flavor_profile: "spicy, pungent, warm" },
    { common_name: "Beta-caryophyllene", flavor_profile: "woody, spicy" },
    { common_name: "Limonene", flavor_profile: "citrus, lemon, fresh" },
    { common_name: "Alpha-pinene", flavor_profile: "woody, green" },
  ],
  milk: [
    { common_name: "Diacetyl", flavor_profile: "butter, creamy, sweet" },
    { common_name: "Delta-decalactone", flavor_profile: "creamy, peach" },
    { common_name: "Butyric acid", flavor_profile: "butter, sour, cheesy" },
  ],
  coconut: [
    { common_name: "Delta-octalactone", flavor_profile: "sweet, creamy, coconut" },
    { common_name: "Delta-decalactone", flavor_profile: "creamy, peach" },
    { common_name: "Nonanal", flavor_profile: "fatty, citrus, green" },
  ],
  basil: [
    { common_name: "Linalool", flavor_profile: "floral, sweet, citrus" },
    { common_name: "Eugenol", flavor_profile: "spicy, warm, woody" },
    { common_name: "Estragole", flavor_profile: "sweet, herbal" },
    { common_name: "1,8-Cineole", flavor_profile: "minty, cooling" },
  ],
  lentil: [
    { common_name: "Hexanal", flavor_profile: "green, fatty, grassy" },
    { common_name: "Nonanal", flavor_profile: "fatty, citrus, green" },
    { common_name: "1-Octen-3-ol", flavor_profile: "earthy, mushroom" },
  ],
  potato: [
    { common_name: "Methional", flavor_profile: "earthy, potato, meaty" },
    { common_name: "2-Ethyl-3-methylpyrazine", flavor_profile: "nutty, roasted, earthy" },
    { common_name: "Nonanal", flavor_profile: "fatty, citrus, green" },
  ],
  carrot: [
    { common_name: "Beta-carotene", flavor_profile: "earthy" },
    { common_name: "Myristicin", flavor_profile: "woody, warm, spicy" },
    { common_name: "Terpinolene", flavor_profile: "herbal, sweet, citrus" },
  ],
  "olive oil": [
    { common_name: "Hexanal", flavor_profile: "green, fatty, grassy" },
    { common_name: "cis-3-Hexenal", flavor_profile: "green, fresh" },
    { common_name: "Oleocanthal", flavor_profile: "pungent, bitter, spicy" },
  ],
  salt: [],
  water: [],
  sugar: [
    { common_name: "Furaneol", flavor_profile: "sweet, caramel, fruity" },
    { common_name: "Maltol", flavor_profile: "sweet, caramel, warm" },
  ],
  flour: [
    { common_name: "Hexanal", flavor_profile: "green, fatty, grassy" },
  ],
  egg: [
    { common_name: "Hydrogen sulfide", flavor_profile: "sulfurous, meaty" },
    { common_name: "Dimethyl sulfide", flavor_profile: "sulfurous, sweet" },
    { common_name: "Nonanal", flavor_profile: "fatty, citrus, green" },
  ],
};

// Get molecules for an ingredient by matching against our static cache (sync)
export function getMoleculesForIngredient(ingredientName: string): FlavorMolecule[] {
  const lower = ingredientName.toLowerCase().trim();
  // Direct match
  if (INGREDIENT_MOLECULES[lower]) return INGREDIENT_MOLECULES[lower];
  // Partial match
  for (const [key, mols] of Object.entries(INGREDIENT_MOLECULES)) {
    if (lower.includes(key) || key.includes(lower)) return mols;
  }
  return [];
}

// Runtime cache for FlavorDB lookups (avoids repeated API calls within session)
const RUNTIME_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const _runtimeMoleculeCache: Record<string, { molecules: FlavorMolecule[]; cachedAt: number }> = {};

function getRuntimeCache(key: string): FlavorMolecule[] | null {
  const entry = _runtimeMoleculeCache[key];
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > RUNTIME_CACHE_TTL) {
    delete _runtimeMoleculeCache[key];
    return null;
  }
  return entry.molecules;
}

function setRuntimeCache(key: string, molecules: FlavorMolecule[]): void {
  _runtimeMoleculeCache[key] = { molecules, cachedAt: Date.now() };
}

/** Async molecule lookup: tries static cache first, then FlavorDB API */
export async function getMoleculesForIngredientAsync(ingredientName: string): Promise<FlavorMolecule[]> {
  const lower = ingredientName.toLowerCase().trim();
  // 1. Static cache (instant, 0 API calls)
  const staticResult = getMoleculesForIngredient(lower);
  if (staticResult.length > 0) return staticResult;
  // Skip known empty ingredients
  if (INGREDIENT_MOLECULES[lower]?.length === 0) return [];

  // 2. Runtime cache (with TTL)
  const cached = getRuntimeCache(lower);
  if (cached !== null) return cached;

  // 3. FlavorDB API (cached in localStorage for 24h)
  try {
    const result = await getEntitiesByName(lower);
    const entities = result?.content || [];
    if (entities.length === 0) {
      setRuntimeCache(lower, []);
      return [];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entity = entities[0] as any;
    const molecules: FlavorMolecule[] = (entity.molecules || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (m: any) => ({
        common_name: m.common_name || m.commonName || m.common_Name || "Unknown",
        flavor_profile: m.flavor_profile || m.flavorProfile || m.flavor_Profile || "other",
        pubchem_id: m.pubchem_id || m.pubchemId,
      })
    );
    setRuntimeCache(lower, molecules);
    return molecules;
  } catch {
    setRuntimeCache(lower, []);
    return [];
  }
}

// Generate FlavorPrint for a recipe (sync — uses static cache only)
export function generateFlavorPrint(
  recipeId: number,
  recipeTitle: string,
  cuisine: string,
  country: string,
  ingredients: RecipeIngredient[]
): FlavorPrint {
  const allMolecules: FlavorMolecule[] = [];
  let analyzedCount = 0;

  for (const ing of ingredients) {
    const mols = getMoleculesForIngredient(ing.ingredient);
    if (mols.length > 0) analyzedCount++;
    allMolecules.push(...mols);
  }

  return buildFlavorPrint(recipeId, recipeTitle, cuisine, country, ingredients.length, analyzedCount, allMolecules);
}

/** Async FlavorPrint generation — uses FlavorDB API fallback for unknown ingredients */
export async function generateFlavorPrintAsync(
  recipeId: number,
  recipeTitle: string,
  cuisine: string,
  country: string,
  ingredients: RecipeIngredient[]
): Promise<FlavorPrint> {
  const allMolecules: FlavorMolecule[] = [];
  let analyzedCount = 0;

  // Fetch molecules for all ingredients in parallel
  const results = await Promise.all(
    ingredients.map((ing) => getMoleculesForIngredientAsync(ing.ingredient))
  );

  for (const mols of results) {
    if (mols.length > 0) analyzedCount++;
    allMolecules.push(...mols);
  }

  return buildFlavorPrint(recipeId, recipeTitle, cuisine, country, ingredients.length, analyzedCount, allMolecules);
}

// Shared FlavorPrint builder
function buildFlavorPrint(
  recipeId: number,
  recipeTitle: string,
  cuisine: string,
  country: string,
  ingredientCount: number,
  analyzedCount: number,
  allMolecules: FlavorMolecule[]
): FlavorPrint {
  // Group by flavor category
  const categoryMap: Record<string, string[]> = {};
  for (const mol of allMolecules) {
    const profiles = mol.flavor_profile.split(",").map((s) => s.trim());
    for (const profile of profiles) {
      const cat = classifyFlavor(profile);
      if (!categoryMap[cat]) categoryMap[cat] = [];
      if (!categoryMap[cat].includes(mol.common_name)) {
        categoryMap[cat].push(mol.common_name);
      }
    }
  }

  const categories: FlavorCategory[] = Object.entries(categoryMap)
    .map(([name, molecules]) => ({
      name,
      count: molecules.length,
      color: FLAVOR_CATEGORIES[name] || "#90A4AE",
      molecules,
    }))
    .sort((a, b) => b.count - a.count);

  // Unique molecules
  const uniqueMols = Array.from(
    new Map(allMolecules.map((m) => [m.common_name, m])).values()
  );

  return {
    recipeId,
    recipeTitle,
    cuisine,
    country,
    categories,
    totalMolecules: uniqueMols.length,
    ingredientCount,
    analyzedCount,
    molecules: uniqueMols,
  };
}

// Calculate Jaccard similarity between two molecule sets
export function jaccardSimilarity(setA: string[], setB: string[]): number {
  const a = new Set(setA);
  const b = new Set(setB);
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

// Find flavor twins: high molecular overlap, low ingredient overlap
export function calculateTwinScore(
  sourceDetail: RecipeDetail,
  sourceFlavorPrint: FlavorPrint,
  twinDetail: RecipeDetail,
  twinFlavorPrint: FlavorPrint
): TwinResult {
  const sourceMolNames = sourceFlavorPrint.molecules.map((m) => m.common_name);
  const twinMolNames = twinFlavorPrint.molecules.map((m) => m.common_name);

  const sourceIngNames = sourceDetail.ingredients.map((i) => i.ingredient.toLowerCase());
  const twinIngNames = twinDetail.ingredients.map((i) => i.ingredient.toLowerCase());

  const molecularSimilarity = jaccardSimilarity(sourceMolNames, twinMolNames);
  const ingredientSimilarity = jaccardSimilarity(sourceIngNames, twinIngNames);
  const ingredientDifference = 1 - ingredientSimilarity;

  const twinScore = molecularSimilarity * ingredientDifference;

  const sharedMolecules = sourceMolNames.filter((m) => twinMolNames.includes(m));
  const sharedIngredients = sourceIngNames.filter((i) => twinIngNames.includes(i));

  return {
    source: sourceDetail,
    twin: twinDetail,
    sourceFlavorPrint,
    twinFlavorPrint,
    twinScore,
    molecularSimilarity,
    ingredientDifference,
    sharedMolecules,
    sharedIngredients,
  };
}

// Calculate philosophy spectrum score (sync)
export function calculatePhilosophyScore(
  ingredients: RecipeIngredient[]
): PhilosophyScore {
  const ingMolecules: Record<string, string[]> = {};

  for (const ing of ingredients) {
    const mols = getMoleculesForIngredient(ing.ingredient);
    ingMolecules[ing.ingredient] = mols.map((m) => m.common_name);
  }

  return computePhilosophy(ingMolecules);
}

/** Async philosophy score — uses FlavorDB fallback */
export async function calculatePhilosophyScoreAsync(
  ingredients: RecipeIngredient[]
): Promise<PhilosophyScore> {
  const ingMolecules: Record<string, string[]> = {};

  const results = await Promise.all(
    ingredients.map(async (ing) => {
      const mols = await getMoleculesForIngredientAsync(ing.ingredient);
      return { name: ing.ingredient, mols };
    })
  );

  for (const { name, mols } of results) {
    ingMolecules[name] = mols.map((m) => m.common_name);
  }

  return computePhilosophy(ingMolecules);
}

// Shared philosophy computation
function computePhilosophy(ingMolecules: Record<string, string[]>): PhilosophyScore {
  const ingNames = Object.keys(ingMolecules).filter(
    (name) => ingMolecules[name].length > 0
  );

  let totalShared = 0;
  let totalPairs = 0;
  let pairingPairs = 0;
  let contrastPairs = 0;

  for (let i = 0; i < ingNames.length; i++) {
    for (let j = i + 1; j < ingNames.length; j++) {
      const molsA = new Set(ingMolecules[ingNames[i]]);
      const molsB = new Set(ingMolecules[ingNames[j]]);
      const shared = [...molsA].filter((m) => molsB.has(m)).length;
      totalShared += shared;
      totalPairs++;
      if (shared > 0) pairingPairs++;
      else contrastPairs++;
    }
  }

  const avgShared = totalPairs > 0 ? totalShared / totalPairs : 0;
  const baseline = 0.5;
  const normalized = Math.min(100, Math.max(0, (avgShared / (baseline * 2)) * 100));

  let label: "Contrast" | "Balanced" | "Pairing" = "Balanced";
  if (normalized < 35) label = "Contrast";
  else if (normalized > 65) label = "Pairing";

  return {
    score: Math.round(normalized),
    label,
    avgSharedMolecules: Math.round(avgShared * 100) / 100,
    totalPairs,
    pairingPairs,
    contrastPairs,
  };
}

export { FLAVOR_CATEGORIES };
