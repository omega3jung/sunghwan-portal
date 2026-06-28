import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "안녕하세요, Liam.<br>시스템에서 84321565를 찾을 수 없습니다. 디바이스 ID가 올바른지 확인해 주시겠어요?<br> 감사합니다.",
    owner_id: "evan_seo",

    created_at: "2026-05-27T09:15:00Z",
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
      "84321565가 맞습니다. 스크린샷을 확인해 주세요.<br><img src='/_mocks/scenarios/serviceDesk/ticket-2026-1/comment-2_image-1.png' />",
    owner_id: "liam_williams",

    created_at: "2026-05-27T12:55:58Z",
    updated_at: null,
    active: true,

    files: [],
    images: [
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
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "COMMENT",
    content:
      "' 84321565'였습니다. 84321565 앞에 공백이 있습니다.<br> 디바이스 ID를 84321585로 수정했습니다.<br> 감사합니다.",
    owner_id: "evan_seo",

    created_at: "2026-05-27T14:36:47Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 4,

    action_type: "COMMENT",
    content: "감사합니다!!",
    owner_id: "liam_williams",

    created_at: "2026-05-27T15:02:13Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
