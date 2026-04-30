import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "sunghwan-portal-2026-11",
  ticket_number: "SP-2026-0011",
  created_at: "2026-03-26T22:44:33Z",
  updated_at: "2026-03-27T14:38:25Z",
  requester_id: "53",
  status: "Resolved",
  priority: "medium",
  risk_level: "medium",
  assignee_id: ["41"],
  track_time_minutes: 60,
  last_comment_at: "2026-03-27T15:02:13Z",
  last_commenter_email: "liam.williams@sunghwan-portal.dev",
  due_at: "2026-04-02T18:00:00Z",
  owner: false,
  assigned: false,
  active: true,
  scope: "INTERNAL",
  category_id: "72",
  approval_step_id: null,
  subject: "Solicitud para corregir el ID de un dispositivo recibido",
  content:
    "Hola, encontramos que uno de los IDs de dispositivo B4 recibidos es incorrecto.<br>Actualice el ID del dispositivo de 84321565 a 84321585.",
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
