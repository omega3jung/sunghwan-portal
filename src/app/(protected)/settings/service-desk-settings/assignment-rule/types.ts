import { AssigneeGroup, Category, SubCategory } from "@/domain/serviceDesk";

export type SubAssignmentRuleData = SubCategory & AssigneeGroup;
export type AssignmentRuleData = Omit<Category, "subCategories"> &
  AssigneeGroup & {
    subCategories: SubAssignmentRuleData[];
  };
