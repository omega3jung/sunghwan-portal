import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Bonjour, Isabella. Pourrais-tu préciser quelles informations doivent être incluses ?",
    owner_id: "evan_seo",

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
      "Il doit inclure l’ID de réception, la date de réception, l’IMEI, le SKU, l’ID de l’employé, le statut et l’emplacement actuel.",
    owner_id: "liam_williams",

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
      "Voici le rapport. Si vous avez besoin d’aide, faites-le-nous savoir. Merci.",
    owner_id: "evan_seo",

    created_at: "2026-03-27T09:15:11Z",
    updated_at: null,
    active: true,

    files: [
      {
        index: 1,
        type: "file",
        name: "report_2026_03_27.csv",
        url: "/_mocks/scenarios/serviceDesk/ticket-2026-22/comment-3_file-1.csv",
        active: true,
      },
    ],
    images: [],
  },
];
