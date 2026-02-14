import {
  getEntitiesByName,
  getEntitiesByCategory,
  getEntitiesByNaturalSource,
  getFoodPairings,
  getMoleculesByFlavorProfile,
  getMoleculesByCommonName,
  getMoleculesByType,
  getPropertiesByDescription,
  getPropertiesByTasteThreshold,
} from "@/lib/api/flavordb";
import {
  searchRecipesByTitle,
  getRecipeById,
  getRecipeInstructions,
  getRecipeOfDay,
  getRecipesByCuisine,
  getRecipes,
} from "@/lib/api/recipedb";

export interface ApiEndpoint {
  id: string;
  name: string;
  source: "FlavorDB" | "RecipeDB";
  category: string;
  method: "GET" | "POST";
  path: string;
  description: string;
  exampleParams: Record<string, string>;
  status: "live" | "demo";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runner?: () => Promise<any>;
  expectedOutput?: string;
}

// ── FlavorDB: Entity Controller ────────────────────────────────
const FDB_ENTITY: ApiEndpoint[] = [
  {
    id: "fdb-entity-name", name: "Entities by Readable Name", source: "FlavorDB", category: "Entity Controller",
    method: "GET", path: "/flavordb/entities/by-entity-alias-readable",
    description: "Look up a food ingredient and get its flavor molecules, category, and natural source.",
    exampleParams: { entity_alias_readable: "mango", page: "0", size: "5" },
    status: "live", runner: () => getEntitiesByName("mango", 0, 5),
  },
  {
    id: "fdb-entity-category", name: "Entities by Name & Category", source: "FlavorDB", category: "Entity Controller",
    method: "GET", path: "/flavordb/entities/by-name-and-category",
    description: "Filter food entities by name and category (e.g. fruit, spice, vegetable).",
    exampleParams: { name: "apple", category: "fruit", page: "0", size: "5" },
    status: "live", runner: () => getEntitiesByCategory("apple", "fruit", 0, 5),
  },
  {
    id: "fdb-entity-source", name: "Entities by Natural Source", source: "FlavorDB", category: "Entity Controller",
    method: "GET", path: "/flavordb/entities/by-natural-source",
    description: "Find food entities originating from a specific natural source (e.g. plant, animal).",
    exampleParams: { naturalSource: "plant", page: "0", size: "5" },
    status: "live", runner: () => getEntitiesByNaturalSource("plant", 0, 5),
  },
];

// ── FlavorDB: Food Pairing Controller ──────────────────────────
const FDB_PAIRING: ApiEndpoint[] = [
  {
    id: "fdb-pairings", name: "Food Pairings by Alias", source: "FlavorDB", category: "Food Pairing Controller",
    method: "GET", path: "/flavordb/food/by-alias",
    description: "Find ingredients that pair well with a given food item based on shared flavor molecules.",
    exampleParams: { food_pair: "tomato" },
    status: "live", runner: () => getFoodPairings("tomato"),
  },
];

// ── FlavorDB: Molecule Controller ──────────────────────────────
const FDB_MOLECULE: ApiEndpoint[] = [
  {
    id: "fdb-mol-flavor", name: "Molecules by Flavor Profile", source: "FlavorDB", category: "Molecule Controller",
    method: "GET", path: "/flavordb/molecules_data/by-flavorProfile",
    description: "Search molecules by their flavor descriptor (e.g. sweet, spicy, fruity).",
    exampleParams: { flavorProfile: "sweet", page: "0", size: "5" },
    status: "live", runner: () => getMoleculesByFlavorProfile("sweet", 0, 5),
  },
  {
    id: "fdb-mol-name", name: "Molecules by Common Name", source: "FlavorDB", category: "Molecule Controller",
    method: "GET", path: "/flavordb/molecules_data/by-commonName",
    description: "Look up a specific molecule by its common chemical name.",
    exampleParams: { commonName: "Linalool", page: "0", size: "5" },
    status: "live", runner: () => getMoleculesByCommonName("Linalool", 0, 5),
  },
  {
    id: "fdb-mol-type", name: "Molecules by Type", source: "FlavorDB", category: "Molecule Controller",
    method: "GET", path: "/flavordb/molecules_data/filter-by-type",
    description: "Filter molecules by chemical type classification.",
    exampleParams: { type: "Terpene", page: "0", size: "5" },
    status: "live", runner: () => getMoleculesByType("Terpene", 0, 5),
  },
  {
    id: "fdb-mol-fema", name: "Molecules by FEMA Flavor Profile", source: "FlavorDB", category: "Molecule Controller",
    method: "GET", path: "/flavordb/molecules_data/by-femaFlavorProfile",
    description: "Search molecules by FEMA (Flavor & Extract Manufacturers Association) flavor classification.",
    exampleParams: { femaFlavorProfile: "fruity", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ pubchem_id: 8842, common_name: "Ethyl butyrate", flavor_profile: "fruity, sweet", fema_flavor_profile: "fruity, pineapple", molecular_weight: 116.16, type: "Ester" }], totalElements: 150, totalPages: 30 }, null, 2),
  },
  {
    id: "fdb-mol-weight", name: "Molecules by Weight Range", source: "FlavorDB", category: "Molecule Controller",
    method: "GET", path: "/flavordb/molecules_data/filter-by-weight-range",
    description: "Filter molecules within a molecular weight range (Daltons).",
    exampleParams: { min: "100", max: "200", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ pubchem_id: 6549, common_name: "Limonene", molecular_weight: 136.23, flavor_profile: "citrus, lemon", type: "Terpene" }, { pubchem_id: 7463, common_name: "Linalool", molecular_weight: 154.25, flavor_profile: "floral, sweet", type: "Terpene" }], totalElements: 340, totalPages: 68 }, null, 2),
  },
  {
    id: "fdb-mol-funcgrp", name: "Molecules by Functional Groups", source: "FlavorDB", category: "Molecule Controller",
    method: "GET", path: "/flavordb/molecules_data/by-functionalGroups",
    description: "Filter molecules by chemical functional group (e.g. Aldehyde, Ketone, Ester).",
    exampleParams: { functional_groups: "Aldehyde", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ pubchem_id: 6184, common_name: "Hexanal", flavor_profile: "green, fatty", functional_groups: "Aldehyde", molecular_weight: 100.16 }, { pubchem_id: 31266, common_name: "Cinnamaldehyde", flavor_profile: "sweet, warm, spicy", functional_groups: "Aldehyde", molecular_weight: 132.16 }], totalElements: 85, totalPages: 17 }, null, 2),
  },
  {
    id: "fdb-mol-hbd", name: "Molecules by HBD Count Range", source: "FlavorDB", category: "Molecule Controller",
    method: "GET", path: "/flavordb/molecules_data/filter-by-hbd-count-range",
    description: "Filter molecules by Hydrogen Bond Donor count range.",
    exampleParams: { min: "0", max: "2", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ pubchem_id: 6549, common_name: "Limonene", hbd_count: 0, flavor_profile: "citrus" }], totalElements: 200, totalPages: 40 }, null, 2),
  },
  {
    id: "fdb-mol-hba", name: "Molecules by HBA Count Range", source: "FlavorDB", category: "Molecule Controller",
    method: "GET", path: "/flavordb/molecules_data/filter-by-hba-count-range",
    description: "Filter molecules by Hydrogen Bond Acceptor count range.",
    exampleParams: { min: "1", max: "3", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ pubchem_id: 7463, common_name: "Linalool", hba_count: 1, flavor_profile: "floral, sweet" }], totalElements: 180, totalPages: 36 }, null, 2),
  },
  {
    id: "fdb-mol-tpsa", name: "Molecules by Topological Polar Surface Area", source: "FlavorDB", category: "Molecule Controller",
    method: "GET", path: "/flavordb/molecules_data/by-topologicalPolarSurfaceArea-range",
    description: "Filter by topological polar surface area range (affects absorption and permeability).",
    exampleParams: { min: "0", max: "50", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ pubchem_id: 6549, common_name: "Limonene", topological_polar_surface_area: 0.0, flavor_profile: "citrus" }], totalElements: 120, totalPages: 24 }, null, 2),
  },
  {
    id: "fdb-mol-pubchem", name: "Molecules by PubChem ID Range", source: "FlavorDB", category: "Molecule Controller",
    method: "GET", path: "/flavordb/molecules_data/by-pubchemId-range",
    description: "Filter molecules within a PubChem compound ID range.",
    exampleParams: { min: "1000", max: "10000", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ pubchem_id: 6549, common_name: "Limonene", flavor_profile: "citrus, lemon" }, { pubchem_id: 7463, common_name: "Linalool", flavor_profile: "floral, sweet" }], totalElements: 95, totalPages: 19 }, null, 2),
  },
  {
    id: "fdb-mol-mass", name: "Molecules by Monoisotopic Mass", source: "FlavorDB", category: "Molecule Controller",
    method: "GET", path: "/flavordb/molecules_data/by-monoisotopicMass-range",
    description: "Filter by monoisotopic mass range (precise molecular mass).",
    exampleParams: { min: "100", max: "300", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ pubchem_id: 6549, common_name: "Limonene", monoisotopic_mass: 136.125, flavor_profile: "citrus" }], totalElements: 250, totalPages: 50 }, null, 2),
  },
  {
    id: "fdb-mol-heavy", name: "Molecules by Heavy Atom Count", source: "FlavorDB", category: "Molecule Controller",
    method: "GET", path: "/flavordb/molecules_data/by-heavyAtomCount-range",
    description: "Filter by non-hydrogen atom count range.",
    exampleParams: { min: "5", max: "15", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ pubchem_id: 6549, common_name: "Limonene", heavy_atom_count: 10, flavor_profile: "citrus" }], totalElements: 300, totalPages: 60 }, null, 2),
  },
];

// ── FlavorDB: Property Controller ──────────────────────────────
const FDB_PROPERTY: ApiEndpoint[] = [
  {
    id: "fdb-prop-desc", name: "Properties by Description", source: "FlavorDB", category: "Property Controller",
    method: "GET", path: "/flavordb/properties/by-description",
    description: "Search molecule properties by text description.",
    exampleParams: { description: "sweet", page: "0", size: "5" },
    status: "live", runner: () => getPropertiesByDescription("sweet", 0, 5),
  },
  {
    id: "fdb-prop-taste", name: "Properties by Taste Threshold", source: "FlavorDB", category: "Property Controller",
    method: "GET", path: "/flavordb/properties/taste-threshold",
    description: "Filter molecular properties by taste threshold values (concentration at which taste is detected).",
    exampleParams: { values: "0.001", page: "0", size: "5" },
    status: "live", runner: () => getPropertiesByTasteThreshold("0.001", 0, 5),
  },
  {
    id: "fdb-prop-synth", name: "Properties by Synthesis", source: "FlavorDB", category: "Property Controller",
    method: "GET", path: "/flavordb/properties/synthesis",
    description: "Retrieve molecule properties filtered by synthetic origin.",
    exampleParams: { page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ fl_no: "09.146", common_name: "Ethyl vanillin", synthesis: "Synthetic", description: "sweet, vanilla-like", fema_number: 2464 }], totalElements: 400, totalPages: 80 }, null, 2),
  },
  {
    id: "fdb-prop-trade", name: "Properties by Trade Guidelines", source: "FlavorDB", category: "Property Controller",
    method: "GET", path: "/flavordb/properties/by-tradeAssociationGuidelines",
    description: "Filter by trade association regulatory guidelines.",
    exampleParams: { page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ fl_no: "05.013", common_name: "Vanillin", trade_association_guidelines: "GRAS", fema_number: 3107 }], totalElements: 300, totalPages: 60 }, null, 2),
  },
  {
    id: "fdb-prop-natural", name: "Properties by Natural Occurrence", source: "FlavorDB", category: "Property Controller",
    method: "GET", path: "/flavordb/properties/by-naturalOccurrence",
    description: "Filter properties by natural occurrence data.",
    exampleParams: { page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ fl_no: "05.013", common_name: "Vanillin", natural_occurrence: "Vanilla bean, clove", description: "sweet, vanilla" }], totalElements: 250, totalPages: 50 }, null, 2),
  },
  {
    id: "fdb-prop-nas", name: "Properties by NAS Range", source: "FlavorDB", category: "Property Controller",
    method: "GET", path: "/flavordb/properties/by-nas-range",
    description: "Filter by NAS (National Academy of Sciences) number range.",
    exampleParams: { min: "1", max: "100", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ fl_no: "09.001", common_name: "Methyl formate", nas_number: 25 }], totalElements: 50, totalPages: 10 }, null, 2),
  },
  {
    id: "fdb-prop-jecfa", name: "Properties by JECFA Range", source: "FlavorDB", category: "Property Controller",
    method: "GET", path: "/flavordb/properties/by-jecfa-range",
    description: "Filter by JECFA (Joint Expert Committee on Food Additives) number range.",
    exampleParams: { min: "100", max: "500", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ fl_no: "05.013", common_name: "Vanillin", jecfa_number: 889, fema_number: 3107 }], totalElements: 200, totalPages: 40 }, null, 2),
  },
  {
    id: "fdb-prop-iofi", name: "Properties by IOFI Categorisation", source: "FlavorDB", category: "Property Controller",
    method: "GET", path: "/flavordb/properties/by-iofi-categorisation",
    description: "Filter by IOFI (International Organization of the Flavor Industry) categorisation.",
    exampleParams: { page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ fl_no: "05.013", common_name: "Vanillin", iofi_categorisation: "Natural and Artificial" }], totalElements: 400, totalPages: 80 }, null, 2),
  },
  {
    id: "fdb-prop-flno", name: "Properties by FL No Range", source: "FlavorDB", category: "Property Controller",
    method: "GET", path: "/flavordb/properties/by-flNo-range",
    description: "Filter properties by Flavour Number range.",
    exampleParams: { min: "01.001", max: "05.100", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ fl_no: "01.004", common_name: "1-Butanol", description: "fusel, alcoholic" }], totalElements: 100, totalPages: 20 }, null, 2),
  },
  {
    id: "fdb-prop-fema", name: "Properties by FEMA Range", source: "FlavorDB", category: "Property Controller",
    method: "GET", path: "/flavordb/properties/by-fema-range",
    description: "Filter by FEMA GRAS number range (Generally Recognized As Safe).",
    exampleParams: { min: "2000", max: "3000", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ fl_no: "09.146", common_name: "Ethyl vanillin", fema_number: 2464, description: "sweet, vanilla" }], totalElements: 500, totalPages: 100 }, null, 2),
  },
  {
    id: "fdb-prop-einecs", name: "Properties by EINECS", source: "FlavorDB", category: "Property Controller",
    method: "GET", path: "/flavordb/properties/by-einecs",
    description: "Filter by EINECS (European Inventory of Existing Chemical Substances) identifier.",
    exampleParams: { page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ fl_no: "05.013", common_name: "Vanillin", einecs: "204-465-2" }], totalElements: 300, totalPages: 60 }, null, 2),
  },
  {
    id: "fdb-prop-coe", name: "Properties by CoE Range", source: "FlavorDB", category: "Property Controller",
    method: "GET", path: "/flavordb/properties/by-coe-range",
    description: "Filter by Council of Europe number range.",
    exampleParams: { min: "1", max: "500", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ fl_no: "01.004", common_name: "1-Butanol", coe_number: 45 }], totalElements: 150, totalPages: 30 }, null, 2),
  },
  {
    id: "fdb-prop-coe-appr", name: "Properties by CoE Approval", source: "FlavorDB", category: "Property Controller",
    method: "GET", path: "/flavordb/properties/by-coe-approval",
    description: "Filter properties by Council of Europe approval status.",
    exampleParams: { approved: "true", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ fl_no: "05.013", common_name: "Vanillin", coe_approved: true, description: "sweet, vanilla" }], totalElements: 350, totalPages: 70 }, null, 2),
  },
  {
    id: "fdb-prop-aroma", name: "Properties by Aroma Threshold", source: "FlavorDB", category: "Property Controller",
    method: "GET", path: "/flavordb/properties/by-aromaThresholdValues",
    description: "Filter by aroma detection threshold values (concentration at which smell is perceived).",
    exampleParams: { page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ fl_no: "05.013", common_name: "Vanillin", aroma_threshold: "0.0002 mg/L", description: "sweet, vanilla" }], totalElements: 200, totalPages: 40 }, null, 2),
  },
];

// ── FlavorDB: More Property Controller ─────────────────────────
const FDB_MORE_PROP: ApiEndpoint[] = [
  {
    id: "fdb-mprop-surface", name: "More Props: Surface Area Range", source: "FlavorDB", category: "More Property Controller",
    method: "GET", path: "/flavordb/more_properties/by-surfaceArea-range",
    description: "Filter by molecular surface area range (Angstrom²).",
    exampleParams: { min: "50", max: "200", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ pubchem_id: 6549, common_name: "Limonene", surface_area: 135.2, molecular_weight: 136.23 }], totalElements: 180, totalPages: 36 }, null, 2),
  },
  {
    id: "fdb-mprop-rotbonds", name: "More Props: Rotatable Bonds", source: "FlavorDB", category: "More Property Controller",
    method: "GET", path: "/flavordb/more_properties/by-rotatableBonds-range",
    description: "Filter by number of rotatable bonds (indicates molecular flexibility).",
    exampleParams: { min: "0", max: "5", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ pubchem_id: 6549, common_name: "Limonene", rotatable_bonds: 1, flavor_profile: "citrus" }], totalElements: 250, totalPages: 50 }, null, 2),
  },
  {
    id: "fdb-mprop-atoms", name: "More Props: Number of Atoms", source: "FlavorDB", category: "More Property Controller",
    method: "GET", path: "/flavordb/more_properties/by-numberOfAtoms-range",
    description: "Filter by total atom count range (including hydrogens).",
    exampleParams: { min: "10", max: "30", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ pubchem_id: 6549, common_name: "Limonene", number_of_atoms: 26, flavor_profile: "citrus" }], totalElements: 300, totalPages: 60 }, null, 2),
  },
  {
    id: "fdb-mprop-rings", name: "More Props: Number of Rings", source: "FlavorDB", category: "More Property Controller",
    method: "GET", path: "/flavordb/more_properties/by-numRings-range",
    description: "Filter by ring count (cyclic structures in the molecule).",
    exampleParams: { min: "0", max: "3", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ pubchem_id: 6549, common_name: "Limonene", num_rings: 1, flavor_profile: "citrus" }], totalElements: 220, totalPages: 44 }, null, 2),
  },
  {
    id: "fdb-mprop-energy", name: "More Props: Energy Range", source: "FlavorDB", category: "More Property Controller",
    method: "GET", path: "/flavordb/more_properties/by-energy-range",
    description: "Filter by molecular energy range (kcal/mol).",
    exampleParams: { min: "10", max: "50", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ pubchem_id: 7463, common_name: "Linalool", energy: 28.3, flavor_profile: "floral, sweet" }], totalElements: 100, totalPages: 20 }, null, 2),
  },
  {
    id: "fdb-mprop-aromrings", name: "More Props: Aromatic Rings", source: "FlavorDB", category: "More Property Controller",
    method: "GET", path: "/flavordb/more_properties/by-aromaticRings-range",
    description: "Filter by number of aromatic ring systems.",
    exampleParams: { min: "0", max: "2", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ pubchem_id: 31266, common_name: "Cinnamaldehyde", aromatic_rings: 1, flavor_profile: "sweet, warm" }], totalElements: 150, totalPages: 30 }, null, 2),
  },
  {
    id: "fdb-mprop-arombonds", name: "More Props: Aromatic Bonds", source: "FlavorDB", category: "More Property Controller",
    method: "GET", path: "/flavordb/more_properties/by-aromaticBonds-range",
    description: "Filter by number of aromatic bonds.",
    exampleParams: { min: "0", max: "12", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ pubchem_id: 31266, common_name: "Cinnamaldehyde", aromatic_bonds: 6, flavor_profile: "sweet, warm" }], totalElements: 150, totalPages: 30 }, null, 2),
  },
  {
    id: "fdb-mprop-alogp", name: "More Props: ALogP Range", source: "FlavorDB", category: "More Property Controller",
    method: "GET", path: "/flavordb/more_properties/by-alogp-range",
    description: "Filter by ALogP (Ghose-Crippen LogP) — indicates lipophilicity.",
    exampleParams: { min: "1.0", max: "5.0", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ pubchem_id: 6549, common_name: "Limonene", alogp: 4.38, flavor_profile: "citrus" }], totalElements: 200, totalPages: 40 }, null, 2),
  },
  {
    id: "fdb-mprop-pubchem", name: "More Props: PubChem ID Range", source: "FlavorDB", category: "More Property Controller",
    method: "GET", path: "/flavordb/more_properties/by-pubchemId-range",
    description: "Filter extended molecular properties by PubChem compound ID range.",
    exampleParams: { min: "1000", max: "10000", page: "0", size: "5" },
    status: "demo",
    expectedOutput: JSON.stringify({ content: [{ pubchem_id: 6549, common_name: "Limonene", surface_area: 135.2, rotatable_bonds: 1, num_rings: 1 }], totalElements: 95, totalPages: 19 }, null, 2),
  },
];

// ── RecipeDB: GET Endpoints ────────────────────────────────────
const RDB_GET: ApiEndpoint[] = [
  {
    id: "rdb-search", name: "Search Recipes by Title", source: "RecipeDB", category: "Recipe Search",
    method: "GET", path: "/recipe2-api/recipe-bytitle/recipeByTitle",
    description: "Full-text search for recipes by title keyword with partial matching.",
    exampleParams: { title: "chicken" },
    status: "live", runner: () => searchRecipesByTitle("chicken"),
  },
  {
    id: "rdb-byid", name: "Get Recipe by ID", source: "RecipeDB", category: "Recipe Detail",
    method: "GET", path: "/recipe2-api/search-recipe/{id}",
    description: "Fetch full recipe details including ingredients, nutrition, and metadata.",
    exampleParams: { id: "1" },
    status: "live", runner: () => getRecipeById(1),
  },
  {
    id: "rdb-instructions", name: "Recipe Instructions", source: "RecipeDB", category: "Recipe Detail",
    method: "GET", path: "/recipe2-api/instructions/{recipe_id}",
    description: "Get step-by-step cooking instructions for a recipe.",
    exampleParams: { recipe_id: "1" },
    status: "live", runner: () => getRecipeInstructions(1),
  },
  {
    id: "rdb-ofday", name: "Recipe of the Day", source: "RecipeDB", category: "Recipe Discovery",
    method: "GET", path: "/recipe2-api/recipe/recipeofday",
    description: "Returns a randomly selected featured recipe. Changes daily.",
    exampleParams: {},
    status: "live", runner: () => getRecipeOfDay(),
  },
  {
    id: "rdb-info", name: "All Recipes (Paginated)", source: "RecipeDB", category: "Recipe Discovery",
    method: "GET", path: "/recipe2-api/recipe/recipesinfo",
    description: "Retrieves a paginated list of all 118K+ recipes in the database.",
    exampleParams: { page: "1", limit: "3" },
    status: "live", runner: () => getRecipes(1, 3),
  },
  {
    id: "rdb-cuisine", name: "Recipes by Cuisine", source: "RecipeDB", category: "Recipe Filters",
    method: "GET", path: "/recipe2-api/recipes_cuisine/cuisine/{region}",
    description: "Browse recipes filtered by cuisine region (Indian, Italian, Japanese, etc.).",
    exampleParams: { region: "Indian", page: "1", page_size: "3" },
    status: "live", runner: () => getRecipesByCuisine("Indian", { page: 1, limit: 3 }),
  },
  {
    id: "rdb-day-exclude", name: "Recipe of Day (with Exclusions)", source: "RecipeDB", category: "Recipe Discovery",
    method: "GET", path: "/recipe2-api/recipe/recipe-day/with-ingredients-categories",
    description: "Recipe of the day excluding specific ingredients or food categories (e.g. nut-free, dairy-free).",
    exampleParams: { excludeIngredients: "peanut", excludeCategories: "dairy" },
    status: "demo",
    expectedOutput: JSON.stringify({ payload: { data: { Recipe_id: 42, Recipe_title: "Grilled Vegetable Medley", Region: "Mediterranean", Calories: 285, total_time: "35 min", vegan: "1", processes: "grilling, seasoning", ingredients: [{ ingredient: "zucchini", quantity: "2" }, { ingredient: "bell pepper", quantity: "1" }] } } }, null, 2),
  },
  {
    id: "rdb-nutri", name: "Recipe Nutrition Info", source: "RecipeDB", category: "Nutrition",
    method: "GET", path: "/recipe2-api/recipe-nutri/nutritioninfo",
    description: "Macronutrient breakdown (calories, fat, protein, carbs) for recipes.",
    exampleParams: { page: "1", limit: "3" },
    status: "demo",
    expectedOutput: JSON.stringify({ payload: { data: [{ Recipe_id: 1, Recipe_title: "Butter Chicken", Calories: 490, "Protein (g)": 32, "Total lipid (fat) (g)": 28, "Carbohydrate, by difference (g)": 18 }], pagination: { page: 1, total: 118000 } } }, null, 2),
  },
  {
    id: "rdb-micro-nutri", name: "Recipe Micronutrition Info", source: "RecipeDB", category: "Nutrition",
    method: "GET", path: "/recipe2-api/recipe-micronutri/micronutritioninfo",
    description: "Detailed micronutrient data (vitamins, minerals, cholesterol) for recipes.",
    exampleParams: { page: "1", limit: "3" },
    status: "demo",
    expectedOutput: JSON.stringify({ payload: { data: [{ Recipe_id: 1, Recipe_title: "Butter Chicken", "Vitamin A (IU)": 1250, "Vitamin C (mg)": 12, "Iron (mg)": 3.2, "Calcium (mg)": 85, "Cholesterol (mg)": 95 }], pagination: { page: 1, total: 118000 } } }, null, 2),
  },
  {
    id: "rdb-range", name: "Recipes by Time Range", source: "RecipeDB", category: "Recipe Filters",
    method: "GET", path: "/recipe2-api/recipes/range",
    description: "Filter recipes by preparation, cooking, or total time ranges.",
    exampleParams: { field: "total_time", min: "10", max: "30", page: "1", limit: "3" },
    status: "demo",
    expectedOutput: JSON.stringify({ data: [{ Recipe_id: 55, Recipe_title: "Quick Tomato Soup", total_time: "20 min", Calories: 180 }, { Recipe_id: 89, Recipe_title: "15-Minute Pasta Aglio Olio", total_time: "15 min", Calories: 350 }] }, null, 2),
  },
  {
    id: "rdb-calories", name: "Recipes by Calorie Range", source: "RecipeDB", category: "Nutrition",
    method: "GET", path: "/recipe2-api/recipes-calories/calories",
    description: "Filter recipes within a minimum and maximum calorie range.",
    exampleParams: { minCalories: "200", maxCalories: "500", limit: "3" },
    status: "demo",
    expectedOutput: JSON.stringify({ data: [{ Recipe_id: 12, Recipe_title: "Grilled Chicken Salad", Calories: 320 }, { Recipe_id: 45, Recipe_title: "Vegetable Stir Fry", Calories: 280 }, { Recipe_id: 78, Recipe_title: "Lentil Soup", Calories: 350 }] }, null, 2),
  },
  {
    id: "rdb-diet", name: "Recipes by Diet Type", source: "RecipeDB", category: "Recipe Filters",
    method: "GET", path: "/recipe2-api/recipe-diet/recipe-diet",
    description: "Filter recipes by dietary restrictions (vegan, vegetarian, pescetarian, etc.).",
    exampleParams: { diet: "vegan", limit: "3" },
    status: "demo",
    expectedOutput: JSON.stringify({ data: [{ Recipe_id: 200, Recipe_title: "Chickpea Curry", vegan: "1", Calories: 310, Region: "Indian" }, { Recipe_id: 305, Recipe_title: "Vegan Pad Thai", vegan: "1", Calories: 420, Region: "Thai" }] }, null, 2),
  },
  {
    id: "rdb-region-diet", name: "Recipes by Region & Diet", source: "RecipeDB", category: "Recipe Filters",
    method: "GET", path: "/recipe2-api/recipe/region-diet/region-diet",
    description: "Combine cuisine region and diet type filters for targeted recipe discovery.",
    exampleParams: { region: "Indian", diet: "vegan", limit: "3" },
    status: "demo",
    expectedOutput: JSON.stringify({ data: [{ Recipe_id: 200, Recipe_title: "Chickpea Curry", Region: "Indian", vegan: "1", Calories: 310 }, { Recipe_id: 415, Recipe_title: "Aloo Gobi", Region: "Indian", vegan: "1", Calories: 280 }] }, null, 2),
  },
  {
    id: "rdb-carbs", name: "Recipes by Carbs Range", source: "RecipeDB", category: "Nutrition",
    method: "GET", path: "/recipe2-api/recipe-carbo/recipes-by-carbs",
    description: "Filter recipes by carbohydrate content range (grams).",
    exampleParams: { minCarbs: "10", maxCarbs: "50", limit: "3" },
    status: "demo",
    expectedOutput: JSON.stringify({ data: [{ Recipe_id: 33, Recipe_title: "Grilled Salmon", "Carbohydrate, by difference (g)": 12, Calories: 380 }, { Recipe_id: 67, Recipe_title: "Caesar Salad", "Carbohydrate, by difference (g)": 18, Calories: 290 }] }, null, 2),
  },
  {
    id: "rdb-protein", name: "Recipes by Protein Range", source: "RecipeDB", category: "Nutrition",
    method: "GET", path: "/recipe2-api/protein/protein-range",
    description: "Filter recipes by protein content range (grams).",
    exampleParams: { min: "20", max: "50", page: "1", limit: "3" },
    status: "demo",
    expectedOutput: JSON.stringify({ data: [{ Recipe_id: 15, Recipe_title: "Chicken Breast with Rice", "Protein (g)": 38, Calories: 420 }, { Recipe_id: 92, Recipe_title: "Tofu Stir Fry", "Protein (g)": 24, Calories: 310 }] }, null, 2),
  },
  {
    id: "rdb-energy", name: "Recipes by Energy Range", source: "RecipeDB", category: "Nutrition",
    method: "GET", path: "/recipe2-api/byenergy/energy",
    description: "Filter recipes by energy content range (kcal).",
    exampleParams: { minEnergy: "300", maxEnergy: "600", page: "1", limit: "3" },
    status: "demo",
    expectedOutput: JSON.stringify({ data: [{ Recipe_id: 101, Recipe_title: "Chicken Tikka Masala", "Energy (kcal)": 480, Region: "Indian" }] }, null, 2),
  },
  {
    id: "rdb-flavor", name: "Recipes by Ingredient Flavor", source: "RecipeDB", category: "Recipe Filters",
    method: "GET", path: "/recipe2-api/ingredients/flavor/{flavor}",
    description: "Find recipes containing ingredients with a specific flavor profile.",
    exampleParams: { flavor: "spicy", page: "1", limit: "3" },
    status: "demo",
    expectedOutput: JSON.stringify({ data: [{ Recipe_id: 88, Recipe_title: "Thai Green Curry", Region: "Thai", ingredients: ["chili", "garlic", "ginger"] }, { Recipe_id: 142, Recipe_title: "Spicy Chicken Wings", Region: "American" }] }, null, 2),
  },
  {
    id: "rdb-utensils", name: "Recipes by Utensils", source: "RecipeDB", category: "Recipe Filters",
    method: "GET", path: "/recipe2-api/byutensils/utensils",
    description: "Filter recipes by required cooking utensils (oven, pan, blender, etc.).",
    exampleParams: { utensils: "oven", page: "1", limit: "3" },
    status: "demo",
    expectedOutput: JSON.stringify({ data: [{ Recipe_id: 77, Recipe_title: "Roasted Chicken", utensils: "oven, baking tray", total_time: "75 min" }] }, null, 2),
  },
  {
    id: "rdb-method", name: "Recipes by Cooking Method", source: "RecipeDB", category: "Recipe Filters",
    method: "GET", path: "/recipe2-api/recipes-method/{method}",
    description: "Filter recipes by cooking method (grilling, baking, frying, steaming, etc.).",
    exampleParams: { method: "grilling", page: "1" },
    status: "demo",
    expectedOutput: JSON.stringify({ data: [{ Recipe_id: 156, Recipe_title: "Grilled Lamb Chops", processes: "grilling, marinating", Region: "Mediterranean" }] }, null, 2),
  },
  {
    id: "rdb-ing-cat", name: "Recipes by Ingredients & Categories", source: "RecipeDB", category: "Recipe Filters",
    method: "GET", path: "/recipe2-api/recipebyingredient/by-ingredients-categories-title",
    description: "Advanced filter: include/exclude specific ingredients, categories, and title keywords.",
    exampleParams: { includeIngredients: "chicken,garlic", excludeIngredients: "peanut", title: "curry", page: "1", limit: "3" },
    status: "demo",
    expectedOutput: JSON.stringify({ data: [{ Recipe_id: 200, Recipe_title: "Chicken Garlic Curry", ingredients: ["chicken", "garlic", "onion", "tomato"], Region: "Indian", Calories: 420 }] }, null, 2),
  },
  {
    id: "rdb-category", name: "Recipes by Dietary Category", source: "RecipeDB", category: "Recipe Filters",
    method: "GET", path: "/recipe2-api/category/",
    description: "Filter recipes by dietary category (include/exclude specific dietary classifications).",
    exampleParams: { includeDietrxCategories: "vegetarian", page: "1", limit: "3" },
    status: "demo",
    expectedOutput: JSON.stringify({ data: [{ Recipe_id: 340, Recipe_title: "Paneer Tikka", lacto_vegetarian: "1", Region: "Indian", Calories: 350 }] }, null, 2),
  },
  {
    id: "rdb-day-cat", name: "Recipe of Day by Category", source: "RecipeDB", category: "Recipe Discovery",
    method: "GET", path: "/recipe2-api/recipe-Day-category/",
    description: "Get recipe of the day filtered by dietary category exclusions.",
    exampleParams: { excludeDietrxCategories: "non-vegetarian", page: "1", limit: "3" },
    status: "demo",
    expectedOutput: JSON.stringify({ payload: { data: { Recipe_id: 512, Recipe_title: "Mushroom Risotto", lacto_vegetarian: "1", Region: "Italian", Calories: 410, total_time: "45 min" } } }, null, 2),
  },
];

// ── RecipeDB: POST Endpoints ───────────────────────────────────
const RDB_POST: ApiEndpoint[] = [
  {
    id: "rdb-mealplan", name: "Generate Meal Plan", source: "RecipeDB", category: "Meal Planning",
    method: "POST", path: "/recipe2-api/mealplan/meal-plan",
    description: "AI-powered meal plan generator: specify diet type, calorie targets, duration, and exclusions.",
    exampleParams: { diet_type: "vegan", days: "7", calories_per_day: "1500-2200", exclude_ingredients: "sugar" },
    status: "demo",
    expectedOutput: JSON.stringify({
      meal_plan: {
        diet_type: "vegan", days: 7, calories_per_day: { min: 1500, max: 2200 },
        plan: [
          { day: 1, meals: [
            { meal_type: "breakfast", recipe_id: 1200, title: "Overnight Oats with Berries", calories: 380 },
            { meal_type: "lunch", recipe_id: 3400, title: "Chickpea Buddha Bowl", calories: 520 },
            { meal_type: "dinner", recipe_id: 5600, title: "Lentil Coconut Curry", calories: 480 },
          ], total_calories: 1380 },
          { day: 2, meals: [
            { meal_type: "breakfast", recipe_id: 1205, title: "Smoothie Bowl", calories: 350 },
            { meal_type: "lunch", recipe_id: 3420, title: "Falafel Wrap", calories: 560 },
            { meal_type: "dinner", recipe_id: 5620, title: "Vegetable Stir Fry with Tofu", calories: 440 },
          ], total_calories: 1350 },
        ],
      },
    }, null, 2),
  },
];

// ── All endpoint categories ────────────────────────────────────
export const API_ENDPOINT_CATEGORIES = [
  "All",
  // FlavorDB
  "Entity Controller",
  "Food Pairing Controller",
  "Molecule Controller",
  "Property Controller",
  "More Property Controller",
  // RecipeDB
  "Recipe Search",
  "Recipe Detail",
  "Recipe Discovery",
  "Recipe Filters",
  "Nutrition",
  "Meal Planning",
];

export const ALL_API_ENDPOINTS: ApiEndpoint[] = [
  ...FDB_ENTITY,
  ...FDB_PAIRING,
  ...FDB_MOLECULE,
  ...FDB_PROPERTY,
  ...FDB_MORE_PROP,
  ...RDB_GET,
  ...RDB_POST,
];
