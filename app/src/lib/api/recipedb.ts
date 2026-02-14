const RECIPEDB_BASE =
  process.env.NEXT_PUBLIC_RECIPEDB_BASE ||
  "http://cosylab.iiitd.edu.in:6969/recipe2-api";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (API_KEY) h["Authorization"] = `Bearer ${API_KEY}`;
  return h;
}

// Normalize recipe fields from API response (PascalCase → camelCase)
function normalizeRecipe(raw: Record<string, unknown>) {
  return {
    recipe_id: Number(raw.Recipe_id ?? raw.recipe_id),
    recipe_title: (raw.Recipe_title ?? raw.recipe_title ?? "") as string,
    calories: Number(raw.Calories ?? raw.calories ?? 0),
    cook_time: String(raw.cook_time ?? "0"),
    prep_time: String(raw.prep_time ?? "0"),
    total_time: String(raw.total_time ?? "0"),
    servings: String(raw.servings ?? "0"),
    region: (raw.Region ?? raw.region ?? "") as string,
    sub_region: (raw.Sub_region ?? raw.sub_region ?? "") as string,
    continent: (raw.Continent ?? raw.continent ?? "") as string,
    source: (raw.Source ?? raw.source ?? "") as string,
    url: (raw.url ?? "") as string,
    img_url: (raw.img_url ?? "") as string,
    "carbohydrate, by difference (g)": Number(
      raw["Carbohydrate, by difference (g)"] ??
        raw["carbohydrate, by difference (g)"] ??
        0
    ),
    "energy (kcal)": Number(raw["Energy (kcal)"] ?? raw["energy (kcal)"] ?? 0),
    "protein (g)": Number(raw["Protein (g)"] ?? raw["protein (g)"] ?? 0),
    "total lipid (fat) (g)": Number(
      raw["Total lipid (fat) (g)"] ?? raw["total lipid (fat) (g)"] ?? 0
    ),
    processes: (raw.Processes ?? raw.processes ?? "") as string,
    utensils: (raw.Utensils ?? raw.utensils ?? "") as string,
    vegan: String(raw.vegan ?? "0"),
    pescetarian: String(raw.pescetarian ?? "0"),
    ovo_vegetarian: String(raw.ovo_vegetarian ?? "0"),
    lacto_vegetarian: String(raw.lacto_vegetarian ?? "0"),
    ovo_lacto_vegetarian: String(raw.ovo_lacto_vegetarian ?? "0"),
  };
}

// Normalize ingredient fields
function normalizeIngredient(raw: Record<string, unknown>) {
  return {
    recipe_no: Number(raw.recipe_no ?? 0),
    ingredient_phrase: (raw.ingredient_Phrase ?? raw.ingredient_phrase ?? "") as string,
    ingredient: (raw.ingredient ?? "") as string,
    quantity: String(raw.quantity ?? ""),
    unit: (raw.unit ?? undefined) as string | undefined,
    ing_id: Number(raw.ing_id ?? 0),
    ndb_id: raw.ndb_id ? Number(raw.ndb_id) : undefined,
    state: (raw.state ?? undefined) as string | undefined,
    size: (raw.size ?? undefined) as string | undefined,
  };
}

export async function searchRecipesByTitle(title: string) {
  const res = await fetch(
    `${RECIPEDB_BASE}/recipe-bytitle/recipeByTitle?title=${encodeURIComponent(title)}`,
    { headers: authHeaders() }
  );
  const data = await res.json();
  const raw = data.data || data.payload?.data || [];
  return Array.isArray(raw) ? raw.map(normalizeRecipe) : [];
}

export async function getRecipeById(id: number | string) {
  const res = await fetch(`${RECIPEDB_BASE}/search-recipe/${id}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  return {
    recipe: data.recipe ? normalizeRecipe(data.recipe) : null,
    ingredients: Array.isArray(data.ingredients)
      ? data.ingredients.map(normalizeIngredient)
      : [],
  };
}

export async function getRecipeInstructions(recipeId: number | string) {
  const res = await fetch(`${RECIPEDB_BASE}/instructions/${recipeId}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  return data.steps || data.instructions || [];
}

export async function getRecipeOfDay() {
  const res = await fetch(`${RECIPEDB_BASE}/recipe/recipeofday`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  const raw = data.payload?.data || data.data;
  return raw ? normalizeRecipe(raw) : null;
}

export async function getRecipesByCuisine(
  region: string,
  opts?: {
    continent?: string;
    subRegion?: string;
    page?: number;
    limit?: number;
  }
) {
  const params = new URLSearchParams();
  if (opts?.continent) params.set("continent", opts.continent);
  if (opts?.subRegion) params.set("subRegion", opts.subRegion);
  params.set("page", String(opts?.page || 1));
  params.set("page_size", String(opts?.limit || 10));
  const res = await fetch(
    `${RECIPEDB_BASE}/recipes_cuisine/cuisine/${encodeURIComponent(region)}?${params}`,
    { headers: authHeaders() }
  );
  const data = await res.json();
  const raw = data.data || data.payload?.data || [];
  return Array.isArray(raw) ? raw.map(normalizeRecipe) : [];
}

export async function getRecipes(page = 1, limit = 10) {
  const res = await fetch(
    `${RECIPEDB_BASE}/recipe/recipesinfo?page=${page}&limit=${limit}`,
    { headers: authHeaders() }
  );
  const data = await res.json();
  const raw = data.payload?.data || data.data || [];
  return {
    recipes: Array.isArray(raw) ? raw.map(normalizeRecipe) : [],
    pagination: data.payload?.pagination || data.pagination,
  };
}
