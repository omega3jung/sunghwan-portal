import { DbTicketAction } from "@/feature/serviceDesk/ticketAction";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "안녕하세요, Grant.<br>현재 트랜잭션 흐름을 확인하고 있습니다.<br>이 문제가 특정 사용자 한 명에게만 발생하는지, 아니면 물류팀 전체에 영향을 주는지 확인해 주세요.",
    owner_id: "41",

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
    owner_id: "141",

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
    owner_id: "31",

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
      "업데이트: DB lock이 해결되었고 출고 배송이 다시 정상적으로 처리되고 있습니다.<br>페이지를 새로고침한 뒤 트랜잭션을 다시 시도해 주세요.<br>저희 쪽에서 추가 데이터 보정은 필요하지 않습니다.",
    owner_id: "31",

    created_at: "2026-04-02T07:21:42Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
