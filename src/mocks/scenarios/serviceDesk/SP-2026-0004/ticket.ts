import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "sunghwan-portal-2026-4",
  ticket_number: "SP-2026-0004",
  created_at: "2026-03-31T16:25:38Z",
  updated_at: "2026-04-01T03:22:49Z",
  requester_id: "olivia_johnson",
  status: "Rejected",
  priority: "medium",
  risk_level: "medium",
  assignee_id: ["evan_seo", "daniel_kim"],
  work_minutes: 95,
  last_comment_at: "2026-04-01T03:22:49Z",
  last_commenter_email: "Daniel.Kim@sunghwan-portal.dev",
  due_at: "2026-04-04T18:00:00Z",
  owner: false,
  assigned: false,
  active: true,
  scope: "INTERNAL",
  category_id: "72",
  approval_step_id: null,
  subject: "Request to extend Unit ID edit permission for repair staff",
  content:
    "During repair work, input mistakes on Unit ID happen frequently and correction requests take too long.<br>Currently, Unit ID modification is allowed only for leader level and above.<br>Please grant Unit ID edit permission to Repair Technician as well.",
  email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["liam.williams@sunghwan-portal.dev"],
    bcc: [],
  },
  files: [],
  images: [],
};
