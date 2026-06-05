export interface AssigneeGroupDto {
  job_field_id: number[]; // string number. can use parseInt.
  employee_username: string[];
}

export interface AssignmentRuleDto {
  category_id: number; // string number. can use parseInt.
  assignee: AssigneeGroupDto;
}
