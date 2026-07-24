"use client";

import { Check, Loader2, StepBack, StepForward } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { NS } from "@/lib/application/i18n";

import { UPDATE_TICKET_REVIEW_STEP } from "../../hooks/useUpdateTicketDialog";

type UpdateTicketDialogFooterProps = {
  currentStep: number;
  disabled: boolean;
  isBusy: boolean;
  onBack: () => void;
  onNext: () => void;
};

export function UpdateTicketDialogFooter({
  currentStep,
  disabled,
  isBusy,
  onBack,
  onNext,
}: UpdateTicketDialogFooterProps) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <DialogFooter className="grid grid-cols-2 items-stretch gap-2 px-4 py-3 md:px-6 md:py-4 md:flex">
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2 whitespace-normal sm:w-48"
        disabled={isBusy}
        onClick={onBack}
      >
        <StepBack />
        {t("action.back", { ns: NS.common })}
      </Button>

      <Button
        type="button"
        className="w-full gap-2 whitespace-normal sm:w-48"
        disabled={disabled}
        onClick={onNext}
      >
        {isBusy ? (
          <>
            <Loader2 className="animate-spin" />
            {t("ticketUpdate.action.submitting")}
          </>
        ) : currentStep !== UPDATE_TICKET_REVIEW_STEP ? (
          <>
            <StepForward />
            {t("action.next", { ns: NS.common })}
          </>
        ) : (
          <>
            <Check />
            {t("ticketUpdate.action.submit")}
          </>
        )}
      </Button>
    </DialogFooter>
  );
}
