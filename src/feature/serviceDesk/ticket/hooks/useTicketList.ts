// hooks/useTicketList.ts
import { useQuery } from "@tanstack/react-query";

export const useTicketList = (filters: TicketFilterParams) => {
  return useQuery({
    queryKey: ["service-desk", "tickets", filters],
    queryFn: () => fetchTickets(filters),
    staleTime: 1000 * 30,
  });
};
