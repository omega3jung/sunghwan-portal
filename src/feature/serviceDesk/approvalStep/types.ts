import { AccessLevel } from "@/domain/auth";
import type {
  ApprovalStep,
  CategoryApprovalSettings,
  CategoryScope,
} from "@/domain/serviceDesk";
import { LocalizedText } from "@/shared/types";
import type { DbParams } from "@/shared/types/api";

import { DbCategory } from "../category";

// back-end data structures.
export type DbCategoryApprovalSettings = Omit<DbCategory, "sub_category"> & {
  approval_step: DbApprovalStep[];
};

export interface DbApprovalStep {
  approval_step_id: number; // string number. can use parseInt.
  approval_step_name: LocalizedText;
  approval_step_description: LocalizedText | null;
  approval_step_index: number;

  category_id: number; // string number. can use parseInt.
  approval_step_assignee: DbApprovalAssigneeType;

  /**
   * If requester's access level is greater than or equal to this value,
   * this approval step will be skipped.
   */
  skip_access_level: AccessLevel | null;
}

export type DbApprovalAssigneeType =
  | {
      type: "MANAGER";
      level: 1 | 2;
    }
  | {
      type: "DEPARTMENT";
      department_id: number; // string number. can use parseInt.
    }
  | {
      type: "JOB_FIELD";
      field_id: number; // string number. can use parseInt.
    }
  | {
      type: "EMPLOYEE";
      employee_username: string[];
    };

export type ServiceDeskApprovalStepListParams = DbParams & {
  tenantId?: string;
  settings?: boolean;
  context?: "settings";
  scope?: CategoryScope;
};

export type ApprovalStepTreeSyncInput = Omit<
  ApprovalStep,
  "id" | "categoryId"
> & {
  id?: string;
};

export type CategoryApprovalStepTreeSyncInput = Pick<
  CategoryApprovalSettings,
  "id"
> & {
  approvalSteps: ApprovalStepTreeSyncInput[];
};

export type SaveServiceDeskApprovalStepTreePayload = {
  tenantId: string;
  categories: CategoryApprovalStepTreeSyncInput[];
};
