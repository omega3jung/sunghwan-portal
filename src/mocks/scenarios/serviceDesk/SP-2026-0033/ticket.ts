import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "sunghwan-portal-2026-33",
  ticket_number: "SP-2026-0033",
  created_at: "2026-05-27T01:14:33Z",
  updated_at: "2026-05-30T02:02:00Z",
  requester_id: "liam_williams",
  status: "Working",
  priority: "medium",
  risk_level: "low",
  assignee_id: ["evan_seo", "mason_kwon"],
  work_minutes: 80,
  last_comment_at: "2026-05-30T01:48:10Z",
  last_commenter_email: "Mason.Kwon@sunghwan-portal.dev",
  due_at: "2026-05-30T18:00:00Z",
  owner: false,
  assigned: false,
  active: true,
  scope: "INTERNAL",
  category_id: "53",
  approval_step_id: null,
  subject: "바코드 설정 요청",
  content:
    "안녕하세요. 고객사로부터 샘플 바코드를 받았습니다.<br>설정해 주실 수 있을까요?",
  email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "liam.williams@sunghwan-portal.dev"],
    cc: ["Mason.Kwon@sunghwan-portal.dev"],
    bcc: [],
  },
  files: [],
  images: [
    {
      index: 1,
      type: "image",
      name: "ticket_image-1.png",
      url: "/_mocks/scenarios/serviceDesk/ticket-2026-3/ticket_image-1.png",
      active: true,
    },
  ],
};
