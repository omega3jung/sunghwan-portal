import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "sunghwan-portal-2026-31",
  ticket_number: "SP-2026-0031",
  created_at: "2026-03-26T22:44:33Z",
  updated_at: "2026-03-27T14:38:25Z",
  requester_id: "liam_williams",
  status: "Resolved",
  priority: "medium",
  risk_level: "medium",
  assignee_id: ["evan_seo"],
  work_minutes: 60,
  last_comment_at: "2026-03-27T15:02:13Z",
  last_commenter_email: "liam.williams@sunghwan-portal.dev",
  due_at: "2026-04-02T18:00:00Z",
  owner: false,
  assigned: false,
  active: true,
  scope: "INTERNAL",
  category_id: "72",
  approval_step_id: null,
  subject: "?�고???�바?�스 ID ?�정 ?�청",
  content:
    "?�녕?�세?? ?�고??B4 ?�바?�스 ID �??�나가 ?�못??것을 ?�인?�습?�다.<br>?�바?�스 ID�?84321565?�서 84321585�??�정??주세??",
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
