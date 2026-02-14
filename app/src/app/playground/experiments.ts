import type { FlavorMolecule } from "@/types";
import { getMoleculesForIngredient, classifyFlavor, FLAVOR_CATEGORIES } from "@/lib/algorithms/flavorprint";

export interface LabExperiment {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  tags: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  cuisine: string;
}

// 55+ pre-built experiments using the static 22-ingredient cache
export const LAB_EXPERIMENTS: LabExperiment[] = [
  // ── Indian ──────────────────────────────────────────
  { id: "butter-chicken", title: "Butter Chicken", description: "Butter + Chicken + Garlic + Ginger + Tomato + Yogurt. Diacetyl from butter meets meaty sulfur compounds. Citral from ginger bridges the gap.", ingredients: ["butter", "chicken", "garlic", "ginger", "tomato", "yogurt"], tags: ["Cross-Category", "Umami Rich"], difficulty: "Advanced", cuisine: "Indian" },
  { id: "dal-tadka", title: "Dal Tadka", description: "Classic lentil dish tempered with cumin, garlic, and chili. The earthy 1-Octen-3-ol from lentils meets the warm Cuminaldehyde.", ingredients: ["lentil", "onion", "garlic", "cumin", "chili", "tomato"], tags: ["Earthy Base", "Spice Temper"], difficulty: "Intermediate", cuisine: "Indian" },
  { id: "chicken-biryani", title: "Chicken Biryani", description: "Layered rice dish. 2-Acetyl-1-pyrroline (basmati rice) meets Zingiberene (ginger) and Cuminaldehyde. A molecular symphony.", ingredients: ["chicken", "rice", "onion", "garlic", "ginger", "cumin", "coriander", "yogurt"], tags: ["Aromatic Layers", "Complex"], difficulty: "Advanced", cuisine: "Indian" },
  { id: "aloo-gobi", title: "Aloo Gobi", description: "Potato + Cumin + Coriander + Chili. Methional (potato) creates earthy depth while cumin and coriander terpenes add warmth.", ingredients: ["potato", "onion", "garlic", "cumin", "coriander", "chili"], tags: ["Root Chemistry", "Spiced"], difficulty: "Beginner", cuisine: "Indian" },
  { id: "masala-chai", title: "Masala Chai", description: "Milk + Ginger + Cinnamon + Black Pepper + Sugar. Cinnamaldehyde and Gingerol create the signature warmth, while Piperine adds bite.", ingredients: ["milk", "ginger", "cinnamon", "sugar", "black pepper"], tags: ["Warm-Sweet", "Spice Cascade"], difficulty: "Beginner", cuisine: "Indian" },
  { id: "raita", title: "Raita", description: "Yogurt + Onion + Cumin + Coriander. The cooling Diacetyl meets pungent sulfides from onion. Cumin bridges them.", ingredients: ["yogurt", "onion", "cumin", "coriander"], tags: ["Cooling", "Contrast"], difficulty: "Beginner", cuisine: "Indian" },
  { id: "tandoori-chicken", title: "Tandoori Chicken", description: "Chicken marinated in yogurt + spices. Diacetyl (yogurt) coats the meaty Hexanal while Capsaicin provides heat.", ingredients: ["chicken", "yogurt", "garlic", "ginger", "cumin", "chili", "lemon"], tags: ["Marination", "Heat Blend"], difficulty: "Intermediate", cuisine: "Indian" },
  { id: "kheer", title: "Kheer", description: "Rice + Milk + Sugar + Cinnamon + Coconut. Triple creamy molecules: Diacetyl, Delta-decalactone, and Delta-octalactone unite.", ingredients: ["rice", "milk", "sugar", "cinnamon", "coconut"], tags: ["Dessert Science", "Creamy Triad"], difficulty: "Beginner", cuisine: "Indian" },
  { id: "coconut-chutney", title: "Coconut Chutney", description: "Coconut + Chili + Ginger + Lemon. Sweet lactones from coconut contrasted with Capsaicin heat and citrus Limonene.", ingredients: ["coconut", "chili", "ginger", "lemon"], tags: ["Sweet-Heat", "Contrast"], difficulty: "Beginner", cuisine: "Indian" },
  { id: "spiced-lentil-soup", title: "Spiced Lentil Soup", description: "Lentil + Carrot + Onion + Cumin + Ginger. Earthy mushroom-like compounds meet warm terpenes.", ingredients: ["lentil", "carrot", "onion", "cumin", "ginger", "garlic"], tags: ["Comfort Food", "Earthy-Warm"], difficulty: "Beginner", cuisine: "Indian" },

  // ── Italian ─────────────────────────────────────────
  { id: "italian-marriage", title: "The Italian Marriage", description: "Tomato + Basil is the iconic pairing. Both share Linalool — a floral molecule that binds them at the molecular level.", ingredients: ["tomato", "basil", "garlic", "olive oil"], tags: ["Western Pairing", "Floral Bond"], difficulty: "Beginner", cuisine: "Italian" },
  { id: "pesto-base", title: "Pesto Alla Genovese", description: "Basil + Garlic + Olive Oil + Lemon. Linalool (basil) and Allicin (garlic) combine. Hexanal bridges olive oil and basil.", ingredients: ["basil", "garlic", "olive oil", "lemon"], tags: ["Herbal Fusion", "Shared Bridge"], difficulty: "Beginner", cuisine: "Italian" },
  { id: "bruschetta", title: "Bruschetta", description: "Tomato + Basil + Garlic + Olive Oil. The classic quad: cis-3-Hexenal (tomato + olive oil) is the molecular glue.", ingredients: ["tomato", "basil", "garlic", "olive oil"], tags: ["Shared Molecule", "Fresh"], difficulty: "Beginner", cuisine: "Italian" },
  { id: "risotto", title: "Risotto Base", description: "Rice + Onion + Garlic + Butter + Lemon. 2-Acetyl-1-pyrroline from rice meets the creamy Diacetyl from butter.", ingredients: ["rice", "onion", "garlic", "butter", "lemon"], tags: ["Creamy-Nutty", "Pairing Style"], difficulty: "Intermediate", cuisine: "Italian" },
  { id: "aglio-olio", title: "Aglio e Olio", description: "Garlic + Olive Oil + Chili + Lemon. Allicin meets Oleocanthal — both pungent, creating a double-spice effect.", ingredients: ["garlic", "olive oil", "chili", "lemon"], tags: ["Pungent Duo", "Minimalist"], difficulty: "Beginner", cuisine: "Italian" },
  { id: "chicken-parm", title: "Chicken Parmigiana", description: "Chicken + Tomato + Basil + Garlic + Egg + Flour. Hexanal from chicken links to tomato's cis-3-Hexenal.", ingredients: ["chicken", "tomato", "basil", "garlic", "egg", "flour"], tags: ["Multi-Layer", "Umami"], difficulty: "Advanced", cuisine: "Italian" },
  { id: "minestrone", title: "Minestrone", description: "A molecular orchestra: potato, carrot, onion, tomato, garlic, basil, olive oil. Seven ingredients, 20+ unique molecules.", ingredients: ["potato", "carrot", "onion", "tomato", "garlic", "basil", "olive oil"], tags: ["Max Diversity", "29+ Molecules"], difficulty: "Advanced", cuisine: "Italian" },

  // ── Thai ─────────────────────────────────────────────
  { id: "tom-kha", title: "Tom Kha Gai", description: "Coconut + Chicken + Ginger + Chili + Lemon + Garlic. Sweet Delta-octalactone meets fiery Capsaicin — classic Thai contrast.", ingredients: ["coconut", "chicken", "ginger", "chili", "lemon", "garlic"], tags: ["Sweet-Heat", "Contrast Style"], difficulty: "Intermediate", cuisine: "Thai" },
  { id: "green-curry", title: "Green Curry Base", description: "Coconut + Basil + Chili + Garlic + Ginger + Chicken. Linalool cools while Capsaicin heats. Maximum molecular tension.", ingredients: ["coconut", "basil", "chili", "garlic", "ginger", "chicken"], tags: ["East Asian Style", "Tension"], difficulty: "Advanced", cuisine: "Thai" },
  { id: "pad-thai-base", title: "Pad Thai Base", description: "Egg + Garlic + Chili + Lemon + Sugar. Hydrogen sulfide (egg) meets Allicin (garlic) — a sulfur bridge.", ingredients: ["egg", "garlic", "chili", "lemon", "sugar"], tags: ["Sulfur Bridge", "Sweet-Sour"], difficulty: "Intermediate", cuisine: "Thai" },
  { id: "thai-coconut-rice", title: "Thai Coconut Rice", description: "Rice + Coconut + Ginger + Lemon. Nutty 2-Acetyl-1-pyrroline meets sweet Delta-octalactone. Citral adds brightness.", ingredients: ["rice", "coconut", "ginger", "lemon"], tags: ["Sweet-Nutty", "Aromatic"], difficulty: "Beginner", cuisine: "Thai" },
  { id: "tom-yum", title: "Tom Yum Base", description: "Chili + Lemon + Garlic + Ginger + Onion. Five pungent ingredients — Capsaicin, Limonene, Allicin, Gingerol, and Propanethiol.", ingredients: ["chili", "lemon", "garlic", "ginger", "onion"], tags: ["Pungent Stack", "Hot-Sour"], difficulty: "Intermediate", cuisine: "Thai" },

  // ── Mexican ─────────────────────────────────────────
  { id: "salsa-roja", title: "Salsa Roja", description: "Tomato + Onion + Chili + Garlic + Coriander + Lemon. Six ingredients, each bringing distinct molecular families.", ingredients: ["tomato", "onion", "chili", "garlic", "coriander", "lemon"], tags: ["Diverse Blend", "Fresh Heat"], difficulty: "Beginner", cuisine: "Mexican" },
  { id: "guac-base", title: "Guacamole Base", description: "Coriander + Onion + Tomato + Chili + Lemon + Garlic. Linalool from coriander creates an unexpected bridge to tomato.", ingredients: ["coriander", "onion", "tomato", "chili", "lemon", "garlic"], tags: ["Citrus-Herb", "Fresh"], difficulty: "Beginner", cuisine: "Mexican" },
  { id: "chicken-fajita", title: "Chicken Fajita", description: "Chicken + Onion + Garlic + Chili + Cumin + Lemon. Hexanal (chicken) meets sulfides (onion) with cumin warmth.", ingredients: ["chicken", "onion", "garlic", "chili", "cumin", "lemon"], tags: ["Smoky", "Spice Blend"], difficulty: "Intermediate", cuisine: "Mexican" },
  { id: "mexican-rice", title: "Mexican Rice", description: "Rice + Tomato + Onion + Garlic + Cumin. Seven molecules shared between tomato and rice (Hexanal, Nonanal).", ingredients: ["rice", "tomato", "onion", "garlic", "cumin"], tags: ["Shared Aldehydes", "Comfort"], difficulty: "Beginner", cuisine: "Mexican" },

  // ── Middle Eastern ──────────────────────────────────
  { id: "hummus-base", title: "Hummus Base", description: "Garlic + Lemon + Cumin + Olive Oil. Allicin meets Limonene — both are antibacterials, a functional molecular bond.", ingredients: ["garlic", "lemon", "cumin", "olive oil"], tags: ["Functional", "Minimal"], difficulty: "Beginner", cuisine: "Middle Eastern" },
  { id: "falafel-spice", title: "Falafel Spice Mix", description: "Onion + Garlic + Cumin + Coriander + Chili. Sulfur compounds (allicin, propanethiol) create the foundation. Terpenes add complexity.", ingredients: ["onion", "garlic", "cumin", "coriander", "chili"], tags: ["Sulfur Base", "Terpene Layer"], difficulty: "Intermediate", cuisine: "Middle Eastern" },
  { id: "shawarma", title: "Shawarma Spice", description: "Chicken + Garlic + Cumin + Coriander + Cinnamon + Black Pepper. Cinnamaldehyde adds sweet warmth to the savory base.", ingredients: ["chicken", "garlic", "cumin", "coriander", "cinnamon", "black pepper"], tags: ["Sweet-Savory", "Warm Spice"], difficulty: "Advanced", cuisine: "Middle Eastern" },
  { id: "tabbouleh", title: "Tabbouleh Base", description: "Tomato + Onion + Lemon + Olive Oil. cis-3-Hexenal links tomato and olive oil — same molecule, different sources.", ingredients: ["tomato", "onion", "lemon", "olive oil"], tags: ["Same Molecule", "Fresh"], difficulty: "Beginner", cuisine: "Middle Eastern" },

  // ── French ──────────────────────────────────────────
  { id: "beurre-blanc", title: "Beurre Blanc", description: "Butter + Lemon + Onion. Creamy Diacetyl meets citrus Limonene. The sulfides from onion add savory depth.", ingredients: ["butter", "lemon", "onion"], tags: ["Classic Sauce", "Creamy-Citrus"], difficulty: "Beginner", cuisine: "French" },
  { id: "french-onion", title: "French Onion Base", description: "Onion + Butter + Garlic + Black Pepper. Dipropyl disulfide (onion) caramelizes into Maillard compounds. Piperine adds bite.", ingredients: ["onion", "butter", "garlic", "black pepper"], tags: ["Caramelization", "Sulfur Chemistry"], difficulty: "Intermediate", cuisine: "French" },
  { id: "bechamel", title: "Bechamel Sauce", description: "Butter + Milk + Flour + Black Pepper. Triple Diacetyl source (butter + milk) creates an ultra-creamy molecular foundation.", ingredients: ["butter", "milk", "flour", "black pepper"], tags: ["Triple Cream", "Mother Sauce"], difficulty: "Beginner", cuisine: "French" },
  { id: "ratatouille", title: "Ratatouille", description: "Tomato + Onion + Garlic + Basil + Olive Oil. Five ingredients sharing Hexanal and cis-3-Hexenal — heavy molecular pairing.", ingredients: ["tomato", "onion", "garlic", "basil", "olive oil"], tags: ["Western Pairing", "Green Notes"], difficulty: "Intermediate", cuisine: "French" },
  { id: "crepe-batter", title: "Crepe Batter", description: "Flour + Egg + Milk + Butter + Sugar. Hydrogen sulfide from egg meets Diacetyl from butter and milk. Furaneol sweetens.", ingredients: ["flour", "egg", "milk", "butter", "sugar"], tags: ["Baking Chemistry", "Sweet-Sulfur"], difficulty: "Beginner", cuisine: "French" },
  { id: "lemon-butter", title: "Lemon Butter Sauce", description: "Butter + Lemon + Garlic. Three ingredients, three molecular worlds: creamy, citrus, pungent — classic fusion.", ingredients: ["butter", "lemon", "garlic"], tags: ["Three Worlds", "Balance"], difficulty: "Beginner", cuisine: "French" },

  // ── Japanese/Chinese ────────────────────────────────
  { id: "teriyaki-base", title: "Teriyaki Base", description: "Ginger + Garlic + Sugar. Gingerol (heat) + Allicin (pungent) + Furaneol (sweet). Three opposing molecular forces.", ingredients: ["ginger", "garlic", "sugar"], tags: ["Triad Contrast", "Sweet-Pungent"], difficulty: "Beginner", cuisine: "Japanese" },
  { id: "tempura-batter", title: "Tempura Batter", description: "Flour + Egg + Rice. Minimal molecules — Hexanal is the only shared compound between flour and rice.", ingredients: ["flour", "egg", "rice"], tags: ["Minimal Bond", "Clean"], difficulty: "Beginner", cuisine: "Japanese" },
  { id: "japanese-curry", title: "Japanese Curry Roux", description: "Onion + Carrot + Potato + Garlic + Ginger + Butter + Flour. The ultimate comfort dish: earthy roots meet warm spice and cream.", ingredients: ["onion", "carrot", "potato", "garlic", "ginger", "butter", "flour"], tags: ["Comfort Max", "Multi-Layer"], difficulty: "Advanced", cuisine: "Japanese" },
  { id: "kung-pao", title: "Kung Pao Base", description: "Chicken + Garlic + Ginger + Chili + Black Pepper. Double heat: Capsaicin + Piperine. Dimethyl trisulfide from garlic bridges chicken.", ingredients: ["chicken", "garlic", "ginger", "chili", "black pepper"], tags: ["Double Heat", "Sulfur Bridge"], difficulty: "Intermediate", cuisine: "Chinese" },
  { id: "egg-fried-rice", title: "Egg Fried Rice", description: "Rice + Egg + Onion + Garlic + Ginger. Nonanal from rice meets Hydrogen sulfide from egg. A savory aldehyde-sulfur reaction.", ingredients: ["rice", "egg", "onion", "garlic", "ginger"], tags: ["Aldehyde-Sulfur", "Wok Hei"], difficulty: "Beginner", cuisine: "Chinese" },
  { id: "sweet-sour", title: "Sweet & Sour Base", description: "Sugar + Garlic + Ginger + Onion + Tomato. Furaneol (sugar) vs Allicin (garlic) — sweet-pungent molecular battle.", ingredients: ["sugar", "garlic", "ginger", "onion", "tomato"], tags: ["Sweet-Pungent", "Classic"], difficulty: "Intermediate", cuisine: "Chinese" },
  { id: "ginger-chicken", title: "Ginger Chicken", description: "Chicken + Ginger + Garlic + Onion. Gingerol adds citrus-warm heat, while Dimethyl trisulfide links garlic to chicken.", ingredients: ["chicken", "ginger", "garlic", "onion"], tags: ["Warm-Meaty", "Sulfur Glue"], difficulty: "Beginner", cuisine: "Chinese" },

  // ── British/American ────────────────────────────────
  { id: "pot-pie-base", title: "Chicken Pot Pie Base", description: "Chicken + Potato + Carrot + Onion + Butter + Flour + Milk. Max ingredients, max molecular complexity.", ingredients: ["chicken", "potato", "carrot", "onion", "butter", "flour", "milk"], tags: ["Maximum Complexity", "Comfort"], difficulty: "Advanced", cuisine: "American" },
  { id: "scrambled-eggs", title: "Scrambled Eggs", description: "Egg + Butter + Milk + Black Pepper. Hydrogen sulfide from egg meets Diacetyl from butter and milk. Piperine finishes.", ingredients: ["egg", "butter", "milk", "black pepper"], tags: ["Sulfur-Cream", "Simple"], difficulty: "Beginner", cuisine: "American" },
  { id: "pancakes", title: "Pancake Batter", description: "Flour + Egg + Milk + Sugar + Butter. Diacetyl appears three times (butter, milk), Furaneol adds sweetness.", ingredients: ["flour", "egg", "milk", "sugar", "butter"], tags: ["Triple Diacetyl", "Breakfast"], difficulty: "Beginner", cuisine: "American" },
  { id: "mashed-potato", title: "Mashed Potatoes", description: "Potato + Butter + Milk + Black Pepper. Methional (potato) creates the earthy base. Diacetyl (butter + milk) adds cream.", ingredients: ["potato", "butter", "milk", "black pepper"], tags: ["Earthy-Cream", "Comfort"], difficulty: "Beginner", cuisine: "American" },

  // ── Mediterranean ────────────────────────────────────
  { id: "greek-lemon-chicken", title: "Greek Lemon Chicken", description: "Chicken + Lemon + Garlic + Olive Oil + Onion. Limonene brightens the meaty Hexanal. Five-way molecular interaction.", ingredients: ["chicken", "lemon", "garlic", "olive oil", "onion"], tags: ["Citrus-Savory", "Mediterranean"], difficulty: "Intermediate", cuisine: "Mediterranean" },
  { id: "tzatziki", title: "Tzatziki Base", description: "Yogurt + Garlic + Lemon + Cumin. Diacetyl (yogurt) meets Allicin (garlic) — creamy-pungent contrast.", ingredients: ["yogurt", "garlic", "lemon", "cumin"], tags: ["Creamy-Pungent", "Cool"], difficulty: "Beginner", cuisine: "Mediterranean" },

  // ── Desserts ─────────────────────────────────────────
  { id: "cinnamon-rolls", title: "Cinnamon Roll Base", description: "Flour + Sugar + Cinnamon + Butter + Egg + Milk. Cinnamaldehyde dominates, supported by Diacetyl cream and Furaneol sweetness.", ingredients: ["flour", "sugar", "cinnamon", "butter", "egg", "milk"], tags: ["Sweet Aromatic", "Baking"], difficulty: "Intermediate", cuisine: "Dessert" },
  { id: "coconut-ladoo", title: "Coconut Ladoo", description: "Coconut + Sugar + Milk + Cinnamon. Delta-octalactone meets Cinnamaldehyde — tropical-warm dessert chemistry.", ingredients: ["coconut", "sugar", "milk", "cinnamon"], tags: ["Tropical-Warm", "Sweet"], difficulty: "Beginner", cuisine: "Dessert" },
  { id: "lemon-curd", title: "Lemon Curd", description: "Lemon + Sugar + Egg + Butter. Limonene and Citral (lemon) meet Diacetyl (butter) — citrus-cream perfection.", ingredients: ["lemon", "sugar", "egg", "butter"], tags: ["Citrus-Cream", "Classic"], difficulty: "Beginner", cuisine: "Dessert" },
  { id: "rice-pudding", title: "Rice Pudding", description: "Rice + Milk + Sugar + Cinnamon + Coconut. Five creamy-sweet molecules create the ultimate comfort dessert.", ingredients: ["rice", "milk", "sugar", "cinnamon", "coconut"], tags: ["Max Comfort", "Sweet"], difficulty: "Beginner", cuisine: "Dessert" },
  { id: "carrot-cake", title: "Carrot Cake Base", description: "Carrot + Flour + Egg + Sugar + Cinnamon + Butter. Beta-carotene from carrot adds earthy depth to the sweet base.", ingredients: ["carrot", "flour", "egg", "sugar", "cinnamon", "butter"], tags: ["Earthy-Sweet", "Complex"], difficulty: "Intermediate", cuisine: "Dessert" },

  // ── Fusion / Science ────────────────────────────────
  { id: "citrus-herb-triad", title: "Citrus-Herb Fusion", description: "Lemon + Basil + Coriander — all three share Linalool, making this a near-perfect molecular triad. Pure pairing chemistry.", ingredients: ["lemon", "basil", "coriander"], tags: ["Perfect Match", "Floral-Citrus"], difficulty: "Beginner", cuisine: "Fusion" },
  { id: "earthy-comfort", title: "Earthy Comfort Bowl", description: "Potato + Lentil + Carrot + Onion. Root vegetables sharing Nonanal and earthy compounds for deep grounding flavors.", ingredients: ["potato", "lentil", "carrot", "onion"], tags: ["Earth Tones", "Root Chemistry"], difficulty: "Beginner", cuisine: "Fusion" },
  { id: "umami-bomb", title: "Umami Bomb", description: "Chicken + Egg + Onion + Black Pepper. Hydrogen sulfide from egg meets meaty Dimethyl trisulfide. Molecular glue.", ingredients: ["chicken", "egg", "onion", "black pepper"], tags: ["Umami Stack", "Sulfur Bridge"], difficulty: "Advanced", cuisine: "Fusion" },
  { id: "thai-contrast", title: "Thai Contrast Profile", description: "Coconut + Chili + Lemon + Basil. Capsaicin heat vs cooling Linalool. Sweet lactones vs sharp citrus — max contrast.", ingredients: ["coconut", "chili", "lemon", "basil"], tags: ["Max Contrast", "Tension"], difficulty: "Advanced", cuisine: "Fusion" },
  { id: "spiced-coconut-lentils", title: "Spiced Coconut Lentils", description: "Lentil + Coconut + Onion + Garlic + Cumin + Chili + Ginger. East meets West — seven ingredients, 25+ molecules.", ingredients: ["lentil", "coconut", "onion", "garlic", "cumin", "chili", "ginger"], tags: ["East-West", "Max Molecules"], difficulty: "Advanced", cuisine: "Fusion" },
  { id: "herb-butter", title: "Compound Herb Butter", description: "Butter + Basil + Garlic + Lemon + Black Pepper. Diacetyl cream base infused with Linalool, Allicin, and Limonene.", ingredients: ["butter", "basil", "garlic", "lemon", "black pepper"], tags: ["Infusion", "Aromatic"], difficulty: "Beginner", cuisine: "Fusion" },
  { id: "all-spice-mix", title: "Universal Spice Mix", description: "Cumin + Coriander + Chili + Black Pepper + Cinnamon + Ginger. The complete spice molecule atlas in one blend.", ingredients: ["cumin", "coriander", "chili", "black pepper", "cinnamon", "ginger"], tags: ["Full Spectrum", "Spice Atlas"], difficulty: "Intermediate", cuisine: "Fusion" },
];

export const CUISINE_CATEGORIES = [
  "All", "Indian", "Italian", "Thai", "Mexican", "Middle Eastern",
  "French", "Japanese", "Chinese", "American", "Mediterranean", "Dessert", "Fusion",
];

// Pre-compute molecule data for an experiment
export function computeExperimentData(exp: LabExperiment) {
  const ingMols: {
    name: string;
    molecules: { common_name: string; flavor_profile: string; category: string; color: string }[];
  }[] = [];

  for (const name of exp.ingredients) {
    const mols = getMoleculesForIngredient(name);
    ingMols.push({
      name,
      molecules: mols.map((m) => {
        const cat = classifyFlavor(m.flavor_profile);
        return { ...m, category: cat, color: FLAVOR_CATEGORIES[cat] || "#90A4AE" };
      }),
    });
  }

  // Shared molecules across any two ingredients
  const allMolNames = ingMols.map((im) => im.molecules.map((m) => m.common_name));
  const shared: string[] = [];
  if (allMolNames.length >= 2) {
    const seen = new Set<string>();
    for (let i = 0; i < allMolNames.length; i++) {
      for (const name of allMolNames[i]) {
        if (seen.has(name)) continue;
        for (let j = i + 1; j < allMolNames.length; j++) {
          if (allMolNames[j].includes(name)) {
            shared.push(name);
            seen.add(name);
            break;
          }
        }
      }
    }
  }

  return { ingMols, shared };
}

// Shared palette of ingredients with molecule data
export const PALETTE_INGREDIENTS = [
  "chicken", "onion", "garlic", "tomato", "cumin", "coriander",
  "yogurt", "butter", "ginger", "chili", "lemon", "cinnamon",
  "rice", "black pepper", "milk", "coconut", "basil", "lentil",
  "potato", "carrot", "olive oil", "sugar", "egg", "flour",
].filter((name) => getMoleculesForIngredient(name).length > 0);

// Extract unique ingredients per cuisine from experiments
export function getCuisineIngredients(): Record<string, string[]> {
  const map: Record<string, Set<string>> = {};
  for (const exp of LAB_EXPERIMENTS) {
    if (exp.cuisine === "Fusion" || exp.cuisine === "Dessert") continue;
    if (!map[exp.cuisine]) map[exp.cuisine] = new Set();
    for (const ing of exp.ingredients) map[exp.cuisine].add(ing);
  }
  const result: Record<string, string[]> = {};
  for (const [cuisine, set] of Object.entries(map)) {
    result[cuisine] = Array.from(set).sort();
  }
  return result;
}
