import type {
  ApprovalStep,
  CategoryApprovalSettings,
} from "@/domain/serviceDesk";
import type { DbParams } from "@/shared/types/api";

export type ServiceDeskApprovalStepListParams = DbParams & {
  clientId?: string;
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
  clientId: string;
  categories: CategoryApprovalStepTreeSyncInput[];
};
