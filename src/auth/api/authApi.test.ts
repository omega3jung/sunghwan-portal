import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const requestEmbeddedAuthApi = vi.hoisted(() => vi.fn());
const requestExternalAuthApi = vi.hoisted(() => vi.fn());

vi.mock("./embeddedAuthApi", () => ({ requestEmbeddedAuthApi }));
vi.mock("./externalAuthApi", () => ({ requestExternalAuthApi }));

import { authApiJson } from "./authApiJson";

describe("Auth API topology selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.AUTH_API_BASE_URL;
  });
  afterEach(() => delete process.env.AUTH_API_BASE_URL);

  it("uses the embedded dispatcher when no external base URL is configured", () => {
    const options = { path: "/auth/login", errorMessage: "failed" };
    authApiJson(options);

    expect(requestEmbeddedAuthApi).toHaveBeenCalledWith(options);
    expect(requestExternalAuthApi).not.toHaveBeenCalled();
  });

  it("uses the external transport for a non-empty base URL", () => {
    process.env.AUTH_API_BASE_URL = "https://auth.example.com";
    const options = { path: "/auth/login", errorMessage: "failed" };
    authApiJson(options);

    expect(requestExternalAuthApi).toHaveBeenCalledWith(options);
    expect(requestEmbeddedAuthApi).not.toHaveBeenCalled();
  });
});
