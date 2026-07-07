"use client";

import { createContext, useContext } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { SupportedLanguage } from "@/domain/config";
import type {
  MainCategory,
  TicketAttachmentMetadata,
  TicketDetail,
} from "@/domain/serviceDesk";
import type { TicketFormValues } from "@/feature/serviceDesk/ticket/forms";
import i18n, { NS } from "@/lib/i18n";
import type { ImageValueLabel } from "@/shared/types";

type TicketUpdateFormContextValue = {
  form: UseFormReturn<TicketFormValues>;
  ticket: TicketDetail | null;
  categories: MainCategory[];
  users: ImageValueLabel[];
  language: SupportedLanguage;
  isRemoteMode: boolean;
  existingFiles: TicketAttachmentMetadata[];
  existingImages: TicketAttachmentMetadata[];
  onRemoveExistingFile: (index: number) => void;
  onRemoveExistingImage: (index: number) => void;
};

const TicketUpdateFormContext =
  createContext<TicketUpdateFormContextValue | null>(null);

export const useTicketUpdateFormContext = () => {
  const contextValue = useContext(TicketUpdateFormContext);

  if (!contextValue) {
    throw new Error(
      i18n.t("ticketUpdateFormContext.missingProvider", { ns: NS.serviceDesk }),
    );
  }

  return contextValue;
};

export const TicketUpdateFormProvider = TicketUpdateFormContext.Provider;
