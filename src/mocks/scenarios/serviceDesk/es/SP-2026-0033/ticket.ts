import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "d773a4a0-e4ab-4bb1-bd55-c3c3735c7bea",
  tk_ticket_no: "SP-2026-0033",
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
    "Error de actualización de los datos de generación de Solar Farm A en Energy Operations Dashboard",
  tk_content:
    "Hola. Los datos de generación de Solar Farm A no se actualizan en Energy Operations Dashboard del portal de Client Demo Energy.<br><br>La última actualización se muestra como el 29 de junio de 2026 a las 14:35 y, al seleccionar el botón Refresh, aparece el error “Unable to synchronize telemetry data”. Los datos más recientes se muestran correctamente en el sistema de monitoreo externo.<br><br>Esto afecta al estado operativo y a los informes diarios de generación, por lo que solicitamos una revisión urgente.",
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
