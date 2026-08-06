import type { AssigneeGroup } from "./model";

export function hasAssignmentRuleSelection(
  assignee: Pick<AssigneeGroup, "jobFieldIds" | "assigneeUsernames">,
) {
  return (
    assignee.jobFieldIds.length > 0 || assignee.assigneeUsernames.length > 0
  );
}
