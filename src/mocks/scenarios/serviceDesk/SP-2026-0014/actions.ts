import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Hola, Olivia.<br>Gracias por enviar esta solicitud directamente. Como fue planteada por una gerente del equipo de reparación, no se necesita ningún paso adicional de aprobación.<br>Estamos revisando el impacto de acceso con el equipo de IT porque Unit ID se utiliza como identificador principal en los registros posteriores.",
    owner_id: "evan_seo",

    created_at: "2026-05-31T17:02:41Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 2,

    action_type: "ASSIGN",
    content:
      "Hola, Daniel.<br>¿Podrías ayudar con este ticket?<br>Quieren conceder permiso de edición al grupo de empleados Repair Technician.",
    owner_id: "evan_seo",

    created_at: "2026-05-31T17:06:18Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "COMMENT",
    content:
      "Revisado desde la perspectiva de gobernanza de IT.<br>Unit ID es un identificador crítico y debe seguir restringido a roles controlados.<br>Ampliar el permiso de edición a usuarios generales de reparación aumentaría el riesgo de inconsistencia de datos y dificultaría el seguimiento de auditoría cuando se realicen correcciones más adelante.",
    owner_id: "daniel_kim",

    created_at: "2026-06-01T01:26:17Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 4,

    action_type: "COMMENT",
    content:
      "Hola, Olivia.<br>Después de la revisión, rechazo esta solicitud.<br><br>Motivo:<br>La modificación de Unit ID está restringida para mantener la integridad de los datos y la auditabilidad.<br><br>Recomendación:<br>Por favor, escalen las solicitudes de corrección a través del líder del equipo para su validación.",
    owner_id: "daniel_kim",

    created_at: "2026-06-01T03:22:49Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
