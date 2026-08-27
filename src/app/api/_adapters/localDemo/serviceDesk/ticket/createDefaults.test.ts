import { afterEach, describe, expect, it } from "vitest";

import { getLocalDemoCategories } from "@/app/api/_adapters/localDemo/serviceDesk/settings/state";
import { resetLocalDemoTicketState } from "@/app/api/_adapters/localDemo/serviceDesk/ticket/state";
import { allEmployeesMock } from "@/mocks/domain/organization/employee";

import { localCreateTicket } from "./create";
import { localRequesterUpdateTicket } from "./requesterUpdate";
import { getLocalDemoTickets } from "./state";

afterEach(resetLocalDemoTicketState);

describe("LOCAL ticket create category defaults", () => {
  it("uses category defaults only when valid explicit values are absent", async () => {
    const tenant = getLocalDemoCategories(false).find((item) =>
      item.category.some((category) => category.category_active),
    )!;
    const category = tenant.category.find(
      (item) => item.category_active && item.sub_category.length === 0,
    ) ?? tenant.category.find((item) => item.category_active)!;
    const selectedCategory =
      category.sub_category.find((item) => item.category_active) ?? category;
    const requester = allEmployeesMock.find(
      (employee) =>
        String(employee.e_company_id) === String(tenant.tenant_company_id),
    )!;
    const baseInput = {
      tenantId: tenant.tenant_id,
      categoryId: selectedCategory.category_id,
      subject: "Default policy regression",
      body: "Verify defaults and explicit overrides.",
      dueAt: "2099-01-01T00:00:00.000Z",
      email: { to: [], cc: [], bcc: [] },
      files: [],
      images: [],
      priority: null,
      riskLevel: null,
    };
    const access = {
      username: requester.e_username,
      userScope: "CLIENT" as const,
      tenantId: String(tenant.tenant_id),
    };

    const defaulted = await localCreateTicket({
      isInternal: false,
      access,
      requesterUsername: requester.e_username,
      input: baseInput,
    });
    expect(defaulted.priority).toBe(
      selectedCategory.default_priority ?? category.default_priority,
    );
    expect(defaulted.riskLevel).toBe(
      selectedCategory.default_risk_level ?? category.default_risk_level,
    );

    const overridden = await localCreateTicket({
      isInternal: false,
      access,
      requesterUsername: requester.e_username,
      input: { ...baseInput, priority: "urgent", riskLevel: "critical" },
    });
    expect(overridden.priority).toBe("urgent");
    expect(overridden.riskLevel).toBe("critical");
  });
});

describe("LOCAL requester Category change defaults", () => {
  it("applies the new category defaults and preserves a later existing due date", async () => {
    const tenant = getLocalDemoCategories(false).find(
      (item) => item.category.filter((category) => category.category_active).length > 1,
    )!;
    const selectableCategories = tenant.category.flatMap((category) => [
      ...(category.category_active ? [category] : []),
      ...category.sub_category.filter(
        (subCategory) => category.category_active && subCategory.category_active,
      ),
    ]);
    const [currentCategory, nextCategory] = selectableCategories;
    const nextMainCategory = tenant.category.find(
      (category) =>
        String(category.category_id) === String(nextCategory.category_id) ||
        category.sub_category.some(
          (subCategory) =>
            String(subCategory.category_id) === String(nextCategory.category_id),
        ),
    )!;
    const requester = allEmployeesMock.find(
      (employee) =>
        String(employee.e_company_id) === String(tenant.tenant_company_id),
    )!;
    const ticket = {
      ...getLocalDemoTickets()[0],
      id: "category-default-update-ticket",
      tenant_id: String(tenant.tenant_id),
      tenant_name: tenant.tenant_name,
      requester_username: requester.e_username,
      category_id: String(currentCategory.category_id),
      category_name: currentCategory.category_name,
      scope: nextMainCategory.category_scope,
      status: "Assigned" as const,
      due_at: "2099-12-31T00:00:00.000Z",
      active: true,
    };
    getLocalDemoTickets().splice(0, getLocalDemoTickets().length, ticket);

    const updated = await localRequesterUpdateTicket({
      isInternal: false,
      access: {
        username: requester.e_username,
        userScope: "CLIENT",
        tenantId: String(tenant.tenant_id),
      },
      ticketId: ticket.id,
      requesterUsername: requester.e_username,
      input: {
        categoryId: String(nextCategory.category_id),
        subject: ticket.subject,
        content: ticket.content,
        dueAt: "2027-01-01T00:00:00.000Z",
        email: ticket.email,
        files: ticket.files,
        images: ticket.images,
      },
    });

    expect(updated.priority).toBe(
      nextCategory.default_priority ?? nextMainCategory.default_priority,
    );
    expect(updated.riskLevel).toBe(
      nextCategory.default_risk_level ?? nextMainCategory.default_risk_level,
    );
    expect(updated.dueAt).toBe("2099-12-31T00:00:00.000Z");
  });
});
