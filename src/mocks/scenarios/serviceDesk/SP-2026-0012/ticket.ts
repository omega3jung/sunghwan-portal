import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "974542c7-247d-42c6-abbf-f27e307e8fa3",
  ticket_number: "SP-2026-0012",
  created_at: "2026-05-27T02:44:33Z",
  updated_at: "2026-05-27T09:18:42Z",
  requester_id: "liam_williams",
  status: "Resolved",
  priority: "medium",
  risk_level: "high",
  assignee_id: ["evan_seo"],
  work_minutes: 30,
  last_comment_at: "2026-05-27T09:15:11Z",
  last_commenter_email: "Evan.Seo@sunghwan-portal.dev",
  due_at: "2026-05-31T18:00:00Z",
  owner: false,
  assigned: false,
  active: true,
  scope: "INTERNAL",
  category_id: "75",
  approval_step_id: null,
  subject: "Solicitud de informe de recepción para SKU-12345",
  content:
    "Hola, solicitamos al cliente el informe de recepción de todos los dispositivos SKU-12345 para comprobar que la información sea correcta.<br>Por favor envíenlo lo antes posible.",
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
