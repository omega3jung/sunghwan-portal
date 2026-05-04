import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Hola, Amelia y Matthew.<br>¿Puedo actualizar sus registros de trabajo para que vean la hora correcta?",
    owner_id: "41",

    created_at: "2026-04-25T13:15:53Z",
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
      "Espera, Evan. Estamos revisando el tipo de trabajo. Puede tratarse de trabajo adicional, no de horas extra.",
    owner_id: "4",

    created_at: "2026-04-26T00:01:58Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "COMMENT",
    content: "Entendido, Amelia. Voy a cambiar este ticket a 'Pending' ahora.",
    owner_id: "41",

    created_at: "2026-04-26T01:17:18Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
