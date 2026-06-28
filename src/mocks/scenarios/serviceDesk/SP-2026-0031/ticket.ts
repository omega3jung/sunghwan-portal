import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "sunghwan-portal-2026-31",
  ticket_number: "SP-2026-0031",
  created_at: "2026-05-26T22:44:33Z",
  updated_at: "2026-05-27T14:38:25Z",
  requester_id: "liam_williams",
  status: "Resolved",
  priority: "medium",
  risk_level: "medium",
  assignee_id: ["evan_seo"],
  work_minutes: 60,
  last_comment_at: "2026-05-27T15:02:13Z",
  last_commenter_email: "liam.williams@sunghwan-portal.dev",
  due_at: "2026-06-02T18:00:00Z",
  owner: false,
  assigned: false,
  active: true,
  scope: "INTERNAL",
  category_id: "72",
  approval_step_id: null,
  subject: "입고된 디바이스 ID 수정 요청",
  content:
    "안녕하세요. 입고된 B4 디바이스 ID 중 하나가 잘못된 것을 확인했습니다.<br>디바이스 ID를 84321565에서 84321585로 수정해 주세요.",
  email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "liam.williams@sunghwan-portal.dev"],
    cc: [
      "olivia.johnson@sunghwan-portal.dev",
      "emma.brown@sunghwan-portal.dev",
    ],
    bcc: [],
  },
  files: [],
  images: [],
};
