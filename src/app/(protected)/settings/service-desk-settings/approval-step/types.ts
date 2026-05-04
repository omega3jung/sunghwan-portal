import {
  ApprovalAssigneeType,
  ApprovalStep,
  MainCategory,
} from "@/domain/serviceDesk";

export type ApprovalStepData = ApprovalStep & {
  approvalId: string;
  nodeType: "approvalStep";
  stepAssignee: ApprovalAssigneeType;
};

export type CategoryApprovalStepData = Omit<MainCategory, "subCategories"> & {
  categoryId: string;
  nodeType: "category";
  approvalSteps: ApprovalStepData[];
};
