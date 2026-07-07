"use client";

import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SupportedLanguage } from "@/domain/config";
import { MainCategory } from "@/domain/serviceDesk";
import { ticketStep } from "@/feature/serviceDesk/ticket/constants";
import { NS } from "@/lib/i18n";
import { ImageValueLabel } from "@/shared/types";

import { TicketCreateFormProvider } from "../../context/TicketCreateFormContext";
import { useCreateTicketDialog } from "../../hooks/useCreateTicketDialog";
import { AttachmentStep } from "./AttachmentStep";
import { CreateTicketDialogFooter } from "./CreateTicketDialogFooter";
import { CreateTicketDialogHeader } from "./CreateTicketDialogHeader";
import { CreateTicketDialogStepFlow } from "./CreateTicketDialogStepFlow";
import { InfoStep } from "./InfoStep";
import { ReviewStep } from "./ReviewStep";

type CreateTicketDialogProps = {
  categories: MainCategory[];
  users: ImageValueLabel[];
  language: SupportedLanguage;
  trigger?: React.ReactNode;
};

export const CreateTicketDialog = (props: CreateTicketDialogProps) => {
  const { categories, users, language } = props;
  const { t } = useTranslation(NS.serviceDesk);
  const {
    open,
    isRemoteMode,
    handleOpenChange,
    ticketForm,
    currentStep,
    setCurrentStep,
    canMoveNext,
    createSteps,
    afterSteps,
    moveToBack,
    moveToNext,
  } = useCreateTicketDialog({
    language,
    categories,
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={false}>
      <DialogTrigger asChild>
        {props.trigger ?? (
          <Button type="button" className="gap-2">
            <Plus />
            {t("action.withItem", {
              ns: NS.common,
              action: t("action.create", { ns: NS.common }),
              item: t("field.ticket", { ns: NS.common }),
            })}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="grid h-full min-h-0 min-w-0 w-full max-w-full grid-rows-[auto_1fr_auto] gap-0 overflow-hidden rounded-none p-0 md:h-[800px] md:max-h-[90vh] md:max-w-4xl md:rounded-lg"
        onInteractOutside={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onFocusOutside={(event) => event.preventDefault()}
        overlayStyle="dark"
      >
        <CreateTicketDialogHeader />
        <form className="flex min-h-0 min-w-0 flex-col overflow-x-hidden px-4 py-3 md:px-6 md:py-4">
          <TicketCreateFormProvider
            value={{ form: ticketForm, categories, users, isRemoteMode }}
          >
            <CreateTicketDialogStepFlow
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              createSteps={createSteps}
              afterSteps={afterSteps}
            />

            <ScrollArea className="min-h-0 min-w-0 flex-1 pr-2 md:pr-3">
              {
                /* select department and cateogry */
                currentStep === ticketStep.info && <InfoStep />
              }

              {
                /* Additional */
                currentStep === ticketStep.attachment && <AttachmentStep />
              }

              {
                /* preview issue */ currentStep === ticketStep.review && (
                  <ReviewStep />
                )
              }
            </ScrollArea>
          </TicketCreateFormProvider>
        </form>
        <CreateTicketDialogFooter
          currentStep={currentStep}
          canMoveNext={canMoveNext}
          onBack={moveToBack}
          onNext={moveToNext}
        />
      </DialogContent>
    </Dialog>
  );
};
