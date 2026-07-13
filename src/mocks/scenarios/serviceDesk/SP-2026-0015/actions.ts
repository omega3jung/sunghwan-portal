import { TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "COMMENT",
    tka_content:
      "Hola, Grant.<br>Estamos revisando el flujo de la transacción ahora.<br>Por favor confirma si esto afecta solo a un usuario o a todo el equipo de logística.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-06-02T06:15:48Z",
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
      "Esto afecta a todo el equipo de envío de salida.<br>Distintos usuarios lo intentaron y todos se quedan bloqueados con el indicador de carga.",
    tka_owner_username: "grant_murphy",

    tka_created_at: "2026-06-02T06:19:36Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,

    tka_action_type: "NOTE",
    tka_content:
      "Encontramos la causa raíz.<br>Un bloqueo de la base de datos en la ruta de transacciones de envío está impidiendo que las solicitudes se completen.<br>Estoy liberando la sesión bloqueada y verificando que las transacciones pendientes se recuperen con normalidad.",
    tka_owner_username: "daniel_kim",

    tka_created_at: "2026-06-02T06:52:08Z",
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
      "Actualización: el bloqueo de la base de datos se resolvió y el envío de salida vuelve a procesarse con normalidad.<br>Por favor actualiza la página y vuelve a intentar la transacción.<br>No se requiere ninguna corrección adicional de datos por nuestra parte.",
    tka_owner_username: "daniel_kim",

    tka_created_at: "2026-06-02T07:21:42Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
