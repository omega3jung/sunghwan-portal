import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "안녕하세요, Isabella. 어떤 정보가 포함되어야 하는지 자세히 알려주실 수 있을까요?",
    owner_id: "evan_seo",

    created_at: "2026-05-27T08:20:00Z",
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
      "입고 ID, 입고일, IMEI, SKU, 직원 ID, 상태, 현재 위치가 포함되어야 합니다.",
    owner_id: "liam_williams",

    created_at: "2026-05-27T08:41:12Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "COMMENT",
    content: "보고서를 첨부했습니다. 도움이 필요하시면 알려주세요. 감사합니다.",
    owner_id: "evan_seo",

    created_at: "2026-05-27T09:15:11Z",
    updated_at: null,
    active: true,

    files: [
      {
        index: 1,
        type: "file",
        name: "report_2026_03_27.csv",
        url: "/_mocks/scenarios/serviceDesk/ticket-2026-32/comment-3_file-1.csv",
        active: true,
      },
    ],
    images: [],
  },
];
