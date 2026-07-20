import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "053fd7dd-1413-4263-9f63-720451a4a64b",
  tk_ticket_no: "SP-2026-0072",
  tk_created_at: "2026-07-12T05:46:12Z",
  tk_updated_at: "2026-07-13T08:20:34Z",
  tk_requester_username: "tessa_ito",
  tk_status: "Closed",
  tk_close_reason: "Escalated",
  tk_priority: "high",
  tk_risk_level: "medium",
  tk_assignee_usernames: ["adrian_vega", "bianca_davis"],
  tk_merged_into_ticket_id: "6d6b7582-7e7e-4a6c-942c-c61d5408ce93",
  tk_merged_into_ticket_no: "SP-2026-0073",
  tk_work_minutes: 138,
  tka_last_comment_at: "2026-07-13T08:20:34Z",
  tka_last_comment_email: "bianca.davis@client-demo-energy.com",

  tka_last_user_activity_at: "2026-07-13T08:20:34Z",
  tka_last_user_activity_email: "bianca.davis@client-demo-energy.com",
  tk_due_at: "2026-07-15T18:00:00Z",
  tk_active: true,
  cat_scope: "INTERNAL",
  cat_id: "189",
  cat_name: {
    en: "Report data issue",
    es: "Problema de datos en reportes",
    fr: "Problème de données de rapport",
    ko: "리포트 데이터 문제",
  },
  tk_approval_step_id: null,
  tk_subject: "Solar Farm A 발전량 데이터 갱신 지연 내부 점검 요청",
  tk_content:
    "안녕하세요. Energy Operations Dashboard에서 Solar Farm A의 발전량 데이터가 2026-06-29 14:35 이후 갱신되지 않고 있습니다.<br><br>외부 모니터링 시스템에서는 최신 발전량이 정상적으로 확인되므로, 내부 telemetry 수집 및 보고 데이터 처리 과정에 이상이 있는지 우선 점검해주세요. 운영 현황과 일일 발전량 보고서에 영향을 주고 있습니다.",
  tk_email: {
    to: [
      "adrian.vega@client-demo-energy.com",
      "bianca.davis@client-demo-energy.com",
      "tessa.ito@client-demo-energy.com",
    ],
    cc: [
      "samuel.baker@client-demo-energy.com",
      "rosa.hall@client-demo-energy.com",
    ],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
