import { AccessLevel } from "@/domain/auth";
import { LocalizedText } from "@/shared/types";

/** Defines the PostgreSQL approval step row used only within the repository boundary. */
export type ApprovalStepRow = {
  aps_id: number;
  aps_category_id: number;
  aps_name: LocalizedText;
  aps_description: LocalizedText | null;
  aps_index: number;
  aps_assignee: unknown;
  aps_skip_access_level: AccessLevel | null;
};

/** Defines the PostgreSQL create approval step row input used only within the repository boundary. */
export type CreateApprovalStepRowInput = {
  aps_category_id: number;
  aps_name: LocalizedText;
  aps_description: LocalizedText | null;
  aps_index: number;
  aps_assignee: unknown;
  aps_skip_access_level: AccessLevel | null;
};

/** Defines the PostgreSQL update approval step row input used only within the repository boundary. */
export type UpdateApprovalStepRowInput = {
  aps_category_id: number;
  aps_name: LocalizedText;
  aps_description: LocalizedText | null;
  aps_index: number;
  aps_assignee: unknown;
  aps_skip_access_level: AccessLevel | null;
};
