"use client";

import { createContext, useContext } from "react";
import { UseFormReturn } from "react-hook-form";

import { MainCategory } from "@/domain/serviceDesk";
import type { TicketFormValues } from "@/feature/serviceDesk/ticket/forms";
import i18n, { NS } from "@/lib/i18n";
import { ImageValueLabel } from "@/shared/types";

type TicketFormContextValue = {
  form: UseFormReturn<TicketFormValues>;
  categories: MainCategory[];
  users: ImageValueLabel[];
  isRemoteMode: boolean;
};

const TicketFormContext = createContext<TicketFormContextValue | null>(null);

export const useTicketFormContext = () => {
  const contextValue = useContext(TicketFormContext);

  if (!contextValue) {
    throw new Error(
      i18n.t("ticketFormContext.missingProvider", { ns: NS.serviceDesk }),
    );
  }

  return contextValue;
};

export const TicketFormProvider = TicketFormContext.Provider;
