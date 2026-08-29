import { afterEach, describe, expect, it, vi } from "vitest";

import { detectBrowserLanguage } from "./detectLanguage";

describe("browser language detection", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("selects the first supported base language from browser preferences", () => {
    vi.stubGlobal("navigator", {
      language: "de-DE",
      languages: ["de-DE", "KO-kr", "fr-FR"],
    });

    expect(detectBrowserLanguage()).toBe("ko");
  });

  it("falls back to English when browser languages are unsupported", () => {
    vi.stubGlobal("navigator", {
      language: "de-DE",
      languages: ["de-DE", "ja-JP"],
    });

    expect(detectBrowserLanguage()).toBe("en");
  });

  it("falls back to English when no browser runtime exists", () => {
    vi.stubGlobal("navigator", undefined);

    expect(detectBrowserLanguage()).toBe("en");
  });
});
