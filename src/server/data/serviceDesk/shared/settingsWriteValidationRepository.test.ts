import { describe, expect, it, vi } from "vitest";

import {
  assertApprovalReferencesValidForWrite,
  assertAssignmentReferencesValidForWrite,
  assertCategoriesReadyForActivation,
} from "./settingsWriteValidationRepository";

describe("Settings write database validation", () => {
  it("selects every category context column consumed by approval validation", async () => {
    const query = vi.fn().mockResolvedValue([{ error_code: null }]);

    await assertApprovalReferencesValidForWrite(query, 7, [
      { categoryId: 10, assignee: { type: "EMPLOYEE", employee_username: ["a"] } },
    ]);

    const sql = String(query.mock.calls[0][0]);
    expect(sql).toContain("cat.cat_scope as category_scope");
    expect(sql).toContain("owner_company.c_id as owner_company_id");
  });

  it("selects scope and owner company context consumed by assignment validation", async () => {
    const query = vi.fn().mockResolvedValue([{ error_code: null }]);

    await assertAssignmentReferencesValidForWrite(query, 7, [
      {
        categoryId: 10,
        assignee: {
          employee_username: ["a"],
          job_field_id: [],
          include_tenant_company: false,
        },
      },
    ]);

    const sql = String(query.mock.calls[0][0]);
    expect(sql).toContain("main.cat_scope as category_scope");
    expect(sql).toContain("owner_company.c_id as owner_company_id");
    expect(sql).toContain("join public.company owner_company");
  });

  it.each([
    [assertApprovalReferencesValidForWrite, "categoryNotFound"],
    [assertAssignmentReferencesValidForWrite, "categoryNotFound"],
  ])("maps missing categories to a stable write error", async (validate, message) => {
    const query = vi.fn().mockResolvedValue([{ error_code: "CATEGORY_NOT_FOUND" }]);
    await expect(validate(query, 7, [])).rejects.toMatchObject({
      message: expect.stringContaining(message),
      status: 400,
    });
  });

  it("requires every requested activation target to have a valid worker", async () => {
    const query = vi.fn().mockResolvedValue([
      { category_id: 10, has_effective_valid_worker: true },
      { category_id: 11, has_effective_valid_worker: false },
    ]);

    await expect(
      assertCategoriesReadyForActivation(7, [10, 11], query),
    ).rejects.toMatchObject({ status: 400 });
  });
});
