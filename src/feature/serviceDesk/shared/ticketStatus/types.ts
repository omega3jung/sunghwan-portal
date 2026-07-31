import type { TicketStatus } from "@/domain/serviceDesk";

/** Configures status selection and compact rendering for the shared ticket status badge. */
export interface TicketStatusBadgeProps {
  status?: TicketStatus;
}
