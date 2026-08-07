/** Defines the PostgreSQL assignment rule row used only within the repository boundary. */
export type AssignmentRuleRow = {
  ar_id: number;
  ar_category_id: number;
  ar_assignee: unknown;
};

/** Defines the PostgreSQL create assignment rule row input used only within the repository boundary. */
export type CreateAssignmentRuleRowInput = {
  ar_category_id: number;
  ar_assignee: unknown;
};

/** Defines the PostgreSQL update assignment rule row input used only within the repository boundary. */
export type UpdateAssignmentRuleRowInput = {
  ar_category_id: number;
  ar_assignee: unknown;
};
