import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SaveServiceDeskAssignmentRuleTreePayload } from "@/lib/application/contracts/serviceDesk";

import type { PortalApiMethod, PortalApiQuery } from "../types";
import type { ServiceDeskPortalApiContext } from "./serviceDeskPortalApiUtils";

const query = vi.hoisted(() => vi.fn());
const services = vi.hoisted(() => ({
  createAssignmentRule: vi.fn(),
  deleteAssignmentRuleById: vi.fn(),
  getAssignmentRecommendationResponse: vi.fn(),
  getAssignmentRulesByTenantId: vi.fn(),
  getAssignmentRulesResponseByTenantId: vi.fn(),
  hasAssignmentRuleAssigneeSelection: vi.fn(),
  updateAssignmentRuleById: vi.fn(),
  validateAssignmentRuleTreeMutation: vi.fn(),
  getCategoryTreeByTenantId: vi.fn(),
  getServiceDeskCategoryContext: vi.fn(),
  assertAssignmentReferencesValidForWrite: vi.fn(),
  mapSettingsWriteError: vi.fn(),
  canAccessCategory: vi.fn(),
  resolveAuthorizedSettingsTenant: vi.fn(),
  resolveServiceDeskRequestContext: vi.fn(),
}));

vi.mock("@/server/data/serviceDesk/assignmentRule", () => ({
  createAssignmentRule: services.createAssignmentRule,
  deleteAssignmentRuleById: services.deleteAssignmentRuleById,
  getAssignmentRecommendationResponse: services.getAssignmentRecommendationResponse,
  getAssignmentRulesByTenantId: services.getAssignmentRulesByTenantId,
  getAssignmentRulesResponseByTenantId: services.getAssignmentRulesResponseByTenantId,
  hasAssignmentRuleAssigneeSelection: services.hasAssignmentRuleAssigneeSelection,
  updateAssignmentRuleById: services.updateAssignmentRuleById,
  validateAssignmentRuleTreeMutation: services.validateAssignmentRuleTreeMutation,
}));
vi.mock("@/server/data/serviceDesk/category", () => ({
  getCategoryTreeByTenantId: services.getCategoryTreeByTenantId,
  getServiceDeskCategoryContext: services.getServiceDeskCategoryContext,
}));
vi.mock("@/server/data/serviceDesk/shared", () => ({
  assertAssignmentReferencesValidForWrite: services.assertAssignmentReferencesValidForWrite,
  mapSettingsWriteError: services.mapSettingsWriteError,
}));
vi.mock("@/server/shared/supabase/portalApiClient", () => ({
  withPortalApiTransaction: (callback: (executor: typeof query) => unknown) =>
    callback(query),
}));
vi.mock("@/lib/application/serviceDesk", () => ({
  canAccessOperationalServiceDeskCategory: services.canAccessCategory,
}));
vi.mock("./shared", () => ({
  resolveAuthorizedSettingsTenant: services.resolveAuthorizedSettingsTenant,
  resolveServiceDeskRequestContext: services.resolveServiceDeskRequestContext,
}));

import { handleAssignmentRulePortalApi } from "./assignmentRuleApiHandler";

const tenant = {
  id: "7",
  companyId: 2,
  isOwnerTenant: false,
  active: true,
  operational: true,
};
const principal = {
  id: "admin",
  username: "admin",
  displayName: { en: "Admin" },
  email: "admin@example.com",
  permission: 9,
  role: "ADMIN",
  userScope: "INTERNAL",
  companyId: 1,
};

describe("REMOTE assignment-rule handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    services.getAssignmentRulesByTenantId.mockReset();
    services.createAssignmentRule.mockReset();
    services.updateAssignmentRuleById.mockReset();
    services.deleteAssignmentRuleById.mockReset();
    services.hasAssignmentRuleAssigneeSelection.mockImplementation(
      (assignee: { job_field_id: number[]; employee_username: string[] }) =>
        assignee.job_field_id.length > 0 || assignee.employee_username.length > 0,
    );
    services.resolveAuthorizedSettingsTenant.mockResolvedValue({
      principal,
      tenant,
      effectiveUsername: "admin",
    });
    services.validateAssignmentRuleTreeMutation.mockResolvedValue(new Set(["10"]));
    services.getAssignmentRulesByTenantId
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([rule(100, 10, ["worker"])]);
    services.createAssignmentRule.mockResolvedValue(rule(100, 10, ["worker"]));
    services.updateAssignmentRuleById.mockResolvedValue(rule(100, 10, ["worker"]));
    services.deleteAssignmentRuleById.mockResolvedValue(undefined);
    services.assertAssignmentReferencesValidForWrite.mockResolvedValue(undefined);
    services.mapSettingsWriteError.mockImplementation((error) => error);
  });

  it("filters reads to category scope after loading the requested tenant", async () => {
    services.getAssignmentRulesResponseByTenantId.mockResolvedValue([
      rule(100, 10, ["internal"]),
      rule(200, 20, ["portal"]),
    ]);
    services.getCategoryTreeByTenantId.mockResolvedValue([
      { category_id: 20, category_scope: "PORTAL", sub_category: [] },
    ]);

    const response = await handleAssignmentRulePortalApi(
      context("GET", undefined, { tenantId: "7", scope: "PORTAL", isInternal: "false" }),
    );

    expect(services.getAssignmentRulesResponseByTenantId).toHaveBeenCalledWith({
      tenantId: "7",
      isInternal: false,
    });
    await expect(response.json()).resolves.toEqual({
      items: [rule(200, 20, ["portal"])],
      total: 1,
    });
  });

  it("uses canonical authorization and one transaction executor for create", async () => {
    const payload = createPayload();

    const response = await handleAssignmentRulePortalApi(context("PUT", payload));

    expect(services.resolveAuthorizedSettingsTenant).toHaveBeenCalledWith({
      request: expect.any(NextRequest),
      requestedTenantId: "7",
    });
    expect(services.validateAssignmentRuleTreeMutation).toHaveBeenCalledWith({
      principal,
      tenant,
      payload,
    });
    expect(services.assertAssignmentReferencesValidForWrite).toHaveBeenCalledWith(
      query,
      7,
      [{ categoryId: 10, assignee: expect.any(Object) }],
    );
    expect(services.createAssignmentRule).toHaveBeenCalledWith(
      {
        tenant_id: 7,
        category_id: 10,
        assignee: {
          job_field_id: [],
          employee_username: ["worker"],
          include_tenant_company: false,
        },
      },
      query,
    );
    await expect(response.json()).resolves.toEqual([rule(100, 10, ["worker"])]);
  });

  it("updates changed rules and deletes omitted rules in the same transaction", async () => {
    services.getAssignmentRulesByTenantId.mockReset();
    services.getAssignmentRulesByTenantId
      .mockResolvedValueOnce([
        rule(100, 10, ["old"]),
        rule(200, 11, ["remove"]),
      ])
      .mockResolvedValueOnce([rule(100, 10, ["new"])]);
    const payload = createPayload(["new"]);
    payload.categories[0].subCategories.push({
      id: "11",
      assignee: { jobFieldIds: [], assigneeUsernames: [] },
    });

    await handleAssignmentRulePortalApi(context("PUT", payload));

    expect(services.updateAssignmentRuleById).toHaveBeenCalledWith(
      7,
      100,
      expect.objectContaining({ category_id: 10 }),
      query,
    );
    expect(services.deleteAssignmentRuleById).toHaveBeenCalledWith(7, 200, query);
    expect(services.createAssignmentRule).not.toHaveBeenCalled();
  });

  it("propagates a middle write failure through settings error mapping", async () => {
    const failure = Object.assign(new Error("middle failure"), { status: 409 });
    services.createAssignmentRule.mockRejectedValue(failure);

    await expect(
      handleAssignmentRulePortalApi(context("PUT", createPayload())),
    ).rejects.toBe(failure);
    expect(services.mapSettingsWriteError).toHaveBeenCalledWith(
      failure,
      "assignmentRules",
    );
  });

  it("rejects a missing canonical target and invalid tenant id", async () => {
    services.resolveAuthorizedSettingsTenant.mockResolvedValueOnce({
      principal,
      tenant: null,
      effectiveUsername: "admin",
    });
    await expect(
      handleAssignmentRulePortalApi(context("PUT", createPayload())),
    ).rejects.toMatchObject({ status: 400 });

    const invalid = createPayload();
    invalid.tenantId = "invalid";
    services.resolveAuthorizedSettingsTenant.mockResolvedValue({
      principal,
      tenant,
      effectiveUsername: "admin",
    });
    await expect(
      handleAssignmentRulePortalApi(context("PUT", invalid)),
    ).rejects.toThrow("Invalid tenantId");
  });

  it("conceals recommendations outside the canonical operational category", async () => {
    services.getServiceDeskCategoryContext.mockResolvedValue({ categoryId: "10" });
    services.resolveServiceDeskRequestContext.mockResolvedValue({ principal });
    services.canAccessCategory.mockReturnValue(false);

    const denied = await handleAssignmentRulePortalApi(
      recommendationContext({ categoryId: "10", assigneeUsernames: [], language: "en" }),
    );
    expect(denied.status).toBe(404);
    expect(services.getAssignmentRecommendationResponse).not.toHaveBeenCalled();

    services.canAccessCategory.mockReturnValue(true);
    services.getAssignmentRecommendationResponse.mockResolvedValue({ recommendedUsers: [] });
    const allowed = await handleAssignmentRulePortalApi(
      recommendationContext({ categoryId: "10", assigneeUsernames: [], language: "en" }),
    );
    expect(allowed.status).toBe(200);
  });
});

function rule(id: number, categoryId: number, users: string[]) {
  return {
    assignment_rule_id: id,
    category_id: categoryId,
    assignee: {
      job_field_id: [],
      employee_username: users,
      include_tenant_company: false,
    },
  };
}

function createPayload(
  users = ["worker"],
): SaveServiceDeskAssignmentRuleTreePayload {
  return {
    tenantId: "7",
    categories: [
      {
        id: "10",
        assignee: { jobFieldIds: [], assigneeUsernames: users },
        subCategories: [],
      },
    ],
  };
}

function context(
  method: PortalApiMethod,
  body?: object,
  queryValues?: PortalApiQuery,
): ServiceDeskPortalApiContext {
  const path = "/service-desk/assignment-rules";
  return {
    request: new NextRequest("http://localhost/internal"),
    options: {
      path,
      method,
      body,
      query: queryValues,
      errorMessage: "assignment request failed",
    },
    path,
    method,
  };
}

function recommendationContext(body: object): ServiceDeskPortalApiContext {
  const path = "/service-desk/assignment-rules/recommendations";
  return {
    request: new NextRequest("http://localhost/internal"),
    options: { path, method: "POST", body, errorMessage: "recommendation failed" },
    path,
    method: "POST",
  };
}
