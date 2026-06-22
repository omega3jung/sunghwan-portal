import { TICKET_ACTION_MOCK_DEFAULTS, TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "COMMENT",
    tka_content:
      "안녕하세요, Isabella. 어떤 정보가 포함되어야 하는지 자세히 알려주실 수 있을까요?",
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
      "입고 ID, 입고일, IMEI, SKU, 직원 ID, 상태, 현재 위치가 포함되어야 합니다.",
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
      "보고서를 첨부했습니다. 도움이 필요하시면 알려주세요. 감사합니다.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-27T09:15:11Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [
      {
        index: 1,
        type: "file",
        name: "report_2026_03_27.csv",
        url: "/_mocks/scenarios/serviceDesk/ticket-2026-32/comment-3_file-1.csv",
        active: true,
      },
    ],
    tka_images: [],
  },
];
