// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { AssignmentRule, MainCategory } from "@/domain/serviceDesk";

import { useAssignmentRuleTree } from "./useAssignmentRuleTree";

const categories: MainCategory[] = [
  {
    id: "category-1",
    name: { en: "Account" },
    index: 1,
    active: true,
    scope: "PORTAL",
    defaultPriority: "medium",
    defaultRiskLevel: "medium",
    defaultSlaDays: 3,
    subCategories: [
      {
        id: "subcategory-1",
        name: { en: "New account" },
        index: 1,
        active: true,
      },
      {
        id: "subcategory-2",
        name: { en: "Login issue" },
        index: 2,
        active: true,
      },
    ],
  },
];

const assignmentRules: AssignmentRule[] = [
  {
    categoryId: "category-1",
    assignee: {
      jobFieldIds: ["parent-field"],
      assigneeUsernames: ["parent-user"],
    },
  },
  {
    categoryId: "subcategory-2",
    assignee: {
      jobFieldIds: ["child-2-field"],
      assigneeUsernames: ["child-2-user"],
    },
  },
];

afterEach(cleanup);

describe("useAssignmentRuleTree", () => {
  it("uses the parent rule when a subcategory has no assignment rule", async () => {
    const { result } = renderHook(() =>
      useAssignmentRuleTree({
        contextKey: "tenant-1:PORTAL",
        categories,
        assignmentRules,
      }),
    );
    await waitFor(() => expect(result.current.isReady).toBe(true));

    act(() => result.current.setSelectedId("subcategory-1"));

    expect(result.current.selectedNode).toMatchObject({
      id: "subcategory-1",
      assignmentRule: null,
    });
    expect(result.current.inheritedAssignee).toEqual({
      jobFieldIds: ["parent-field"],
      assigneeUsernames: ["parent-user"],
    });
  });

  it("keeps a subcategory's own rule when one exists", async () => {
    const { result } = renderHook(() =>
      useAssignmentRuleTree({
        contextKey: "tenant-1:PORTAL",
        categories,
        assignmentRules,
      }),
    );
    await waitFor(() => expect(result.current.isReady).toBe(true));

    act(() => result.current.setSelectedId("subcategory-2"));

    expect(result.current.selectedNode).toMatchObject({
      id: "subcategory-2",
      assignmentRule: {
        jobFieldIds: ["child-2-field"],
        assigneeUsernames: ["child-2-user"],
      },
    });
    expect(result.current.inheritedAssignee).toEqual({
      jobFieldIds: ["parent-field"],
      assigneeUsernames: ["parent-user"],
    });
  });
});
