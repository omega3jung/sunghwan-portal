import { createContext, useContext } from "react";
import { UseFormReturn } from "react-hook-form";

import { MainCategory } from "@/domain/serviceDesk";
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
    throw new Error("useTicketFormContext must be used inside provider");
  }

  return contextValue;
};

export const TicketFormProvider = TicketFormContext.Provider;
