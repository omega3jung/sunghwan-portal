import { describe, expect, it } from "vitest";

import { isCategoryEffectivelyActive } from "./rules";

describe("category effective active state", () => {
  it("requires both parent and subcategory stored states", () => {
    expect(
      isCategoryEffectivelyActive({ active: false }, { active: true }),
    ).toBe(false);
    expect(
      isCategoryEffectivelyActive({ active: true }, { active: true }),
    ).toBe(true);
    expect(
      isCategoryEffectivelyActive({ active: true }, { active: false }),
    ).toBe(false);
  });
});
