import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  ticketSearchCriteriaFormDefaultValues,
  ticketSearchCriteriaFormSchema,
  TicketSearchCriteriaFormValues,
} from ".";

/** Creates the search criteria form with schema validation and normalized defaults. */
export const useTicketSearchCriteriaForm = () =>
  useForm<TicketSearchCriteriaFormValues>({
    resolver: zodResolver(ticketSearchCriteriaFormSchema),
    defaultValues: ticketSearchCriteriaFormDefaultValues,
  });
