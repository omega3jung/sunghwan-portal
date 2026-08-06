export interface AssigneeGroup {
  jobFieldIds: string[];
  assigneeUsernames: string[];
  /** Explicitly extends a PORTAL rule from provider-only to joint handling. */
  includeTenantCompany?: boolean;
}

export interface AssignmentRule {
  categoryId: string; // string number. can use parseInt.
  assignee: AssigneeGroup;
}
