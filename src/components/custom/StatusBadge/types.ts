import type { TicketStatus } from "@/domain/serviceDesk";

export type SystemStatus = TicketStatus;

export interface StatusBadgeProps {
  status?: SystemStatus;
  size?: "sm" | "md";
}
