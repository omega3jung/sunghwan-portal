import { TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "APPROVE",
    tka_content: "Olivia Johnson님이 승인했습니다",
    tka_owner_username: "olivia_johnson",

    tka_created_at: "2026-06-25T07:29:25Z",
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
      "안녕하세요, Amelia, Matthew.<br>이 직원들이 올바른 시간을 확인할 수 있도록 근무 기록을 업데이트해도 될까요?",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-06-25T13:15:53Z",
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
      "잠시만요, Evan. 작업 유형을 확인 중입니다. 초과 근무가 아니라 추가 작업으로 처리될 수도 있습니다.",
    tka_owner_username: "amelia_brown",

    tka_created_at: "2026-06-26T00:01:58Z",
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
      "알겠습니다, Amelia. 이 ticket을 지금 'Pending' 상태로 변경하겠습니다.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-06-26T01:17:18Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
