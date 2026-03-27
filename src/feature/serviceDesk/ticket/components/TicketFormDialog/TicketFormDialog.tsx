import {
  Check,
  ChevronLeft,
  ChevronRight,
  MoveLeft,
  MoveRight,
  Plus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupportedLanguage } from "@/domain/config";
import { Category } from "@/domain/serviceDesk";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { NS } from "@/lib/i18n";
import { ImageValueLabel } from "@/shared/types";
import { useMutationToast } from "@/shared/utils";

import { TicketFormProvider } from "../../context/TicketFormContext";
import { TicketFormValues, useTicketForm } from "../../forms/ticket";
import { useTicketDraft } from "../../hooks";
import {
  useCreateServiceDeskTicket,
  useUpdateServiceDeskTicket,
} from "./../../api";
import { AttachmentStep } from "./AttachmentStep";
import { InfoStep } from "./InfoStep";
import { ReviewStep } from "./ReviewStep";

type TicketFormDialogProps = {
  mode?: "create" | "update" | "view";
  categories: Category[];
  users: ImageValueLabel[];
  language: SupportedLanguage;
  trigger?: React.ReactNode;
};

type TicketStep = "info" | "attachment" | "review";

export const TicketFormDialog = (props: TicketFormDialogProps) => {
  const { mode = "create", categories, users } = props;
  const { t } = useTranslation("serviceHub");

  const [open, setOpen] = useState(false);
  const { data: currentSession } = useCurrentSession();
  const ticketForm = useTicketForm(currentSession?.user);

  const [currentStep, setCurrentStep] = useState<TicketStep>();

  // ticket mutataions.
  const { mutateAsync: createTicketAsync } = useCreateServiceDeskTicket();
  const { mutateAsync: updateTicketAsync } = useUpdateServiceDeskTicket();

  // draft mutations.
  const ticketDraftState = useTicketDraft({
    userId: currentSession?.user.id,
    mode,
    form: ticketForm,
  });

  // promise toast function.
  const mutationToast = useMutationToast();

  const onOpen = async () => {
    ticketForm.reset();
    setCurrentStep(mode === "view" ? "review" : "info");
    setOpen(true);
  };

  const moveToBack = () => {
    if (currentStep === "review") {
      setCurrentStep("attachment");
    }

    if (currentStep === "attachment") {
      setCurrentStep("info");
    }

    if (currentStep === "info") {
      void handleClose();
    }
  };

  const moveToNext = () => {
    if (currentStep === "info") {
      setCurrentStep("attachment");
    }

    if (currentStep === "attachment") {
      setCurrentStep("review");
    }

    if (currentStep === "review") {
      onSubmit(ticketForm.getValues());
    }
  };

  // valid required data.
  const hasRequiredTicketContent = (values: TicketFormValues) =>
    values.subject?.length || values.body?.length || values.category;

  const onSubmit = async (data: TicketFormValues) => {
    // create ticket.
    if (mode === "create") {
      mutationToast(createTicketAsync(data), "save", t("field.ticket"));
    }

    // update ticket.
    if (mode === "update") {
      mutationToast(updateTicketAsync(data), "update", t("field.ticket"));
    }

    // remove draft.
    await ticketDraftState.removeDraft();

    // auto close dialog after finish.
    setOpen(false);
  };

  const handleOpenChange = async (value: boolean) => {
    if (value) {
      await onOpen();
      return;
    }

    await handleClose();
  };

  const handleClose = async () => {
    const draft = await ticketDraftState.saveDraftNow();

    if (draft) {
      toast.success(
        t("save.success", { ns: NS.message, item: t("field.draft") }),
      );
    }

    setOpen(false);
  };

  useEffect(() => {
    if (ticketDraftState.draftId) {
      toast(t("message.foundDraft"), {
        description: t("message.loadDraft"),
        action: {
          label: t("action.load", { ns: NS.common }),
          onClick: () => {
            if (ticketDraftState.ticketDraft) {
              const requester = users.find(
                (user) =>
                  user.value === ticketDraftState.ticketDraft?.requesterId,
              );

              ticketForm.setValue("id", ticketDraftState.ticketDraft.id);
              ticketForm.setValue(
                "category",
                ticketDraftState.ticketDraft.categoryId,
              );
              ticketForm.setValue(
                "subject",
                ticketDraftState.ticketDraft.subject,
              );
              ticketForm.setValue("body", ticketDraftState.ticketDraft.body);
              ticketForm.setValue(
                "dueDate",
                new Date(ticketDraftState.ticketDraft.dueAt),
              );
              ticketForm.setValue(
                "priority",
                ticketDraftState.ticketDraft.priority,
              );
              ticketForm.setValue("email", ticketDraftState.ticketDraft.email);
              ticketForm.setValue("requester", {
                id: ticketDraftState.ticketDraft.requesterId,
                email: requester?.displayName ?? "",
                name: requester?.label ?? "",
              });
            }
          },
        },
      });
    }
  }, [
    t,
    ticketDraftState.draftId,
    ticketDraftState.ticketDraft,
    ticketForm,
    users,
  ]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
      <DialogContent className="h-full w-full max-w-full gap-0 md:h-[680px] md:max-w-4xl">
        {mode !== "view" && (
          <DialogHeader>
            <div className="hidden w-full flex-row justify-between md:flex">
              <div></div>
              <DialogTitle>{t("createTicketDialog.dialogTitle")}</DialogTitle>
              <div className="flex justify-end">
                <DialogClose className="float-right h-4 w-4 border-none p-0">
                  <X></X>
                </DialogClose>
              </div>
            </div>

            <div className="flex w-full items-center justify-between md:hidden">
              <Button type="button" variant="ghost" onClick={moveToBack}>
                {currentStep === "info" ? <X /> : <ChevronLeft />}
              </Button>
              <DialogTitle>{t("createTicketDialog.dialogTitle")}</DialogTitle>
              <Button
                type="button"
                size="icon"
                onClick={moveToNext}
                disabled={
                  currentStep === "info" &&
                  !hasRequiredTicketContent(ticketForm.getValues())
                }
              >
                {currentStep !== "review" ? <ChevronRight /> : <Check />}
              </Button>
            </div>
          </DialogHeader>
        )}
        <form className="p-6">
          <TicketFormProvider value={{ form: ticketForm, categories, users }}>
            <Tabs
              value={currentStep}
              onValueChange={(value) => setCurrentStep(value as TicketStep)}
            >
              {mode !== "view" && (
                <TabsList className="w-full justify-start border-b-2">
                  <TabsTrigger
                    value="info"
                    className="text-sm data-[state=inactive]:border-none md:w-40"
                  >
                    {t("general.info")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="attachment"
                    className="text-sm data-[state=inactive]:border-none md:w-40"
                    disabled={!hasRequiredTicketContent(ticketForm.getValues())}
                  >
                    {t("general.attachment")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="review"
                    className="text-sm data-[state=inactive]:border-none md:w-40"
                    disabled={!hasRequiredTicketContent(ticketForm.getValues())}
                  >
                    {t("general.review")}
                  </TabsTrigger>
                </TabsList>
              )}

              {/* select department and cateogry */}
              <TabsContent value="info">
                <ScrollArea className="h-[calc(100vh-120px)] md:h-[450px]">
                  <InfoStep />
                </ScrollArea>
              </TabsContent>

              {/* Additional */}
              <TabsContent value="attachment">
                <ScrollArea className="h-[calc(100vh-120px)] md:h-[450px]">
                  <AttachmentStep />
                </ScrollArea>
              </TabsContent>

              {/* preview issue */}
              <TabsContent value="review">
                <ScrollArea className="h-[calc(100vh-120px)] md:h-[450px]">
                  <ReviewStep />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </TicketFormProvider>
        </form>
        <DialogFooter>
          {currentStep === "info" ? (
            <div className="w-40"></div>
          ) : (
            <Button
              variant="outline"
              type="button"
              className="w-48 gap-2"
              onClick={moveToBack}
            >
              <>
                <MoveLeft />
                {t("action.back", { ns: NS.common })}
              </>
            </Button>
          )}

          <Button
            type="button"
            className="w-48 gap-2"
            onClick={moveToNext}
            disabled={
              currentStep === "info" &&
              !hasRequiredTicketContent(ticketForm.getValues())
            }
          >
            {currentStep !== "review" ? (
              <>
                <MoveRight />
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
      </DialogContent>
    </Dialog>
  );
};

export const CreateTicketDialog = TicketFormDialog;
