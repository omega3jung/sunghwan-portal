import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  LocalCompanyEmployee,
  ServiceDeskCategoryContext,
} from "@/app/api/_adapters/localDemo/serviceDesk/eligibility";

const mocks = vi.hoisted(() => ({
  getCategoryContext: vi.fn(),
  getEmployees: vi.fn(),
  getCategoryTrees: vi.fn(),
  getAssignmentRules: vi.fn(),
}));

vi.mock("@/app/api/_adapters/localDemo/serviceDesk/eligibility", () => ({
  getServiceDeskCategoryContext: mocks.getCategoryContext,
  getActiveLocalEmployeesByCompanyId: mocks.getEmployees,
}));

vi.mock(
  "@/app/api/_adapters/localDemo/serviceDesk/settings/category",
  () => ({ getLocalCategoryTrees: mocks.getCategoryTrees }),
);

vi.mock("@/app/api/_adapters/localDemo/serviceDesk/settings/state", () => ({
  getLocalDemoAssignmentRules: mocks.getAssignmentRules,
}));

import { resolveLocalAssignmentRecommendation } from "./recommendation";

const context: ServiceDeskCategoryContext = {
  categoryId: "11",
  mainCategoryId: "10",
  scope: "PORTAL",
  active: true,
  tenant: {
    id: "7",
    companyId: 2,
    isOwnerTenant: false,
    active: true,
    operational: true,
  },
};

const employee = (
  username: string,
  companyId: number,
  jobFieldId: number,
): LocalCompanyEmployee => ({
  id: username.length,
  username,
  name: {
    en: { first: username, middle: "", last: "User" },
    ko: { first: username, middle: "", last: "사용자" },
  },
  email: `${username}@example.com`,
  imageUrl: null,
  departmentId: 1,
  jobFieldId,
  companyId,
  active: true,
});

const categories = [
  {
    id: "7",
    companyId: "2",
    name: { en: "Customer", ko: "고객사" },
    active: true,
    categories: [
      {
        id: "10",
        name: { en: "Hardware", ko: "하드웨어" },
        index: 0,
        active: true,
        scope: "PORTAL" as const,
        defaultPriority: "medium" as const,
        defaultRiskLevel: "low" as const,
        defaultSlaDays: 3,
        subCategories: [
          {
            id: "11",
            name: { en: "Laptop", ko: "노트북" },
            index: 0,
            active: true,
          },
        ],
      },
    ],
  },
];

describe("resolveLocalAssignmentRecommendation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCategoryContext.mockResolvedValue(context);
    mocks.getCategoryTrees.mockReturnValue(categories);
    mocks.getEmployees.mockImplementation((companyId: number) =>
      companyId === 1
        ? [employee("direct", 1, 5), employee("job", 1, 8)]
        : [employee("tenant", 2, 8)],
    );
    mocks.getAssignmentRules.mockReturnValue([]);
  });

  it("rejects a category whose tenant is active but not operational", async () => {
    mocks.getCategoryContext.mockResolvedValue({
      ...context,
      tenant: { ...context.tenant, operational: false },
    });

    await expect(
      resolveLocalAssignmentRecommendation({
        input: { categoryId: "11", assigneeUsernames: [] },
      }),
    ).rejects.toMatchObject({ status: 404 });

    expect(mocks.getAssignmentRules).not.toHaveBeenCalled();
  });

  it("prefers an exact subcategory rule, deduplicates candidates, and excludes existing assignees", async () => {
    mocks.getAssignmentRules.mockReturnValue([
      {
        category_id: 10,
        assignee: { employee_username: ["parent"], job_field_id: [] },
      },
      {
        category_id: 11,
        assignee: {
          employee_username: ["direct", "job"],
          job_field_id: [8],
          include_tenant_company: true,
        },
      },
    ]);

    const result = await resolveLocalAssignmentRecommendation({
      input: {
        categoryId: "11",
        assigneeUsernames: ["direct"],
        language: "ko",
      },
    });

    expect(mocks.getEmployees.mock.calls.map(([id]) => id)).toEqual([1, 2]);
    expect(result).toEqual({
      recommendedUsers: [
        expect.objectContaining({ value: "job", label: "job 사용자" }),
        expect.objectContaining({ value: "tenant", label: "tenant 사용자" }),
      ],
      source: "mixed",
      selectedCategoryLabel: "노트북",
    });
  });

  it("falls back to the main-category rule and limits PORTAL candidates to the owner company", async () => {
    mocks.getAssignmentRules.mockReturnValue([
      {
        category_id: 10,
        assignee: { employee_username: ["direct"], job_field_id: [] },
      },
    ]);

    const result = await resolveLocalAssignmentRecommendation({
      input: { categoryId: "11", assigneeUsernames: [] },
    });

    expect(mocks.getEmployees).toHaveBeenCalledOnce();
    expect(mocks.getEmployees).toHaveBeenCalledWith(1);
    expect(result.recommendedUsers.map(({ value }) => value)).toEqual([
      "direct",
    ]);
    expect(result.source).toBe("employee");
  });

  it("returns the selected label with an empty recommendation when no rule exists", async () => {
    await expect(
      resolveLocalAssignmentRecommendation({
        input: { categoryId: "11", assigneeUsernames: [] },
      }),
    ).resolves.toEqual({
      recommendedUsers: [],
      source: null,
      selectedCategoryLabel: "Laptop",
    });
  });
});
