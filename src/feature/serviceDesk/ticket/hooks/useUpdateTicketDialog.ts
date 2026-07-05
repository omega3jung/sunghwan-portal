"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type {
  TicketAttachmentMetadata,
  TicketDetail,
} from "@/domain/serviceDesk";
import { useCurrentSession } from "@/feature/auth/session/hooks/useCurrentSession";
import {
  serviceDeskTicketApi,
  useRequesterUpdateServiceDeskTicket,
} from "@/feature/serviceDesk/ticket/api/client";
import { ticketStep } from "@/feature/serviceDesk/ticket/constants";
import {
  ticketFormDefaultValues,
  ticketFormSchema,
  type TicketFormValues,
} from "@/feature/serviceDesk/ticket/forms";
import { NS } from "@/lib/i18n";
import { useMutationToast } from "@/shared/client/toast";

import {
  PrepareTicketAttachmentsResponse,
  RequesterUpdateTicketPayload,
} from "../write";

export const UPDATE_TICKET_STEPS = ["info", "attachment", "review"] as const;
export const UPDATE_TICKET_REVIEW_STEP = UPDATE_TICKET_STEPS.length - 1;

type UseUpdateTicketDialogParams = {
  ticketId: string;
};

export function useUpdateTicketDialog({
  ticketId,
}: UseUpdateTicketDialogParams) {
  const { t } = useTranslation(NS.serviceDesk);
  const { data: currentSession } = useCurrentSession();
  const mutationToast = useMutationToast();
  const loadRequestRef = useRef(0);
  const [open, setOpen] = useState(false);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(ticketStep.info);
  const [isLoadingTicket, setIsLoadingTicket] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [existingFiles, setExistingFiles] = useState<
    TicketAttachmentMetadata[]
  >([]);
  const [existingImages, setExistingImages] = useState<
    TicketAttachmentMetadata[]
  >([]);
  const { mutateAsync: updateRequesterTicket, isPending } =
    useRequesterUpdateServiceDeskTicket();
  const isRemoteMode = currentSession?.user.dataScope === "REMOTE";

  const ticketForm = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: ticketFormDefaultValues,
  });

  const updateSteps = useMemo<{ key: string; label: string }[]>(
    () =>
      UPDATE_TICKET_STEPS.map((step) => ({
        key: step,
        label: t(`ticketUpdate.step.${step}`),
      })),
    [t],
  );

  const createInitialTicketFormValues = useCallback(
    (freshTicket?: TicketDetail): TicketFormValues => {
      if (freshTicket) {
        return mapTicketToTicketFormValues(freshTicket);
      }

      return {
        ...ticketFormDefaultValues,
        dueAt: new Date(),
        attachment: [],
      };
    },
    [],
  );

  const resetDialogState = useCallback(() => {
    loadRequestRef.current += 1;
    setOpen(false);
    setTicket(null);
    setLoadError(null);
    setIsLoadingTicket(false);
    setCurrentStep(ticketStep.info);
    setExistingFiles([]);
    setExistingImages([]);
    ticketForm.reset(createInitialTicketFormValues());
  }, [createInitialTicketFormValues, ticketForm]);

  const loadTicket = useCallback(async () => {
    const requestId = loadRequestRef.current + 1;
    loadRequestRef.current = requestId;

    setIsLoadingTicket(true);
    setLoadError(null);
    setTicket(null);
    setCurrentStep(ticketStep.info);
    setExistingFiles([]);
    setExistingImages([]);
    ticketForm.reset(createInitialTicketFormValues());

    try {
      const freshTicket = await serviceDeskTicketApi.get(ticketId);

      if (loadRequestRef.current !== requestId) {
        return;
      }

      if (!freshTicket) {
        throw new Error("Ticket not found.");
      }

      setTicket(freshTicket);
      setExistingFiles(freshTicket.files);
      setExistingImages(freshTicket.images);
      ticketForm.reset(createInitialTicketFormValues(freshTicket));
    } catch {
      if (loadRequestRef.current !== requestId) {
        return;
      }

      setLoadError(t("ticketUpdate.error.load"));
    } finally {
      if (loadRequestRef.current === requestId) {
        setIsLoadingTicket(false);
      }
    }
  }, [createInitialTicketFormValues, t, ticketForm, ticketId]);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!value) {
        resetDialogState();
        return;
      }

      setOpen(true);
      void loadTicket();
    },
    [loadTicket, resetDialogState],
  );

  const validateCurrentStep = useCallback(async () => {
    if (currentStep === ticketStep.info) {
      const isValid = await ticketForm.trigger([
        "category",
        "subject",
        "dueAt",
        "body",
      ]);
      const hasCategory = !!ticketForm.getValues("category");
      const hasSubject = ticketForm.getValues("subject").trim().length > 0;
      const hasBody = ticketForm.getValues("body").trim().length > 0;

      if (!hasCategory) {
        ticketForm.setError("category", {
          type: "required",
          message: "required.default",
        });
      }

      if (!hasSubject) {
        ticketForm.setError("subject", {
          type: "required",
          message: "required.default",
        });
      }

      if (!hasBody) {
        ticketForm.setError("body", {
          type: "required",
          message: "required.default",
        });
      }

      return isValid && hasCategory && hasSubject && hasBody;
    }

    if (currentStep === ticketStep.attachment) {
      return ticketForm.trigger(["attachment"]);
    }

    return true;
  }, [currentStep, ticketForm]);

  const onSubmit = useCallback(
    async (values: TicketFormValues) => {
      const updatePromise = (async () => {
        const prepared = await serviceDeskTicketApi.prepareAttachments({
          body: values.body,
          files: values.attachment,
        });

        return updateRequesterTicket({
          ticketId,
          data: mapTicketFormValuesToRequesterUpdatePayload(values, prepared, {
            files: existingFiles,
            images: existingImages,
          }),
        });
      })();

      mutationToast(
        updatePromise,
        "update",
        t("field.ticket", { ns: NS.common }),
      );

      try {
        await updatePromise;
      } catch {
        return;
      }

      resetDialogState();
    },
    [
      existingFiles,
      existingImages,
      mutationToast,
      resetDialogState,
      t,
      ticketId,
      updateRequesterTicket,
    ],
  );

  const moveToBack = useCallback(() => {
    if (currentStep === ticketStep.info) {
      resetDialogState();
      return;
    }

    if (currentStep === ticketStep.review) {
      setCurrentStep(ticketStep.attachment);
      return;
    }

    if (currentStep === ticketStep.attachment) {
      setCurrentStep(ticketStep.info);
    }
  }, [currentStep, resetDialogState]);

  const moveToNext = useCallback(async () => {
    if (currentStep === ticketStep.review) {
      await ticketForm.handleSubmit(onSubmit)();
      return;
    }

    const isValid = await validateCurrentStep();

    if (!isValid) {
      return;
    }

    if (currentStep === ticketStep.info) {
      setCurrentStep(ticketStep.attachment);
      return;
    }

    if (currentStep === ticketStep.attachment) {
      setCurrentStep(ticketStep.review);
    }
  }, [currentStep, onSubmit, ticketForm, validateCurrentStep]);

  const handleStepChange = useCallback(
    (step: number) => {
      if (step <= currentStep) {
        setCurrentStep(step);
      }
    },
    [currentStep],
  );

  const removeExistingFile = useCallback((index: number) => {
    setExistingFiles((items) =>
      items.filter((_, itemIndex) => itemIndex !== index),
    );
  }, []);

  const removeExistingImage = useCallback((index: number) => {
    setExistingImages((items) =>
      items.filter((_, itemIndex) => itemIndex !== index),
    );
  }, []);

  return {
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
  };
}

function mapTicketToTicketFormValues(ticket: TicketDetail): TicketFormValues {
  return {
    ...ticketFormDefaultValues,
    id: ticket.id,
    category: ticket.categoryId,
    subject: ticket.subject,
    body: ticket.content,
    dueAt: new Date(ticket.dueAt),
    priority: ticket.priority,
    riskLevel: ticket.riskLevel,
    email: ticket.email,
    requester: {
      id: ticket.requesterUsername,
      email: "",
      name: ticket.requesterUsername,
    },
    attachment: [],
  };
}

function mapTicketFormValuesToRequesterUpdatePayload(
  values: TicketFormValues,
  prepared: PrepareTicketAttachmentsResponse,
  existingAttachments: {
    files: TicketAttachmentMetadata[];
    images: TicketAttachmentMetadata[];
  },
): RequesterUpdateTicketPayload {
  return {
    categoryId: values.category ?? "",
    subject: values.subject.trim(),
    content: prepared.body.trim(),
    dueAt: values.dueAt.toISOString(),
    email: values.email,
    files: [...existingAttachments.files, ...prepared.files],
    images: [...existingAttachments.images, ...prepared.images],
  };
}
