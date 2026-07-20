import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "0d940296-704d-4534-a035-5d4d33a794cf",
  tk_ticket_no: "SP-2026-0065",
  tk_created_at: "2026-07-05T06:03:14Z",
  tk_updated_at: "2026-07-05T07:21:42Z",
  tk_requester_username: "grant_murphy",
  tk_status: "Resolved",
  tk_priority: "high",
  tk_risk_level: "high",
  tk_assignee_usernames: ["evan_seo", "daniel_kim"],
  tk_work_minutes: 105,
  tka_last_comment_at: "2026-07-05T07:21:42Z",
  tka_last_comment_email: "Daniel.Kim@sunghwan-portal.dev",

  tka_last_user_activity_at: "2026-07-05T07:21:42Z",
  tka_last_user_activity_email: "Daniel.Kim@sunghwan-portal.dev",
  tk_due_at: "2026-07-06T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "5",
  cat_name: {
    en: "Performance / Availability",
    es: "Rendimiento / disponibilidad",
    fr: "Performance / disponibilité",
    ko: "성능 / 사용성",
  },
  tk_approval_step_id: null,
  tk_subject: "출고 배송 화면이 로딩 상태에서 멈춤",
  tk_content:
    "출고 배송을 처리하는 중 배송 실행 화면에 로딩 아이콘만 계속 표시되고 완료되지 않습니다.<br>물류팀 사용자가 출고 배송 트랜잭션을 완료할 수 없습니다.",
  tk_email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["Victor.Rivera@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
