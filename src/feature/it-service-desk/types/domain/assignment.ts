import { Locale } from "@/types";

import { User } from "../shared";

type Assignee = User;

export interface AssignmentRule {
  category_id: string; // toString(number). can use parseInt.
  rule_seq: number;
  rule_assignee: Assignee[];
  rule_active: boolean;
  rule_translations?: AssignmentRuleTranslations;
}

export interface AssignmentRuleI18n {
  rule_description: string;
}

type DefaultLocale = "en";
type OptionalLocale = Exclude<Locale, DefaultLocale>;

type AssignmentRuleTranslations = Record<DefaultLocale, AssignmentRuleI18n> &
  Partial<Record<OptionalLocale, AssignmentRuleI18n>>;
