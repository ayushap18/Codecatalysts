const FLAVORDB_BASE = "https://cosylab.iiitd.edu.in/flavordb";

// Old public API - works without auth
export async function searchMoleculesByName(name: string): Promise<string[]> {
  const res = await fetch(
    `${FLAVORDB_BASE}/molecules_autocomplete?common_name=${encodeURIComponent(name)}`
  );
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export async function searchMoleculesByFlavor(flavor: string): Promise<string[]> {
  const res = await fetch(
    `${FLAVORDB_BASE}/molecules_autocomplete?flavor_profile=${encodeURIComponent(flavor)}`
  );
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

// New API (port 6969 on campus) - uses auth token
const FLAVORDB_V2_BASE =
  process.env.NEXT_PUBLIC_FLAVORDB_V2_URL ||
  "https://cosylab.iiitd.edu.in/flavordb";

const AUTH_TOKEN = process.env.NEXT_PUBLIC_FLAVORDB_TOKEN || "";

function v2Headers() {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (AUTH_TOKEN) h["Authorization"] = `Bearer ${AUTH_TOKEN}`;
  return h;
}

export async function getEntitiesByName(
  name: string,
  page = 0,
  size = 20
) {
  const res = await fetch(
    `${FLAVORDB_V2_BASE}/entities/by-entity-alias-readable?aliasReadable=${encodeURIComponent(name)}&page=${page}&size=${size}`,
    { headers: v2Headers() }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function getEntitiesByCategory(
  name: string,
  category: string,
  page = 0,
  size = 20
) {
  const res = await fetch(
    `${FLAVORDB_V2_BASE}/entities/by-name-and-category?name=${encodeURIComponent(name)}&category=${encodeURIComponent(category)}&page=${page}&size=${size}`,
    { headers: v2Headers() }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function getFoodPairings(ingredient: string) {
  const res = await fetch(
    `${FLAVORDB_V2_BASE}/food/by-alias?food_pair=${encodeURIComponent(ingredient)}`,
    { headers: v2Headers() }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function getMoleculesByFlavorProfile(
  flavor: string,
  page = 0,
  size = 20
) {
  const res = await fetch(
    `${FLAVORDB_V2_BASE}/molecules_data/by-flavorProfile?flavorProfile=${encodeURIComponent(flavor)}&page=${page}&size=${size}`,
    { headers: v2Headers() }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function getMoleculesByCommonName(
  name: string,
  page = 0,
  size = 20
) {
  const res = await fetch(
    `${FLAVORDB_V2_BASE}/molecules_data/by-commonName?commonName=${encodeURIComponent(name)}&page=${page}&size=${size}`,
    { headers: v2Headers() }
  );
  if (!res.ok) return [];
  return res.json();
}
