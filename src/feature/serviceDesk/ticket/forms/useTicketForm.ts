import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { SessionUser } from "@/domain/auth";
import { getLocalizedText } from "@/lib/application/i18n";
import { Locale } from "@/shared/types";

import { ticketFormDefaultValues, ticketFormSchema, TicketFormValues } from ".";

export const useTicketForm = (user?: SessionUser, language: Locale = "en") =>
  useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),

    defaultValues: {
      ...ticketFormDefaultValues,
      requester: {
        id: user?.username,
        email: user?.email,
        name: getLocalizedText(user?.displayName, language),
      },
    },
  });
