import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "sunghwan-portal-2026-34",
  ticket_number: "SP-2026-0034",
  created_at: "2026-03-31T16:25:38Z",
  updated_at: "2026-04-01T03:22:49Z",
  requester_id: "olivia_johnson",
  status: "Rejected",
  priority: "medium",
  risk_level: "medium",
  assignee_id: ["evan_seo", "daniel_kim"],
  track_time_minutes: 95,
  last_comment_at: "2026-04-01T03:22:49Z",
  last_commenter_email: "Daniel.Kim@sunghwan-portal.dev",
  due_at: "2026-04-04T18:00:00Z",
  owner: false,
  assigned: false,
  active: true,
  scope: "INTERNAL",
  category_id: "72",
  approval_step_id: null,
  subject: "수리 담당자에게 Unit ID 수정 권한 확대 요청",
  content:
    "수리 작업 중 Unit ID 입력 실수가 자주 발생하고, 수정 요청 처리에 시간이 너무 오래 걸리고 있습니다.<br>현재 Unit ID 수정은 리더 레벨 이상에게만 허용되어 있습니다.<br>Repair Technician에게도 Unit ID 수정 권한을 부여해 주세요.",
  email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["liam.williams@sunghwan-portal.dev"],
    bcc: [],
  },
  files: [],
  images: [],
};
