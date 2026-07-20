import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "aef262d0-46f8-43f0-b1bc-e686377a8b16",
  tk_ticket_no: "SP-2026-0066",
  tk_created_at: "2026-07-06T06:13:27Z",
  tk_updated_at: "2026-07-06T07:13:18Z",
  tk_requester_username: "liam_williams",
  tk_status: "Closed",
  tk_close_reason: "Merged",
  tk_priority: "high",
  tk_risk_level: "high",
  tk_assignee_usernames: ["evan_seo", "daniel_kim"],
  tk_merged_into_ticket_id: "b3b17f20-b909-4603-adcd-8987d231c981",
  tk_merged_into_ticket_no: "SP-2026-0065",
  tk_work_minutes: 20,
  tka_last_comment_at: "2026-07-06T07:13:18Z",
  tka_last_comment_email: "Daniel.Kim@sunghwan-portal.dev",

  tka_last_user_activity_at: "2026-07-06T07:13:18Z",
  tka_last_user_activity_email: "Daniel.Kim@sunghwan-portal.dev",
  tk_due_at: "2026-07-07T18:00:00Z",
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
  tk_subject: "입고, 수리, QC 화면에서 로딩 상태가 계속됨",
  tk_content:
    "입고, 수리, QC 담당자들이 로딩 스피너만 표시되는 상태에서 거래 처리를 계속 진행하지 못하고 있습니다.<br>이 문제는 특정 화면 하나가 아니라 포털의 여러 단계에서 발생하고 있습니다.",
  tk_email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["olivia.johnson@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
