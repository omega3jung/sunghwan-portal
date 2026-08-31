import { describe, expect, it } from "vitest";

import { isCategoryEffectivelyActive } from "./rules";

describe("category effective active state", () => {
  it.each([
    [true, true, true],
    [true, false, false],
    [false, true, false],
    [false, false, false],
  ])(
    "resolves main=%s and subcategory=%s to %s",
    (mainActive, subCategoryActive, expected) => {
      expect(
        isCategoryEffectivelyActive(
          { active: mainActive },
          { active: subCategoryActive },
        ),
      ).toBe(expected);
    },
  );

  it("uses the main category state when no subcategory is selected", () => {
    expect(isCategoryEffectivelyActive({ active: true })).toBe(true);
    expect(isCategoryEffectivelyActive({ active: false }, null)).toBe(false);
  });
});
