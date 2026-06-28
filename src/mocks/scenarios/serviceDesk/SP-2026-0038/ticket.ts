import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "sunghwan-portal-2026-38",
  ticket_number: "SP-2026-0038",
  created_at: "2026-06-25T07:13:53Z",
  updated_at: "2026-06-26T01:18:10Z",
  requester_id: "vivian_long",
  status: "Pending",
  close_reason: null,
  priority: "medium",
  risk_level: "low",
  assignee_id: ["matthew_williams", "amelia_brown", "evan_seo"],
  merged_into_ticket_id: null,
  work_minutes: 0,
  last_comment_at: null,
  last_commenter_email: null,
  due_at: "2026-07-01T18:00:00Z",
  owner: false,
  assigned: true,
  active: true,
  scope: "PORTAL",
  category_id: "62",
  approval_step_id: null,
  subject: "24일 근무 기록에 초과 근무 시간을 반영해 주세요",
  content:
    "안녕하세요. 24일 오후 5시에 모든 직원이 퇴근한 후, 설비팀에서 전기 배선 교체 작업을 진행했습니다.<br>이로 인해 퇴근 체크를 할 수 없었습니다.<br>세 명의 직원에 대해 퇴근 시간과 근무 시간을 업데이트해 주세요.<br><br>Jasper.Powell@sunghwan-portal.dev<br>Naomi.Jenkins@sunghwan-portal.dev<br>Connor.Peterson@sunghwan-portal.dev<br><br>작업 종료 시간: 오후 9시.",
  email: {
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
  files: [],
  images: [],
};
