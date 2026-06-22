import { Priority, RiskLevel } from "@/domain/common";
import {
  Attach,
  CategoryScope,
  HistoryType,
  TicketActionType,
  TicketHistoryAction,
  TicketResolutionReason,
  TicketStatus,
} from "@/domain/serviceDesk";
import { ISODateString, LocalizedText } from "@/shared/types";

export type TicketMockInput = {
  tk_id: string;
  tk_ticket_no: string;

  tk_created_at: ISODateString;
  tk_updated_at: ISODateString | null;

  tk_requester_username: string;

  tk_status: TicketStatus;
  tk_priority: Priority;
  tk_risk_level: RiskLevel;
  tk_assignee_usernames: string[];

  tk_work_minutes: number;

  tka_last_comment_at: ISODateString | null;
  tka_last_comment_email: string | null;

  tka_last_user_activity_at: ISODateString | null;
  tka_last_user_activity_email: string | null;

  tk_close_reason?: TicketResolutionReason | null;
  tk_merged_into_ticket_id?: string | null;
  tk_merged_into_ticket_no?: string | null;

  tk_due_at: ISODateString;

  tk_active: boolean;

  cat_scope: CategoryScope;
  cat_id: string;
  cat_name: LocalizedText;

  tk_approval_step_id: string | null;

  tk_subject: string;
  tk_content: string;

  tk_email: {
    to: string[];
    cc: string[];
    bcc: string[];
  };

  tk_files: Attach[];
  tk_images: Attach[];
};

export type TicketActionMockInput = {
  tka_ticket_id: string;
  tka_action_no: number;

  tka_action_type: TicketActionType;
  tka_content: string;
  tka_owner_username: string;

  tka_created_at: ISODateString;
  tka_updated_at: ISODateString | null;
  tka_active: boolean;

  tka_metadata: Record<string, unknown>;
  tka_files: Attach[];
  tka_images: Attach[];
};

export type TicketHistoryMockInput = {
  tkh_ticket_id: string;
  tkh_history_no: number;

  tkh_history_type: HistoryType;
  tkh_history_action: TicketHistoryAction;

  tkh_actor_username: string | null;
  tkh_action_no: string | null;

  tkh_from_value: unknown | null;
  tkh_to_value: unknown | null;
  tkh_metadata: Record<string, unknown>;

  tkh_created_at: ISODateString;
};

export const TICKET_ACTION_MOCK_DEFAULTS = {
  tka_metadata: {},
  tka_files: [],
  tka_images: [],
} satisfies Pick<
  TicketActionMockInput,
  "tka_metadata" | "tka_files" | "tka_images"
>;

export const TICKET_HISTORY_MOCK_DEFAULTS = {
  tkh_from_value: null,
  tkh_to_value: null,
  tkh_metadata: {},
} satisfies Pick<
  TicketHistoryMockInput,
  "tkh_from_value" | "tkh_to_value" | "tkh_metadata"
>;
