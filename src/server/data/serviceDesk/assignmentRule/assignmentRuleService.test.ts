import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SaveServiceDeskAssignmentRuleTreePayload } from "@/lib/application/contracts/serviceDesk";

const mocks = vi.hoisted(() => ({
  getCategoryContext: vi.fn(),
  getCategoryTree: vi.fn(),
  findRuleRows: vi.fn(),
  mapRules: vi.fn(),
  getOwnerCompany: vi.fn(),
  getEmployees: vi.fn(),
}));

vi.mock("@/server/data/serviceDesk/category", () => ({
  getServiceDeskCategoryContext: mocks.getCategoryContext,
}));
vi.mock("../category/categoryService", () => ({
  getCategoryTreeByTenantId: mocks.getCategoryTree,
}));
vi.mock("./assignmentRuleRepository", () => ({
  createAssignmentRuleRow: vi.fn(),
  deleteAssignmentRuleRowById: vi.fn(),
  findAssignmentRuleRowByTenantIdAndAssignmentRuleId: vi.fn(),
  findAssignmentRuleRowsByTenantId: mocks.findRuleRows,
  updateAssignmentRuleRowById: vi.fn(),
}));
vi.mock("./assignmentRuleMapper", () => ({
  mapAssignmentRuleRowsToDtos: mocks.mapRules,
  mapAssignmentRuleRowToDto: vi.fn(),
  mapCreateAssignmentRuleInputDtoToRowInput: vi.fn(),
  mapUpdateAssignmentRuleInputDtoToRowInput: vi.fn(),
}));
vi.mock("@/server/data/organization/company", () => ({
  getPortalOwnerCompany: mocks.getOwnerCompany,
}));
vi.mock("@/server/data/organization/employees", () => ({
  getEmployeesByCompanyId: mocks.getEmployees,
}));

import {
  getAssignmentRecommendationResponse,
  validateAssignmentRuleTreeMutation,
} from "./assignmentRuleService";

const tenant = {
  id: "7",
  companyId: 2,
  isOwnerTenant: false,
  active: true,
  operational: true,
};
const principal = {
  permission: 9 as const,
  userScope: "INTERNAL" as const,
  companyId: 1,
};

describe("Assignment settings validation and recommendation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCategoryContext.mockResolvedValue({
      categoryId: "10",
      mainCategoryId: "10",
      scope: "PORTAL",
      tenant,
    });
    mocks.findRuleRows.mockResolvedValue([]);
    mocks.mapRules.mockReturnValue([]);
    mocks.getCategoryTree.mockResolvedValue([]);
    mocks.getOwnerCompany.mockResolvedValue({ company_id: 1 });
    mocks.getEmployees.mockResolvedValue([]);
  });

  it("requires every main category rule to select an assignee", async () => {
    const payload = createPayload();
    payload.categories[0].assignee = {
      jobFieldIds: [],
      assigneeUsernames: [],
    };

    await expect(
      validateAssignmentRuleTreeMutation({ principal, tenant, payload }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("rejects duplicate or cross-tenant category references", async () => {
    const duplicate = createPayload();
    duplicate.categories.push({ ...duplicate.categories[0] });
    await expect(
      validateAssignmentRuleTreeMutation({ principal, tenant, payload: duplicate }),
    ).rejects.toMatchObject({ status: 400 });

    mocks.getCategoryContext.mockResolvedValue({
      categoryId: "10",
      mainCategoryId: "10",
      scope: "PORTAL",
      tenant: { ...tenant, id: "8" },
    });
    await expect(
      validateAssignmentRuleTreeMutation({ principal, tenant, payload: createPayload() }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("prefers an exact subcategory rule and de-duplicates active recommendations", async () => {
    mocks.getCategoryContext.mockResolvedValue({
      categoryId: "11",
      mainCategoryId: "10",
      scope: "PORTAL",
      tenant,
    });
    mocks.getCategoryTree.mockResolvedValue([
      {
        category_id: 10,
        category_name: { en: "Main" },
        sub_category: [{ category_id: 11, category_name: { en: "Sub" } }],
      },
    ]);
    mocks.mapRules.mockReturnValue([
      {
        assignment_rule_id: 1,
        category_id: 10,
        assignee: { employee_username: ["parent"], job_field_id: [], include_tenant_company: false },
      },
      {
        assignment_rule_id: 2,
        category_id: 11,
        assignee: { employee_username: ["direct"], job_field_id: [5], include_tenant_company: false },
      },
    ]);
    mocks.getEmployees.mockResolvedValue([
      createEmployee("direct", 5),
      createEmployee("field-user", 5),
    ]);

    const result = await getAssignmentRecommendationResponse({
      input: {
        categoryId: "11",
        assigneeUsernames: ["field-user"],
        language: "en",
      },
    });

    expect(result.source).toBe("mixed");
    expect(result.selectedCategoryLabel).toBe("Sub");
    expect(result.recommendedUsers.map((user) => user.value)).toEqual(["direct"]);
  });

  it("falls back to the main category rule when no exact rule exists", async () => {
    mocks.getCategoryContext.mockResolvedValue({
      categoryId: "11",
      mainCategoryId: "10",
      scope: "PORTAL",
      tenant,
    });
    mocks.getCategoryTree.mockResolvedValue([
      {
        category_id: 10,
        category_name: { en: "Main" },
        sub_category: [{ category_id: 11, category_name: { en: "Sub" } }],
      },
    ]);
    mocks.mapRules.mockReturnValue([
      {
        assignment_rule_id: 1,
        category_id: 10,
        assignee: { employee_username: ["parent"], job_field_id: [], include_tenant_company: false },
      },
    ]);
    mocks.getEmployees.mockResolvedValue([createEmployee("parent", 4)]);

    const result = await getAssignmentRecommendationResponse({
      input: { categoryId: "11", assigneeUsernames: [], language: "en" },
    });
    expect(result.source).toBe("employee");
    expect(result.recommendedUsers.map((user) => user.value)).toEqual(["parent"]);
  });
});

function createPayload(): SaveServiceDeskAssignmentRuleTreePayload {
  return {
    tenantId: "7",
    categories: [
      {
        id: "10",
        assignee: { jobFieldIds: [], assigneeUsernames: ["worker"] },
        subCategories: [],
      },
    ],
  };
}

function createEmployee(username: string, jobFieldId: number) {
  return {
    username,
    name: { en: { first: username, middle: "", last: "" } },
    email: `${username}@example.com`,
    imageUrl: null,
    jobFieldId,
  };
}
