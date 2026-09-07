import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  PortalApiJsonOptions,
  PortalApiQuery,
} from "@/server/portalApi/types";

const services = vi.hoisted(() => ({
  getActiveCompanies: vi.fn(),
  getActiveDepartments: vi.fn(),
  getActiveDepartmentsByCompanyId: vi.fn(),
  getEmployees: vi.fn(),
  getEmployeesByCompanyId: vi.fn(),
  getActiveJobFields: vi.fn(),
  getActiveJobFieldsByCompanyId: vi.fn(),
}));

vi.mock("@/server/data/organization/company", () => ({
  getActiveCompanies: services.getActiveCompanies,
}));
vi.mock("@/server/data/organization/department", () => ({
  getActiveDepartments: services.getActiveDepartments,
  getActiveDepartmentsByCompanyId: services.getActiveDepartmentsByCompanyId,
}));
vi.mock("@/server/data/organization/employees", () => ({
  getEmployees: services.getEmployees,
  getEmployeesByCompanyId: services.getEmployeesByCompanyId,
}));
vi.mock("@/server/data/organization/jobField", () => ({
  getActiveJobFields: services.getActiveJobFields,
  getActiveJobFieldsByCompanyId: services.getActiveJobFieldsByCompanyId,
}));

import { handleOrganizationPortalApi } from "./organizationPortalApiHandler";

const request = (query = "") =>
  new NextRequest(`http://localhost/internal${query}`);
const options = (path: string, query?: PortalApiQuery): PortalApiJsonOptions => ({
  method: "GET" as const,
  path,
  query,
  errorMessage: "Organization request failed",
});

describe("organization portal API handler", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns active companies with a collection total", async () => {
    services.getActiveCompanies.mockResolvedValue([
      { company_id: 1 },
      { company_id: 2 },
    ]);

    const response = await handleOrganizationPortalApi(
      request(),
      options("/company"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      items: [{ company_id: 1 }, { company_id: 2 }],
      total: 2,
    });
  });

  it("uses a validated company target for department, employee, and job-field queries", async () => {
    services.getActiveDepartmentsByCompanyId.mockResolvedValue([]);
    services.getEmployeesByCompanyId.mockResolvedValue([]);
    services.getActiveJobFieldsByCompanyId.mockResolvedValue([]);

    await handleOrganizationPortalApi(
      request(),
      options("/department", { companyId: "2" }),
    );
    await handleOrganizationPortalApi(
      request(),
      options("/employees", { companyId: "2" }),
    );
    await handleOrganizationPortalApi(
      request(),
      options("/job-field", { companyId: "2" }),
    );

    expect(services.getActiveDepartmentsByCompanyId).toHaveBeenCalledWith(2);
    expect(services.getEmployeesByCompanyId).toHaveBeenCalledWith(true, 2);
    expect(services.getActiveJobFieldsByCompanyId).toHaveBeenCalledWith(2);
    expect(services.getActiveDepartments).not.toHaveBeenCalled();
  });

  it("ignores malformed company input instead of forwarding it to scoped repositories", async () => {
    services.getActiveDepartments.mockResolvedValue([]);

    await handleOrganizationPortalApi(
      request(),
      options("/department", { companyId: "2 OR 1=1" }),
    );

    expect(services.getActiveDepartments).toHaveBeenCalled();
    expect(services.getActiveDepartmentsByCompanyId).not.toHaveBeenCalled();
  });

  it("derives company scope from a filter and still applies the remaining filter", async () => {
    services.getActiveDepartmentsByCompanyId.mockResolvedValue([
      { d_id: 10, d_company_id: 2, d_active: true, d_name: { en: "Active" } },
      { d_id: 11, d_company_id: 2, d_active: false, d_name: { en: "Inactive" } },
    ]);
    const filter = {
      rules: [
        { field: "companyId", operator: "=", value: "2" },
        "and",
        { field: "active", operator: "=", value: true },
      ],
    };

    const response = await handleOrganizationPortalApi(
      request(),
      options("/department", { filter: JSON.stringify(filter) }),
    );

    expect(services.getActiveDepartmentsByCompanyId).toHaveBeenCalledWith(2);
    await expect(response.json()).resolves.toEqual({
      items: [expect.objectContaining({ d_id: 10 })],
      total: 1,
    });
  });

  it("preserves employee service error status and maps other service failures to 500", async () => {
    services.getEmployees.mockRejectedValue(
      Object.assign(new Error("employees unavailable"), { status: 503 }),
    );
    const employeeResponse = await handleOrganizationPortalApi(
      request(),
      options("/employees"),
    );
    expect(employeeResponse.status).toBe(503);

    services.getActiveDepartments.mockRejectedValue(new Error("db failure"));
    const departmentResponse = await handleOrganizationPortalApi(
      request(),
      options("/department"),
    );
    expect(departmentResponse.status).toBe(500);
    await expect(departmentResponse.json()).resolves.toEqual({
      message: "Organization request failed",
    });
  });

  it("returns not found for unsupported methods and paths", async () => {
    const methodResponse = await handleOrganizationPortalApi(request(), {
      ...options("/company"),
      method: "POST",
    });
    const pathResponse = await handleOrganizationPortalApi(
      request(),
      options("/unknown"),
    );

    expect(methodResponse.status).toBe(404);
    expect(pathResponse.status).toBe(404);
  });
});
