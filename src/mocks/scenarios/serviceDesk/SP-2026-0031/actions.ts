import { TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "APPROVE",
    tka_content: "Olivia Johnson님이 승인했습니다",
    tka_owner_username: "olivia_johnson",

    tka_created_at: "2026-05-27T08:48:37Z",
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
      "안녕하세요, Liam.<br>시스템에서 84321565를 찾을 수 없습니다. 디바이스 ID가 올바른지 확인해 주시겠어요?<br> 감사합니다.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-27T09:15:00Z",
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
      "84321565가 맞습니다. 스크린샷을 확인해 주세요.<br><img src='/_mocks/scenarios/serviceDesk/ticket-2026-1/comment-2_image-1.png' />",
    tka_owner_username: "liam_williams",

    tka_created_at: "2026-05-27T12:55:58Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [
      {
        index: 1,
        type: "image",
        name: "comment-2_image-1.png",
        url: "/_mocks/scenarios/serviceDesk/ticket-2026-1/comment-2_image-1.png",
        active: true,
      },
    ],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 4,

    tka_action_type: "COMMENT",
    tka_content:
      "' 84321565'였습니다. 84321565 앞에 공백이 있습니다.<br> 디바이스 ID를 84321585로 수정했습니다.<br> 감사합니다.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-27T14:36:47Z",
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
    tka_content: "감사합니다!!",
    tka_owner_username: "liam_williams",

    tka_created_at: "2026-05-27T15:02:13Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
