"use client";

import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { MainCategory } from "@/domain/serviceDesk";
import { ticketStep } from "@/feature/serviceDesk/ticket/constants";
import type { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/application/i18n";
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
  trigger: ReactElement;
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
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      modal={false}
      disablePointerDismissal
    >
      <DialogTrigger render={trigger} />
      <DialogContent
        className="h-full min-h-0 min-w-0 max-w-full grid-rows-[auto_1fr_auto] gap-0 overflow-hidden rounded-none p-0 md:h-[760px] md:max-h-[90vh] md:max-w-4xl md:rounded-lg"
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
                <UpdateTicketDialogSkeleton
                  label={t("ticketUpdate.loadingTicket")}
                />
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
          canProceed={!isBusy && Boolean(ticket) && !loadError}
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

function UpdateTicketDialogSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-5 py-1" role="status">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-2 md:w-72 md:shrink-0 lg:w-80">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
          <Skeleton className="h-9 w-full md:w-24" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-52 w-full" />
        </div>
      </div>
    </div>
  );
}
