const RECIPEDB_BASE = "https://cosylab.iiitd.edu.in/recipe2-api";

export async function searchRecipesByTitle(title: string) {
  const res = await fetch(
    `${RECIPEDB_BASE}/recipe-bytitle/recipeByTitle?title=${encodeURIComponent(title)}`
  );
  const data = await res.json();
  return data.data || data.payload?.data || [];
}

export async function getRecipeById(id: number | string) {
  const res = await fetch(`${RECIPEDB_BASE}/search-recipe/${id}`);
  const data = await res.json();
  return {
    recipe: data.recipe,
    ingredients: data.ingredients || [],
  };
}

export async function getRecipeInstructions(recipeId: number | string) {
  const res = await fetch(`${RECIPEDB_BASE}/instructions/${recipeId}`);
  const data = await res.json();
  return data.steps || [];
}

export async function getRecipeOfDay() {
  const res = await fetch(`${RECIPEDB_BASE}/recipe/recipeofday`);
  const data = await res.json();
  return data.payload?.data || data.data;
}

export async function getRecipesByCuisine(
  region: string,
  opts?: { continent?: string; subRegion?: string; page?: number; limit?: number }
) {
  const params = new URLSearchParams();
  if (opts?.continent) params.set("continent", opts.continent);
  if (opts?.subRegion) params.set("subRegion", opts.subRegion);
  params.set("page", String(opts?.page || 1));
  params.set("page_size", String(opts?.limit || 10));
  const res = await fetch(
    `${RECIPEDB_BASE}/recipes_cuisine/cuisine/${encodeURIComponent(region)}?${params}`
  );
  const data = await res.json();
  return data.data || data.payload?.data || [];
}

export async function getRecipes(page = 1, limit = 10) {
  const res = await fetch(
    `${RECIPEDB_BASE}/recipe/recipesinfo?page=${page}&limit=${limit}`
  );
  const data = await res.json();
  return {
    recipes: data.payload?.data || data.data || [],
    pagination: data.payload?.pagination || data.pagination,
  };
}
