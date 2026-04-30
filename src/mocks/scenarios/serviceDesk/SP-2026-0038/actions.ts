import { DbTicketAction } from "@/feature/serviceDesk/ticketAction";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "안녕하세요, Amelia, Matthew.<br>이 직원들이 올바른 시간을 확인할 수 있도록 근무 기록을 업데이트해도 될까요?",
    owner_id: "41",

    created_at: "2026-04-25T13:15:53Z",
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
      "잠시만요, Evan. 작업 유형을 확인 중입니다. 초과 근무가 아니라 추가 작업으로 처리될 수도 있습니다.",
    owner_id: "4",

    created_at: "2026-04-26T00:01:58Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "COMMENT",
    content: "알겠습니다, Amelia. 이 ticket을 지금 'Pending' 상태로 변경하겠습니다.",
    owner_id: "41",

    created_at: "2026-04-26T01:17:18Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
