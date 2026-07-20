import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "bf2f48e9-f7c4-4f80-85db-336a9860f8b0",
  tk_ticket_no: "SP-2026-0075",
  tk_created_at: "2026-07-15T01:13:27Z",
  tk_updated_at: "2026-07-15T01:13:28Z",
  tk_requester_username: "__demo_user__",
  tk_status: "Approval",
  tk_priority: "medium",
  tk_risk_level: "low",
  tk_assignee_usernames: ["__demo_manager__"],
  tk_work_minutes: 0,
  tka_last_comment_at: null,
  tka_last_comment_email: null,
  tka_last_user_activity_at: "2026-07-15T01:13:27Z",
  tka_last_user_activity_email: "demoUser@sunghwan-portal.dev",
  tk_due_at: "2026-07-19T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "85",
  cat_name: {
    en: "Client issue inquiry",
    es: "Consulta sobre problemas del cliente",
    fr: "Demande concernant un problème client",
    ko: "고객사 문제 문의",
  },
  tk_approval_step_id: "9",
  tk_subject: "승인 및 승인 반려 액션 테스트",
  tk_content:
    "이 티켓은 승인 및 승인 반려 액션을 테스트하기 위해 준비되었습니다.<br>현재 승인자는 티켓 상태가 'Approval'일 때 티켓을 승인하거나 승인 반려할 수 있어야 합니다.",
  tk_email: {
    to: ["demoManager@sunghwan-portal.dev"],
    cc: ["demoUser@sunghwan-portal.dev", "demoAdmin@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
