import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Hola, Grant.<br>Estamos revisando el flujo de la transacción ahora.<br>Por favor confirma si esto afecta solo a un usuario o a todo el equipo de logística.",
    owner_id: "evan_seo",

    created_at: "2026-04-02T06:15:48Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 2,

    action_type: "COMMENT",
    content:
      "Esto afecta a todo el equipo de envío de salida.<br>Distintos usuarios lo intentaron y todos se quedan bloqueados con el indicador de carga.",
    owner_id: "grant_murphy",

    created_at: "2026-04-02T06:19:36Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "NOTE",
    content:
      "Encontramos la causa raíz.<br>Un bloqueo de la base de datos en la ruta de transacciones de envío está impidiendo que las solicitudes se completen.<br>Estoy liberando la sesión bloqueada y verificando que las transacciones pendientes se recuperen con normalidad.",
    owner_id: "daniel_kim",

    created_at: "2026-04-02T06:52:08Z",
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
      "Actualización: el bloqueo de la base de datos se resolvió y el envío de salida vuelve a procesarse con normalidad.<br>Por favor actualiza la página y vuelve a intentar la transacción.<br>No se requiere ninguna corrección adicional de datos por nuestra parte.",
    owner_id: "daniel_kim",

    created_at: "2026-04-02T07:21:42Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
