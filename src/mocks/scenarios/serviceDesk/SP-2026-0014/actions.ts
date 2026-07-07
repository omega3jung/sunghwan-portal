import { TICKET_ACTION_MOCK_DEFAULTS, TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "COMMENT",
    tka_content:
      "Hola, Olivia.<br>Gracias por enviar esta solicitud directamente. Como fue planteada por una gerente del equipo de reparación, no se necesita ningún paso adicional de aprobación.<br>Estamos revisando el impacto de acceso con el equipo de IT porque Unit ID se utiliza como identificador principal en los registros posteriores.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-31T17:02:41Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 2,

    tka_action_type: "ASSIGN",
    tka_content:
      "Hola, Daniel.<br>¿Podrías ayudar con este ticket?<br>Quieren conceder permiso de edición al grupo de empleados Repair Technician.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-31T17:06:18Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,

    tka_action_type: "COMMENT",
    tka_content:
      "Revisado desde la perspectiva de gobernanza de IT.<br>Unit ID es un identificador crítico y debe seguir restringido a roles controlados.<br>Ampliar el permiso de edición a usuarios generales de reparación aumentaría el riesgo de inconsistencia de datos y dificultaría el seguimiento de auditoría cuando se realicen correcciones más adelante.",
    tka_owner_username: "daniel_kim",

    tka_created_at: "2026-06-01T01:26:17Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 4,

    tka_action_type: "REJECT",
    tka_content:
      "Hola, Olivia.<br>Después de la revisión, rechazo esta solicitud.<br><br>Motivo:<br>La modificación de Unit ID está restringida para mantener la integridad de los datos y la auditabilidad.<br><br>Recomendación:<br>Por favor, escalen las solicitudes de corrección a través del líder del equipo para su validación.",
    tka_owner_username: "daniel_kim",

    tka_created_at: "2026-06-01T03:22:49Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
];
