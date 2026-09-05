import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ApprovalAssigneeType } from "@/domain/serviceDesk";

const mocks = vi.hoisted(() => ({
  categories: vi.fn(),
  tenants: vi.fn(),
  resolveDemoProfile: vi.fn(),
}));

vi.mock("./settings/state", () => ({
  getLocalDemoCategories: mocks.categories,
  getLocalDemoTenants: mocks.tenants,
}));
vi.mock("@/mocks/domain/organization/companies", () => ({
  allCompaniesMock: [
    { company_id: 1, company_active: true, company_portal_owner: true },
    { company_id: 2, company_active: true, company_portal_owner: false },
    { company_id: 3, company_active: false, company_portal_owner: false },
  ],
}));
vi.mock("@/mocks/domain/organization/employee", () => ({
  employeesMock: [
    createDbEmployee(1, "owner.worker", 1, 10, 100),
    createDbEmployee(2, "tenant.manager", 2, 20, 200),
    createDbEmployee(3, "tenant.worker", 2, 20, 201),
    { ...createDbEmployee(4, "inactive.worker", 2, 20, 201), e_active: false },
  ],
}));
vi.mock("@/mocks/domain/organization/employee/demoUser", () => ({
  clientDemoEmployee: [],
}));
vi.mock("@/mocks/domain/organization/jobFields", () => ({
  allJobFieldsMock: [
    { jf_id: 100, jf_company_id: 1, jf_active: true },
    { jf_id: 200, jf_company_id: 2, jf_active: true },
    { jf_id: 999, jf_company_id: 2, jf_active: false },
  ],
}));
vi.mock("@/mocks/domain/user", () => ({
  resolveDemoProfile: mocks.resolveDemoProfile,
}));

import {
  assertApprovalAssigneeEligible,
  assertAssignmentAssigneeEligible,
  getServiceDeskCategoryContext,
} from "./eligibility";

const portalCategory = {
  categoryId: "10",
  mainCategoryId: "10",
  scope: "PORTAL" as const,
  active: true,
  tenant: {
    id: "7",
    companyId: 2,
    isOwnerTenant: false,
    active: true,
    operational: true,
  },
};

describe("LOCAL Service Desk eligibility boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveDemoProfile.mockImplementation((username: string) => ({
      permission: username === "tenant.manager" ? 9 : 3,
    }));
    mocks.tenants.mockReturnValue([
      { tenant_id: 7, tenant_company_id: 2, tenant_active: true },
    ]);
    mocks.categories.mockImplementation((isInternal: boolean) =>
      isInternal
        ? []
        : [
            {
              tenant_id: 7,
              category: [
                {
                  category_id: 10,
                  category_scope: "PORTAL",
                  category_active: true,
                  sub_category: [
                    { category_id: 11, category_active: true },
                  ],
                },
              ],
            },
          ],
    );
  });

  it("fails closed when a fixture category id resolves to multiple tenant trees", async () => {
    mocks.categories.mockReturnValue([
      {
        tenant_id: 7,
        category: [
          { category_id: 10, category_scope: "PORTAL", category_active: true, sub_category: [] },
        ],
      },
      {
        tenant_id: 8,
        category: [
          { category_id: 10, category_scope: "PORTAL", category_active: true, sub_category: [] },
        ],
      },
    ]);

    await expect(getServiceDeskCategoryContext(10)).resolves.toBeNull();
  });

  it("marks an inactive company context non-operational", async () => {
    mocks.tenants.mockReturnValue([
      { tenant_id: 7, tenant_company_id: 3, tenant_active: true },
    ]);
    const context = await getServiceDeskCategoryContext(10);
    expect(context?.tenant).toMatchObject({ active: true, operational: false });
  });

  const approvalCases: [string, ApprovalAssigneeType][] = [
    [
      "employee",
      { type: "EMPLOYEE", employeeUsernames: ["tenant.worker"] },
    ],
    ["department", { type: "DEPARTMENT", departmentId: "20" }],
    ["job field", { type: "JOB_FIELD", jobFieldId: "200" }],
    ["manager", { type: "MANAGER", managerDistance: 1 }],
  ];

  it.each(approvalCases)("accepts an active tenant-company %s approval target", async (_label, assignee) => {
    await expect(
      assertApprovalAssigneeEligible({ category: portalCategory, assignee }),
    ).resolves.toBeUndefined();
  });

  it("rejects inactive or cross-company approval employees", async () => {
    await expect(
      assertApprovalAssigneeEligible({
        category: portalCategory,
        assignee: {
          type: "EMPLOYEE",
          employeeUsernames: ["inactive.worker", "owner.worker"],
        },
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("enforces INTERNAL and PORTAL assignment company boundaries", async () => {
    await expect(
      assertAssignmentAssigneeEligible({
        category: { ...portalCategory, scope: "INTERNAL" },
        assignee: {
          assigneeUsernames: ["owner.worker"],
          jobFieldIds: [],
          includeTenantCompany: true,
        },
      }),
    ).rejects.toMatchObject({ status: 400 });

    await expect(
      assertAssignmentAssigneeEligible({
        category: portalCategory,
        assignee: {
          assigneeUsernames: ["owner.worker", "tenant.worker"],
          jobFieldIds: ["100", "200"],
          includeTenantCompany: true,
        },
      }),
    ).resolves.toBeUndefined();
  });
});

function createDbEmployee(
  id: number,
  username: string,
  companyId: number,
  departmentId: number,
  jobFieldId: number,
) {
  return {
    e_id: id,
    e_username: username,
    e_name: { en: { first: username, middle: "", last: "" } },
    e_email: `${username}@example.com`,
    e_image_url: null,
    e_department_id: departmentId,
    e_job_field_id: jobFieldId,
    e_company_id: companyId,
    e_active: true,
  };
}
