import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { SupportedLanguage } from "@/domain/config";
import { useServiceDeskApprovalStepListQuery } from "@/feature/serviceDesk/approvalStep";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { NS } from "@/lib/i18n";
import { useLocalizedText } from "@/shared/hooks";
import { DbParams } from "@/shared/types";
import { useMutationToast } from "@/shared/utils";

import {
  ticketFormDefaultValues,
  TicketFormValues,
  useTicketForm,
} from "../forms/ticket";
import { afterStepData, createStepData, ticketStep } from "../types/constants";
import {
  useCreateServiceDeskTicket,
  useUpdateServiceDeskTicket,
} from "./../api";
import { useTicketDraft } from "./useTicketDraft";

const TICKET_DRAFT_TOAST_ID = "service-desk-ticket-draft";

type UseTicketFormDialogParams = {
  mode: "create" | "update" | "view";
  language: SupportedLanguage;
};

export const useTicketFormDialog = ({
  mode,
  language,
}: UseTicketFormDialogParams) => {
  const { t } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedText(language);
  const { data: currentSession } = useCurrentSession();

  const [open, setOpen] = useState(false);
  const [shouldShowDraftToast, setShouldShowDraftToast] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(ticketStep.info);

  const ticketForm = useTicketForm(currentSession?.user);
  const {
    formState: { isDirty },
  } = ticketForm;

  const selectedCategoryId = ticketForm.watch("mainCategory");
  const params = useMemo<DbParams | undefined>(() => {
    if (!selectedCategoryId) {
      return undefined;
    }

    return {
      filter: {
        rules: [
          {
            field: "id",
            operator: "=",
            value: selectedCategoryId,
          },
        ],
      },
    };
  }, [selectedCategoryId]);

  const { data: approvalSettings } =
    useServiceDeskApprovalStepListQuery(params);
  const { mutateAsync: createTicketAsync } = useCreateServiceDeskTicket();
  const { mutateAsync: updateTicketAsync } = useUpdateServiceDeskTicket();
  const ticketDraftState = useTicketDraft({ mode, form: ticketForm });
  const mutationToast = useMutationToast();

  const createInitialTicketFormValues = useCallback(
    (): TicketFormValues => ({
      ...ticketFormDefaultValues,
      dueDate: new Date(),
      requester: {
        id: currentSession?.user.username ?? "",
        email: currentSession?.user.email ?? "",
        name: currentSession?.user.displayName ?? "",
      },
    }),
    [
      currentSession?.user.displayName,
      currentSession?.user.email,
      currentSession?.user.username,
    ],
  );

  const createSteps = useMemo<{ label: string }[]>(() => {
    return createStepData.map((step) => ({
      label: t(`step.${step}`),
    }));
  }, [t]);

  const afterSteps = useMemo<{ label: string }[]>(() => {
    const approvalSteps = approvalSettings?.[0];
    const approvals =
      approvalSteps?.approvalSteps.map((approval) => ({
        label: tLocal(approval.name),
      })) ?? [];

    const afterFlows = afterStepData.map((step) => ({
      label: t(`step.${step}`),
    }));

    return [...approvals, ...afterFlows];
  }, [approvalSettings, t, tLocal]);

  const onSubmit = useCallback(
    async (data: TicketFormValues) => {
      if (mode === "create") {
        mutationToast(createTicketAsync(data), "save", t("field.ticket"));
      }

      if (mode === "update") {
        mutationToast(updateTicketAsync(data), "update", t("field.ticket"));
      }

      await ticketDraftState.removeDraft();
      setOpen(false);
    },
    [
      createTicketAsync,
      mode,
      mutationToast,
      t,
      ticketDraftState,
      updateTicketAsync,
    ],
  );

  const handleClose = useCallback(async () => {
    toast.dismiss(TICKET_DRAFT_TOAST_ID);
    setShouldShowDraftToast(false);

    if (!isDirty) {
      setOpen(false);
      return;
    }

    const draft = await ticketDraftState.saveDraftNow();

    if (draft) {
      toast.success(
        t("save.success", { ns: NS.message, item: t("field.draft") }),
      );
    }

    setOpen(false);
  }, [isDirty, t, ticketDraftState]);

  const onOpen = useCallback(async () => {
    ticketForm.reset(createInitialTicketFormValues());
    setShouldShowDraftToast(true);
    setCurrentStep(mode === "view" ? ticketStep.review : ticketStep.info);
    setOpen(true);
  }, [createInitialTicketFormValues, mode, ticketForm]);

  const handleOpenChange = useCallback(
    async (value: boolean) => {
      if (value) {
        await onOpen();
        return;
      }

      await handleClose();
    },
    [handleClose, onOpen],
  );

  const moveToBack = useCallback(() => {
    if (currentStep === ticketStep.review) {
      setCurrentStep(ticketStep.attachment);
      return;
    }

    if (currentStep === ticketStep.attachment) {
      setCurrentStep(ticketStep.info);
      return;
    }

    void handleClose();
  }, [currentStep, handleClose]);

  const moveToNext = useCallback(() => {
    if (currentStep === ticketStep.review) {
      void onSubmit(ticketForm.getValues());
      return;
    }

    if (currentStep === ticketStep.info) {
      setCurrentStep(ticketStep.attachment);
      return;
    }

    if (currentStep === ticketStep.attachment) {
      setCurrentStep(ticketStep.review);
    }
  }, [currentStep, onSubmit, ticketForm]);

  const hasRequiredTicketContent = (values: TicketFormValues) =>
    values.subject?.length && values.body?.length && values.subCategory;
  const canMoveNext =
    currentStep !== ticketStep.info ||
    !!hasRequiredTicketContent(ticketForm.getValues());

  const loadDraft = useCallback(
    (ticketDraft: TicketFormValues) => {
      ticketForm.reset({
        ...ticketDraft,
        dueDate: new Date(ticketDraft.dueDate),
      });
      toast.dismiss(TICKET_DRAFT_TOAST_ID);
      setShouldShowDraftToast(false);
    },
    [ticketForm],
  );

  useEffect(() => {
    const ticketDraft = ticketDraftState.ticketDraft;

    if (
      !open ||
      mode !== "create" ||
      !ticketDraft ||
      !shouldShowDraftToast ||
      isDirty
    ) {
      toast.dismiss(TICKET_DRAFT_TOAST_ID);
      return;
    }

    toast(t("message.foundDraft"), {
      id: TICKET_DRAFT_TOAST_ID,
      description: t("message.loadDraft"),
      action: {
        label: t("action.load", { ns: NS.common }),
        onClick: () => {
          loadDraft(ticketDraft);
        },
      },
      duration: 30000,
    });

    return () => {
      toast.dismiss(TICKET_DRAFT_TOAST_ID);
    };
  }, [
    isDirty,
    loadDraft,
    mode,
    open,
    shouldShowDraftToast,
    t,
    ticketDraftState.ticketDraft,
  ]);

  useEffect(() => {
    if (isDirty) {
      toast.dismiss(TICKET_DRAFT_TOAST_ID);
      setShouldShowDraftToast(false);
    }
  }, [isDirty]);

  return {
    open,
    handleOpenChange,
    ticketForm,
    currentStep,
    setCurrentStep,
    canMoveNext,
    createSteps,
    afterSteps,
    moveToBack,
    moveToNext,
  };
};
