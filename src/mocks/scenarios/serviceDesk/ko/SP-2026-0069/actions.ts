import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "APPROVE",
    tka_content: "Elias Martinez님이 승인했습니다",
    tka_owner_username: "elias_martinez",

    tka_created_at: "2026-07-09T08:29:25Z",
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
      "안녕하세요, Fiona, Elias.<br>이 장치가 QC area에 있기 때문에 송장 발송을 할 수 없습니다. 장치를 shipping dock으로 transfer한 후 다시 시도해주세요.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-07-09T09:15:53Z",
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
      "잠시만요, Evan. 오늘 중으로 처리하도록 demo corporation쪽 manager에게 요청받았습니다. 빠르게 처리해주세요.",
    tka_owner_username: "fiona_tanaka",

    tka_created_at: "2026-07-09T10:01:58Z",
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
      "알겠습니다, Fiona. 이 357849216854353를 shipping dock으로 옮기고 처리하겠습니다.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-07-09T10:17:18Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 5,

    tka_action_type: "COMMENT",
    tka_content:
      "357849216854353에 대해 배송 송장이 보내진 것을 확인하였습니다. 처리를 확인 후 이후 작업을 진행해주세요.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-07-09T12:43:05Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
