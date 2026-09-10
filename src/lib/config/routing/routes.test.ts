import { describe, expect, it } from "vitest";

import { isPublicRoute, ROUTES } from "./routes";

describe("route paths", () => {
  it("exposes Storybook as an application route", () => {
    expect(ROUTES.STORYBOOK).toBe("/storybook");
  });
});

describe("public route policy", () => {
  it.each(["/login", "/login/reset", "/login/mfa/challenge"])(
    "allows the login route and its descendants: %s",
    (pathname) => {
      expect(isPublicRoute(pathname)).toBe(true);
    },
  );

  it.each(["/", "/settings", "/login-help", "/logins"])(
    "does not treat a protected or similarly prefixed path as public: %s",
    (pathname) => {
      expect(isPublicRoute(pathname)).toBe(false);
    },
  );
});
