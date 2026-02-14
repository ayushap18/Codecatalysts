// Use proxy route in production (Vercel HTTPS → HTTP upstream)
// Direct calls in development (localhost can reach HTTP APIs)
const IS_SERVER = typeof window === "undefined";
const USE_PROXY =
  !IS_SERVER && typeof window !== "undefined" && window.location.protocol === "https:";

const DIRECT_BASE = "http://cosylab.iiitd.edu.in:6969";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

function buildUrl(path: string, params?: Record<string, string>): string {
  if (USE_PROXY) {
    const p = new URLSearchParams({ path });
    if (params) {
      Object.entries(params).forEach(([k, v]) => p.set(k, v));
    }
    return `/api/proxy?${p.toString()}`;
  }
  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
  return `${DIRECT_BASE}${path}${qs}`;
}

function authHeaders(): Record<string, string> {
  if (USE_PROXY) return {}; // proxy handles auth server-side
  const h: Record<string, string> = { "Content-Type": "application/json" };
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
  const url = buildUrl("/recipe2-api/recipe-bytitle/recipeByTitle", {
    title,
  });
  const res = await fetch(url, { headers: authHeaders() });
  const data = await res.json();
  const raw = data.data || data.payload?.data || [];
  return Array.isArray(raw) ? raw.map(normalizeRecipe) : [];
}

export async function getRecipeById(id: number | string) {
  const url = buildUrl(`/recipe2-api/search-recipe/${id}`);
  const res = await fetch(url, { headers: authHeaders() });
  const data = await res.json();
  return {
    recipe: data.recipe ? normalizeRecipe(data.recipe) : null,
    ingredients: Array.isArray(data.ingredients)
      ? data.ingredients.map(normalizeIngredient)
      : [],
  };
}

export async function getRecipeInstructions(recipeId: number | string) {
  const url = buildUrl(`/recipe2-api/instructions/${recipeId}`);
  const res = await fetch(url, { headers: authHeaders() });
  const data = await res.json();
  return data.steps || data.instructions || [];
}

export async function getRecipeOfDay() {
  const url = buildUrl("/recipe2-api/recipe/recipeofday");
  const res = await fetch(url, { headers: authHeaders() });
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
  const params: Record<string, string> = {
    page: String(opts?.page || 1),
    page_size: String(opts?.limit || 10),
  };
  if (opts?.continent) params.continent = opts.continent;
  if (opts?.subRegion) params.subRegion = opts.subRegion;
  const url = buildUrl(
    `/recipe2-api/recipes_cuisine/cuisine/${encodeURIComponent(region)}`,
    params
  );
  const res = await fetch(url, { headers: authHeaders() });
  const data = await res.json();
  const raw = data.data || data.payload?.data || [];
  return Array.isArray(raw) ? raw.map(normalizeRecipe) : [];
}

export async function getRecipes(page = 1, limit = 10) {
  const url = buildUrl("/recipe2-api/recipe/recipesinfo", {
    page: String(page),
    limit: String(limit),
  });
  const res = await fetch(url, { headers: authHeaders() });
  const data = await res.json();
  const raw = data.payload?.data || data.data || [];
  return {
    recipes: Array.isArray(raw) ? raw.map(normalizeRecipe) : [],
    pagination: data.payload?.pagination || data.pagination,
  };
}
