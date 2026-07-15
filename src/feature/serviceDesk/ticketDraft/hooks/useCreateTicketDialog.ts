"use client";

import { addDays, endOfDay, startOfToday } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import type { MainCategory } from "@/domain/serviceDesk";
import { useCurrentSession } from "@/feature/auth/session/client";
import {
  useCreateServiceDeskTicket,
} from "@/feature/serviceDesk/ticket/client";
import { useTicketForm } from "@/feature/serviceDesk/ticket/client";
import {
  afterStepData,
  createStepData,
  ticketStep,
} from "@/feature/serviceDesk/ticket/constants";
import {
  ticketFormDefaultValues,
  ticketFormSchema,
  type TicketFormValues,
} from "@/feature/serviceDesk/ticket/forms";
import { getTicketCategoryParentId } from "@/feature/serviceDesk/ticket/utils/categorySelection";
import { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/application/i18n";
import { useLocalizedText } from "@/lib/client/i18n";
import { useMutationToast } from "@/lib/client/toast";
import { DbParams } from "@/shared/types";
import { createFieldFilter } from "@/shared/utils/routing";

import { useServiceDeskApprovalStepListQuery } from "../../approvalStep/client";
import { useTicketDraft } from "./useTicketDraft";

const TICKET_DRAFT_TOAST_ID = "service-desk-ticket-draft";

type UseCreateTicketDialogParams = {
  language: SupportedLanguage;
  categories: MainCategory[];
};

export const useCreateTicketDialog = ({
  language,
  categories,
}: UseCreateTicketDialogParams) => {
  const { t } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedText(language);
  const { data: currentSession } = useCurrentSession();
  const isRemoteMode = currentSession?.user.dataScope === "REMOTE";

  const [open, setOpen] = useState(false);
  const [shouldShowDraftToast, setShouldShowDraftToast] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(ticketStep.info);

  const ticketForm = useTicketForm(currentSession?.user, language);
  const {
    formState: { isDirty },
  } = ticketForm;

  const [selectedCategoryId, subjectValue, bodyValue] = useWatch({
    control: ticketForm.control,
    name: ["category", "subject", "body"],
  });
  const selectedParentCategoryId = useMemo(() => {
    if (!selectedCategoryId) {
      return undefined;
    }

    return getTicketCategoryParentId(categories, selectedCategoryId);
  }, [categories, selectedCategoryId]);
  const params = useMemo<DbParams | undefined>(() => {
    if (!selectedParentCategoryId) {
      return undefined;
    }

    return {
      filter: createFieldFilter({
        field: "id",
        value: selectedParentCategoryId,
      }),
    };
  }, [selectedParentCategoryId]);

  const { data: approvalSettings } =
    useServiceDeskApprovalStepListQuery(params);
  const { mutateAsync: createTicketAsync } = useCreateServiceDeskTicket();
  const ticketDraftState = useTicketDraft({ mode: "create", form: ticketForm });
  const mutationToast = useMutationToast();

  const createInitialTicketFormValues = useCallback(
    (): TicketFormValues => ({
      ...ticketFormDefaultValues,
      dueAt: new Date(),
      requester: {
        id: currentSession?.user.username ?? "",
        email: currentSession?.user.email ?? "",
        name: currentSession?.user.displayName
          ? tLocal(currentSession.user.displayName)
          : "",
      },
    }),
    [
      currentSession?.user.displayName,
      currentSession?.user.email,
      currentSession?.user.username,
      tLocal,
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
      const createPromise = createTicketAsync(data);

      mutationToast(
        createPromise,
        "save",
        t("field.ticket", { ns: NS.common }),
      );

      try {
        await createPromise;
      } catch {
        return;
      }

      if (!isRemoteMode) {
        await ticketDraftState.removeDraft();
      }

      setOpen(false);
    },
    [createTicketAsync, isRemoteMode, mutationToast, t, ticketDraftState],
  );

  const handleClose = useCallback(async () => {
    toast.dismiss(TICKET_DRAFT_TOAST_ID);
    setShouldShowDraftToast(false);
    setOpen(false);

    if (!isDirty) {
      return;
    }

    const draft = await ticketDraftState.saveDraftNow();

    if (draft) {
      toast.success(
        t("common.save.success", {
          ns: NS.message,
          item: t("field.draft", { ns: NS.common }),
        }),
      );
    }
  }, [isDirty, t, ticketDraftState]);

  const onOpen = useCallback(async () => {
    ticketForm.reset(createInitialTicketFormValues());
    setShouldShowDraftToast(true);
    setCurrentStep(ticketStep.info);
    setOpen(true);
  }, [createInitialTicketFormValues, ticketForm]);

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

  const hasRequiredTicketContent =
    !!selectedCategoryId &&
    subjectValue.trim().length > 0 &&
    bodyValue.trim().length > 0;
  const canMoveNext =
    currentStep !== ticketStep.info || hasRequiredTicketContent;

  const loadDraft = useCallback(
    (ticketDraft: TicketFormValues) => {
      const draftRecord = ticketDraft as Record<string, unknown>;
      const schemaShape = ticketFormSchema.shape;
      const nextValues = ticketForm.getValues();
      const invalidFields = new Set<string>();
      const normalizedDraft = { ...draftRecord };

      if (
        normalizedDraft.dueAt === undefined &&
        normalizedDraft.dueDate !== undefined
      ) {
        normalizedDraft.dueAt = normalizedDraft.dueDate;
      }

      Object.keys(normalizedDraft).forEach((fieldName) => {
        if (!(fieldName in schemaShape) && fieldName !== "dueDate") {
          invalidFields.add(fieldName);
        }
      });

      (Object.keys(schemaShape) as Array<keyof typeof schemaShape>).forEach(
        (fieldName) => {
          const rawValue = normalizedDraft[fieldName as string];

          if (rawValue === undefined) {
            return;
          }

          const normalizedValue =
            fieldName === "dueAt"
              ? new Date(rawValue as Date | string)
              : rawValue;
          const parsed = schemaShape[fieldName].safeParse(normalizedValue);

          if (!parsed.success) {
            invalidFields.add(String(fieldName));
            return;
          }

          if (
            fieldName === "dueAt" &&
            endOfDay(parsed.data as Date) < addDays(startOfToday(), 1)
          ) {
            invalidFields.add(
              normalizedDraft.dueDate !== undefined ? "dueDate" : "dueAt",
            );
            return;
          }

          (nextValues[fieldName as keyof TicketFormValues] as unknown) =
            parsed.data;
        },
      );

      ticketForm.reset(nextValues);

      if (invalidFields.size > 0) {
        toast(
          `${t("message.loadDraftExceptInvalid")} : ${t("validation.invalidFieldItems", { item: Array.from(invalidFields).join(", ") })}`,
        );
      }

      toast.dismiss(TICKET_DRAFT_TOAST_ID);
      setShouldShowDraftToast(false);
    },
    [t, ticketForm],
  );

  useEffect(() => {
    const ticketDraft = ticketDraftState.ticketDraft;

    if (
      !open ||
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
  };
};
