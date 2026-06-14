export type AssignmentRuleRow = {
  ar_id: number;
  ar_category_id: number;
  ar_assignee: unknown;
};

export type CreateAssignmentRuleRowInput = {
  ar_category_id: number;
  ar_assignee: unknown;
};

export type UpdateAssignmentRuleRowInput = {
  ar_category_id: number;
  ar_assignee: unknown;
};
