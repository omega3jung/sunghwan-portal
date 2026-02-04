import {
  ApprovalStep,
  AssignmentRule,
  Category,
} from "@/feature/it-service-desk/types";

type EditType = {
  edit_type: undefined | "create" | "update" | "delete";
};

export type CategoryData = Category & EditType;

export type ApprovalStepData = ApprovalStep & EditType;
export type AssignmentRuleData = AssignmentRule & EditType;
export type MainCategoryData = CategoryData &
  EditType & {
    sub_category: CategoryData[];
  };

export type CategoryTreeItem =
  | (MainCategoryData & { children?: CategoryTreeItem[] })
  | CategoryData;
