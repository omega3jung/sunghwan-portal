import { AccessLevel } from "@/domain/auth";
import type {
  ApprovalStep,
  CategoryApprovalSettings,
  CategoryScope,
} from "@/domain/serviceDesk";
import { LocalizedText } from "@/shared/types";
import type { DbParams } from "@/shared/types/api";

import { DbCategory } from "./category";

// back-end data structures.
export type DbCategoryApprovalSettings = Omit<DbCategory, "sub_category"> & {
  approval_step: DbApprovalStep[];
};

/** Database-facing approval step shape used by the Service Desk application boundary. */
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

/** Database-facing approval assignee type shape used by the Service Desk application boundary. */
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

/** Parameters that configure service desk approval step list behavior in the Service Desk application boundary. */
export type ServiceDeskApprovalStepListParams = DbParams & {
  tenantId?: string;
  settings?: boolean;
  context?: "settings";
  scope?: CategoryScope;
};

/** Input contract for approval step tree sync operations at the Service Desk application boundary. */
export type ApprovalStepTreeSyncInput = Omit<
  ApprovalStep,
  "id" | "categoryId"
> & {
  id?: string;
};

/** Input contract for category approval step tree sync operations at the Service Desk application boundary. */
export type CategoryApprovalStepTreeSyncInput = Pick<
  CategoryApprovalSettings,
  "id"
> & {
  approvalSteps: ApprovalStepTreeSyncInput[];
};

/** Represents save service desk approval step tree payload within the Service Desk application boundary. */
export type SaveServiceDeskApprovalStepTreePayload = {
  tenantId: string;
  categories: CategoryApprovalStepTreeSyncInput[];
  force?: boolean;
};
