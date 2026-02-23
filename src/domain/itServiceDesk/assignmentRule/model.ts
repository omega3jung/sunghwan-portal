import { DEFAULT_LANGUAGE } from "@/domain/config";
import { Locale } from "@/shared/types";

type AssigneeType = "employee" | "role";
export type Assignee =
  | {
      type: "employee";
      id: string; // employeeId
    }
  | {
      type: "jobField";
      id: string; // jobFieldId
    };

export interface AssignmentRule {
  categoryId: string; // string number. can use parseInt.
  rule_seq: number;
  rule_assignee: Assignee[];
  rule_active: boolean;
  rule_translations?: AssignmentRuleTranslations;
}

export interface AssignmentRuleI18n {
  rule_description: string;
}

type OptionalLocale = Exclude<Locale, typeof DEFAULT_LANGUAGE>;

type AssignmentRuleTranslations = Record<
  typeof DEFAULT_LANGUAGE,
  AssignmentRuleI18n
> &
  Partial<Record<OptionalLocale, AssignmentRuleI18n>>;
