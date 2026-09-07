import { beforeEach, describe, expect, it, vi } from "vitest";

const eligibility = vi.hoisted(() => ({
  getServiceDeskCategoryContext: vi.fn(),
  getActiveLocalEmployeesByCompanyId: vi.fn(),
}));
const settings = vi.hoisted(() => ({
  getLocalDemoApprovalSteps: vi.fn(),
  getLocalDemoAssignmentRules: vi.fn(),
}));
const users = vi.hoisted(() => ({
  resolveDemoAuth: vi.fn(),
}));

vi.mock(
  "@/app/api/_adapters/localDemo/serviceDesk/eligibility",
  () => eligibility,
);
vi.mock(
  "@/app/api/_adapters/localDemo/serviceDesk/settings/state",
  () => settings,
);
vi.mock("@/mocks/domain/user", () => users);

import {
  resolveApprovedTicketRouting,
  resolveCreateTicketRouting,
} from "./createRouting";

const categoryContext = {
  categoryId: "101",
  mainCategoryId: "100",
  scope: "PORTAL" as const,
  active: true,
  tenant: {
    id: "20",
    companyId: 20,
    isOwnerTenant: false,
    active: true,
    operational: true,
  },
};

const employees = [
  {
    id: 1,
    username: "first-approver",
    departmentId: 1,
    jobFieldId: 1,
    companyId: 20,
    active: true,
  },
  {
    id: 2,
    username: "final-approver",
    departmentId: 2,
    jobFieldId: 2,
    companyId: 20,
    active: true,
  },
  {
    id: 3,
    username: "sub-worker",
    departmentId: 3,
    jobFieldId: 3,
    companyId: 1,
    active: true,
  },
  {
    id: 4,
    username: "main-worker",
    departmentId: 4,
    jobFieldId: 4,
    companyId: 1,
    active: true,
  },
];

function approvalStep({
  id,
  index,
  username,
  skipAccessLevel = null,
}: {
  id: number;
  index: number;
  username: string;
  skipAccessLevel?: number | null;
}) {
  return {
    approval_step_id: id,
    approval_step_name: { en: `Step ${id}` },
    approval_step_description: null,
    approval_step_index: index,
    category_id: 100,
    approval_step_assignee: {
      type: "EMPLOYEE" as const,
      employee_username: [username],
    },
    skip_access_level: skipAccessLevel,
  };
}

describe("LOCAL ticket routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eligibility.getServiceDeskCategoryContext.mockResolvedValue(
      categoryContext,
    );
    eligibility.getActiveLocalEmployeesByCompanyId.mockImplementation(
      (companyId: number) =>
        employees.filter((employee) => employee.companyId === companyId),
    );
    users.resolveDemoAuth.mockReturnValue({ permission: 5 });
    settings.getLocalDemoApprovalSteps.mockReturnValue([]);
    settings.getLocalDemoAssignmentRules.mockReturnValue([]);
  });

  it("uses main-category approval fallback and skips steps covered by requester access", async () => {
    settings.getLocalDemoApprovalSteps.mockReturnValue([
      {
        category_id: 100,
        approval_step: [
          approvalStep({
            id: 1,
            index: 0,
            username: "first-approver",
            skipAccessLevel: 5,
          }),
          approvalStep({
            id: 2,
            index: 1,
            username: "final-approver",
          }),
        ],
      },
    ]);

    await expect(
      resolveCreateTicketRouting({
        isInternal: false,
        categoryId: "101",
        parentCategoryId: "100",
        requesterUsername: "requester",
      }),
    ).resolves.toEqual({
      status: "Approval",
      approvalStepId: "2",
      assigneeUsernames: ["final-approver"],
    });
  });

  it("prefers a subcategory assignment rule after the final approval step", async () => {
    settings.getLocalDemoApprovalSteps.mockReturnValue([
      {
        category_id: 100,
        approval_step: [
          approvalStep({
            id: 2,
            index: 0,
            username: "final-approver",
          }),
        ],
      },
    ]);
    settings.getLocalDemoAssignmentRules.mockReturnValue([
      {
        category_id: 100,
        assignee: {
          employee_username: ["main-worker"],
          job_field_id: [],
        },
      },
      {
        category_id: 101,
        assignee: {
          employee_username: ["sub-worker"],
          job_field_id: [],
        },
      },
    ]);

    await expect(
      resolveApprovedTicketRouting({
        isInternal: false,
        categoryId: "101",
        parentCategoryId: "100",
        requesterUsername: "requester",
        currentApprovalStepId: "2",
      }),
    ).resolves.toEqual({
      status: "Assigned",
      approvalStepId: null,
      assigneeUsernames: ["sub-worker"],
    });
  });

  it("fails a broken subcategory rule instead of silently falling back to the main rule", async () => {
    settings.getLocalDemoAssignmentRules.mockReturnValue([
      {
        category_id: 100,
        assignee: {
          employee_username: ["main-worker"],
          job_field_id: [],
        },
      },
      {
        category_id: 101,
        assignee: {
          employee_username: ["inactive-worker"],
          job_field_id: [],
        },
      },
    ]);

    await expect(
      resolveCreateTicketRouting({
        isInternal: false,
        categoryId: "101",
        parentCategoryId: "100",
        requesterUsername: "requester",
      }),
    ).rejects.toMatchObject({ status: 409 });
  });
});
