import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "e5ac6411-2b39-4313-9119-11037ebbf712",
  tk_ticket_no: "SP-2026-0032",
  tk_created_at: "2026-07-12T05:46:12Z",
  tk_updated_at: "2026-07-13T08:20:34Z",
  tk_requester_username: "tessa_ito",
  tk_status: "Closed",
  tk_close_reason: "Escalated",
  tk_priority: "high",
  tk_risk_level: "medium",
  tk_assignee_usernames: ["adrian_vega", "bianca_davis"],
  tk_merged_into_ticket_id: "d773a4a0-e4ab-4bb1-bd55-c3c3735c7bea",
  tk_merged_into_ticket_no: "SP-2026-0033",
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
  tk_subject:
    "Solicitud de revisión interna por el retraso en la actualización de los datos de generación de Solar Farm A",
  tk_content:
    "Hola. Los datos de generación de Solar Farm A en Energy Operations Dashboard no se actualizan desde el 29 de junio de 2026 a las 14:35.<br><br>Los datos de generación más recientes aparecen correctamente en el sistema de monitoreo externo. Revise primero si existe algún problema en la recopilación interna de telemetry o en el procesamiento de datos de los informes. Esto afecta al estado operativo y a los informes diarios de generación.",
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
