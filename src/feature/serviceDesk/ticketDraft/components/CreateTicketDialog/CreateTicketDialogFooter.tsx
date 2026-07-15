import { Check, StepBack, StepForward } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { ticketStep } from "@/feature/serviceDesk/ticket/constants";
import { NS } from "@/lib/application/i18n";
import { cn } from "@/shared/utils/presentation/classnames";

type CreateTicketDialogFooterProps = {
  currentStep: number;
  canMoveNext: boolean;
  onBack: () => void;
  onNext: () => void;
};

export const CreateTicketDialogFooter = ({
  currentStep,
  canMoveNext,
  onBack,
  onNext,
}: CreateTicketDialogFooterProps) => {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <DialogFooter className="grid grid-cols-2 items-stretch gap-2 px-4 py-3 md:px-6 md:py-4 md:flex">
      <Button
        variant="outline"
        type="button"
        className={cn(
          "w-full gap-2 whitespace-normal sm:w-48",
          currentStep === ticketStep.info && "md:hidden",
        )}
        onClick={onBack}
        disabled={currentStep === ticketStep.info}
      >
        <>
          <StepBack />
          {t("action.back", { ns: NS.common })}
        </>
      </Button>

      <Button
        type="button"
        className="w-full gap-2 whitespace-normal sm:w-48"
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
