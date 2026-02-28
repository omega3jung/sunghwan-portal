import { AssigneeGroup, Category } from "@/domain/itServiceDesk";

export type AssignmentRuleData = Category & AssigneeGroup;
export type MainAssignmentRuleData = AssignmentRuleData & {
  subCategories: AssignmentRuleData[];
};
