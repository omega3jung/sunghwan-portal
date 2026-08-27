import { describe, expect, it } from "vitest";

import type { TreeNodes } from "@/components/custom/SortableTree";

import type { AssignmentRuleData, SubAssignmentRuleData } from "../types";
import {
  createAssignmentRuleSettingsSignatureFromTree,
  getAssignmentRuleTreeErrors,
} from "./tree";

function createTree(
  jobFieldIds: string[],
): TreeNodes<AssignmentRuleData | SubAssignmentRuleData> {
  return [
    {
      id: "category-1",
      data: {
        id: "category-1",
        name: { en: "Category" },
        index: 1,
        active: true,
        scope: "INTERNAL",
        defaultPriority: "medium",
        defaultRiskLevel: "medium",
        defaultSlaDays: 3,
        jobFieldIds,
        assigneeUsernames: [],
      },
      children: [],
    },
  ];
}

describe("assignment rule tree", () => {
  it("returns missing assignee errors keyed by node id", () => {
    expect(getAssignmentRuleTreeErrors(createTree([])).get("category-1")).toBe(
      "missingAssignee",
    );
  });

  it("creates the same signature regardless of assignee order and duplicates", () => {
    expect(
      createAssignmentRuleSettingsSignatureFromTree(
        createTree(["job-2", "job-1", "job-1"]),
      ),
    ).toBe(
      createAssignmentRuleSettingsSignatureFromTree(
        createTree(["job-1", "job-2"]),
      ),
    );
  });
});
