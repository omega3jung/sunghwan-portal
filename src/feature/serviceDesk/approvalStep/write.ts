import { ApprovalStep } from "@/domain/serviceDesk";

type ApprovalStepWriteFields = Pick<
  ApprovalStep,
  | "name"
  | "description"
  | "index"
  | "categoryId"
  | "stepAssignee"
  | "skipAccessLevel"
>;

export type CreateApprovalStepInput = ApprovalStepWriteFields & { id?: string };
export type UpdateApprovalStepInput = ApprovalStepWriteFields & { id: string };
