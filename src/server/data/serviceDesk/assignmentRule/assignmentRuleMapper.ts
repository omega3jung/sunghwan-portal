import {
  AssigneeGroupDto,
  AssignmentRuleDto,
  CreateAssignmentRuleInputDto,
  UpdateAssignmentRuleInputDto,
} from "./assignmentRuleDto";
import {
  AssignmentRuleRow,
  CreateAssignmentRuleRowInput,
  UpdateAssignmentRuleRowInput,
} from "./assignmentRuleRow";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mapAssigneeGroupToDto(value: unknown): AssigneeGroupDto {
  if (!isObject(value)) {
    throw new Error("Invalid assignment rule assignee: expected object");
  }

  if (!Array.isArray(value.job_field_id)) {
    throw new Error(
      "Invalid assignment rule assignee: job_field_id must be an array",
    );
  }

  if (!Array.isArray(value.employee_username)) {
    throw new Error(
      "Invalid assignment rule assignee: employee_username must be an array",
    );
  }

  if (
    !value.job_field_id.every(
      (jobFieldId) =>
        typeof jobFieldId === "number" || typeof jobFieldId === "string",
    )
  ) {
    throw new Error(
      "Invalid assignment rule assignee: job_field_id values must be numeric",
    );
  }

  if (
    !value.employee_username.every(
      (employeeUsername) => typeof employeeUsername === "string",
    )
  ) {
    throw new Error(
      "Invalid assignment rule assignee: employee_username values must be strings",
    );
  }

  return {
    job_field_id: value.job_field_id.map((jobFieldId) => Number(jobFieldId)),
    employee_username: value.employee_username,
    include_tenant_company: value.include_tenant_company === true,
  };
}

export function mapAssignmentRuleRowToDto(
  row: AssignmentRuleRow,
): AssignmentRuleDto {
  return {
    assignment_rule_id: Number(row.ar_id),
    category_id: Number(row.ar_category_id),
    assignee: mapAssigneeGroupToDto(row.ar_assignee),
  };
}

export function mapAssignmentRuleRowsToDtos(
  rows: AssignmentRuleRow[],
): AssignmentRuleDto[] {
  return rows.map(mapAssignmentRuleRowToDto);
}

export function mapCreateAssignmentRuleInputDtoToRowInput(
  input: CreateAssignmentRuleInputDto,
): CreateAssignmentRuleRowInput {
  return {
    ar_category_id: Number(input.category_id),
    ar_assignee: normalizeAssigneeGroupDto(input.assignee),
  };
}

export function mapUpdateAssignmentRuleInputDtoToRowInput(
  input: UpdateAssignmentRuleInputDto,
): UpdateAssignmentRuleRowInput {
  return {
    ar_category_id: Number(input.category_id),
    ar_assignee: normalizeAssigneeGroupDto(input.assignee),
  };
}

function normalizeAssigneeGroupDto(input: AssigneeGroupDto): AssigneeGroupDto {
  return {
    job_field_id: input.job_field_id.map(Number),
    employee_username: input.employee_username.map(String),
    include_tenant_company: input.include_tenant_company === true,
  };
}
