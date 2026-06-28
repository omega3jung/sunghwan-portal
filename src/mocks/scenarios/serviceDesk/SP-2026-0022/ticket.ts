import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "sunghwan-portal-2026-22",
  ticket_number: "SP-2026-0022",
  created_at: "2026-05-27T02:44:33Z",
  updated_at: "2026-05-27T09:18:42Z",
  requester_id: "liam_williams",
  status: "Resolved",
  priority: "medium",
  risk_level: "high",
  assignee_id: ["evan_seo"],
  work_minutes: 30,
  last_comment_at: "2026-05-27T09:15:11Z",
  last_commenter_email: "Evan.Seo@sunghwan-portal.dev",
  due_at: "2026-05-31T18:00:00Z",
  owner: false,
  assigned: false,
  active: true,
  scope: "INTERNAL",
  category_id: "75",
  approval_step_id: null,
  subject: "Demande de rapport de réception pour SKU-12345",
  content:
    "Bonjour, nous avons demandé au client le rapport de réception de tous les appareils SKU-12345 afin de vérifier que les informations sont correctes.<br>Veuillez l?�envoyer dès que possible.",
  email: {
    to: [
      "isabella.martinez@sunghwan-portal.dev",
      "Evan.Seo@sunghwan-portal.dev",
    ],
    cc: [
      "benjamin.rodriguez@sunghwan-portal.dev",
      "lucas.hernandez@sunghwan-portal.dev",
    ],
    bcc: [],
  },
  files: [],
  images: [],
};
