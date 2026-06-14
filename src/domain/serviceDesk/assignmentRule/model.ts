export interface AssigneeGroup {
  jobFieldIds: string[];
  assigneeUsernames: string[];
}

export interface AssignmentRule {
  categoryId: string; // string number. can use parseInt.
  assignee: AssigneeGroup;
}
