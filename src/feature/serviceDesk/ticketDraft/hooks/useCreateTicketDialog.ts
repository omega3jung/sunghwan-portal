"use client";

import { addDays, endOfDay, startOfToday } from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { toast } from "@/components/ui/toast";
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
import { hasMeaningfulTicketContent } from "@/lib/application/contracts/serviceDesk/ticketContent";
import { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/application/i18n";
import { hasTicketDraftCategory } from "@/lib/application/serviceDesk/ticketDraft";
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
  const { current, data: session } = useCurrentSession();
  const effectiveUser = current.user;
  const isRemoteMode = session?.user.dataScope === "REMOTE";

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const busyRef = useRef(false);
  const warnedAboutUnsavedDraftRef = useRef(false);
  const [shouldShowDraftToast, setShouldShowDraftToast] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(ticketStep.info);

  const ticketForm = useTicketForm(effectiveUser, language);
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
        id: effectiveUser?.username ?? "",
        email: effectiveUser?.email ?? "",
        name: effectiveUser?.displayName
          ? tLocal(effectiveUser.displayName)
          : "",
      },
    }),
    [
      effectiveUser?.displayName,
      effectiveUser?.email,
      effectiveUser?.username,
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
      if (busyRef.current) return;
      busyRef.current = true;
      setIsSubmitting(true);
      try {
        const createPromise = createTicketAsync(data);
        await mutationToast(createPromise, "save", t("field.ticket", { ns: NS.common }));
        try {
          if (isRemoteMode) {
            await ticketDraftState.clearDraft();
          } else {
            await ticketDraftState.removeDraft();
          }
        } finally {
          // A completed ticket must not become retryable if local draft cleanup fails.
          ticketForm.reset(createInitialTicketFormValues());
          setShouldShowDraftToast(false);
          setOpen(false);
        }
      } catch {
        return;
      } finally {
        busyRef.current = false;
        setIsSubmitting(false);
      }
    },
    [createInitialTicketFormValues, createTicketAsync, isRemoteMode, mutationToast, t, ticketDraftState, ticketForm],
  );

  const handleClose = useCallback(async () => {
    if (busyRef.current) return;
    const canSaveDraft = hasTicketDraftCategory(ticketForm.getValues().category);
    if (isDirty && !canSaveDraft && !warnedAboutUnsavedDraftRef.current) {
      warnedAboutUnsavedDraftRef.current = true;
      toast.add({
        title: t("ticketDraft.categoryRequired"),
        type: "warning",
        timeout: 5000,
      });
      return;
    }
    toast.close(TICKET_DRAFT_TOAST_ID);
    setShouldShowDraftToast(false);
    setOpen(false);

    if (!isDirty || !canSaveDraft) {
      return;
    }

    busyRef.current = true;
    try {
      const saving = ticketDraftState.saveDraftNow();
      await mutationToast(saving, "save", t("field.draft", { ns: NS.common }));
    } catch {
      // Keep the editor contents available if image preparation or draft saving fails.
      setOpen(true);
    } finally {
      busyRef.current = false;
    }
  }, [isDirty, mutationToast, t, ticketDraftState, ticketForm]);

  const onOpen = useCallback(async () => {
    if (busyRef.current) return;
    warnedAboutUnsavedDraftRef.current = false;
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
    if (busyRef.current) return;
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
    if (busyRef.current) return;
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
    hasTicketDraftCategory(selectedCategoryId) &&
    subjectValue.trim().length > 0 &&
    hasMeaningfulTicketContent(bodyValue);
  const canMoveNext =
    !isSubmitting && (currentStep !== ticketStep.info || hasRequiredTicketContent);

  const loadDraft = useCallback(
    (ticketDraft: TicketFormValues) => {
      if (busyRef.current) return;
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

      // Drafts may outlive the current form schema. Preserve valid fields and
      // report stale ones instead of rejecting the whole draft.
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
        toast.add({
          title: `${t("message.loadDraftExceptInvalid")} : ${t("validation.invalidFieldItems", { item: Array.from(invalidFields).join(", ") })}`,
          type: "warning",
        });
      }

      toast.close(TICKET_DRAFT_TOAST_ID);
      setShouldShowDraftToast(false);
    },
    [t, ticketForm],
  );

  const discardDraft = useCallback(async () => {
    if (busyRef.current || !window.confirm(t("ticketDraft.discardConfirm"))) return;
    busyRef.current = true;
    try {
      const discarding = ticketDraftState.removeDraft();
      await mutationToast(discarding, "delete", t("field.draft", { ns: NS.common }));
      toast.close(TICKET_DRAFT_TOAST_ID);
      setShouldShowDraftToast(false);
    } catch {
      return;
    } finally {
      busyRef.current = false;
    }
  }, [mutationToast, t, ticketDraftState]);

  useEffect(() => {
    const ticketDraft = ticketDraftState.ticketDraft;

    // Never offer restoration after local edits; accepting an older draft at
    // that point would overwrite the user's current form state.
    if (
      !open ||
      !ticketDraft ||
      !shouldShowDraftToast ||
      isDirty
    ) {
      toast.close(TICKET_DRAFT_TOAST_ID);
      return;
    }

    toast.add({
      id: TICKET_DRAFT_TOAST_ID,
      title: t("message.foundDraft"),
      description: t("ticketDraft.restoreOrDiscard"),
      actionProps: {
        children: t("action.load", { ns: NS.common }),
        onClick: () => {
          loadDraft(ticketDraft);
        },
      },
      data: {
        secondaryActionProps: {
          children: t("ticketDraft.discard"),
          onClick: () => { void discardDraft(); },
        },
      },
      timeout: 30000,
    });

    return () => {
      toast.close(TICKET_DRAFT_TOAST_ID);
    };
  }, [
    discardDraft,
    isDirty,
    loadDraft,
    open,
    shouldShowDraftToast,
    t,
    ticketDraftState.ticketDraft,
  ]);

  useEffect(() => {
    if (isDirty) {
      toast.close(TICKET_DRAFT_TOAST_ID);
      setShouldShowDraftToast(false);
    }
  }, [isDirty]);

  return {
    open,
    isSubmitting,
    isRemoteMode,
    handleOpenChange,
    ticketForm,
    currentStep,
    setCurrentStep: (step: number) => {
      if (!busyRef.current) setCurrentStep(step);
    },
    canMoveNext,
    createSteps,
    afterSteps,
    moveToBack,
    moveToNext,
  };
};
