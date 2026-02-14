// Smart API cache using localStorage with TTL
// Prevents redundant API calls and saves credit tokens

const CACHE_PREFIX = "fp_cache_";

interface CacheEntry<T> {
  data: T;
  expires: number;
}

function getCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.expires) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry<T> = { data, expires: Date.now() + ttlMs };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage full — evict old entries
    evictOldEntries();
    try {
      const entry: CacheEntry<T> = { data, expires: Date.now() + ttlMs };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Still full, skip caching
    }
  }
}

function evictOldEntries(): void {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) keys.push(key);
  }
  // Remove oldest 50% of entries
  const entries = keys.map((k) => {
    try {
      const raw = localStorage.getItem(k);
      const parsed = raw ? JSON.parse(raw) : null;
      return { key: k, expires: parsed?.expires || 0 };
    } catch {
      return { key: k, expires: 0 };
    }
  });
  entries.sort((a, b) => a.expires - b.expires);
  const toRemove = entries.slice(0, Math.ceil(entries.length / 2));
  toRemove.forEach((e) => localStorage.removeItem(e.key));
}

// TTL constants
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const TTL = {
  RECIPE_DETAIL: DAY,        // Recipe data is static
  RECIPE_SEARCH: 6 * HOUR,   // Search results rarely change
  RECIPE_OF_DAY: DAY,        // Changes daily
  RECIPE_INSTRUCTIONS: DAY,  // Instructions are static
  CUISINE_LIST: 6 * HOUR,    // Cuisine results rarely change
  FLAVORDB: DAY,             // Molecule data is static
} as const;

/**
 * Fetch with cache — checks localStorage first, calls API only on cache miss.
 * Returns { data, fromCache } so callers can optionally show cache indicators.
 */
export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number
): Promise<{ data: T; fromCache: boolean }> {
  const cached = getCache<T>(key);
  if (cached !== null) {
    return { data: cached, fromCache: true };
  }

  const data = await fetchFn();
  setCache(key, data, ttlMs);
  return { data, fromCache: false };
}

/** Clear all FlavorPrint cache entries */
export function clearCache(): void {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) keys.push(key);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}

/** Get cache stats */
export function getCacheStats(): { entries: number; sizeKB: number } {
  if (typeof window === "undefined") return { entries: 0, sizeKB: 0 };
  let entries = 0;
  let size = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      entries++;
      size += (localStorage.getItem(key) || "").length;
    }
  }
  return { entries, sizeKB: Math.round(size / 1024) };
}
