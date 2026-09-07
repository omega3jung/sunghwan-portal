import { afterEach, describe, expect, it } from "vitest";

import {
  getLocalDemoAssignmentRules,
  getLocalDemoCategories,
  getLocalDemoTenants,
  resetLocalDemoSettingsState,
} from "@/app/api/_adapters/localDemo/serviceDesk/settings/state";
import {
  resolveApprovedTicketRouting,
  resolveCreateTicketRouting,
} from "@/app/api/_adapters/localDemo/serviceDesk/ticket/createRouting";
import {
  getLocalDemoHistories,
  getLocalDemoTickets,
  resetLocalDemoTicketState,
} from "@/app/api/_adapters/localDemo/serviceDesk/ticket/state";
import { ACCESS_LEVEL } from "@/domain/auth";
import { isOwnerCompany } from "@/domain/organization";

import {
  getApprovalStepStore,
  normalizeCategoryApprovalSettings,
} from "./approvalStep/approvalStepUtils";
import { localSaveApprovalStepTree } from "./approvalStep/mutation";
import { localSaveCategoryTree } from "./category/mutation";
import { getLocalCategoryTrees } from "./category/query";
import {
  localSoftDeleteTenant,
  localUpdateTenant,
} from "./tenant/mutation";

afterEach(() => {
  resetLocalDemoSettingsState();
  resetLocalDemoTicketState();
});

describe("Service Desk settings workflow impacts", () => {
  it.each([
    "Approval",
    "Assigned",
    "Working",
    "Pending",
    "Declined",
    "Rejected",
    "Resolved",
  ] as const)(
    "blocks customer tenant deactivation while a %s ticket exists",
    (status) => {
    const tenant = getLocalDemoTenants().find(
      (item) => !isOwnerCompany(item.tenant_company_id),
    );
    expect(tenant).toBeDefined();
    const ticket = getLocalDemoTickets()[0];
    getLocalDemoTickets().splice(0, getLocalDemoTickets().length, {
      ...ticket,
      id: "tenant-impact-ticket",
      tenant_id: String(tenant?.tenant_id),
      status,
      active: true,
    });

    expect(() =>
      localUpdateTenant({
        id: String(tenant?.tenant_id),
        input: {
          id: String(tenant?.tenant_id),
          companyId: String(tenant?.tenant_company_id),
          name: tenant!.tenant_name,
          color: tenant!.tenant_color,
          active: false,
        },
      }),
    ).toThrow("serviceDesk.tenants.liveTicketsBlockDeactivation");
    expect(() =>
      localSoftDeleteTenant({ id: String(tenant?.tenant_id) }),
    ).toThrow("serviceDesk.tenants.liveTicketsBlockDeactivation");
    },
  );

  it("allows customer tenant deactivation when only Draft or Closed tickets exist", () => {
    const tenant = getLocalDemoTenants().find(
      (item) => !isOwnerCompany(item.tenant_company_id),
    )!;
    const ticket = getLocalDemoTickets()[0];
    getLocalDemoTickets().splice(
      0,
      getLocalDemoTickets().length,
      {
        ...ticket,
        tenant_id: String(tenant.tenant_id),
        status: "Draft",
        active: true,
      },
      {
        ...ticket,
        id: "closed-ticket",
        tenant_id: String(tenant.tenant_id),
        status: "Closed",
        active: true,
      },
    );

    expect(
      localUpdateTenant({
        id: String(tenant.tenant_id),
        input: {
          id: String(tenant.tenant_id),
          companyId: String(tenant.tenant_company_id),
          name: tenant.tenant_name,
          color: tenant.tenant_color,
          active: false,
        },
      }).active,
    ).toBe(false);
  });

  it("always protects the portal-owner Tenant", () => {
    const tenant = getLocalDemoTenants().find((item) =>
      isOwnerCompany(item.tenant_company_id),
    )!;
    getLocalDemoTickets().splice(0, getLocalDemoTickets().length);

    expect(() =>
      localSoftDeleteTenant({ id: String(tenant.tenant_id) }),
    ).toThrow("serviceDesk.tenants.portalOwnerProtected");
  });

  it("warns before category deactivation and preserves existing ticket state when forced", () => {
    const tree = getLocalCategoryTrees(false)[0];
    const category = tree.categories.find((item) => item.active);
    expect(category).toBeDefined();
    const ticket = {
      ...getLocalDemoTickets()[0],
      id: "category-impact-ticket",
      tenant_id: tree.id,
      tenant_name: tree.name,
      category_id: category!.id,
      category_name: category!.name,
      scope: category!.scope,
      status: "Assigned" as const,
      active: true,
    };
    getLocalDemoTickets().splice(0, getLocalDemoTickets().length, ticket);
    const payload = {
      tenantId: tree.id,
      categories: tree.categories.map((item) =>
        item.id === category!.id ? { ...item, active: false } : item,
      ),
    };

    expect(() =>
      localSaveCategoryTree({ isInternal: false, payload }),
    ).toThrow("Category changes affect active tickets.");

    localSaveCategoryTree({
      isInternal: false,
      payload: { ...payload, force: true },
    });
    expect(getLocalDemoTickets()[0]).toEqual(ticket);
  });

  it("blocks new routing but lets an in-flight approval continue after Category deactivation", async () => {
    const categories = getLocalDemoCategories(false)[0];
    const settings = normalizeCategoryApprovalSettings(
      getApprovalStepStore(false)[String(categories.tenant_id)] ?? [],
    );
    const target = settings.find((item) => item.approvalSteps.length > 0)!;
    const mainCategory = categories.category.find(
      (category) => String(category.category_id) === target.id,
    )!;
    mainCategory.category_active = false;
    const requester = getLocalDemoTickets().find(
      (ticket) => String(ticket.tenant_id) === String(categories.tenant_id),
    )?.requester_username ?? getLocalDemoTickets()[0].requester_username;
    const input = {
      isInternal: false,
      categoryId: target.id,
      parentCategoryId: target.id,
      requesterUsername: requester,
    };

    await expect(resolveCreateTicketRouting(input)).rejects.toThrow(
      "serviceDesk.tickets.localDemo.categoryNotFound",
    );
    await expect(
      resolveApprovedTicketRouting({
        ...input,
        currentApprovalStepId: target.approvalSteps[0].id,
      }),
    ).resolves.toMatchObject({
      status: expect.stringMatching(/Approval|Assigned/),
    });
  });

  it("requires force for affected Approval tickets and records an atomic routing reset", async () => {
    const categories = getLocalDemoCategories(false)[0];
    const settings = normalizeCategoryApprovalSettings(
      getApprovalStepStore(false)[String(categories.tenant_id)] ?? [],
    );
    const target = settings.find(
      (item) =>
        item.approvalSteps.length > 0 &&
        categories.category.some(
          (category) =>
            String(category.category_id) === item.id &&
            category.category_active &&
            category.sub_category.some(
              (subCategory) => subCategory.category_active,
            ),
        ),
    );
    expect(target).toBeDefined();
    const targetMainCategory = categories.category.find(
      (category) => String(category.category_id) === target!.id,
    )!;
    const targetSubCategory = targetMainCategory.sub_category.find(
      (subCategory) => subCategory.category_active,
    )!;
    const ticket = {
      ...getLocalDemoTickets()[0],
      id: "approval-impact-ticket",
      tenant_id: String(categories.tenant_id),
      category_id: String(targetSubCategory.category_id),
      category_name: targetSubCategory.category_name,
      scope: target!.scope,
      status: "Approval" as const,
      approval_step_id: target!.approvalSteps[0].id,
      assignee_usernames: ["approval-user"],
      active: true,
    };
    getLocalDemoTickets().splice(0, getLocalDemoTickets().length, ticket);
    const payload = {
      tenantId: String(categories.tenant_id),
      categories: [
        {
          id: target!.id,
          approvalSteps: target!.approvalSteps.map((step, index) =>
            index === 0
              ? {
                  ...step,
                  skipAccessLevel:
                    step.skipAccessLevel === undefined
                      ? ACCESS_LEVEL.ADMIN
                      : undefined,
                }
              : step,
          ),
        },
      ],
    };

    await expect(
      localSaveApprovalStepTree({
        isInternal: false,
        actorUsername: ticket.requester_username,
        payload,
      }),
    ).rejects.toThrow("Approval configuration affects active tickets.");

    await localSaveApprovalStepTree({
      isInternal: false,
      actorUsername: ticket.requester_username,
      payload: { ...payload, force: true },
    });
    expect(
      getLocalDemoHistories().find(
        (history) =>
          history.ticket_id === ticket.id &&
          history.event === "ROUTING_RESET" &&
          JSON.stringify(history.metadata).includes(
            "APPROVAL_CONFIGURATION_CHANGED",
          ),
      ),
    ).toBeDefined();
  });

  it("saves normally without affected Approval tickets", async () => {
    const categories = getLocalDemoCategories(false)[0];
    const settings = normalizeCategoryApprovalSettings(
      getApprovalStepStore(false)[String(categories.tenant_id)] ?? [],
    );
    const target = settings.find((item) => item.approvalSteps.length > 0)!;
    getLocalDemoTickets().splice(0, getLocalDemoTickets().length);

    const saved = await localSaveApprovalStepTree({
      isInternal: false,
      actorUsername: "admin",
      payload: {
        tenantId: String(categories.tenant_id),
        categories: [
          {
            id: target.id,
            approvalSteps: target.approvalSteps.map((step, index) =>
              index === 0
                ? {
                    ...step,
                    skipAccessLevel:
                      step.skipAccessLevel === undefined
                        ? ACCESS_LEVEL.ADMIN
                        : undefined,
                  }
                : step,
            ),
          },
        ],
      },
    });

    expect(saved.find((item) => item.id === target.id)).toBeDefined();
  });

  it("rolls back forced approval settings when one ticket cannot be rerouted", async () => {
    const categories = getLocalDemoCategories(false)[0];
    const settingsBefore = normalizeCategoryApprovalSettings(
      getApprovalStepStore(false)[String(categories.tenant_id)] ?? [],
    );
    const target = settingsBefore.find(
      (item) => item.approvalSteps.length > 0,
    )!;
    const ticket = {
      ...getLocalDemoTickets()[0],
      id: "approval-rollback-ticket",
      tenant_id: String(categories.tenant_id),
      category_id: target.id,
      category_name: target.name,
      scope: target.scope,
      status: "Approval" as const,
      approval_step_id: target.approvalSteps[0].id,
      active: true,
    };
    getLocalDemoTickets().splice(0, getLocalDemoTickets().length, ticket);
    const rules = getLocalDemoAssignmentRules(false);
    for (let index = rules.length - 1; index >= 0; index -= 1) {
      if (String(rules[index].category_id) === target.id) rules.splice(index, 1);
    }

    await expect(
      localSaveApprovalStepTree({
        isInternal: false,
        actorUsername: ticket.requester_username,
        payload: {
          tenantId: String(categories.tenant_id),
          force: true,
          categories: [{ id: target.id, approvalSteps: [] }],
        },
      }),
    ).rejects.toThrow();

    expect(
      normalizeCategoryApprovalSettings(
        getApprovalStepStore(false)[String(categories.tenant_id)] ?? [],
      ).find((item) => item.id === target.id)?.approvalSteps,
    ).toEqual(target.approvalSteps);
    expect(getLocalDemoTickets()[0]).toEqual(ticket);
    expect(
      getLocalDemoHistories().some(
        (history) => history.ticket_id === ticket.id,
      ),
    ).toBe(false);
  });
});
