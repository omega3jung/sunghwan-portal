import { TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "COMMENT",
    tka_content:
      "안녕하세요, Olivia.<br>요청을 직접 제출해 주셔서 감사합니다. 수리 팀 매니저가 제출한 요청이므로 추가 승인 단계는 필요하지 않습니다.<br>Unit ID는 후속 기록 전반에서 핵심 식별자로 사용되기 때문에 IT 팀과 함께 접근 권한 영향을 검토하고 있습니다.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-31T17:02:41Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 2,

    tka_action_type: "ASSIGN",
    tka_content:
      "안녕하세요, Daniel.<br>이 티켓을 지원해 주실 수 있을까요?<br>Repair Technician 직원 그룹에 수정 권한을 부여하고 싶어 합니다.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-31T17:06:18Z",
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
      "IT 거버넌스 관점에서 검토했습니다.<br>Unit ID는 중요한 식별자이므로 통제된 역할에만 제한되어야 합니다.<br>일반 수리 사용자에게 수정 권한을 확대하면 데이터 불일치 위험이 증가하고, 나중에 수정이 이루어졌을 때 감사 추적이 어려워질 수 있습니다.",
    tka_owner_username: "daniel_kim",

    tka_created_at: "2026-06-01T01:26:17Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 4,

    tka_action_type: "REJECT",
    tka_content:
      "안녕하세요, Olivia님.<br>검토 결과, 이 요청은 반려합니다.<br><br>사유:<br>데이터 무결성과 감사 추적성을 유지하기 위해 Unit ID 수정은 제한됩니다.<br><br>권장 조치:<br>검증을 위해 수정 요청을 팀 리더를 통해 에스컬레이션해 주세요.",
    tka_owner_username: "daniel_kim",

    tka_created_at: "2026-06-01T03:22:49Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
