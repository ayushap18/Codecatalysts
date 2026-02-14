const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://cosylab.iiitd.edu.in:6969";
const FLAVORDB_BASE = `${BASE_URL}/flavordb`;

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (API_KEY) h["Authorization"] = `Bearer ${API_KEY}`;
  return h;
}

// Entity Controller
export async function getEntitiesByName(
  name: string,
  page = 0,
  size = 20
) {
  const res = await fetch(
    `${FLAVORDB_BASE}/entities/by-entity-alias-readable?entity_alias_readable=${encodeURIComponent(name)}&page=${page}&size=${size}`,
    { headers: authHeaders() }
  );
  if (!res.ok) return { content: [] };
  return res.json();
}

export async function getEntitiesByCategory(
  name: string,
  category: string,
  page = 0,
  size = 20
) {
  const res = await fetch(
    `${FLAVORDB_BASE}/entities/by-name-and-category?name=${encodeURIComponent(name)}&category=${encodeURIComponent(category)}&page=${page}&size=${size}`,
    { headers: authHeaders() }
  );
  if (!res.ok) return { content: [] };
  return res.json();
}

export async function getEntitiesByNaturalSource(
  source: string,
  page = 0,
  size = 20
) {
  const res = await fetch(
    `${FLAVORDB_BASE}/entities/by-natural-source?naturalSource=${encodeURIComponent(source)}&page=${page}&size=${size}`,
    { headers: authHeaders() }
  );
  if (!res.ok) return { content: [] };
  return res.json();
}

// Food Pairing Controller
export async function getFoodPairings(ingredient: string) {
  const res = await fetch(
    `${FLAVORDB_BASE}/food/by-alias?food_pair=${encodeURIComponent(ingredient)}`,
    { headers: authHeaders() }
  );
  if (!res.ok) return null;
  return res.json();
}

// Molecule Controller
export async function getMoleculesByFlavorProfile(
  flavor: string,
  page = 0,
  size = 20
) {
  const res = await fetch(
    `${FLAVORDB_BASE}/molecules_data/by-flavorProfile?flavorProfile=${encodeURIComponent(flavor)}&page=${page}&size=${size}`,
    { headers: authHeaders() }
  );
  if (!res.ok) return { content: [] };
  return res.json();
}

export async function getMoleculesByCommonName(
  name: string,
  page = 0,
  size = 20
) {
  const res = await fetch(
    `${FLAVORDB_BASE}/molecules_data/by-commonName?commonName=${encodeURIComponent(name)}&page=${page}&size=${size}`,
    { headers: authHeaders() }
  );
  if (!res.ok) return { content: [] };
  return res.json();
}

export async function getMoleculesByType(
  type: string,
  page = 0,
  size = 20
) {
  const res = await fetch(
    `${FLAVORDB_BASE}/molecules_data/filter-by-type?type=${encodeURIComponent(type)}&page=${page}&size=${size}`,
    { headers: authHeaders() }
  );
  if (!res.ok) return { content: [] };
  return res.json();
}

// Property Controller
export async function getPropertiesByDescription(
  description: string,
  page = 0,
  size = 20
) {
  const res = await fetch(
    `${FLAVORDB_BASE}/properties/by-description?description=${encodeURIComponent(description)}&page=${page}&size=${size}`,
    { headers: authHeaders() }
  );
  if (!res.ok) return { content: [] };
  return res.json();
}

export async function getPropertiesByTasteThreshold(
  values: string,
  page = 0,
  size = 20
) {
  const res = await fetch(
    `${FLAVORDB_BASE}/properties/taste-threshold?values=${encodeURIComponent(values)}&page=${page}&size=${size}`,
    { headers: authHeaders() }
  );
  if (!res.ok) return { content: [] };
  return res.json();
}
