import {
  AssigneeGroup,
  MainCategory,
  SubCategory,
} from "@/domain/serviceDesk";

export type SubAssignmentRuleData = SubCategory & AssigneeGroup;
export type AssignmentRuleData = Omit<MainCategory, "subCategories"> &
  AssigneeGroup & {
    subCategories: SubAssignmentRuleData[];
  };
