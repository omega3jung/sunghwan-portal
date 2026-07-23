"use client";

import { useTranslation } from "react-i18next";

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NS } from "@/lib/application/i18n";

export function UpdateTicketDialogHeader() {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <DialogHeader className="px-4 py-3 md:px-6 md:py-4">
      <DialogTitle className="max-w-full break-words text-center">
        {t("ticketUpdate.title")}
      </DialogTitle>
      <DialogDescription className="sr-only">
        {t("ticketUpdate.description")}
      </DialogDescription>
    </DialogHeader>
  );
}
