import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "01e5fa73-f3ab-4bd8-91b6-384c86faa517",
  tk_ticket_no: "SP-2026-0002",
  tk_created_at: "2026-07-02T02:44:33Z",
  tk_updated_at: "2026-07-02T09:18:42Z",
  tk_requester_username: "liam_williams",
  tk_status: "Resolved",
  tk_priority: "medium",
  tk_risk_level: "high",
  tk_assignee_usernames: ["evan_seo"],
  tk_work_minutes: 30,
  tka_last_comment_at: "2026-07-02T09:15:11Z",
  tka_last_comment_email: "Evan.Seo@sunghwan-portal.dev",

  tka_last_user_activity_at: "2026-07-02T09:15:28Z",
  tka_last_user_activity_email: "Evan.Seo@sunghwan-portal.dev",
  tk_due_at: "2026-07-06T18:00:00Z",
  tk_active: true,
  cat_scope: "INTERNAL",
  cat_id: "75",
  cat_name: {
    en: "Data export request",
    es: "Solicitud de exportación de datos",
    fr: "Demande d’exportation de données",
    ko: "데이터 반출 요청",
  },
  tk_approval_step_id: null,
  tk_subject: "Request to SKU-12345 receving report",
  tk_content:
    "Hi, we requested receving report of all SKU-12345 devices from customer to check info is correct.<br>Please send it ASAP.",
  tk_email: {
    to: [
      "isabella.martinez@sunghwan-portal.dev",
      "Evan.Seo@sunghwan-portal.dev",
    ],
    cc: [
      "benjamin.rodriguez@sunghwan-portal.dev",
      "lucas.hernandez@sunghwan-portal.dev",
    ],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
