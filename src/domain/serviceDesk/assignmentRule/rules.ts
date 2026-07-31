import type { AssigneeGroup } from "./model";

/** Returns whether an assignment rule selects at least one job field or employee. */
export function hasAssignmentRuleSelection(
  assignee: Pick<AssigneeGroup, "jobFieldIds" | "assigneeUsernames">,
) {
  return (
    assignee.jobFieldIds.length > 0 || assignee.assigneeUsernames.length > 0
  );
}
