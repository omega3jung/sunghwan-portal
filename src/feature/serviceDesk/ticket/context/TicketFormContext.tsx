"use client";

import { createContext, useContext } from "react";
import { UseFormReturn } from "react-hook-form";

import { MainCategory } from "@/domain/serviceDesk";
import i18n, { NS } from "@/lib/i18n";
import { ImageValueLabel } from "@/shared/types";

import type { TicketFormValues } from "../forms";

type TicketFormContextValue = {
  form: UseFormReturn<TicketFormValues>;
  categories: MainCategory[];
  users: ImageValueLabel[];
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
