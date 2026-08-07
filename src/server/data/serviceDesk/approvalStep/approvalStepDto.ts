import { AccessLevel } from "@/domain/auth";
import { LocalizedText } from "@/shared/types";

import { CategoryDto } from "../category";

/** Defines the approval step dto exchanged across the server API boundary. */
export interface ApprovalStepDto {
  approval_step_id: number;
  approval_step_name: LocalizedText;
  approval_step_description: LocalizedText | null;
  approval_step_index: number;

  category_id: number;
  approval_step_assignee: ApprovalAssigneeTypeDto;
  skip_access_level: AccessLevel | null;
}

/** Defines the create approval step input dto exchanged across the server API boundary. */
export interface CreateApprovalStepInputDto {
  tenant_id: number;
  category_id: number;
  approval_step_name: LocalizedText;
  approval_step_description: LocalizedText | null;
  approval_step_index: number;
  approval_step_assignee: ApprovalAssigneeTypeDto;
  skip_access_level: AccessLevel | null;
}

/** Defines the update approval step input dto exchanged across the server API boundary. */
export interface UpdateApprovalStepInputDto {
  category_id: number;
  approval_step_name: LocalizedText;
  approval_step_description: LocalizedText | null;
  approval_step_index: number;
  approval_step_assignee: ApprovalAssigneeTypeDto;
  skip_access_level: AccessLevel | null;
}

/** Defines the approval assignee type dto exchanged across the server API boundary. */
export type ApprovalAssigneeTypeDto =
  | {
      type: "MANAGER";
      level: 1 | 2;
    }
  | {
      type: "DEPARTMENT";
      department_id: number;
    }
  | {
      type: "JOB_FIELD";
      field_id: number;
    }
  | {
      type: "EMPLOYEE";
      employee_username: string[];
    };

/** Defines the category approval settings dto exchanged across the server API boundary. */
export type CategoryApprovalSettingsDto = Omit<CategoryDto, "sub_category"> & {
  approval_step: ApprovalStepDto[];
};
