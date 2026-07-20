import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

const relatedPortalTicket = {
  relatedTicketId: "6d6b7582-7e7e-4a6c-942c-c61d5408ce93",
  relatedTicketNo: "SP-2026-0073",
};

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "APPROVE",
    tka_content: "Adrian Vega님이 승인했습니다",
    tka_owner_username: "adrian_vega",

    tka_created_at: "2026-07-12T05:54:30Z",
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
      "안녕하세요, Tessa.<br>Solar Farm A의 telemetry collector, message broker, 발전량 저장소와 보고 데이터 생성 작업을 순서대로 점검하겠습니다.",
    tka_owner_username: "bianca_davis",

    tka_created_at: "2026-07-12T06:12:18Z",
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
      "외부 모니터링 시스템에서는 현재 시각의 데이터가 계속 들어오고 있습니다. Energy Operations Dashboard와 일일 발전량 보고서에서만 14:35 데이터가 마지막으로 표시됩니다.",
    tka_owner_username: "tessa_ito",

    tka_created_at: "2026-07-12T06:35:42Z",
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
      "내부 telemetry 수집, message broker, 발전량 저장소와 보고 데이터 생성 작업은 모두 정상이며 최신 데이터도 저장되어 있습니다. Dashboard의 Refresh 요청에서만 동기화 오류가 재현되어 포털 연동 계층 문제로 판단됩니다.<br>Portal / System 범위의 새 티켓을 생성하고 오류 메시지와 이 점검 결과를 전달해주세요.",
    tka_owner_username: "bianca_davis",

    tka_created_at: "2026-07-12T07:52:36Z",
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
      "안내해주신 점검 결과와 “Unable to synchronize telemetry data” 오류를 포함하여 Portal / System 티켓 SP-2026-0073을 생성했습니다.",
    tka_owner_username: "tessa_ito",

    tka_created_at: "2026-07-12T08:15:10Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: relatedPortalTicket,
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 6,

    tka_action_type: "COMMENT",
    tka_content:
      "SP-2026-0073으로 점검 결과를 인계했습니다. 내부 데이터 처리 과정에는 이상이 없음을 확인했으므로 이 티켓은 해결 처리하고, 이후 진행 상황은 포털 티켓에서 추적하겠습니다.",
    tka_owner_username: "bianca_davis",

    tka_created_at: "2026-07-12T08:18:04Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: relatedPortalTicket,
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 7,

    tka_action_type: "MERGE",
    tka_content:
      "내부 데이터 처리 과정에는 이상이 없고 포털 동기화 문제로 확인되어, 후속 처리를 위해 이 티켓을 포털 티켓 SP-2026-0073으로 에스컬레이션합니다.",
    tka_owner_username: "bianca_davis",

    tka_created_at: "2026-07-13T08:20:34Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
