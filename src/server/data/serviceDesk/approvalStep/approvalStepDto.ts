import { AccessLevel } from "@/domain/auth";
import { LocalizedText } from "@/shared/types";

import { CategoryDto } from "../category";

export interface ApprovalStepDto {
  approval_step_id: number;
  approval_step_name: LocalizedText;
  approval_step_description: LocalizedText | null;
  approval_step_index: number;
  approval_step_active?: boolean;

  category_id: number;
  approval_step_assignee: ApprovalAssigneeTypeDto;
  skip_access_level: AccessLevel | null;
}

export interface CreateApprovalStepInputDto {
  tenant_id: number;
  category_id: number;
  approval_step_name: LocalizedText;
  approval_step_description: LocalizedText | null;
  approval_step_index: number;
  approval_step_assignee: ApprovalAssigneeTypeDto;
  skip_access_level: AccessLevel | null;
}

export interface UpdateApprovalStepInputDto {
  category_id: number;
  approval_step_name: LocalizedText;
  approval_step_description: LocalizedText | null;
  approval_step_index: number;
  approval_step_assignee: ApprovalAssigneeTypeDto;
  skip_access_level: AccessLevel | null;
}

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

export type CategoryApprovalSettingsDto = Omit<CategoryDto, "sub_category"> & {
  approval_step: ApprovalStepDto[];
};
