import { useServiceDeskTicketQuery } from "@/feature/serviceDesk/ticket/client";
import { useServiceDeskTicketActionListQuery } from "@/feature/serviceDesk/ticketAction/client";
import { useServiceDeskTicketHistoryListQuery } from "@/feature/serviceDesk/ticketHistory/client";

export function useTicketDetailData(ticketId: string) {
  const { data: ticketData, isLoading: isTicketLoading } =
    useServiceDeskTicketQuery(ticketId);
  const { data: ticketActions, isLoading: isTicketActionsLoading } =
    useServiceDeskTicketActionListQuery(ticketId);
  const { data: ticketHistories, isLoading: isTicketHistoriesLoading } =
    useServiceDeskTicketHistoryListQuery(ticketId);

  return {
    ticket: ticketData ?? undefined,
    ticketActions,
    ticketHistories,
    isTicketLoading,
    isTicketActionsLoading,
    isTicketHistoriesLoading,
  };
}
