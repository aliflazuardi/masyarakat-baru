// Safe localStorage wrapper. Storage can be missing or throw (private mode,
// blocked site data, server rendering), so every feature must degrade gracefully.

const PREFIX = "mb:";

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function defaultStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Reads and JSON-parses a value. Returns `fallback` on any failure. */
export function readJSON<T>(key: string, fallback: T, store = defaultStorage()): T {
  if (!store) return fallback;
  try {
    const raw = store.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/** JSON-serialises and stores a value. Returns false if it could not be saved. */
export function writeJSON(key: string, value: unknown, store = defaultStorage()): boolean {
  if (!store) return false;
  try {
    store.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function remove(key: string, store = defaultStorage()): void {
  try {
    store?.removeItem(PREFIX + key);
  } catch {
    // nothing to do
  }
}

/** True when values can actually be persisted (used to hide streak UI, etc.). */
export function isAvailable(store = defaultStorage()): boolean {
  if (!store) return false;
  const probe = `${PREFIX}__probe__`;
  try {
    store.setItem(probe, "1");
    store.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
