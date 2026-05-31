import type { ApprovalStep } from "@/domain/serviceDesk";
import type { SaveServiceDeskApprovalStepTreePayload } from "@/feature/serviceDesk/approvalStep/types";
import type {
  CreateApprovalStepInput,
  UpdateApprovalStepInput,
} from "@/feature/serviceDesk/approvalStep/write";

import type {
  LocalDbApprovalStep,
  LocalDbCategoryApprovalSettings,
} from "./approvalStepUtils";

const toDbApprovalAssignee = (approvalStep: ApprovalStep["stepAssignee"]) => {
  switch (approvalStep.type) {
    case "MANAGER":
      return {
        type: approvalStep.type,
        level: approvalStep.level,
      } as const;
    case "DEPARTMENT":
      return {
        type: approvalStep.type,
        department_id: Number(approvalStep.departmentId),
      } as const;
    case "JOB_FIELD":
      return {
        type: approvalStep.type,
        field_id: Number(approvalStep.jobFieldId),
      } as const;
    case "EMPLOYEE":
      return {
        type: approvalStep.type,
        employee_id: approvalStep.employeeIds,
      } as const;
  }
};

export const buildApprovalStepFromInput = ({
  input,
  assignId,
  previousApprovalStep,
}: {
  input:
    | CreateApprovalStepInput
    | UpdateApprovalStepInput
    | SaveServiceDeskApprovalStepTreePayload["categories"][number]["approvalSteps"][number];
  assignId: (value?: string) => number;
  previousApprovalStep?: LocalDbApprovalStep;
}) => {
  const resolvedId =
    previousApprovalStep?.approval_step_id ?? assignId(input.id);

  return {
    approval_step_id: resolvedId,
    approval_step_name: input.name,
    approval_step_description: input.description ?? null,
    approval_step_index: input.index,
    approval_step_active: true,
    category_id: Number(
      "categoryId" in input
        ? input.categoryId
        : previousApprovalStep?.category_id,
    ),
    approval_step_assignee: toDbApprovalAssignee(input.stepAssignee),
    skip_access_level: input.skipAccessLevel ?? null,
  } satisfies LocalDbApprovalStep;
};

export const createFallbackCategory = ({
  categoryId,
  index,
}: {
  categoryId: string;
  index: number;
}): LocalDbCategoryApprovalSettings => {
  const numericCategoryId = Number(categoryId);

  return {
    category_id: numericCategoryId,
    category_name: {
      en: `Category ${categoryId}`,
    },
    category_description: null,
    category_request_template: null,
    category_index: index,
    category_active: true,
    category_scope: "INTERNAL",
    default_priority: "medium",
    default_risk_level: "medium",
    default_sla_days: 3,
    approval_step: [],
  };
};
