import type { TicketStatus } from "@/domain/serviceDesk";

export interface TicketStatusBadgeProps {
  status?: TicketStatus;
  size?: "sm" | "md";
}
