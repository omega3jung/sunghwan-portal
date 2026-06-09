import { AccessLevel } from "@/domain/auth";
import { LocalizedText } from "@/shared/types";

export type ApprovalStepRow = {
  aps_id: number;
  aps_category_id: number;
  aps_name: LocalizedText;
  aps_description: LocalizedText | null;
  aps_index: number;
  aps_assignee: unknown;
  aps_skip_access_level: AccessLevel | null;
  aps_active: boolean;
};

export type CreateApprovalStepRowInput = {
  aps_category_id: number;
  aps_name: LocalizedText;
  aps_description: LocalizedText | null;
  aps_index: number;
  aps_assignee: unknown;
  aps_skip_access_level: AccessLevel | null;
};

export type UpdateApprovalStepRowInput = {
  aps_category_id: number;
  aps_name: LocalizedText;
  aps_description: LocalizedText | null;
  aps_index: number;
  aps_assignee: unknown;
  aps_skip_access_level: AccessLevel | null;
};
