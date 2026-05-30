import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "sunghwan-portal-2026-16",
  ticket_number: "SP-2026-0016",
  created_at: "2026-04-02T06:13:27Z",
  updated_at: "2026-04-02T07:13:18Z",
  requester_id: "liam_williams",
  status: "Closed",
  close_reason: "Merged",
  priority: "high",
  risk_level: "high",
  assignee_id: ["evan_seo", "daniel_kim"],
  merged_into_ticket_id: "sunghwan-portal-2026-15",
  track_time_minutes: 20,
  last_comment_at: "2026-04-02T07:13:18Z",
  last_commenter_email: "Daniel.Kim@sunghwan-portal.dev",
  due_at: "2026-04-03T18:00:00Z",
  owner: false,
  assigned: false,
  active: true,
  scope: "PORTAL",
  category_id: "5",
  approval_step_id: null,
  subject:
    "Las pantallas de recepción, reparación y control de calidad se quedan cargando",
  content:
    "Los usuarios de recepción, reparación y control de calidad solo ven el indicador de carga y no pueden continuar con las transacciones.<br>El problema aparece en varios pasos del portal, no solo en una pantalla.",
  email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["olivia.johnson@sunghwan-portal.dev"],
    bcc: [],
  },
  files: [],
  images: [],
};
