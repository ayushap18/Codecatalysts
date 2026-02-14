import { getMoleculesForIngredientAsync, jaccardSimilarity, classifyFlavor, FLAVOR_CATEGORIES } from "@/lib/algorithms/flavorprint";
import { getFoodPairings } from "@/lib/api/flavordb";

export interface SubstitutionResult {
  original: string;
  substitute: string;
  matchScore: number; // 0-1
  sharedMolecules: string[];
  flavorImpact: { gained: string[]; lost: string[] };
  categories: string[];
}

export async function findSubstitutions(
  ingredientName: string,
  existingIngredients: string[],
  maxResults = 5
): Promise<SubstitutionResult[]> {
  const original = ingredientName.toLowerCase().trim();

  // Get molecules for the original ingredient
  const originalMols = await getMoleculesForIngredientAsync(original);
  const originalMolNames = originalMols.map((m) => m.common_name);

  if (originalMolNames.length === 0) return [];

  // Get food pairings from FlavorDB as candidate substitutes
  const candidates: string[] = [];

  try {
    const pairData = await getFoodPairings(original);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pairs: string[] = Array.isArray(pairData) ? pairData.map((p: any) =>
      (p.entity_alias_readable || p.name || "").toLowerCase()
    ).filter(Boolean) : [];
    candidates.push(...pairs);
  } catch {
    // If pairings fail, return empty — don't waste credits on fallback guesses
  }

  if (candidates.length === 0) return [];

  // Filter out the original and existing ingredients
  const filtered = candidates.filter(
    (c) => c !== original && !existingIngredients.includes(c)
  );

  // Score each candidate — limit to 8 to save API credits
  const results: SubstitutionResult[] = [];

  for (const candidate of filtered.slice(0, 8)) {
    const subMols = await getMoleculesForIngredientAsync(candidate);
    const subMolNames = subMols.map((m) => m.common_name);

    if (subMolNames.length === 0) continue;

    const matchScore = jaccardSimilarity(originalMolNames, subMolNames);
    if (matchScore < 0.01) continue;

    const shared = originalMolNames.filter((m) => subMolNames.includes(m));
    const gained = subMolNames.filter((m) => !originalMolNames.includes(m));
    const lost = originalMolNames.filter((m) => !subMolNames.includes(m));

    // Classify gained/lost into flavor categories
    const gainedCats = new Set<string>();
    for (const mol of subMols) {
      if (gained.includes(mol.common_name)) {
        mol.flavor_profile.split(",").map((s) => s.trim()).forEach((p) => {
          gainedCats.add(classifyFlavor(p));
        });
      }
    }
    const lostCats = new Set<string>();
    for (const mol of originalMols) {
      if (lost.includes(mol.common_name)) {
        mol.flavor_profile.split(",").map((s) => s.trim()).forEach((p) => {
          lostCats.add(classifyFlavor(p));
        });
      }
    }

    // Overall categories for the sub
    const subCats = new Set<string>();
    for (const mol of subMols) {
      mol.flavor_profile.split(",").map((s) => s.trim()).forEach((p) => {
        subCats.add(classifyFlavor(p));
      });
    }

    results.push({
      original,
      substitute: candidate,
      matchScore,
      sharedMolecules: shared,
      flavorImpact: {
        gained: Array.from(gainedCats),
        lost: Array.from(lostCats),
      },
      categories: Array.from(subCats),
    });
  }

  results.sort((a, b) => b.matchScore - a.matchScore);
  return results.slice(0, maxResults);
}

export { FLAVOR_CATEGORIES };
