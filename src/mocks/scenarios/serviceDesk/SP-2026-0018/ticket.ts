import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "sunghwan-portal-2026-18",
  ticket_number: "SP-2026-0018",
  created_at: "2026-04-25T07:13:53Z",
  updated_at: "2026-04-26T01:18:10Z",
  requester_id: "vivian_long",
  status: "Pending",
  close_reason: null,
  priority: "medium",
  risk_level: "low",
  assignee_id: ["matthew_williams", "amelia_brown", "evan_seo"],
  merged_into_ticket_id: null,
  work_minutes: 0,
  last_comment_at: null,
  last_commenter_email: null,
  due_at: "2026-05-01T18:00:00Z",
  owner: false,
  assigned: true,
  active: true,
  scope: "PORTAL",
  category_id: "62",
  approval_step_id: null,
  subject:
    "Por favor, refleja el trabajo fuera de horario del día 24 en el registro de trabajo",
  content:
    "Hola. El día 24, después de que todos los empleados salieron a las 5:00 PM, el equipo de Instalaciones realizó un trabajo de reemplazo del cableado eléctrico.<br>Debido a esto, no pudimos registrar la salida.<br>Por favor, actualiza la hora de salida y las horas trabajadas de tres empleados.<br><br>Jasper.Powell@sunghwan-portal.dev<br>Naomi.Jenkins@sunghwan-portal.dev<br>Connor.Peterson@sunghwan-portal.dev<br><br>Hora de finalización del trabajo: 9:00 PM.",
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
