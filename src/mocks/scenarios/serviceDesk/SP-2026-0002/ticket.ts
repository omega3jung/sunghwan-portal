import { DbTicketDetail } from "@/feature/serviceDesk/ticket/api";

export const ticket: DbTicketDetail = {
  id: "sunghwan-portal-2026-2",
  ticket_number: "SP-2026-0002",
  created_at: "2026-03-27T02:44:33Z",
  updated_at: "2026-03-27T09:18:42Z",
  requester_id: "53",
  status: "Resolved",
  priority: "medium",
  risk_level: "high",
  assignee_id: ["41"],
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
  subject: "Request to SKU-12345 receving report",
  content:
    "Hi, we requested receving report of all SKU-12345 devices from customer to check info is correct.<br>Please send it ASAP.",
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
