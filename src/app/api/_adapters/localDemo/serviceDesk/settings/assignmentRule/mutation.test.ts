import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  getStore: vi.fn(),
  getTenantRules: vi.fn(),
  normalize: vi.fn((rules) => rules),
  build: vi.fn(({ categoryId, assignee }) => ({
    category_id: Number(categoryId),
    assignee: {
      employee_username: assignee.assigneeUsernames,
      job_field_id: assignee.jobFieldIds.map(Number),
    },
  })),
  flatten: vi.fn(),
}));

vi.mock("@/app/api/_adapters/localDemo/serviceDesk/settings/state", () => ({
  replaceLocalDemoAssignmentRules: mocks.replace,
}));
vi.mock("./ruleUtils", () => ({
  buildDbAssignmentRule: mocks.build,
  getAssignmentRuleStore: mocks.getStore,
  getTenantRulesOrThrow: mocks.getTenantRules,
  normalizeAssignmentRules: mocks.normalize,
}));
vi.mock("./treeSync", () => ({ flattenAssignmentRuleTree: mocks.flatten }));

import { localSaveAssignmentRuleTree } from "./mutation";

describe("LOCAL assignment-rule reconciliation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getStore.mockReturnValue({ "7": [] });
    mocks.getTenantRules.mockReturnValue([
      { category_id: 10, assignee: { employee_username: ["old"] } },
      { category_id: 20, assignee: { employee_username: ["preserved"] } },
    ]);
    mocks.flatten.mockReturnValue([
      {
        categoryId: "10",
        assignee: { assigneeUsernames: [], jobFieldIds: [] },
      },
      {
        categoryId: "11",
        assignee: { assigneeUsernames: ["sub-worker"], jobFieldIds: [] },
      },
    ]);
  });

  it("removes an empty submitted rule while preserving unsubmitted rules", () => {
    const result = localSaveAssignmentRuleTree({
      isInternal: false,
      payload: { tenantId: "7", categories: [] },
    });

    expect(result).toEqual([
      {
        category_id: 11,
        assignee: { employee_username: ["sub-worker"], job_field_id: [] },
      },
      { category_id: 20, assignee: { employee_username: ["preserved"] } },
    ]);
    expect(mocks.replace).toHaveBeenCalledWith({
      tenantId: "7",
      categoryIds: new Set(["10", "11"]),
      assignmentRules: [
        {
          category_id: 11,
          assignee: { employee_username: ["sub-worker"], job_field_id: [] },
        },
      ],
    });
  });
});
