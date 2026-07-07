import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  tk_id: "a316bbba-6ea9-4987-b647-417c37738cbf",
  tk_ticket_no: "SP-2026-0004",
  tk_created_at: "2026-05-31T16:25:38Z",
  tk_updated_at: "2026-06-01T03:22:49Z",
  tk_requester_username: "olivia_johnson",
  tk_status: "Rejected",
  tk_close_reason: "Rejected",
  tk_priority: "medium",
  tk_risk_level: "medium",
  tk_assignee_usernames: ["evan_seo", "daniel_kim"],
  tk_work_minutes: 95,
  tka_last_comment_at: "2026-06-01T03:22:49Z",
  tka_last_comment_email: "Daniel.Kim@sunghwan-portal.dev",

  tka_last_user_activity_at: "2026-06-01T03:22:49Z",
  tka_last_user_activity_email: "Daniel.Kim@sunghwan-portal.dev",
  tk_due_at: "2026-06-04T18:00:00Z",
  tk_active: true,
  cat_scope: "INTERNAL",
  cat_id: "72",
  cat_name: {
    en: "Data correction request",
    es: "Solicitud de corrección de datos",
    fr: "Demande de correction de données",
    ko: "데이터 수정 요청",
  },
  tk_approval_step_id: null,
  tk_subject: "Request to extend Unit ID edit permission for repair staff",
  tk_content:
    "During repair work, input mistakes on Unit ID happen frequently and correction requests take too long.<br>Currently, Unit ID modification is allowed only for leader level and above.<br>Please grant Unit ID edit permission to Repair Technician as well.",
  tk_email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["liam.williams@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
