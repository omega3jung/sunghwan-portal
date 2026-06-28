import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "sunghwan-portal-2026-14",
  ticket_number: "SP-2026-0014",
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
    "Solicitud para ampliar el permiso de edición de Unit ID al personal de reparación",
  content:
    "Durante el trabajo de reparación, los errores de entrada en Unit ID ocurren con frecuencia y las solicitudes de corrección tardan demasiado.<br>Actualmente, la modificación de Unit ID solo está permitida para el nivel de líder o superior.<br>Por favor, concedan también el permiso de edición de Unit ID a los Repair Technicians.",
  email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["liam.williams@sunghwan-portal.dev"],
    bcc: [],
  },
  files: [],
  images: [],
};
