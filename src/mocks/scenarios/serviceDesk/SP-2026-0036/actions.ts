import { TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "COMMENT",
    tka_content:
      "안녕하세요, Liam.<br>현재 백엔드 팀과 함께 이 문제를 확인하고 있습니다.<br>수리팀에서 어떤 프로세스 단계가 막혀 있는지 확인 부탁드립니다.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-06-02T06:22:11Z",
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
      "입고, 수리, QC가 모두 막혀 있습니다.<br>영향을 받은 모든 화면에서 로딩 아이콘만 계속 표시되고 사용자가 다음 작업을 진행할 수 없습니다.",
    tka_owner_username: "liam_williams",

    tka_created_at: "2026-06-02T06:25:44Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,

    tka_action_type: "MERGE",
    tka_content:
      "이 티켓은 동일한 DB 잠금으로 인해 발생한 같은 incident이므로 SP-2026-0035에 병합되었습니다.<br>이후 추적과 커뮤니케이션은 대표 티켓에서 계속 진행됩니다.",
    tka_owner_username: "daniel_kim",

    tka_created_at: "2026-06-02T07:13:18Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
