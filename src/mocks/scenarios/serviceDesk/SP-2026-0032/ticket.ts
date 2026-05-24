import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "sunghwan-portal-2026-32",
  ticket_number: "SP-2026-0032",
  created_at: "2026-03-27T02:44:33Z",
  updated_at: "2026-03-27T09:18:42Z",
  requester_id: "liam_williams",
  status: "Resolved",
  priority: "medium",
  risk_level: "high",
  assignee_id: ["evan_seo"],
  track_time_minutes: 30,
  last_comment_at: "2026-03-27T09:15:11Z",
  last_commenter_email: "Evan.Seo@sunghwan-portal.dev",
  due_at: "2026-03-31T18:00:00Z",
  owner: false,
  assigned: false,
  active: true,
  scope: "INTERNAL",
  category_id: "75",
  approval_step_id: null,
  subject: "SKU-12345 입고 보고서 요청",
  content:
    "안녕하세요. SKU-12345 기기 전체의 정보가 정확한지 확인하기 위해 고객에게 입고 보고서를 요청했습니다.<br>가능한 한 빨리 전달해 주세요.",
  email: {
    to: [
      "isabella.martinez@sunghwan-portal.dev",
      "Evan.Seo@sunghwan-portal.dev",
    ],
    cc: [
      "benjamin.rodriguez@sunghwan-portal.dev",
      "lucas.hernandez@sunghwan-portal.dev",
    ],
    bcc: [],
  },
  files: [],
  images: [],
};
