import { Locale } from "@/types";

import { User } from "../shared";

type Approver = User;

export interface ApprovalStep {
  category_id: string; // toString(number). can use parseInt.
  step_seq: number;
  step_approver: Approver[];
  step_active: boolean;
  step_translations: ApprovalStepTranslations;
}

export interface ApprovalStepI18n {
  step_name: string;
  step_description?: string;
}

type DefaultLocale = "en";
type OptionalLocale = Exclude<Locale, DefaultLocale>;

type ApprovalStepTranslations = Record<DefaultLocale, ApprovalStepI18n> &
  Partial<Record<OptionalLocale, ApprovalStepI18n>>;
