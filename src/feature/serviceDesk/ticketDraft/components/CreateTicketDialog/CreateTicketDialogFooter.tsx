import { Check, Loader2, StepBack, StepForward } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { ticketStep } from "@/feature/serviceDesk/ticket/constants";
import { NS } from "@/lib/application/i18n";
import { cn } from "@/shared/utils/presentation/classnames";

type CreateTicketDialogFooterProps = {
  currentStep: number;
  canMoveNext: boolean;
  isSubmitting?: boolean;
  onBack: () => void;
  onNext: () => void;
};

export const CreateTicketDialogFooter = ({
  currentStep,
  canMoveNext,
  isSubmitting = false,
  onBack,
  onNext,
}: CreateTicketDialogFooterProps) => {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <DialogFooter className="grid grid-cols-2 px-4 py-3 md:flex md:px-6 md:py-4">
      <Button
        variant="outline"
        type="button"
        className={cn(
          "w-full gap-2 whitespace-normal sm:w-48",
          currentStep === ticketStep.info && "md:hidden",
        )}
        onClick={onBack}
        disabled={isSubmitting || currentStep === ticketStep.info}
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
        disabled={isSubmitting || !canMoveNext}
        aria-busy={isSubmitting}
      >
        {currentStep !== ticketStep.review ? (
          <>
            <StepForward />
            {t("action.next", { ns: NS.common })}
          </>
        ) : (
          <>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Check />}
            {t("action.submit", { ns: NS.common })}
          </>
        )}
      </Button>
    </DialogFooter>
  );
};
