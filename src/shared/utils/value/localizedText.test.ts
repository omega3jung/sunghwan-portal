import { describe, expect, it } from "vitest";

import {
  normalizeLocalizedText,
  normalizeOptionalLocalizedText,
} from "./localizedText";

describe("localized text normalization", () => {
  it("sorts locale keys for stable signatures", () => {
    expect(
      Object.keys(
        normalizeLocalizedText({
          ko: "한국어",
          en: "English",
          fr: "Français",
        }),
      ),
    ).toEqual(["en", "fr", "ko"]);
  });

  it("normalizes an empty optional value to undefined", () => {
    expect(normalizeOptionalLocalizedText(undefined)).toBeUndefined();
  });
});
