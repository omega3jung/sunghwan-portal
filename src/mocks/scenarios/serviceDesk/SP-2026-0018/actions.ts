import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Hola, Amelia y Matthew.<br>¿Puedo actualizar sus registros de trabajo para que vean la hora correcta?",
    owner_id: "evan_seo",

    created_at: "2026-06-25T13:15:53Z",
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
    owner_id: "amelia_brown",

    created_at: "2026-06-26T00:01:58Z",
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
    owner_id: "evan_seo",

    created_at: "2026-06-26T01:17:18Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
