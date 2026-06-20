import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "59fe93dc-5e91-40da-a5da-4ee5cc58c157",
  ticket_number: "SP-2026-0023",
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
  subject: "Configurer le code-barres",
  content:
    "Bonjour, nous avons reçu un exemple de code-barres du client.<br>Pourriez-vous le configurer ?",
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
