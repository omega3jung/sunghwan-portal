// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearSessionStorage,
  readSessionStorage,
  removeSessionStorage,
  writeSessionStorage,
} from "./sessionStorage";

describe("session storage browser contract", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("writes and reads an unversioned value", () => {
    writeSessionStorage("filters", { keyword: "VPN" });

    expect(
      readSessionStorage("filters", { fallback: { keyword: "" } }),
    ).toEqual({ keyword: "VPN" });
  });

  it("reads legacy raw JSON values", () => {
    window.sessionStorage.setItem("legacy", JSON.stringify(["Assigned"]));

    expect(readSessionStorage("legacy", { fallback: [] as string[] })).toEqual([
      "Assigned",
    ]);
  });

  it("falls back for malformed JSON and invalid persisted null", () => {
    window.sessionStorage.setItem("broken", "{not-json");
    window.sessionStorage.setItem("null", "null");

    expect(readSessionStorage("broken", { fallback: "safe" })).toBe("safe");
    expect(readSessionStorage("null", { fallback: "safe" })).toBe("safe");
  });

  it("migrates a version mismatch only when a migration is supplied", () => {
    writeSessionStorage("filters", { query: "vpn" }, 1);

    expect(
      readSessionStorage("filters", { fallback: { keyword: "" }, version: 2 }),
    ).toEqual({ keyword: "" });
    expect(
      readSessionStorage("filters", {
        fallback: { keyword: "" },
        version: 2,
        migrate: (raw) => ({
          keyword: (raw as { query: string }).query.toUpperCase(),
        }),
      }),
    ).toEqual({ keyword: "VPN" });
  });

  it("ignores quota and storage API failures", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    expect(() => writeSessionStorage("filters", { keyword: "VPN" })).not.toThrow();
  });

  it("removes one key or clears the complete session", () => {
    writeSessionStorage("one", 1);
    writeSessionStorage("two", 2);

    removeSessionStorage("one");
    expect(window.sessionStorage.getItem("one")).toBeNull();
    expect(window.sessionStorage.getItem("two")).not.toBeNull();

    clearSessionStorage();
    expect(window.sessionStorage.length).toBe(0);
  });
});
