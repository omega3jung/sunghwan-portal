import {
  ApprovalAssigneeType,
  ApprovalStep,
  AssignmentRule,
  Category,
} from "@/feature/itServiceDesk";

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
    stepAssignee: ApprovalAssigneeType;
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
