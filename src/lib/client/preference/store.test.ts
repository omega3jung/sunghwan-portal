import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePreferenceStore } from "./store";

const STORAGE_KEY = "sunghwan_portal_preference";

function createStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

describe("preference client cache", () => {
  beforeEach(() => {
    vi.stubGlobal("navigator", {
      language: "en-US",
      languages: ["en-US"],
    });
    vi.stubGlobal("sessionStorage", createStorage());
    usePreferenceStore.getState().clearPreference();
  });

  it("normalizes stale persisted fields independently during hydration", () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        menu: "group",
        screenMode: "sepia",
        colorTheme: "ruby",
        language: "de",
        ignored: true,
      }),
    );

    usePreferenceStore.getState().hydratePreference();

    expect(usePreferenceStore.getState()).toMatchObject({
      menu: "group",
      screenMode: "system",
      colorTheme: "ruby",
      language: "en",
    });
  });

  it("applies a partial valid patch while preserving prior preferences", () => {
    usePreferenceStore.getState().setPreference({
      menu: "group",
      screenMode: "dark",
    });
    usePreferenceStore.getState().setPreference({ language: "ko" });

    expect(usePreferenceStore.getState()).toMatchObject({
      menu: "group",
      screenMode: "dark",
      colorTheme: "default",
      language: "ko",
    });
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null")).toEqual({
      menu: "group",
      screenMode: "dark",
      colorTheme: "default",
      language: "ko",
    });
  });

  it("falls back after malformed JSON and removes persisted state on clear", () => {
    sessionStorage.setItem(STORAGE_KEY, "{invalid-json");

    usePreferenceStore.getState().hydratePreference();
    expect(usePreferenceStore.getState()).toMatchObject({
      menu: "collapsible",
      screenMode: "system",
      colorTheme: "default",
      language: "en",
    });

    usePreferenceStore.getState().setPreference({ colorTheme: "emerald" });
    usePreferenceStore.getState().clearPreference();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(usePreferenceStore.getState().colorTheme).toBe("default");
  });
});
