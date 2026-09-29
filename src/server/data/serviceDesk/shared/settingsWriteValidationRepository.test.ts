import { describe, expect, it, vi } from "vitest";

import {
  assertApprovalReferencesValidForWrite,
  assertAssignmentReferencesValidForWrite,
  assertCategoriesReadyForActivation,
} from "./settingsWriteValidationRepository";

describe("Settings write database validation", () => {
  it.each([1, 2])("validates MANAGER level %s through tenant-scoped active ancestry in the write transaction", async (level) => {
    const query = vi.fn().mockResolvedValue([{ error_code: null }]);
    const references = [{ categoryId: 10, assignee: { type: "MANAGER", level } }];
    await assertApprovalReferencesValidForWrite(query, 7, references);
    const [sql, params] = query.mock.calls[0];
    expect(params).toEqual([7, JSON.stringify(references)]);
    expect(sql).toContain("not in ('1', '2')");
    expect(sql).toContain("parent.jf_id = requester_field.jf_parent_id");
    expect(sql).toContain("grandparent.jf_id = parent.jf_parent_id");
    expect(sql).toContain("manager.e_company_id = context.tn_company_id");
    expect(sql).toContain("requester_field.jf_active = true");
    expect(sql).toContain("grandparent_department.d_active = true");
    expect(sql).not.toContain("aa_access_level");
    expect(sql).not.toContain("vw_auth_login_user");
    query.mockResolvedValue([{ error_code: "INVALID_ORGANIZATION_REFERENCE" }]);
    await expect(assertApprovalReferencesValidForWrite(query, 7, references)).rejects.toMatchObject({ status: 400 });
  });

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
    expect(sql).toContain("department.d_company_id = context.tn_company_id");
    expect(sql).not.toContain("job_field.jf_company_id");
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
    const sql = String(query.mock.calls[0][0]);
    expect(sql).toContain("department.d_id = job_field.jf_department_id");
    expect(sql).not.toContain("job_field.jf_company_id");
  });
});
