import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { SessionUser } from "@/domain/auth";

import { ticketFormDefaultValues, ticketFormSchema, TicketFormValues } from ".";

export const useTicketForm = (user?: SessionUser) =>
  useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),

    defaultValues: {
      ...ticketFormDefaultValues,
      requester: {
        id: user?.username,
        email: user?.email,
        name: user?.displayName,
      },
    },
  });
