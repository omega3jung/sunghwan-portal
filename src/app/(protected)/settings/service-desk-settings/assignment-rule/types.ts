import { AssigneeGroup, Category } from "@/domain/serviceDesk";

export type AssignmentRuleData = Category & AssigneeGroup;
export type MainAssignmentRuleData = AssignmentRuleData & {
  subCategories: AssignmentRuleData[];
};
