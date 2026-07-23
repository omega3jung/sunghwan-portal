import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "APPROVE",
    tka_content: "Quentin Wilson님이 승인했습니다",
    tka_owner_username: "quentin_wilson",

    tka_created_at: "2026-07-10T17:29:25Z",
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
      "안녕하세요, Sam.<br>portal ticket 권한이 필요한 이유를 알 수 있을까요?",
    tka_owner_username: "adrian_usman",

    tka_created_at: "2026-07-10T18:15:53Z",
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
      "portal 기능 개선과 신규 기능 요청을 위해 필요합니다. 우리가 결정하고 판단하지만 그녀가 요청하고 기록할거에요.",
    tka_owner_username: "samuel_anderson",

    tka_created_at: "2026-07-10T19:01:58Z",
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
      "알겠습니다, Sam. 권한을 부여했습니다. 문제가 있다면 알려주세요.",
    tka_owner_username: "adrian_usman",

    tka_created_at: "2026-07-10T20:17:18Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
