import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  checkAdmin: vi.fn(),
  isRemoteRequest: vi.fn(),
  portalApiJson: vi.fn(),
  local: {
    listLocalCompanies: vi.fn(),
    createLocalCompany: vi.fn(),
    listLocalDepartments: vi.fn(),
    createLocalDepartment: vi.fn(),
    listLocalEmployees: vi.fn(),
    createLocalEmployee: vi.fn(),
    listLocalJobFields: vi.fn(),
    createLocalJobField: vi.fn(),
  },
}));

vi.mock("@/app/api/_adapters/auth/requestAuth", () => ({
  checkAdmin: mocks.checkAdmin,
  checkAdminOrSelf: vi.fn(),
  isRemoteRequest: mocks.isRemoteRequest,
}));
vi.mock("@/app/api/_adapters/backend", () => ({
  portalApiJson: mocks.portalApiJson,
}));
vi.mock("@/app/api/_adapters/localDemo/organization", () => mocks.local);

import * as companyRoute from "./companies/route";
import * as departmentRoute from "./departments/route";
import * as employeeRoute from "./employees/route";
import * as jobFieldRoute from "./job-fields/route";

const routes = [companyRoute, departmentRoute, employeeRoute, jobFieldRoute];

describe("Organization collection authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkAdmin.mockResolvedValue({ ok: true, token: {} });
    mocks.isRemoteRequest.mockResolvedValue(false);
    Object.values(mocks.local).forEach((fn) => fn.mockReturnValue([]));
  });

  it.each(routes.map((route, index) => [`route ${index + 1}`, route] as const))(
    "rejects unauthenticated LOCAL reads and writes for %s",
    async (_label, route) => {
      mocks.checkAdmin.mockResolvedValue({ ok: false, status: 401 });

      const getResponse = await route.GET(createRequest());
      const postResponse = await route.POST(createRequest("POST"));

      expect(getResponse.status).toBe(401);
      expect(postResponse.status).toBe(401);
      expect(mocks.isRemoteRequest).not.toHaveBeenCalled();
      expect(mocks.portalApiJson).not.toHaveBeenCalled();
    },
  );

  it("rejects non-admin mutations with the same status in both runtimes", async () => {
    mocks.checkAdmin.mockResolvedValue({ ok: false, status: 403 });

    const localResponse = await employeeRoute.POST(createRequest("POST"));
    mocks.isRemoteRequest.mockResolvedValue(true);
    const remoteResponse = await employeeRoute.POST(createRequest("POST"));

    expect(localResponse.status).toBe(403);
    expect(remoteResponse.status).toBe(403);
    expect(mocks.portalApiJson).not.toHaveBeenCalled();
  });

  it("dispatches an authorized remote mutation only after the admin check", async () => {
    mocks.isRemoteRequest.mockResolvedValue(true);
    mocks.portalApiJson.mockResolvedValue(new Response(null, { status: 204 }));

    await employeeRoute.POST(createRequest("POST"));

    expect(mocks.checkAdmin.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.portalApiJson.mock.invocationCallOrder[0],
    );
  });
});

function createRequest(method = "GET") {
  return new NextRequest("http://localhost/api/employees", {
    method,
    ...(method === "GET"
      ? {}
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: "value", name: { en: "Value" } }),
        }),
  });
}
