import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NS } from "@/lib/i18n";

import { ticketStep } from "../../types/constants";

type TicketFormDialogHeaderProps = {
  mode: "create" | "update" | "view";
  currentStep: number;
  canMoveNext: boolean;
  onBack: () => void;
  onNext: () => void;
};

export const TicketFormDialogHeader = ({
  mode,
  currentStep,
  canMoveNext,
  onBack,
  onNext,
}: TicketFormDialogHeaderProps) => {
  const { t } = useTranslation(NS.serviceDesk);

  if (mode === "view") {
    return null;
  }

  return (
    <DialogHeader className="px-4 py-3 md:px-6 md:py-4">
      <div className="hidden w-full flex-row justify-center md:flex">
        <DialogTitle>{t("message.createTicket")}</DialogTitle>
      </div>

      <div className="flex w-full items-center justify-between md:hidden">
        <Button type="button" variant="ghost" onClick={onBack}>
          {currentStep === ticketStep.info ? <X /> : <ChevronLeft />}
        </Button>
        <DialogTitle>{t("createTicketDialog.dialogTitle")}</DialogTitle>
        <Button
          type="button"
          size="icon"
          onClick={onNext}
          disabled={!canMoveNext}
        >
          {currentStep !== ticketStep.review ? <ChevronRight /> : <Check />}
        </Button>
      </div>
    </DialogHeader>
  );
};
