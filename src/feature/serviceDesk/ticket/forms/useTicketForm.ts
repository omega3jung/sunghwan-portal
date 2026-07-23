import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { AppUser } from "@/domain/user";
import { getLocalizedText } from "@/lib/application/i18n";
import { Locale } from "@/shared/types";

import { ticketFormDefaultValues, ticketFormSchema, TicketFormValues } from ".";

type TicketFormUser = Pick<AppUser, "displayName" | "email" | "username">;

export const useTicketForm = (
  user?: TicketFormUser | null,
  language: Locale = "en",
) =>
  useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),

    defaultValues: {
      ...ticketFormDefaultValues,
      requester: {
        id: user?.username,
        email: user?.email ?? undefined,
        name: getLocalizedText(user?.displayName, language),
      },
    },
  });
