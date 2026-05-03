import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "안녕하세요, Liam.<br>SLA 기준으로 이 요청은 최대 3일 정도 소요될 수 있습니다.<br>프린터 설정을 확인하고 라벨 출력 결과를 검증해야 합니다.",
    owner_id: "41",

    created_at: "2026-03-27T01:23:18Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 2,

    action_type: "COMMENT",
    content: "알겠습니다. 완료되면 알려주세요.",
    owner_id: "53",

    created_at: "2026-03-27T01:40:42Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "COMMENT",
    content:
      "안녕하세요, Mason Kwon님. Repair 팀에서 사용할 프린터를 설정하고 정상적으로 출력되는지 확인해 주실 수 있을까요?<br>이 바코드는 시스템에 설정을 완료했고, PDF 파일로 출력되는 것까지 확인했습니다.",
    owner_id: "41",

    created_at: "2026-03-30T01:12:20Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 4,

    action_type: "NOTE",
    content:
      "안녕하세요.<br><br>바코드 자체는 정상입니다. 다만 라벨 폭이 너무 작아서<br>인쇄할 때 오른쪽 영역이 잘려 나가고 있습니다.<br><br>더 넓은 라벨을 주문해 두었고, 수령 후 다시 업데이트하겠습니다.",
    owner_id: "43",

    created_at: "2026-03-30T01:48:10Z",
    updated_at: null,
    active: true,

    files: [],
    images: [
      {
        index: 1,
        type: "image",
        name: "comment-4_image-1.png",
        url: "/_mocks/scenarios/serviceDesk/ticket-2026-3/comment-4_image-1.png",
        active: true,
      },
    ],
  },
];
