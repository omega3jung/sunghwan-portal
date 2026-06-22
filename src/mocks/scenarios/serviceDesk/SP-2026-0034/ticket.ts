import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  tk_id: "3919f46d-74c2-4c64-836c-faf19c550c33",
  tk_ticket_no: "SP-2026-0034",
  tk_created_at: "2026-05-31T16:25:38Z",
  tk_updated_at: "2026-06-01T03:22:49Z",
  tk_requester_username: "olivia_johnson",
  tk_status: "Rejected",
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
  tk_subject: "수리 담당자에게 Unit ID 수정 권한 확대 요청",
  tk_content:
    "수리 작업 중 Unit ID 입력 실수가 자주 발생하고, 수정 요청 처리에 시간이 너무 오래 걸리고 있습니다.<br>현재 Unit ID 수정은 리더 레벨 이상에게만 허용되어 있습니다.<br>Repair Technician에게도 Unit ID 수정 권한을 부여해 주세요.",
  tk_email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["liam.williams@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
