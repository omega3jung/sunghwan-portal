import { describe, expect, it } from "vitest";

import {
  clearSessionStorage,
  readSessionStorage,
  removeSessionStorage,
  writeSessionStorage,
} from "./sessionStorage";

describe("session storage SSR fallback", () => {
  it("returns the fallback and makes mutations no-ops without window", () => {
    expect(
      readSessionStorage("filters", { fallback: { keyword: "" } }),
    ).toEqual({ keyword: "" });
    expect(() => writeSessionStorage("filters", { keyword: "VPN" })).not.toThrow();
    expect(() => removeSessionStorage("filters")).not.toThrow();
    expect(() => clearSessionStorage()).not.toThrow();
  });
});
