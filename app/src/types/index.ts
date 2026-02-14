export interface Recipe {
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
  url?: string;
  img_url?: string;
  "carbohydrate, by difference (g)": number;
  "energy (kcal)": number;
  "protein (g)": number;
  "total lipid (fat) (g)": number;
  processes: string;
  utensils?: string;
  vegan: string;
  pescetarian: string;
  ovo_vegetarian: string;
  lacto_vegetarian: string;
  ovo_lacto_vegetarian: string;
}

export interface RecipeDetail {
  recipe: Recipe;
  ingredients: RecipeIngredient[];
}

export interface RecipeIngredient {
  recipe_no: number;
  ingredient_phrase: string;
  ingredient: string;
  quantity: string;
  unit?: string;
  ing_id: number;
  ndb_id?: number;
  state?: string;
  size?: string;
}

export interface FlavorMolecule {
  common_name: string;
  flavor_profile: string;
  pubchem_id?: number;
  functional_groups?: string;
}

export interface FlavorEntity {
  entity_id: number;
  entity_alias_readable: string;
  entity_alias_synonyms?: string;
  category: string;
  natural_source_name?: string;
  molecules?: FlavorMolecule[];
}

export interface FlavorPrint {
  recipeId: number;
  recipeTitle: string;
  cuisine: string;
  country: string;
  categories: FlavorCategory[];
  totalMolecules: number;
  ingredientCount: number;
  analyzedCount: number;
  molecules: FlavorMolecule[];
}

export interface FlavorCategory {
  name: string;
  count: number;
  color: string;
  molecules: string[];
}

export interface TwinResult {
  source: RecipeDetail;
  twin: RecipeDetail;
  sourceFlavorPrint: FlavorPrint;
  twinFlavorPrint: FlavorPrint;
  twinScore: number;
  molecularSimilarity: number;
  ingredientDifference: number;
  sharedMolecules: string[];
  sharedIngredients: string[];
}

export interface PhilosophyScore {
  score: number; // 0 = pure contrast, 100 = pure pairing
  label: "Contrast" | "Balanced" | "Pairing";
  avgSharedMolecules: number;
  totalPairs: number;
  pairingPairs: number;
  contrastPairs: number;
}
