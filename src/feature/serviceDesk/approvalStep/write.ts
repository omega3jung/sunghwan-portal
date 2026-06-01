import { ApprovalStep } from "@/domain/serviceDesk";
import { idToNumber } from "@/lib/api/utils/mapId";
import { undefinedToNull } from "@/shared/utils/value";

import { DbApprovalStep } from "./mapper";

type ApprovalStepWriteFields = Pick<
  ApprovalStep,
  | "name"
  | "description"
  | "index"
  | "categoryId"
  | "stepAssignee"
  | "skipAccessLevel"
>;

type DbApprovalStepWriteInput = Omit<DbApprovalStep, "approval_step_id"> & {
  approval_step_id?: number | null;
};

export type CreateApprovalStepInput = ApprovalStepWriteFields & { id?: string };
export type UpdateApprovalStepInput = ApprovalStepWriteFields & { id: string };

export function toApprovalStepWritePayload(
  input: CreateApprovalStepInput | UpdateApprovalStepInput,
): DbApprovalStepWriteInput {
  return {
    approval_step_id: idToNumber(input.id),
    approval_step_name: input.name,
    approval_step_description: undefinedToNull(input.description),
    approval_step_index: input.index,
    category_id: Number(input.categoryId),
    approval_step_assignee: toApprovalAssigneeWritePayload(input.stepAssignee),
    skip_access_level: undefinedToNull(input.skipAccessLevel),
  };
}

export function toApprovalStepMockResource(
  input: CreateApprovalStepInput | UpdateApprovalStepInput,
  id = createMockId(),
): ApprovalStep {
  return { id, ...input };
}

function toApprovalAssigneeWritePayload(input: ApprovalStep["stepAssignee"]) {
  switch (input.type) {
    case "MANAGER":
      return { type: input.type, level: input.level };
    case "DEPARTMENT":
      return { type: input.type, department_id: Number(input.departmentId) };
    case "JOB_FIELD":
      return { type: input.type, field_id: Number(input.jobFieldId) };
    case "EMPLOYEE":
      return {
        type: input.type,
        employee_username: input.employeeUsernames,
      };
  }
}

function createMockId() {
  return Date.now().toString();
}
