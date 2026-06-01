import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "sunghwan-portal-2026-34",
  ticket_number: "SP-2026-0034",
  created_at: "2026-03-31T16:25:38Z",
  updated_at: "2026-04-01T03:22:49Z",
  requester_id: "olivia_johnson",
  status: "Rejected",
  priority: "medium",
  risk_level: "medium",
  assignee_id: ["evan_seo", "daniel_kim"],
  work_minutes: 95,
  last_comment_at: "2026-04-01T03:22:49Z",
  last_commenter_email: "Daniel.Kim@sunghwan-portal.dev",
  due_at: "2026-04-04T18:00:00Z",
  owner: false,
  assigned: false,
  active: true,
  scope: "INTERNAL",
  category_id: "72",
  approval_step_id: null,
  subject: "?�리 ?�당?�에�?Unit ID ?�정 권한 ?��? ?�청",
  content:
    "?�리 ?�업 �?Unit ID ?�력 ?�수가 ?�주 발생?�고, ?�정 ?�청 처리???�간???�무 ?�래 걸리�??�습?�다.<br>?�재 Unit ID ?�정?� 리더 ?�벨 ?�상?�게�??�용?�어 ?�습?�다.<br>Repair Technician?�게??Unit ID ?�정 권한??부?�해 주세??",
  email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["liam.williams@sunghwan-portal.dev"],
    bcc: [],
  },
  files: [],
  images: [],
};
