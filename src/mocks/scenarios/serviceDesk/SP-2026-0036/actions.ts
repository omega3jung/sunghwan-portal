import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "안녕하세요, Liam.<br>현재 백엔드 팀과 함께 이 문제를 확인하고 있습니다.<br>수리팀에서 어떤 프로세스 단계가 막혀 있는지 확인 부탁드립니다.",
    owner_id: "evan_seo",

    created_at: "2026-06-02T06:22:11Z",
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
      "입고, 수리, QC가 모두 막혀 있습니다.<br>영향을 받은 모든 화면에서 로딩 아이콘만 계속 표시되고 사용자가 다음 작업을 진행할 수 없습니다.",
    owner_id: "liam_williams",

    created_at: "2026-06-02T06:25:44Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "MERGE",
    content:
      "이 티켓은 동일한 DB 잠금으로 인해 발생한 같은 incident이므로 SP-2026-0035에 병합되었습니다.<br>이후 추적과 커뮤니케이션은 대표 티켓에서 계속 진행됩니다.",
    owner_id: "daniel_kim",

    created_at: "2026-06-02T07:13:18Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
