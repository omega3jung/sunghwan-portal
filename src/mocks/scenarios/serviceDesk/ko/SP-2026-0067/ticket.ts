import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "f144356b-6363-46b1-ace5-3b352eaf1eaa",
  tk_ticket_no: "SP-2026-0067",
  tk_created_at: "2026-07-07T01:13:27Z",
  tk_updated_at: "2026-07-07T02:41:12Z",
  tk_requester_username: "james_smith",
  tk_requester: {
    username: "james_smith",
    name: {
      en: { first: "James", middle: "", last: "Smith" },
    },
    email: "james.smith@sunghwan-portal.dev",
    image: null,
  },
  tk_status: "Resolved",
  tk_priority: "high",
  tk_risk_level: "high",
  tk_assignee_usernames: [
    "isabella_oh",
    "julian_moon",
    "benjamin_hong",
    "aria_jeon",
    "matthew_williams",
  ],
  tk_work_minutes: 85,
  tka_last_comment_at: "2026-07-07T02:40:06Z",
  tka_last_comment_email: "Julian.Moon@sunghwan-portal.dev",

  tka_last_user_activity_at: "2026-07-07T02:40:06Z",
  tka_last_user_activity_email: "Julian.Moon@sunghwan-portal.dev",
  tk_due_at: "2026-07-08T18:00:00Z",
  tk_active: true,
  cat_scope: "INTERNAL",
  cat_id: "16",
  cat_name: {
    en: "Account lock / unlock",
    es: "Bloqueo / desbloqueo de cuenta",
    fr: "Verrouillage / déverrouillage du compte",
    ko: "계정 잠금 / 해제",
  },
  tk_approval_step_id: null,
  tk_subject: "퇴사한 Repair Manager 계정 잠금 요청 - Aria Young",
  tk_content:
    "안녕하세요. Non-phone Repair 팀의 Manager인 Aria Young이 2026-06-23부로 퇴사했습니다.<br><br>aria.young@sunghwan-portal.dev 계정을 즉시 잠그고 활성 세션, MFA 등록 정보와 API 토큰을 회수해 주세요. 보안 처리가 완료되면 HR 부서에 퇴사 및 계정 종료 대상이 맞는지 최종 확인을 요청해 주세요.",
  tk_email: {
    to: [
      "Isabella.Oh@sunghwan-portal.dev",
      "Julian.Moon@sunghwan-portal.dev",
      "Benjamin.Hong@sunghwan-portal.dev",
      "Aria.Jeon@sunghwan-portal.dev",
      "Matthew.Williams@sunghwan-portal.dev",
      "james.smith@sunghwan-portal.dev",
    ],
    cc: ["Charlotte.Johnson@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
