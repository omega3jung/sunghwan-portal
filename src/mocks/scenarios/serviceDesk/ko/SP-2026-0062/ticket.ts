import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "48e0f68c-82e8-4784-bc30-d06e4e068201",
  tk_ticket_no: "SP-2026-0062",
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
  tk_subject: "SKU-12345 입고 보고서 요청",
  tk_content:
    "안녕하세요. SKU-12345 기기 전체의 정보가 정확한지 확인하기 위해 고객에게 입고 보고서를 요청했습니다.<br>가능한 한 빨리 전달해 주세요.",
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
