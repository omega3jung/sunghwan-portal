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
  work_minutes: 30,
  last_comment_at: "2026-03-27T09:15:11Z",
  last_commenter_email: "Evan.Seo@sunghwan-portal.dev",
  due_at: "2026-03-31T18:00:00Z",
  owner: false,
  assigned: false,
  active: true,
  scope: "INTERNAL",
  category_id: "75",
  approval_step_id: null,
  subject: "SKU-12345 ?�고 보고???�청",
  content:
    "?�녕?�세?? SKU-12345 기기 ?�체???�보가 ?�확?��? ?�인?�기 ?�해 고객?�게 ?�고 보고?��? ?�청?�습?�다.<br>가?�한 ??빨리 ?�달??주세??",
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
