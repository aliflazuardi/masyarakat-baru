import { describe, expect, it } from "vitest";
import { isAvailable, readJSON, remove, writeJSON, type StorageLike } from "@/lib/storage";

function memoryStore(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const throwingStore: StorageLike = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
  removeItem: () => {
    throw new Error("blocked");
  },
};

describe("storage", () => {
  it("round-trips JSON values under a namespaced key", () => {
    const store = memoryStore();
    expect(writeJSON("streak", { count: 3 }, store)).toBe(true);
    expect(store.data.has("mb:streak")).toBe(true);
    expect(readJSON("streak", null, store)).toEqual({ count: 3 });
  });

  it("returns the fallback for missing keys and corrupt values", () => {
    const store = memoryStore();
    expect(readJSON("missing", 7, store)).toBe(7);
    store.data.set("mb:bad", "{not json");
    expect(readJSON("bad", "fallback", store)).toBe("fallback");
  });

  it("removes values", () => {
    const store = memoryStore();
    writeJSON("x", 1, store);
    remove("x", store);
    expect(readJSON("x", 0, store)).toBe(0);
  });

  it("degrades gracefully when storage is unavailable or throws", () => {
    expect(readJSON("k", "fb", null)).toBe("fb");
    expect(writeJSON("k", 1, null)).toBe(false);
    expect(isAvailable(null)).toBe(false);

    expect(readJSON("k", "fb", throwingStore)).toBe("fb");
    expect(writeJSON("k", 1, throwingStore)).toBe(false);
    expect(() => remove("k", throwingStore)).not.toThrow();
    expect(isAvailable(throwingStore)).toBe(false);
  });

  it("reports availability for a working store", () => {
    expect(isAvailable(memoryStore())).toBe(true);
  });
});
