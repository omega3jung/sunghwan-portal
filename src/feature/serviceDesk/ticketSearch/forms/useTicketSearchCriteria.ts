import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  ticketSearchCriteriaFormDefaultValues,
  ticketSearchCriteriaFormSchema,
  TicketSearchCriteriaFormValues,
} from ".";

export const useTicketSearchCriteriaForm = () =>
  useForm<TicketSearchCriteriaFormValues>({
    resolver: zodResolver(ticketSearchCriteriaFormSchema),
    defaultValues: ticketSearchCriteriaFormDefaultValues,
  });
