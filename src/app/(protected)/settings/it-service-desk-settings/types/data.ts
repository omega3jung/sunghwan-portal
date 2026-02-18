import {
  ApprovalAssigneeType,
  ApprovalAssigneeTypeValue,
  ApprovalStep,
  AssignmentRule,
  Category,
} from "@/feature/it-service-desk/types";

type EditType = {
  editType?: "create" | "update" | "delete";
};

export type CategoryData = Category & EditType;
export type MainCategoryData = CategoryData & {
  subCategories: CategoryData[];
};

export type ApprovalStepData = ApprovalStep &
  EditType & {
    approvalId: string;
    nodeType: "approvalStep";
    stepAssignee: ApprovalAssigneeType | { type: ApprovalAssigneeTypeValue };
  };
export type CategoryApprovalStepData = Category & {
  categoryId: string;
  nodeType: "category";
  approvalSteps: ApprovalStepData[];
};

export type AssignmentRuleData = AssignmentRule & EditType;
export type CategoryTreeItem =
  | (MainCategoryData & { children?: CategoryTreeItem[] })
  | CategoryData;
