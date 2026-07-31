/** Represents assignee group within the Service Desk domain. */
export interface AssigneeGroup {
  jobFieldIds: string[];
  assigneeUsernames: string[];
  /** Explicitly extends a PORTAL rule from provider-only to joint handling. */
  includeTenantCompany?: boolean;
}

/** Represents assignment rule within the Service Desk domain. */
export interface AssignmentRule {
  categoryId: string; // string number. can use parseInt.
  assignee: AssigneeGroup;
}
