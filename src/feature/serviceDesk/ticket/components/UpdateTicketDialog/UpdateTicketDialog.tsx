"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SupportedLanguage } from "@/domain/config";
import type { MainCategory } from "@/domain/serviceDesk";
import { ticketStep } from "@/feature/serviceDesk/ticket/constants";
import { NS } from "@/lib/i18n";
import type { ImageValueLabel } from "@/shared/types";

import { TicketUpdateFormProvider } from "../../context/TicketUpdateFormContext";
import { useUpdateTicketDialog } from "../../hooks/useUpdateTicketDialog";
import { AttachmentStep } from "./AttachmentStep";
import { InfoStep } from "./InfoStep";
import { ReviewStep } from "./ReviewStep";
import { UpdateTicketDialogFooter } from "./UpdateTicketDialogFooter";
import { UpdateTicketDialogHeader } from "./UpdateTicketDialogHeader";
import { UpdateTicketDialogStepFlow } from "./UpdateTicketDialogStepFlow";

type UpdateTicketDialogProps = {
  ticketId: string;
  categories: MainCategory[];
  users: ImageValueLabel[];
  language: SupportedLanguage;
  trigger: ReactNode;
};

export function UpdateTicketDialog({
  ticketId,
  categories,
  users,
  language,
  trigger,
}: UpdateTicketDialogProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const {
    open,
    ticket,
    ticketForm,
    updateSteps,
    currentStep,
    isLoadingTicket,
    isPending,
    isRemoteMode,
    loadError,
    existingFiles,
    existingImages,
    handleOpenChange,
    handleStepChange,
    removeExistingFile,
    removeExistingImage,
    moveToBack,
    moveToNext,
  } = useUpdateTicketDialog({ ticketId });
  const { isSubmitting } = ticketForm.formState;
  const isBusy = isLoadingTicket || isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={false}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="grid h-full min-h-0 min-w-0 w-full max-w-full grid-rows-[auto_1fr_auto] gap-0 overflow-hidden rounded-none p-0 md:h-[760px] md:max-h-[90vh] md:max-w-4xl md:rounded-lg"
        onInteractOutside={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onFocusOutside={(event) => event.preventDefault()}
        overlayStyle="dark"
      >
        <UpdateTicketDialogHeader />

        <form className="flex min-h-0 min-w-0 flex-col overflow-x-hidden px-4 py-3 md:px-6 md:py-4">
          <TicketUpdateFormProvider
            value={{
              form: ticketForm,
              ticket,
              categories,
              users,
              language,
              isRemoteMode,
              existingFiles,
              existingImages,
              onRemoveExistingFile: removeExistingFile,
              onRemoveExistingImage: removeExistingImage,
            }}
          >
            <UpdateTicketDialogStepFlow
              currentStep={currentStep}
              steps={updateSteps}
              onStepChange={handleStepChange}
            />

            <ScrollArea className="min-h-0 min-w-0 flex-1 pr-2 md:pr-3">
              {isLoadingTicket ? (
                <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("ticketUpdate.loadingTicket")}
                </div>
              ) : loadError ? (
                <div className="rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive">
                  {loadError}
                </div>
              ) : ticket ? (
                <>
                  {currentStep === ticketStep.info ? <InfoStep /> : null}
                  {currentStep === ticketStep.attachment ? (
                    <AttachmentStep />
                  ) : null}
                  {currentStep === ticketStep.review ? <ReviewStep /> : null}
                </>
              ) : null}
            </ScrollArea>
          </TicketUpdateFormProvider>
        </form>

        <UpdateTicketDialogFooter
          currentStep={currentStep}
          disabled={isBusy || !ticket || !!loadError}
          isBusy={isBusy}
          onBack={moveToBack}
          onNext={() => {
            void moveToNext();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
