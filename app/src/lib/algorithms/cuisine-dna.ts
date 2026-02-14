import { getRecipesByCuisine, getRecipeById } from "@/lib/api/recipedb";
import { generateFlavorPrintAsync, FLAVOR_CATEGORIES } from "@/lib/algorithms/flavorprint";

export interface CuisineDNA {
  name: string;
  recipeCount: number;
  profile: Record<string, number>; // category -> normalized score 0-1
  topCategories: string[];
  color: string;
}

export async function computeCuisineDNA(
  cuisineName: string,
  color: string,
  sampleSize = 3
): Promise<CuisineDNA> {
  const recipes = await getRecipesByCuisine(cuisineName, { limit: sampleSize });
  const recipeList = Array.isArray(recipes) ? recipes : [];

  const categoryCounts: Record<string, number> = {};
  let validRecipes = 0;

  for (const recipe of recipeList.slice(0, sampleSize)) {
    try {
      const detail = await getRecipeById(recipe.recipe_id);
      if (!detail.recipe || !detail.ingredients?.length) continue;

      // Cap ingredients to 8 to save API credits
      const cappedIngredients = detail.ingredients.slice(0, 8);

      const fp = await generateFlavorPrintAsync(
        detail.recipe.recipe_id,
        detail.recipe.recipe_title,
        detail.recipe.sub_region,
        detail.recipe.continent,
        cappedIngredients
      );

      if (fp.totalMolecules === 0) continue;
      validRecipes++;

      for (const cat of fp.categories) {
        categoryCounts[cat.name] = (categoryCounts[cat.name] || 0) + cat.count;
      }
    } catch {
      // Skip failed recipes
    }
  }

  // Average and normalize
  const avgProfile: Record<string, number> = {};
  if (validRecipes > 0) {
    for (const [cat, count] of Object.entries(categoryCounts)) {
      avgProfile[cat] = count / validRecipes;
    }
  }

  const maxVal = Math.max(...Object.values(avgProfile), 1);
  const normalizedProfile: Record<string, number> = {};
  for (const cat of Object.keys(FLAVOR_CATEGORIES)) {
    normalizedProfile[cat] = (avgProfile[cat] || 0) / maxVal;
  }

  const topCategories = Object.entries(normalizedProfile)
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 0)
    .slice(0, 5)
    .map(([k]) => k);

  return {
    name: cuisineName,
    recipeCount: validRecipes,
    profile: normalizedProfile,
    topCategories,
    color,
  };
}
