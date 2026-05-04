import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "sunghwan-portal-2026-8",
  ticket_number: "SP-2026-0008",
  created_at: "2026-04-25T07:13:53Z",
  updated_at: "2026-04-26T01:18:10Z",
  requester_id: "117",
  status: "Pending",
  close_reason: null,
  priority: "medium",
  risk_level: "low",
  assignee_id: ["3", "4", "41"],
  merged_into_ticket_id: null,
  track_time_minutes: 0,
  last_comment_at: null,
  last_commenter_email: null,
  due_at: "2026-05-01T18:00:00Z",
  owner: false,
  assigned: true,
  active: true,
  scope: "PORTAL",
  category_id: "62",
  approval_step_id: null,
  subject: "Please reflect the overtime work on the 24th in the work log",
  content:
    "Hello. On the 24th, after all employees left at 5:00 PM, the Facilities Team performed electrical wiring replacement work.<br>Due to this, we were unable to check out.<br>Please update the departure and working hours for three employees.<br><br>Jasper.Powell@sunghwan-portal.dev<br>Naomi.Jenkins@sunghwan-portal.dev<br>Connor.Peterson@sunghwan-portal.dev<br><br>Work end time: 9:00 PM.",
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
