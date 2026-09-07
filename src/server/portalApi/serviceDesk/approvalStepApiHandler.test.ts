import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SaveServiceDeskApprovalStepTreePayload } from "@/lib/application/contracts/serviceDesk";

import type { PortalApiMethod, PortalApiQuery } from "../types";
import type { ServiceDeskPortalApiContext } from "./serviceDeskPortalApiUtils";

const query = vi.hoisted(() => vi.fn());
const services = vi.hoisted(() => ({
  createApprovalStep: vi.fn(),
  deleteApprovalStepById: vi.fn(),
  getApprovalSettingsResponseByTenantId: vi.fn(),
  getCategoryApprovalSettingsByTenantId: vi.fn(),
  updateApprovalStepById: vi.fn(),
  validateApprovalStepTreeMutation: vi.fn(),
  assertApprovalReferencesValidForWrite: vi.fn(),
  mapSettingsWriteError: vi.fn(),
  findActiveTicketViewRowById: vi.fn(),
  updateTicketInitialRoutingById: vi.fn(),
  resolveInitialTicketRouting: vi.fn(),
  createTicketHistory: vi.fn(),
  resolveAuthorizedSettingsTenant: vi.fn(),
}));

vi.mock("@/server/data/serviceDesk/approvalStep", () => ({
  createApprovalStep: services.createApprovalStep,
  deleteApprovalStepById: services.deleteApprovalStepById,
  getApprovalSettingsResponseByTenantId: services.getApprovalSettingsResponseByTenantId,
  getCategoryApprovalSettingsByTenantId: services.getCategoryApprovalSettingsByTenantId,
  updateApprovalStepById: services.updateApprovalStepById,
  validateApprovalStepTreeMutation: services.validateApprovalStepTreeMutation,
}));
vi.mock("@/server/data/serviceDesk/shared", () => ({
  assertApprovalReferencesValidForWrite: services.assertApprovalReferencesValidForWrite,
  mapSettingsWriteError: services.mapSettingsWriteError,
}));
vi.mock("@/server/data/serviceDesk/ticket/ticketRepository", () => ({
  findActiveTicketViewRowById: services.findActiveTicketViewRowById,
}));
vi.mock("@/server/data/serviceDesk/ticket/ticketUpdateRepository", () => ({
  updateTicketInitialRoutingById: services.updateTicketInitialRoutingById,
}));
vi.mock("@/server/data/serviceDesk/ticketAction/shared/ticketActionRouting", () => ({
  resolveInitialTicketRouting: services.resolveInitialTicketRouting,
}));
vi.mock("@/server/data/serviceDesk/ticketHistory", () => ({
  createTicketHistory: services.createTicketHistory,
}));
vi.mock("@/server/shared/supabase/portalApiClient", () => ({
  withPortalApiTransaction: (callback: (executor: typeof query) => unknown) =>
    callback(query),
}));
vi.mock("./shared", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./shared")>();
  return {
    ...actual,
    resolveAuthorizedSettingsTenant: services.resolveAuthorizedSettingsTenant,
  };
});

import { handleApprovalStepPortalApi } from "./approvalStepApiHandler";
import { handleServiceDeskPortalApi } from "./serviceDeskPortalApiHandler";

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
  userScope: "CLIENT",
  companyId: 2,
};

describe("REMOTE approval-step handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    query.mockReset();
    services.getCategoryApprovalSettingsByTenantId.mockReset();
    services.createApprovalStep.mockReset();
    services.updateApprovalStepById.mockReset();
    services.deleteApprovalStepById.mockReset();
    services.resolveAuthorizedSettingsTenant.mockResolvedValue({
      principal,
      tenant,
      effectiveUsername: "effective-admin",
    });
    services.validateApprovalStepTreeMutation.mockResolvedValue(new Set(["PORTAL"]));
    services.assertApprovalReferencesValidForWrite.mockResolvedValue(undefined);
    services.mapSettingsWriteError.mockImplementation((error) => error);
    services.getCategoryApprovalSettingsByTenantId
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([approvalCategory(10, "PORTAL", [step(100, 10)])]);
    services.createApprovalStep.mockResolvedValue(step(100, 10));
    services.updateApprovalStepById.mockResolvedValue(step(100, 10));
    services.deleteApprovalStepById.mockResolvedValue(undefined);
    query.mockResolvedValue([]);
  });

  it("filters GET results by requested scope", async () => {
    services.getApprovalSettingsResponseByTenantId.mockResolvedValue([
      approvalCategory(10, "INTERNAL", []),
      approvalCategory(20, "PORTAL", []),
    ]);

    const response = await handleApprovalStepPortalApi(
      context("GET", undefined, {
        tenantId: "7",
        scope: "PORTAL",
        isInternal: "false",
      }),
    );

    expect(services.getApprovalSettingsResponseByTenantId).toHaveBeenCalledWith({
      tenantId: "7",
      isInternal: false,
    });
    await expect(response.json()).resolves.toEqual({
      items: [approvalCategory(20, "PORTAL", [])],
      total: 1,
    });
  });

  it("uses canonical authorization and one transaction executor for create", async () => {
    const payload = createPayload();

    const response = await handleApprovalStepPortalApi(context("PUT", payload));

    expect(services.resolveAuthorizedSettingsTenant).toHaveBeenCalledWith({
      request: expect.any(NextRequest),
      requestedTenantId: "7",
    });
    expect(services.validateApprovalStepTreeMutation).toHaveBeenCalledWith({
      principal,
      tenant,
      payload,
      query,
    });
    expect(services.assertApprovalReferencesValidForWrite).toHaveBeenCalledWith(
      query,
      7,
      [
        {
          categoryId: 10,
          assignee: { type: "EMPLOYEE", employee_username: ["approver"] },
        },
      ],
    );
    expect(services.createApprovalStep).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant_id: 7,
        category_id: 10,
        approval_step_index: 1,
      }),
      query,
    );
    await expect(response.json()).resolves.toEqual([
      approvalCategory(10, "PORTAL", [step(100, 10)]),
    ]);
  });

  it("deletes omitted steps, moves retained indexes, updates them, and creates new steps", async () => {
    services.getCategoryApprovalSettingsByTenantId.mockReset();
    services.getCategoryApprovalSettingsByTenantId
      .mockResolvedValueOnce([
        approvalCategory(10, "PORTAL", [step(100, 10), step(200, 10, 2)]),
      ])
      .mockResolvedValueOnce([approvalCategory(10, "PORTAL", [step(100, 10)])]);
    const payload = createPayload("100");
    payload.categories[0].approvalSteps.push({
      name: { en: "New" },
      index: 2,
      stepAssignee: { type: "MANAGER", managerDistance: 1 },
    });

    await handleApprovalStepPortalApi(context("PUT", payload));

    expect(services.deleteApprovalStepById).toHaveBeenCalledWith(7, 200, query);
    expect(services.updateApprovalStepById).toHaveBeenCalledTimes(2);
    expect(services.updateApprovalStepById).toHaveBeenNthCalledWith(
      1,
      7,
      100,
      expect.objectContaining({ approval_step_index: 3 }),
      query,
    );
    expect(services.updateApprovalStepById).toHaveBeenNthCalledWith(
      2,
      7,
      100,
      expect.objectContaining({ approval_step_index: 1 }),
      query,
    );
    expect(services.createApprovalStep).toHaveBeenCalledWith(
      expect.objectContaining({
        approval_step_index: 2,
        approval_step_assignee: { type: "MANAGER", level: 1 },
      }),
      query,
    );
  });

  it("blocks a configuration change that affects active Approval tickets unless forced", async () => {
    query.mockResolvedValue([{ tk_id: "ticket-1" }]);

    await expect(
      handleApprovalStepPortalApi(context("PUT", createPayload())),
    ).rejects.toMatchObject({
      status: 409,
      code: "APPROVAL_CONFIGURATION_IMPACT",
    });
    expect(services.createApprovalStep).not.toHaveBeenCalled();
  });

  it("reroutes affected tickets atomically and records the effective actor when forced", async () => {
    query.mockResolvedValue([{ tk_id: "ticket-1" }]);
    services.findActiveTicketViewRowById.mockResolvedValue({
      tk_id: "ticket-1",
      tk_approval_step_id: 100,
      tk_assignee_usernames: ["old-approver"],
    });
    services.resolveInitialTicketRouting.mockResolvedValue({
      approvalStepId: 200,
      assigneeUsernames: ["new-approver"],
      status: "Approval",
    });
    services.updateTicketInitialRoutingById.mockResolvedValue({ tk_id: "ticket-1" });

    await handleApprovalStepPortalApi(
      context("PUT", { ...createPayload(), force: true }),
    );

    expect(services.updateTicketInitialRoutingById).toHaveBeenCalledWith(
      "ticket-1",
      {
        approvalStepId: 200,
        assigneeUsernames: ["new-approver"],
        status: "Approval",
      },
      { query },
    );
    expect(services.createTicketHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: "ticket-1",
        actorUsername: "effective-admin",
        event: "ROUTING_RESET",
        fromValue: {
          approvalStepId: "100",
          assigneeUsernames: ["old-approver"],
        },
        toValue: {
          approvalStepId: "200",
          assigneeUsernames: ["new-approver"],
        },
      }),
      { query },
    );
  });

  it("maps a middle service failure to an HTTP response through the REMOTE dispatcher", async () => {
    const failure = Object.assign(new Error("middle failure"), { status: 409 });
    services.createApprovalStep.mockRejectedValue(failure);
    const payload = createPayload();

    const response = await handleServiceDeskPortalApi(new NextRequest("http://localhost"), {
      path: "/service-desk/approval-steps",
      method: "PUT",
      body: payload,
      errorMessage: "approval save failed",
    });

    expect(response.status).toBe(409);
    expect(services.mapSettingsWriteError).toHaveBeenCalledWith(failure, "approvalSteps");
  });

  it("requires the authorization layer to return a canonical target tenant", async () => {
    services.resolveAuthorizedSettingsTenant.mockResolvedValue({
      principal,
      tenant: null,
      effectiveUsername: "effective-admin",
    });

    await expect(
      handleApprovalStepPortalApi(context("PUT", createPayload())),
    ).rejects.toMatchObject({ status: 400 });
  });
});

function step(id: number, categoryId: number, index = 1) {
  return {
    approval_step_id: id,
    category_id: categoryId,
    approval_step_index: index,
    approval_step_name: { en: `Step ${id}` },
    approval_step_description: null,
    approval_step_assignee: { type: "EMPLOYEE", employee_username: ["approver"] },
    skip_access_level: null,
  };
}

function approvalCategory(
  categoryId: number,
  scope: "INTERNAL" | "PORTAL",
  approvalSteps: ReturnType<typeof step>[],
) {
  return {
    category_id: categoryId,
    category_scope: scope,
    approval_step: approvalSteps,
  };
}

function createPayload(stepId?: string): SaveServiceDeskApprovalStepTreePayload {
  return {
    tenantId: "7",
    categories: [
      {
        id: "10",
        approvalSteps: [
          {
            ...(stepId ? { id: stepId } : {}),
            name: { en: "Approval" },
            index: 1,
            stepAssignee: { type: "EMPLOYEE", employeeUsernames: ["approver"] },
          },
        ],
      },
    ],
  };
}

function context(
  method: PortalApiMethod,
  body?: object,
  queryValues?: PortalApiQuery,
): ServiceDeskPortalApiContext {
  const path = "/service-desk/approval-steps";
  return {
    request: new NextRequest("http://localhost/internal"),
    options: {
      path,
      method,
      body,
      query: queryValues,
      errorMessage: "approval request failed",
    },
    path,
    method,
  };
}
