import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Hola, Isabella. ¿Podrías darnos más detalles sobre qué información debe incluirse?",
    owner_id: "41",

    created_at: "2026-03-27T08:20:00Z",
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
      "Debe incluir el ID de recepción, la fecha de recepción, IMEI, SKU, ID del empleado, estado y ubicación actual.",
    owner_id: "53",

    created_at: "2026-03-27T08:41:12Z",
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
      "Aquí está el informe. Si necesitan ayuda, por favor avísennos. Gracias.",
    owner_id: "41",

    created_at: "2026-03-27T09:15:11Z",
    updated_at: null,
    active: true,

    files: [
      {
        index: 1,
        type: "file",
        name: "report_2026_03_27.csv",
        url: "/_mocks/scenarios/serviceDesk/ticket-2026-12/comment-3_file-1.csv",
        active: true,
      },
    ],
    images: [],
  },
];
