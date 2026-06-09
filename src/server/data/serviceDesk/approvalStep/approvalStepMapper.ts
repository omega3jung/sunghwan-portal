import {
  ApprovalAssigneeTypeDto,
  ApprovalStepDto,
  CreateApprovalStepInputDto,
  UpdateApprovalStepInputDto,
} from "./approvalStepDto";
import {
  ApprovalStepRow,
  CreateApprovalStepRowInput,
  UpdateApprovalStepRowInput,
} from "./approvalStepRow";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isManagerAssignee(
  value: Record<string, unknown>,
): value is Extract<ApprovalAssigneeTypeDto, { type: "MANAGER" }> {
  return value.type === "MANAGER" && (value.level === 1 || value.level === 2);
}

function isDepartmentAssignee(
  value: Record<string, unknown>,
): value is Extract<ApprovalAssigneeTypeDto, { type: "DEPARTMENT" }> {
  return value.type === "DEPARTMENT" && typeof value.department_id === "number";
}

function isJobFieldAssignee(
  value: Record<string, unknown>,
): value is Extract<ApprovalAssigneeTypeDto, { type: "JOB_FIELD" }> {
  return value.type === "JOB_FIELD" && typeof value.field_id === "number";
}

function isEmployeeAssignee(
  value: Record<string, unknown>,
): value is Extract<ApprovalAssigneeTypeDto, { type: "EMPLOYEE" }> {
  return (
    value.type === "EMPLOYEE" &&
    Array.isArray(value.employee_username) &&
    value.employee_username.every(
      (employeeUsername) => typeof employeeUsername === "string",
    )
  );
}

function mapApprovalAssigneeToDto(value: unknown): ApprovalAssigneeTypeDto {
  if (!isObject(value)) {
    throw new Error("Invalid approval step assignee: expected object");
  }

  if (isManagerAssignee(value)) {
    return {
      type: value.type,
      level: value.level,
    };
  }

  if (isDepartmentAssignee(value)) {
    return {
      type: value.type,
      department_id: Number(value.department_id),
    };
  }

  if (isJobFieldAssignee(value)) {
    return {
      type: value.type,
      field_id: Number(value.field_id),
    };
  }

  if (isEmployeeAssignee(value)) {
    return {
      type: value.type,
      employee_username: value.employee_username,
    };
  }

  throw new Error("Invalid approval step assignee shape");
}

export function mapApprovalStepRowToDto(row: ApprovalStepRow): ApprovalStepDto {
  return {
    approval_step_id: Number(row.aps_id),
    approval_step_name: row.aps_name,
    approval_step_description: row.aps_description,
    approval_step_index: row.aps_index,
    approval_step_active: row.aps_active,
    category_id: Number(row.aps_category_id),
    approval_step_assignee: mapApprovalAssigneeToDto(row.aps_assignee),
    skip_access_level: row.aps_skip_access_level,
  };
}

export function mapApprovalStepRowsToDtos(
  rows: ApprovalStepRow[],
): ApprovalStepDto[] {
  return rows.map(mapApprovalStepRowToDto);
}

export function mapCreateApprovalStepInputDtoToRowInput(
  input: CreateApprovalStepInputDto,
): CreateApprovalStepRowInput {
  return {
    aps_category_id: Number(input.category_id),
    aps_name: input.approval_step_name,
    aps_description: input.approval_step_description,
    aps_index: input.approval_step_index,
    aps_assignee: normalizeApprovalAssigneeTypeDto(
      input.approval_step_assignee,
    ),
    aps_skip_access_level: input.skip_access_level,
  };
}

export function mapUpdateApprovalStepInputDtoToRowInput(
  input: UpdateApprovalStepInputDto,
): UpdateApprovalStepRowInput {
  return {
    aps_category_id: Number(input.category_id),
    aps_name: input.approval_step_name,
    aps_description: input.approval_step_description,
    aps_index: input.approval_step_index,
    aps_assignee: normalizeApprovalAssigneeTypeDto(
      input.approval_step_assignee,
    ),
    aps_skip_access_level: input.skip_access_level,
  };
}

function normalizeApprovalAssigneeTypeDto(
  value: ApprovalAssigneeTypeDto,
): ApprovalAssigneeTypeDto {
  switch (value.type) {
    case "MANAGER":
      return {
        type: value.type,
        level: value.level,
      };
    case "DEPARTMENT":
      return {
        type: value.type,
        department_id: Number(value.department_id),
      };
    case "JOB_FIELD":
      return {
        type: value.type,
        field_id: Number(value.field_id),
      };
    case "EMPLOYEE":
      return {
        type: value.type,
        employee_username: value.employee_username.map(String),
      };
  }
}
