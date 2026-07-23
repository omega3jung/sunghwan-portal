import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "APPROVE",
    tka_content: "Olivia Johnson aprobó",
    tka_owner_username: "olivia_johnson",

    tka_created_at: "2026-07-02T08:07:18Z",
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
      "Hola, Isabella. ¿Podrías darnos más detalles sobre qué información debe incluirse?",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-07-02T08:20:00Z",
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
      "Debe incluir el ID de recepción, la fecha de recepción, IMEI, SKU, ID del empleado, estado y ubicación actual.",
    tka_owner_username: "liam_williams",

    tka_created_at: "2026-07-02T08:41:12Z",
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
      "Aquí está el informe. Si necesitan ayuda, por favor avísennos. Gracias.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-07-02T09:15:11Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [
      {
        index: 1,
        type: "file",
        name: "report_2026_03_27.csv",
        url: "/_mocks/scenarios/serviceDesk/ticket-2026-22/comment-3_file-1.csv",
        active: true,
      },
    ],
    tka_images: [],
  },
];
