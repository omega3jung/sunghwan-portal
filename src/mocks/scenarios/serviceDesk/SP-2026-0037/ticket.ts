import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  tk_id: "87223f80-a875-4132-b9ac-51e18625b23c",
  tk_ticket_no: "SP-2026-0037",
  tk_created_at: "2026-06-24T01:13:27Z",
  tk_updated_at: "2026-06-24T01:18:10Z",
  tk_requester_username: "__demo_user__",
  tk_status: "Assigned",
  tk_close_reason: null,
  tk_priority: "medium",
  tk_risk_level: "low",
  tk_assignee_usernames: ["__demo_admin__", "__demo_manager__"],
  tk_merged_into_ticket_id: null,
  tk_work_minutes: 0,
  tka_last_comment_at: null,
  tka_last_comment_email: null,

  tka_last_user_activity_at: "2026-06-24T01:18:10Z",
  tka_last_user_activity_email: null,
  tk_due_at: "2026-06-30T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "92",
  cat_name: {
    en: "General inquiry",
    es: "Consulta general",
    fr: "Demande générale",
    ko: "일반 문의",
  },
  tk_approval_step_id: null,
  tk_subject: "승인된 티켓 자동 작업 시작 테스트",
  tk_content:
    "이 티켓은 상태 자동 변경 흐름을 테스트하기 위해 준비되었습니다.<br>담당자가 티켓 상태가 'Assigned'인 상태에서 티켓 상세 화면을 열면 상태가 자동으로 'Working'으로 변경되어야 합니다.",
  tk_email: {
    to: ["demoAdmin@sunghwan-portal.dev"],
    cc: ["demoUser@sunghwan-portal.dev", "demoManager@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
