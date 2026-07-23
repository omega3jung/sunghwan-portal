import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "d693d6b3-3008-4e02-83cc-452a23751e48",
  tk_ticket_no: "SP-2026-0068",
  tk_created_at: "2026-07-08T07:13:53Z",
  tk_updated_at: "2026-07-09T01:18:10Z",
  tk_requester_username: "vivian_long",
  tk_requester: {
    username: "vivian_long",
    name: {
      en: { first: "Vivian", middle: "", last: "Long" },
    },
    email: "Vivian.Long@sunghwan-portal.dev",
    image: null,
  },
  tk_status: "Pending",
  tk_priority: "medium",
  tk_risk_level: "low",
  tk_assignee_usernames: ["matthew_williams", "amelia_brown", "evan_seo"],
  tk_work_minutes: 0,
  tka_last_comment_at: null,
  tka_last_comment_email: null,

  tka_last_user_activity_at: "2026-07-09T01:17:18Z",
  tka_last_user_activity_email: "Amelia.Brown@sunghwan-portal.dev",
  tk_due_at: "2026-07-14T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "62",
  cat_name: {
    en: "Work log / attendance issue",
    es: "Problema de registro laboral / asistencia",
    fr: "Problème de pointage / présence",
    ko: "근무 일지 / 출근 문제",
  },
  tk_approval_step_id: null,
  tk_subject: "24일 근무 기록에 초과 근무 시간을 반영해 주세요",
  tk_content:
    "안녕하세요. 24일 오후 5시에 모든 직원이 퇴근한 후, 설비팀에서 전기 배선 교체 작업을 진행했습니다.<br>이로 인해 퇴근 체크를 할 수 없었습니다.<br>세 명의 직원에 대해 퇴근 시간과 근무 시간을 업데이트해 주세요.<br><br>Jasper.Powell@sunghwan-portal.dev<br>Naomi.Jenkins@sunghwan-portal.dev<br>Connor.Peterson@sunghwan-portal.dev<br><br>작업 종료 시간: 오후 9시.",
  tk_email: {
    to: [
      "Matthew.Williams@sunghwan-portal.dev",
      "Amelia.Brown@sunghwan-portal.dev",
      "Evan.Seo@sunghwan-portal.dev",
    ],
    cc: [
      "Jasper.Powell@sunghwan-portal.dev",
      "Naomi.Jenkins@sunghwan-portal.dev",
      "Connor.Peterson@sunghwan-portal.dev",
    ],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
