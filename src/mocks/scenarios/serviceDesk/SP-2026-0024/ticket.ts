import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "979af2f3-ea36-4395-b48c-436b9752f446",
  ticket_number: "SP-2026-0024",
  created_at: "2026-05-31T16:25:38Z",
  updated_at: "2026-06-01T03:22:49Z",
  requester_id: "olivia_johnson",
  status: "Rejected",
  priority: "medium",
  risk_level: "medium",
  assignee_id: ["evan_seo", "daniel_kim"],
  work_minutes: 95,
  last_comment_at: "2026-06-01T03:22:49Z",
  last_commenter_email: "Daniel.Kim@sunghwan-portal.dev",
  due_at: "2026-06-04T18:00:00Z",
  owner: false,
  assigned: false,
  active: true,
  scope: "INTERNAL",
  category_id: "72",
  approval_step_id: null,
  subject:
    "Demande d'extension du droit de modification de Unit ID au personnel de réparation",
  content:
    "Pendant les opérations de réparation, les erreurs de saisie sur Unit ID se produisent fréquemment et les demandes de correction prennent trop de temps.<br>Actuellement, la modification de Unit ID est autorisée uniquement au niveau leader et au-dessus.<br>Veuillez également accorder le droit de modification de Unit ID aux Repair Technicians.",
  email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["liam.williams@sunghwan-portal.dev"],
    bcc: [],
  },
  files: [],
  images: [],
};
