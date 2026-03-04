import {
  ApprovalAssigneeType,
  ApprovalStep,
  Category,
} from "@/domain/serviceDesk";

export type ApprovalStepData = ApprovalStep & {
  approvalId: string;
  nodeType: "approvalStep";
  stepAssignee: ApprovalAssigneeType;
};

export type CategoryApprovalStepData = Category & {
  categoryId: string;
  nodeType: "category";
  approvalSteps: ApprovalStepData[];
};
