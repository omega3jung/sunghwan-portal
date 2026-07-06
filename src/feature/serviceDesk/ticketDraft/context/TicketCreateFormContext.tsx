"use client";

import { createContext, useContext } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { MainCategory } from "@/domain/serviceDesk";
import type { TicketFormValues } from "@/feature/serviceDesk/ticket/forms";
import i18n, { NS } from "@/lib/i18n";
import type { ImageValueLabel } from "@/shared/types";

type TicketCreateFormContextValue = {
  form: UseFormReturn<TicketFormValues>;
  categories: MainCategory[];
  users: ImageValueLabel[];
  isRemoteMode: boolean;
};

const TicketCreateFormContext =
  createContext<TicketCreateFormContextValue | null>(null);

export const useTicketCreateFormContext = () => {
  const contextValue = useContext(TicketCreateFormContext);

  if (!contextValue) {
    throw new Error(
      i18n.t("ticketCreateFormContext.missingProvider", { ns: NS.serviceDesk }),
    );
  }

  return contextValue;
};

export const TicketCreateFormProvider = TicketCreateFormContext.Provider;
