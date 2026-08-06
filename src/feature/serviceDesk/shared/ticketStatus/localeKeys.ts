import type { TicketStatus } from "@/domain/serviceDesk";

export const ticketStatusLocaleKey: Record<TicketStatus, string> = {
  Draft: "draft",
  Approval: "approval",
  Declined: "declined",
  Assigned: "assigned",
  Working: "working",
  Pending: "pending",
  Resolved: "resolved",
  Rejected: "rejected",
  Closed: "closed",
};
