import { AssigneeGroup, MainCategory, SubCategory } from "@/domain/serviceDesk";

export type AssignmentRuleData = Omit<MainCategory, "subCategories"> &
  AssigneeGroup & {
    nodeType?: "mainCategory";
  };

export type SubAssignmentRuleData = SubCategory & {
  nodeType: "subCategory";
  assignmentRule: AssigneeGroup | null;
};

export type AssignmentRuleNodeData = AssignmentRuleData | SubAssignmentRuleData;

export function isSubAssignmentRuleData(
  data: AssignmentRuleNodeData,
): data is SubAssignmentRuleData {
  return data.nodeType === "subCategory";
}
