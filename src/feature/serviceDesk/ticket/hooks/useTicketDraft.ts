import { useEffect, useRef, useState } from "react";
import { DeepPartial, UseFormReturn } from "react-hook-form";

import {
  useCreateServiceDeskTicketDraft,
  useDeleteServiceDeskTicketDraft,
  useServiceDeskTicketDraftQuery,
  useUpdateServiceDeskTicketDraft,
} from "../api";
import { TicketFormValues } from "../forms/ticket";

type UseTicketDraftOptions = {
  userId?: string;
  mode: "create" | "update" | "view";
  form: UseFormReturn<TicketFormValues>;
};

export const useTicketDraft = ({
  userId,
  mode,
  form,
}: UseTicketDraftOptions) => {
  const [draftId, setDraftId] = useState<string | null>(null);

  const savingRef = useRef(false);

  const { data: ticketDraft } = useServiceDeskTicketDraftQuery(userId);

  const { mutateAsync: createDraft } = useCreateServiceDeskTicketDraft();
  const { mutateAsync: updateDraft } = useUpdateServiceDeskTicketDraft();
  const { mutateAsync: deleteDraft } = useDeleteServiceDeskTicketDraft();

  const hasRequiredTicketContent = (values: DeepPartial<TicketFormValues>) =>
    values.subject?.length || values.body?.length || values.category;

  const hasTicketContent = (values: DeepPartial<TicketFormValues>) =>
    hasRequiredTicketContent(values) || values.attachment?.length;

  const saveDraftNow = async () => {
    const values = form.getValues();

    if (!hasTicketContent(values)) return null;

    if (!draftId) {
      const draft = await createDraft(values);
      setDraftId(draft.id);
      return draft;
    }

    const { id: _discard, ...rest } = values;

    return updateDraft({
      id: draftId,
      ...(rest as Omit<TicketFormValues, "id">),
    });
  };

  useEffect(() => {
    if (ticketDraft?.id) {
      setDraftId(ticketDraft.id);
    }
  }, [ticketDraft]);

  useEffect(() => {
    if (mode !== "create") return;

    let timeout: NodeJS.Timeout;

    const subscription = form.watch(() => {
      clearTimeout(timeout);

      timeout = setTimeout(async () => {
        if (savingRef.current) return;

        const values = form.getValues();

        if (!hasTicketContent(values)) return;

        try {
          savingRef.current = true;

          if (!draftId) {
            const draft = await createDraft(values);
            setDraftId(draft.id);
            return;
          }

          const { id: _discard, ...rest } = values;

          await updateDraft({
            id: draftId,
            ...(rest as Omit<TicketFormValues, "id">),
          });
        } finally {
          savingRef.current = false;
        }
      }, 1000);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [draftId, mode, form]);

  const removeDraft = async () => {
    if (!draftId) return;
    await deleteDraft(draftId);
    setDraftId(null);
  };

  return {
    draftId,
    ticketDraft,
    removeDraft,
    saveDraftNow,
  };
};
