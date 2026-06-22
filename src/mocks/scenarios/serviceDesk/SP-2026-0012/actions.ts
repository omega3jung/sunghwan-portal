import { TICKET_ACTION_MOCK_DEFAULTS, TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "COMMENT",
    tka_content:
      "Hola, Isabella. ¿Podrías darnos más detalles sobre qué información debe incluirse?",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-27T08:20:00Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 2,

    tka_action_type: "COMMENT",
    tka_content:
      "Debe incluir el ID de recepción, la fecha de recepción, IMEI, SKU, ID del empleado, estado y ubicación actual.",
    tka_owner_username: "liam_williams",

    tka_created_at: "2026-05-27T08:41:12Z",
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
      "Aquí está el informe. Si necesitan ayuda, por favor avísennos. Gracias.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-27T09:15:11Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [
      {
        index: 1,
        type: "file",
        name: "report_2026_03_27.csv",
        url: "/_mocks/scenarios/serviceDesk/ticket-2026-12/comment-3_file-1.csv",
        active: true,
      },
    ],
    tka_images: [],
  },
];
