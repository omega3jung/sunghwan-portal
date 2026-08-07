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

/** Input contract for create approval step operations at the Service Desk application boundary. */
export type CreateApprovalStepInput = ApprovalStepWriteFields & { id?: string };
/** Input contract for update approval step operations at the Service Desk application boundary. */
export type UpdateApprovalStepInput = ApprovalStepWriteFields & { id: string };
