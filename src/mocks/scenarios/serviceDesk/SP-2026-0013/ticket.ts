import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "sunghwan-portal-2026-13",
  ticket_number: "SP-2026-0013",
  created_at: "2026-03-27T01:14:33Z",
  updated_at: "2026-03-30T02:02:00Z",
  requester_id: "liam_williams",
  status: "Working",
  priority: "medium",
  risk_level: "low",
  assignee_id: ["evan_seo", "mason_kwon"],
  work_minutes: 80,
  last_comment_at: "2026-03-30T01:48:10Z",
  last_commenter_email: "Mason.Kwon@sunghwan-portal.dev",
  due_at: "2026-03-30T18:00:00Z",
  owner: false,
  assigned: false,
  active: true,
  scope: "INTERNAL",
  category_id: "53",
  approval_step_id: null,
  subject: "Configurar código de barras",
  content:
    "Hola, recibimos un código de barras de muestra del cliente.<br>¿Podrían configurarlo?",
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
