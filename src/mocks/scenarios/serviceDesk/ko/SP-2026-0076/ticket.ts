import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "bce0861d-9f92-4db9-affa-959b2933b9de",
  tk_ticket_no: "SP-2026-0076",
  tk_created_at: "2026-07-16T01:13:27Z",
  tk_updated_at: "2026-07-16T01:18:09Z",
  tk_requester_username: "__demo_user__",
  tk_requester: {
    username: "__demo_user__",
    name: {
      en: { first: "Demo", middle: "", last: "User" },
    },
    email: "demoUser@sunghwan-portal.dev",
    image: null,
  },
  tk_status: "Declined",
  tk_priority: "medium",
  tk_risk_level: "low",
  tk_assignee_usernames: [],
  tk_work_minutes: 0,
  tka_last_comment_at: null,
  tka_last_comment_email: null,
  tka_last_user_activity_at: "2026-07-16T01:18:09Z",
  tka_last_user_activity_email: "demoManager@sunghwan-portal.dev",
  tk_due_at: "2026-07-20T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "85",
  cat_name: {
    en: "Client issue inquiry",
    es: "Consulta sobre problemas del cliente",
    fr: "Demande concernant un problème client",
    ko: "고객사 문제 문의",
  },
  tk_approval_step_id: null,
  tk_subject: "요청 재제출 액션 테스트",
  tk_content:
    "이 티켓은 요청 재제출 액션을 테스트하기 위해 준비되었습니다.<br>요청자는 티켓 상태가 'Declined'일 때 티켓을 수정하고 다시 제출할 수 있어야 합니다.",
  tk_email: {
    to: ["demoManager@sunghwan-portal.dev"],
    cc: ["demoUser@sunghwan-portal.dev", "demoAdmin@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
