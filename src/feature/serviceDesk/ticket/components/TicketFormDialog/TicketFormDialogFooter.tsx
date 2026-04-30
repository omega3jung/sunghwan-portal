import { Check, StepBack, StepForward } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { NS } from "@/lib/i18n";

import { ticketStep } from "../../utils/constants";

type TicketFormDialogFooterProps = {
  currentStep: number;
  canMoveNext: boolean;
  onBack: () => void;
  onNext: () => void;
};

export const TicketFormDialogFooter = ({
  currentStep,
  canMoveNext,
  onBack,
  onNext,
}: TicketFormDialogFooterProps) => {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <DialogFooter className="px-4 py-3 md:px-6 md:py-4">
      {currentStep === ticketStep.info ? (
        <div className="w-40"></div>
      ) : (
        <Button
          variant="outline"
          type="button"
          className="w-48 gap-2"
          onClick={onBack}
        >
          <>
            <StepBack />
            {t("action.back", { ns: NS.common })}
          </>
        </Button>
      )}

      <Button
        type="button"
        className="w-48 gap-2"
        onClick={onNext}
        disabled={!canMoveNext}
      >
        {currentStep !== ticketStep.review ? (
          <>
            <StepForward />
            {t("action.next", { ns: NS.common })}
          </>
        ) : (
          <>
            <Check />
            {t("action.submit", { ns: NS.common })}
          </>
        )}
      </Button>
    </DialogFooter>
  );
};
