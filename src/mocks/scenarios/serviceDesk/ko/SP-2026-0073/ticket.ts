import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "6d6b7582-7e7e-4a6c-942c-c61d5408ce93",
  tk_ticket_no: "SP-2026-0073",
  tk_created_at: "2026-07-13T08:13:53Z",
  tk_updated_at: "2026-07-13T11:14:20Z",
  tk_requester_username: "tessa_ito",
  tk_status: "Resolved",
  tk_priority: "urgent",
  tk_risk_level: "high",
  tk_assignee_usernames: [
    "olivia_park",
    "lucas_han",
    "logan_baek",
    "noah_yoon",
    "ella_nam",
    "evan_seo",
  ],
  tk_work_minutes: 45,
  tka_last_comment_at: "2026-07-13T11:12:08Z",
  tka_last_comment_email: "Evan.Seo@sunghwan-portal.dev",

  tka_last_user_activity_at: "2026-07-13T11:12:08Z",
  tka_last_user_activity_email: "Evan.Seo@sunghwan-portal.dev",
  tk_due_at: "2026-07-14T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "160",
  cat_name: {
    en: "Integration / External System Issues",
    es: "Problemas de integración / sistemas externos",
    fr: "Problèmes d’intégration / systèmes externes",
    ko: "통합 / 외부 시스템 문제",
  },
  tk_approval_step_id: null,
  tk_subject:
    "Energy Operations Dashboard Solar Farm A 발전량 데이터 갱신 오류",
  tk_content:
    "안녕하세요. Client Demo Energy 포털의 Energy Operations Dashboard에서 Solar Farm A의 발전량 데이터가 갱신되지 않고 있습니다.<br><br>마지막 갱신 시간은 2026-06-29 14:35로 표시되며, Refresh 버튼을 누르면 “Unable to synchronize telemetry data” 오류가 발생합니다. 외부 모니터링 시스템에서는 최신 데이터가 정상적으로 확인됩니다.<br><br>운영 현황과 일일 발전량 보고서에 영향을 주고 있으므로 빠른 확인을 요청합니다.",
  tk_email: {
    to: [
      "Olivia.Park@sunghwan-portal.dev",
      "Lucas.Han@sunghwan-portal.dev",
      "Logan.Baek@sunghwan-portal.dev",
      "Noah.Yoon@sunghwan-portal.dev",
      "Ella.Nam@sunghwan-portal.dev",
      "Evan.Seo@sunghwan-portal.dev",
      "tessa.ito@client-demo-energy.com",
    ],
    cc: [
      "samuel.baker@client-demo-energy.com",
      "zoe.okafor@client-demo-energy.com",
    ],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
