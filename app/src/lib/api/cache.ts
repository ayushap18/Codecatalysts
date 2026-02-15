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

/** Invalidate cache entries matching a prefix (e.g. "fdb:entity" or "search:") */
export function invalidateCache(prefix: string): void {
  if (typeof window === "undefined") return;
  const fullPrefix = CACHE_PREFIX + prefix;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(fullPrefix)) keys.push(key);
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

// ── Search & View History ──────────────────────────────────────
// Persists indefinitely until user clears manually.

const HISTORY_KEY = "fp_history";

export interface HistoryEntry {
  type: "search" | "recipe" | "explore" | "twins" | "spectrum" | "builder" | "cuisine";
  title: string;
  subtitle?: string;
  path: string;
  timestamp: number;
  recipeId?: number;
  img_url?: string;
}

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // storage full — trim oldest half
    const trimmed = entries.slice(0, Math.ceil(entries.length / 2));
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch { /* give up */ }
  }
}

/** Add an entry to history. Deduplicates by path. Max 50 entries. */
export function addToHistory(entry: Omit<HistoryEntry, "timestamp">): void {
  const history = loadHistory();
  // Remove duplicate if same path already exists
  const filtered = history.filter((h) => h.path !== entry.path);
  // Prepend new entry
  filtered.unshift({ ...entry, timestamp: Date.now() });
  // Cap at 50
  saveHistory(filtered.slice(0, 50));
}

/** Get full history, newest first */
export function getHistory(): HistoryEntry[] {
  return loadHistory();
}

/** Remove a single entry by path */
export function removeFromHistory(path: string): void {
  const history = loadHistory();
  saveHistory(history.filter((h) => h.path !== path));
}

/** Clear all history */
export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

/** Clear everything — cache + history */
export function clearAll(): void {
  clearCache();
  clearHistory();
}
