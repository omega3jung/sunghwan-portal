import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "APPROVE",
    tka_content: "Samuel Baker님이 승인했습니다",
    tka_owner_username: "samuel_baker",

    tka_created_at: "2026-07-13T08:25:10Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 2,

    tka_action_type: "APPROVE",
    tka_content: "Zoe Okafor님이 승인했습니다",
    tka_owner_username: "zoe_okafor",

    tka_created_at: "2026-07-13T08:34:42Z",
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
      "안녕하세요, Tessa.<br>외부 모니터링 데이터는 정상 수신 중이지만 Solar Farm A의 telemetry synchronization 작업이 14:35 이후 실패한 것을 확인했습니다. 연동 작업 로그를 확인하겠습니다.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-07-13T09:02:18Z",
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
      "확인 감사합니다, Evan. 운영 현황과 일일 발전량 보고서 마감 전까지 복구 부탁드립니다.",
    tka_owner_username: "tessa_ito",

    tka_created_at: "2026-07-13T09:18:36Z",
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
    tka_content:
      "telemetry synchronization worker의 인증 토큰 만료로 갱신이 중단된 것을 확인했습니다. 인증 토큰을 갱신하고 실패한 구간의 데이터를 재동기화하고 있습니다.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-07-13T10:26:54Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 6,

    tka_action_type: "COMMENT",
    tka_content:
      "Solar Farm A의 발전량이 최신 데이터로 갱신되고 Refresh 버튼에서도 오류가 발생하지 않는 것을 확인했습니다.",
    tka_owner_username: "tessa_ito",

    tka_created_at: "2026-07-13T10:48:27Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 7,

    tka_action_type: "COMMENT",
    tka_content:
      "확인 감사합니다. 14:35 이후 누락된 발전량 데이터의 재동기화를 완료했고 telemetry synchronization worker 모니터링도 추가했습니다. 이 티켓은 해결 처리하겠습니다.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-07-13T11:12:08Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
