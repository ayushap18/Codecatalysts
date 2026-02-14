import { cachedFetch, TTL } from "./cache";

// Use proxy route in production (Vercel HTTPS → HTTP upstream)
const IS_SERVER = typeof window === "undefined";
const USE_PROXY =
  !IS_SERVER && typeof window !== "undefined" && window.location.protocol === "https:";

const DIRECT_BASE = "http://192.168.1.92:6969";
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
  if (USE_PROXY) return {};
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (API_KEY) h["Authorization"] = `Bearer ${API_KEY}`;
  return h;
}

// ── Raw fetchers (no cache) ────────────────────────────────────

async function _getEntitiesByName(name: string, page = 0, size = 20) {
  const url = buildUrl("/flavordb/entities/by-entity-alias-readable", {
    entity_alias_readable: name,
    page: String(page),
    size: String(size),
  });
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return { content: [] };
  return res.json();
}

async function _getEntitiesByCategory(name: string, category: string, page = 0, size = 20) {
  const url = buildUrl("/flavordb/entities/by-name-and-category", {
    name,
    category,
    page: String(page),
    size: String(size),
  });
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return { content: [] };
  return res.json();
}

async function _getEntitiesByNaturalSource(source: string, page = 0, size = 20) {
  const url = buildUrl("/flavordb/entities/by-natural-source", {
    naturalSource: source,
    page: String(page),
    size: String(size),
  });
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return { content: [] };
  return res.json();
}

async function _getFoodPairings(ingredient: string) {
  const url = buildUrl("/flavordb/food/by-alias", { food_pair: ingredient });
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return null;
  return res.json();
}

async function _getMoleculesByFlavorProfile(flavor: string, page = 0, size = 20) {
  const url = buildUrl("/flavordb/molecules_data/by-flavorProfile", {
    flavorProfile: flavor,
    page: String(page),
    size: String(size),
  });
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return { content: [] };
  return res.json();
}

async function _getMoleculesByCommonName(name: string, page = 0, size = 20) {
  const url = buildUrl("/flavordb/molecules_data/by-commonName", {
    commonName: name,
    page: String(page),
    size: String(size),
  });
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return { content: [] };
  return res.json();
}

async function _getMoleculesByType(type: string, page = 0, size = 20) {
  const url = buildUrl("/flavordb/molecules_data/filter-by-type", {
    type,
    page: String(page),
    size: String(size),
  });
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return { content: [] };
  return res.json();
}

async function _getPropertiesByDescription(description: string, page = 0, size = 20) {
  const url = buildUrl("/flavordb/properties/by-description", {
    description,
    page: String(page),
    size: String(size),
  });
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return { content: [] };
  return res.json();
}

async function _getPropertiesByTasteThreshold(values: string, page = 0, size = 20) {
  const url = buildUrl("/flavordb/properties/taste-threshold", {
    values,
    page: String(page),
    size: String(size),
  });
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return { content: [] };
  return res.json();
}

// ── Cached public API ──────────────────────────────────────────

export async function getEntitiesByName(name: string, page = 0, size = 20) {
  const key = `fdb:entity:${name}:${page}:${size}`;
  const { data } = await cachedFetch(key, () => _getEntitiesByName(name, page, size), TTL.FLAVORDB);
  return data;
}

export async function getEntitiesByCategory(name: string, category: string, page = 0, size = 20) {
  const key = `fdb:entcat:${name}:${category}:${page}:${size}`;
  const { data } = await cachedFetch(key, () => _getEntitiesByCategory(name, category, page, size), TTL.FLAVORDB);
  return data;
}

export async function getEntitiesByNaturalSource(source: string, page = 0, size = 20) {
  const key = `fdb:entsrc:${source}:${page}:${size}`;
  const { data } = await cachedFetch(key, () => _getEntitiesByNaturalSource(source, page, size), TTL.FLAVORDB);
  return data;
}

export async function getFoodPairings(ingredient: string) {
  const key = `fdb:pair:${ingredient}`;
  const { data } = await cachedFetch(key, () => _getFoodPairings(ingredient), TTL.FLAVORDB);
  return data;
}

export async function getMoleculesByFlavorProfile(flavor: string, page = 0, size = 20) {
  const key = `fdb:molfp:${flavor}:${page}:${size}`;
  const { data } = await cachedFetch(key, () => _getMoleculesByFlavorProfile(flavor, page, size), TTL.FLAVORDB);
  return data;
}

export async function getMoleculesByCommonName(name: string, page = 0, size = 20) {
  const key = `fdb:molcn:${name}:${page}:${size}`;
  const { data } = await cachedFetch(key, () => _getMoleculesByCommonName(name, page, size), TTL.FLAVORDB);
  return data;
}

export async function getMoleculesByType(type: string, page = 0, size = 20) {
  const key = `fdb:moltype:${type}:${page}:${size}`;
  const { data } = await cachedFetch(key, () => _getMoleculesByType(type, page, size), TTL.FLAVORDB);
  return data;
}

export async function getPropertiesByDescription(description: string, page = 0, size = 20) {
  const key = `fdb:propdesc:${description}:${page}:${size}`;
  const { data } = await cachedFetch(key, () => _getPropertiesByDescription(description, page, size), TTL.FLAVORDB);
  return data;
}

export async function getPropertiesByTasteThreshold(values: string, page = 0, size = 20) {
  const key = `fdb:proptt:${values}:${page}:${size}`;
  const { data } = await cachedFetch(key, () => _getPropertiesByTasteThreshold(values, page, size), TTL.FLAVORDB);
  return data;
}
