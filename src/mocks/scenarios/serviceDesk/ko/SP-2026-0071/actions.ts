import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

const initialAssignees = ["yusuf_garcia", "zoe_novak", "bianca_clark"];
const reviewAssignees = ticket.tk_assignee_usernames;

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "ASSIGN",
    tka_content:
      "신규 제조사 지원 범위를 함께 검토하기 위해 Operations, Repair Engineering, Quality, IT 및 Contract 담당자를 이 티켓에 추가했습니다.",
    tka_owner_username: "yusuf_garcia",

    tka_created_at: "2026-07-11T08:18:20Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {
      fromAssigneeUsernames: initialAssignees,
      toAssigneeUsernames: reviewAssignees,
    },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 2,

    tka_action_type: "COMMENT",
    tka_content:
      "운영 관점에서는 Demo-Com사 제품도 기존 입고, 작업 배정 및 배송 절차를 사용할 수 있습니다. 다만 제조사와 제품 모델을 먼저 식별할 수 있어야 하고, 포장 라벨과 출고 문서에 제조사별 필수 항목이 있는지 확인이 필요합니다.",
    tka_owner_username: "rosa_green",

    tka_created_at: "2026-07-11T09:05:44Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: { reviewArea: "OPERATIONS" },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,

    tka_action_type: "COMMENT",
    tka_content:
      "수리 프로세스에는 Demo-Com사 전용 점검 항목, 고장 코드와 부품 매핑이 필요합니다. 제품 모델 목록과 서비스 매뉴얼을 받아야 기존 수리 결과 코드로 처리할 수 있는 범위를 판단할 수 있습니다.",
    tka_owner_username: "adrian_usman",

    tka_created_at: "2026-07-11T11:42:08Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: { reviewArea: "REPAIR_ENGINEERING" },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 4,

    tka_action_type: "COMMENT",
    tka_content:
      "Quality Check 기준은 기존 제조사와 동일하게 적용하기 어렵습니다. 제품군별 검사 항목, 허용 기준과 증빙 자료를 별도 QC 템플릿으로 설정할 수 있어야 합니다.",
    tka_owner_username: "tessa_hassan",

    tka_created_at: "2026-07-11T14:18:31Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: { reviewArea: "QUALITY" },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 5,

    tka_action_type: "COMMENT",
    tka_content:
      "현재 데이터 모델로 제조사와 제품 모델 기본 정보는 관리할 수 있습니다. 제조사별 Serial Number 규칙, 수리 결과 코드와 QC 템플릿은 설정 확장이 필요하며, 외부 연동 여부를 판단하려면 Demo-Com사 API 사양과 샘플 데이터가 필요합니다.",
    tka_owner_username: "zoe_novak",

    tka_created_at: "2026-07-12T01:15:27Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: { reviewArea: "IT" },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 6,

    tka_action_type: "COMMENT",
    tka_content:
      "계약 검토 단계라 제조사 API 제공 범위와 보증 정보 관리 조건은 아직 확정되지 않았습니다. Demo-Com사에 제품 모델 목록, 보증 정책, API 문서와 테스트 데이터 제공을 요청한 상태입니다.",
    tka_owner_username: "ximena_smith",

    tka_created_at: "2026-07-12T04:32:50Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: { reviewArea: "CONTRACT" },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 7,

    tka_action_type: "COMMENT",
    tka_content:
      "현재 운영 및 수리 프로세스에 대한 1차 검토는 완료했습니다. 제조사로부터 제품 모델 목록, 보증 정책 및 API 사양을 전달받은 후 포털 제공사에 요청할 기능 범위를 확정하겠습니다.",
    tka_owner_username: "fiona_tanaka",

    tka_created_at: "2026-07-12T07:42:16Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {
      reviewStatus: "WAITING_FOR_MANUFACTURER_INFORMATION",
    },
    tka_files: [],
    tka_images: [],
  },
];
