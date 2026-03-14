import { createContext, useContext } from "react";
import { UseFormReturn } from "react-hook-form";

import { MainCategory } from "@/domain/serviceDesk";
import { ImageValueLabel } from "@/shared/types";

import { TicketFormValues } from "../hooks";

type TicketFormContextValue = {
  form: UseFormReturn<TicketFormValues>;
  categories: MainCategory[];
  users: ImageValueLabel[];
};

const TicketFormContext = createContext<TicketFormContextValue | null>(null);

export const useTicketFormContext = () => {
  const ctx = useContext(TicketFormContext);

  if (!ctx) {
    throw new Error("useTicketFormContext must be used inside provider");
  }

  return ctx;
};

export const TicketFormProvider = TicketFormContext.Provider;
