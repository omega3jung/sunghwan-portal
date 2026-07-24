import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,
    tka_action_type: "APPROVE",
    tka_content: "Quentin Wilson aprobó la solicitud.",
    tka_owner_username: "quentin_wilson",
    tka_created_at: "2026-07-10T17:29:25Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 2,
    tka_action_type: "COMMENT",
    tka_content:
      "Hola, Sam.<br>¿Podrías explicar por qué Tessa necesita acceso a los tickets del portal?",
    tka_owner_username: "adrian_usman",
    tka_created_at: "2026-07-10T18:15:53Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,
    tka_action_type: "COMMENT",
    tka_content:
      "Necesita acceso para enviar y documentar solicitudes de mejoras y nuevas funciones del portal. Nosotros tomaremos las decisiones y ella creará y hará seguimiento de las solicitudes.",
    tka_owner_username: "samuel_anderson",
    tka_created_at: "2026-07-10T19:01:58Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 4,
    tka_action_type: "COMMENT",
    tka_content:
      "Entendido, Sam. Se ha concedido el permiso. Avísanos si surge algún problema.",
    tka_owner_username: "adrian_usman",
    tka_created_at: "2026-07-10T20:17:18Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
