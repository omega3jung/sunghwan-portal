import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "601a40a1-6408-4db3-920c-b04fb35b2cdb",
  tk_ticket_no: "SP-2026-0069",
  tk_created_at: "2026-07-09T08:13:53Z",
  tk_updated_at: "2026-07-09T12:45:10Z",
  tk_requester_username: "fiona_tanaka",
  tk_requester: {
    username: "fiona_tanaka",
    name: {
      en: { first: "Fiona", middle: "", last: "Tanaka" },
    },
    email: "fiona.tanaka@client-demo-corporation.com",
    image: null,
  },
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
  tk_work_minutes: 60,
  tka_last_comment_at: "2026-07-09T12:43:05Z",
  tka_last_comment_email: "Evan.Seo@sunghwan-portal.dev",

  tka_last_user_activity_at: "2026-07-09T12:43:05Z",
  tka_last_user_activity_email: "Evan.Seo@sunghwan-portal.dev",
  tk_due_at: "2026-07-10T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "108",
  cat_name: {
    en: "Feature Behavior Issues",
    es: "Problemas de comportamiento de funciones",
    fr: "Problèmes de comportement des fonctionnalités",
    ko: "기능 동작 문제",
  },
  tk_approval_step_id: null,
  tk_subject: "End-to-End Unit Repair page에서 배송 송장 전송 오류",
  tk_content:
    "안녕하세요. 357849216854353 장치에 대해 End-to-End Unit Repair 페이지에서 배송 송장 전송 버튼을 누르면 오류 알림이 표시됩니다. 빠른 시일내 배송할 수 있도록 처리해주세요.",
  tk_email: {
    to: [
      "Olivia.Park@sunghwan-portal.dev",
      "Lucas.Han@sunghwan-portal.dev",
      "Logan.Baek@sunghwan-portal.dev",
      "Noah.Yoon@sunghwan-portal.dev",
      "Ella.Nam@sunghwan-portal.dev",
      "Evan.Seo@sunghwan-portal.dev",
      "fiona.tanaka@client-demo-corporation.com",
    ],
    cc: ["elias.martinez@client-demo-corporation.com"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [
    {
      index: 1,
      type: "image",
      name: "ticket_image-1.png",
      url: "/_mocks/scenarios/serviceDesk/ticket-2026-9/ticket_image-1.png",
      active: true,
    },
  ],
};
