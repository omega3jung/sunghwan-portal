import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SaveServiceDeskApprovalStepTreePayload } from "@/lib/application/contracts/serviceDesk";

const mocks = vi.hoisted(() => ({
  getCategoryTree: vi.fn(),
  getCategoryContext: vi.fn(),
  findRows: vi.fn(),
  mapRows: vi.fn(),
}));

vi.mock("../category/categoryService", () => ({
  getCategoryTreeByTenantId: mocks.getCategoryTree,
  getServiceDeskCategoryContext: mocks.getCategoryContext,
}));
vi.mock("./approvalStepRepository", () => ({
  createApprovalStepRow: vi.fn(),
  deleteApprovalStepRowById: vi.fn(),
  findApprovalStepRowsByTenantId: mocks.findRows,
  findApprovalStepRowsByTenantIdAndApprovalStepId: vi.fn(),
  updateApprovalStepRowById: vi.fn(),
}));
vi.mock("./approvalStepMapper", () => ({
  mapApprovalStepRowsToDtos: mocks.mapRows,
  mapApprovalStepRowToDto: vi.fn(),
  mapCreateApprovalStepInputDtoToRowInput: vi.fn(),
  mapUpdateApprovalStepInputDtoToRowInput: vi.fn(),
}));

import { validateApprovalStepTreeMutation } from "./approvalStepService";

const tenant = {
  id: "7",
  companyId: 2,
  isOwnerTenant: false,
  active: true,
  operational: true,
};
const principal = {
  permission: 9 as const,
  userScope: "CLIENT" as const,
  companyId: 2,
};

describe("Approval settings write validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findRows.mockResolvedValue([]);
    mocks.mapRows.mockReturnValue([]);
    mocks.getCategoryTree.mockResolvedValue([
      { category_id: 10, category_scope: "PORTAL", sub_category: [] },
    ]);
    mocks.getCategoryContext.mockResolvedValue({
      categoryId: "10",
      mainCategoryId: "10",
      scope: "PORTAL",
      tenant,
    });
  });

  it("accepts a manageable main category in the target tenant", async () => {
    await expect(
      validateApprovalStepTreeMutation({
        principal,
        tenant,
        payload: createPayload(),
      }),
    ).resolves.toEqual(new Set(["PORTAL"]));
  });

  it("rejects a category from another tenant or a subcategory", async () => {
    mocks.getCategoryContext.mockResolvedValue({
      categoryId: "10",
      mainCategoryId: "9",
      scope: "PORTAL",
      tenant: { ...tenant, id: "8" },
    });

    await expect(
      validateApprovalStepTreeMutation({ principal, tenant, payload: createPayload() }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("rejects duplicate category submissions", async () => {
    const payload = createPayload();
    payload.categories.push({ ...payload.categories[0] });

    await expect(
      validateApprovalStepTreeMutation({ principal, tenant, payload }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("prevents an existing approval step from moving categories", async () => {
    mocks.mapRows.mockReturnValue([
      {
        approval_step_id: 101,
        category_id: 10,
        approval_step_index: 1,
        approval_step_name: { en: "Existing" },
        approval_step_description: null,
        approval_step_assignee: { type: "EMPLOYEE", employee_username: ["a"] },
        skip_access_level: null,
      },
    ]);
    mocks.getCategoryTree.mockResolvedValue([
      { category_id: 10, category_scope: "PORTAL", sub_category: [] },
      { category_id: 20, category_scope: "PORTAL", sub_category: [] },
    ]);
    mocks.getCategoryContext.mockResolvedValue({
      categoryId: "20",
      mainCategoryId: "20",
      scope: "PORTAL",
      tenant,
    });
    const payload = createPayload("20", "101");

    await expect(
      validateApprovalStepTreeMutation({ principal, tenant, payload }),
    ).rejects.toMatchObject({ status: 400 });
  });
});

function createPayload(categoryId = "10", stepId?: string):
  SaveServiceDeskApprovalStepTreePayload {
  return {
    tenantId: "7",
    categories: [
      {
        id: categoryId,
        approvalSteps: [
          {
            ...(stepId ? { id: stepId } : {}),
            name: { en: "Approval" },
            index: 1,
            stepAssignee: { type: "EMPLOYEE", employeeUsernames: ["a"] },
          },
        ],
      },
    ],
  };
}
