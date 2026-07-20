import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

const securityAssignees = [
  "isabella_oh",
  "julian_moon",
  "benjamin_hong",
  "aria_jeon",
];

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "COMMENT",
    tka_content:
      "안녕하세요, James.<br>Aria Young의 계정과 현재 활성 세션을 확인했습니다. 계정 잠금과 인증 정보 회수를 진행하겠습니다.",
    tka_owner_username: "julian_moon",

    tka_created_at: "2026-07-07T01:20:14Z",
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
      "aria.young 계정을 잠그고 모든 활성 세션을 종료했습니다. MFA 등록 정보와 발급된 API 토큰도 폐기했으며, 잠금 이후 추가 로그인 시도가 없는 것을 확인했습니다.",
    tka_owner_username: "julian_moon",

    tka_created_at: "2026-07-07T02:02:38Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {
      accountUsername: "aria_young",
      securityStatus: "ACCOUNT_LOCKED",
    },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,

    tka_action_type: "ASSIGN",
    tka_content:
      "보안 처리가 완료되어 퇴사 기록과 계정 종료 대상 확인을 위해 HR Manager Matthew Williams를 추가 할당했습니다.",
    tka_owner_username: "julian_moon",

    tka_created_at: "2026-07-07T02:04:12Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {
      fromAssigneeUsernames: securityAssignees,
      toAssigneeUsernames: ticket.tk_assignee_usernames,
    },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 4,

    tka_action_type: "COMMENT",
    tka_content:
      "HR 퇴사 기록을 확인했습니다. Aria Young의 최종 근무일은 2026-06-23이며 계정 종료 대상이 맞습니다. 퇴사 체크리스트에도 IT 계정 잠금 완료를 반영했습니다.",
    tka_owner_username: "matthew_williams",

    tka_created_at: "2026-07-07T02:34:45Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {
      hrVerificationStatus: "CONFIRMED",
    },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 5,

    tka_action_type: "COMMENT",
    tka_content:
      "HR 확인까지 완료되었습니다. 계정, 세션 및 인증 정보가 모두 비활성화된 상태이므로 이 티켓을 해결 처리하겠습니다.",
    tka_owner_username: "julian_moon",

    tka_created_at: "2026-07-07T02:40:06Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {
      resolution: "OFFBOARDING_ACCOUNT_LOCK_COMPLETED",
    },
    tka_files: [],
    tka_images: [],
  },
];
