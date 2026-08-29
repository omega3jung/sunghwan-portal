import { describe, expect, it } from "vitest";

import type { TreeNodes } from "@/components/custom/SortableTree";
import { ACCESS_LEVEL } from "@/domain/auth";
import type { ApprovalAssigneeType } from "@/domain/serviceDesk";

import type { ApprovalStepData, CategoryApprovalStepData } from "../types";
import {
  buildApprovalStepTreeSavePayload,
  createApprovalStepSettingsSignatureFromTree,
  getApprovalStepTreeErrors,
  isApprovalStepAssigneeValid,
  isApprovalStepTreeValid,
} from "./tree";

type ApprovalStepTree = TreeNodes<
  CategoryApprovalStepData | ApprovalStepData
>;

function createApprovalStep(
  stepAssignee: ApprovalAssigneeType,
  overrides: Partial<ApprovalStepData> = {},
): ApprovalStepData {
  return {
    id: "approval:approval-step-1",
    approvalId: "approval-step-1",
    categoryId: "category-1",
    name: { en: "Approval Step" },
    index: 1,
    stepAssignee,
    skipAccessLevel: ACCESS_LEVEL.MANAGER,
    nodeType: "approvalStep",
    ...overrides,
  };
}

function createTree(...approvalSteps: ApprovalStepData[]): ApprovalStepTree {
  return [
    {
      id: "category:category-1",
      data: {
        id: "category:category-1",
        categoryId: "category-1",
        name: { en: "Account" },
        index: 1,
        active: true,
        scope: "INTERNAL",
        defaultPriority: "medium",
        defaultRiskLevel: "medium",
        defaultSlaDays: 3,
        nodeType: "category",
      },
      children: approvalSteps.map((approvalStep) => ({
        id: approvalStep.id,
        data: approvalStep,
        children: [],
      })),
    },
  ];
}

const validAssignees: Array<[string, ApprovalAssigneeType]> = [
  ["a first-level manager", { type: "MANAGER", managerDistance: 1 }],
  ["a second-level manager", { type: "MANAGER", managerDistance: 2 }],
  ["a department", { type: "DEPARTMENT", departmentId: "department-1" }],
  ["a job field", { type: "JOB_FIELD", jobFieldId: "job-field-1" }],
  ["employees", { type: "EMPLOYEE", employeeUsernames: ["user-1"] }],
];

// Simulates malformed Manager data received outside the TypeScript boundary.
const invalidManagerAssignee = {
  type: "MANAGER",
  managerDistance: 3,
} as unknown as ApprovalAssigneeType;

const invalidAssignees: Array<[string, ApprovalAssigneeType]> = [
  ["an unsupported manager distance", invalidManagerAssignee],
  ["a blank department", { type: "DEPARTMENT", departmentId: " " }],
  ["a blank job field", { type: "JOB_FIELD", jobFieldId: " " }],
  ["an empty employee list", { type: "EMPLOYEE", employeeUsernames: [] }],
  [
    "a blank employee username",
    { type: "EMPLOYEE", employeeUsernames: ["user-1", " "] },
  ],
];

describe("isApprovalStepAssigneeValid", () => {
  it.each(validAssignees)("accepts %s", (_, stepAssignee) => {
    expect(
      isApprovalStepAssigneeValid(createApprovalStep(stepAssignee)),
    ).toBe(true);
  });

  it.each(invalidAssignees)("rejects %s", (_, stepAssignee) => {
    expect(
      isApprovalStepAssigneeValid(createApprovalStep(stepAssignee)),
    ).toBe(false);
  });
});

describe("approval step tree validation", () => {
  it("accepts a tree whose approval steps have valid assignees", () => {
    // Arrange
    const tree = createTree(
      createApprovalStep({ type: "MANAGER", managerDistance: 1 }),
    );

    // Act
    const errors = getApprovalStepTreeErrors(tree);

    // Assert
    expect(errors.size).toBe(0);
    expect(isApprovalStepTreeValid(tree)).toBe(true);
  });

  it("reports an invalid assignee against the approval node id", () => {
    const tree = createTree(createApprovalStep(invalidManagerAssignee));

    expect(getApprovalStepTreeErrors(tree)).toEqual(
      new Map([["approval:approval-step-1", "invalidAssignee"]]),
    );
    expect(isApprovalStepTreeValid(tree)).toBe(false);
  });
});

describe("buildApprovalStepTreeSavePayload", () => {
  it("normalizes ids, order, localized text, and employee usernames", () => {
    // Arrange
    const tree = createTree(
      createApprovalStep(
        {
          type: "EMPLOYEE",
          employeeUsernames: ["user-beta", "user-alpha"],
        },
        {
          id: "approval:persisted-step",
          approvalId: "persisted-step",
          name: { ko: "담당자 승인", en: "Employee approval" },
          index: 20,
        },
      ),
      createApprovalStep(
        { type: "MANAGER", managerDistance: 2 },
        {
          id: "newApproval:1",
          approvalId: "newApproval:1",
          name: { en: "Manager approval" },
          index: 10,
        },
      ),
    );

    // Act
    const payload = buildApprovalStepTreeSavePayload({
      tenantId: "tenant-1",
      tree,
    });

    // Assert
    expect(payload).toEqual({
      tenantId: "tenant-1",
      categories: [
        {
          id: "category-1",
          approvalSteps: [
            {
              id: "persisted-step",
              name: { en: "Employee approval", ko: "담당자 승인" },
              description: undefined,
              index: 1,
              stepAssignee: {
                type: "EMPLOYEE",
                employeeUsernames: ["user-alpha", "user-beta"],
              },
              skipAccessLevel: ACCESS_LEVEL.MANAGER,
            },
            {
              id: undefined,
              name: { en: "Manager approval" },
              description: undefined,
              index: 2,
              stepAssignee: { type: "MANAGER", managerDistance: 2 },
              skipAccessLevel: ACCESS_LEVEL.MANAGER,
            },
          ],
        },
      ],
    });
  });
});

describe("createApprovalStepSettingsSignatureFromTree", () => {
  it("creates the same signature regardless of employee username order", () => {
    const firstTree = createTree(
      createApprovalStep({
        type: "EMPLOYEE",
        employeeUsernames: ["user-beta", "user-alpha"],
      }),
    );
    const secondTree = createTree(
      createApprovalStep({
        type: "EMPLOYEE",
        employeeUsernames: ["user-alpha", "user-beta"],
      }),
    );

    expect(createApprovalStepSettingsSignatureFromTree(firstTree)).toBe(
      createApprovalStepSettingsSignatureFromTree(secondTree),
    );
  });

  it("changes the signature when the assignee changes", () => {
    const originalTree = createTree(
      createApprovalStep({
        type: "EMPLOYEE",
        employeeUsernames: ["user-alpha"],
      }),
    );
    const editedTree = createTree(
      createApprovalStep({
        type: "EMPLOYEE",
        employeeUsernames: ["user-gamma"],
      }),
    );

    expect(createApprovalStepSettingsSignatureFromTree(editedTree)).not.toBe(
      createApprovalStepSettingsSignatureFromTree(originalTree),
    );
  });
});
