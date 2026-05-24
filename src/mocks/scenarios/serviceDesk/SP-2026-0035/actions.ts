import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "안녕하세요, Grant.<br>현재 트랜잭션 흐름을 확인하고 있습니다.<br>이 문제가 특정 사용자 한 명에게만 발생하는지, 아니면 물류팀 전체에 영향을 주는지 확인해 주세요.",
    owner_id: "evan_seo",

    created_at: "2026-04-02T06:15:48Z",
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
      "출고 배송팀 전체에 영향을 주고 있습니다.<br>여러 사용자가 시도했지만 모두 로딩 스피너에서 멈춘 상태입니다.",
    owner_id: "grant_murphy",

    created_at: "2026-04-02T06:19:36Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "NOTE",
    content:
      "근본 원인을 찾았습니다.<br>배송 트랜잭션 경로의 DB lock 때문에 요청이 완료되지 않고 있습니다.<br>차단된 세션을 정리하고 대기 중인 트랜잭션이 정상적으로 복구되는지 확인하고 있습니다.",
    owner_id: "daniel_kim",

    created_at: "2026-04-02T06:52:08Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,

    action_no: 4,

    action_type: "COMMENT",
    content:
      "?�데?�트: DB lock???�결?�었�?출고 배송???�시 ?�상?�으�?처리?�고 ?�습?�다.<br>?�이지�??�로고침?????�랜??��???�시 ?�도??주세??<br>?�??쪽에??추�? ?�이??보정?� ?�요?��? ?�습?�다.",
    owner_id: "daniel_kim",

    created_at: "2026-04-02T07:21:42Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
