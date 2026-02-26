export interface AssigneeGroup {
  jobFieldIds: string[];
  employeeIds: string[];
}

export interface AssignmentRule {
  categoryId: string; // string number. can use parseInt.
  assignee: AssigneeGroup;
}
