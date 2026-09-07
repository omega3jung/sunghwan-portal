import { describe, expect, it } from "vitest";

import { buildLoginRedirectHref } from "./redirect";

describe("login redirect target", () => {
  it("defaults to home and preserves non-routing query parameters", () => {
    expect(buildLoginRedirectHref()).toBe("/");
    expect(buildLoginRedirectHref({ locale: "ko" })).toBe("/?locale=ko");
  });

  it("preserves a same-origin relative path, query, and hash", () => {
    expect(
      buildLoginRedirectHref({
        r: "/service-desk/tickets/10?tab=history#action-2",
        locale: "ko",
      }),
    ).toBe("/service-desk/tickets/10?tab=history&locale=ko#action-2");
  });

  it("uses only the first routing parameter and appends array values", () => {
    expect(
      buildLoginRedirectHref({
        r: ["/settings", "/service-desk"],
        tag: ["a b", "x&y"],
      }),
    ).toBe("/settings?tag=a+b&tag=x%26y");
  });

  it.each([
    "https://evil.example/steal",
    "//evil.example/steal",
    "javascript:alert(1)",
    "not-a-relative-path",
  ])("rejects an external or malformed target: %s", (target) => {
    expect(buildLoginRedirectHref({ r: target })).toBe("/");
  });
});
