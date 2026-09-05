/* eslint-disable boundaries/no-unknown-files -- colocated test for the proxy entrypoint */
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getToken = vi.hoisted(() => vi.fn());

vi.mock("next-auth/jwt", () => ({ getToken }));
vi.mock("@/lib/config/environment", () => ({
  ENVIRONMENT: { BASE_PATH: "/portal" },
}));

import { proxy } from "./proxy";

describe("Document authentication proxy", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirects an unauthenticated protected document and preserves its target", async () => {
    getToken.mockResolvedValue(null);

    const response = await proxy(
      createRequest("/portal/service-desk?status=Assigned&status=New"),
    );

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.pathname).toBe("/portal/login");
    expect(location.searchParams.get("r")).toBe("/service-desk");
    expect(location.searchParams.getAll("status")).toEqual(["Assigned", "New"]);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("allows an authenticated document navigation", async () => {
    getToken.mockResolvedValue({ accessToken: "token" });

    const response = await proxy(createRequest("/portal/service-desk"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it.each([
    ["API request", "/api/service-desk/tickets", { accept: "application/json" }],
    ["static resource", "/portal/app.css", { accept: "text/html" }],
    [
      "non-document navigation",
      "/portal/service-desk",
      { accept: "text/html", "sec-fetch-dest": "empty" },
    ],
  ])("bypasses %s", async (_label, path, headers) => {
    const response = await proxy(createRequest(path, headers));

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(getToken).not.toHaveBeenCalled();
  });

  it("fails closed when JWT verification throws", async () => {
    getToken.mockRejectedValue(new Error("invalid token"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await proxy(createRequest("/portal/service-desk"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/portal/login");
  });

  it("redirects Internet Explorer before protected-route authentication", async () => {
    const response = await proxy(
      createRequest("/portal/service-desk", {
        "user-agent": "Mozilla/5.0 Trident/7.0; rv:11.0",
      }),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/unsupported-browser",
    );
    expect(getToken).not.toHaveBeenCalled();
  });
});

function createRequest(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(`http://localhost${path}`, {
    headers: {
      accept: "text/html",
      "sec-fetch-dest": "document",
      ...headers,
    },
  });
}
