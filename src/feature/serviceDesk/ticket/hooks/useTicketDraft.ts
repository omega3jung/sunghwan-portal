import { useEffect, useRef, useState } from "react";
import { DeepPartial, UseFormReturn } from "react-hook-form";

import {
  useCreateServiceDeskTicketDraft,
  useRemoveServiceDeskTicketDraft,
  useServiceDeskTicketDraftQuery,
  useUpdateServiceDeskTicketDraft,
} from "../../ticket/api";
import type { TicketFormValues } from "../../ticket/forms";

type UseTicketDraftOptions = {
  mode: "create" | "update" | "view";
  form: UseFormReturn<TicketFormValues>;
};

export const useTicketDraft = ({ mode, form }: UseTicketDraftOptions) => {
  const [draftId, setDraftId] = useState<string | null>(null);

  const savingRef = useRef(false);

  const { data: ticketDraft } = useServiceDeskTicketDraftQuery();

  const { mutateAsync: createDraft } = useCreateServiceDeskTicketDraft();
  const { mutateAsync: updateDraft } = useUpdateServiceDeskTicketDraft();
  const { mutateAsync: deleteDraft } = useRemoveServiceDeskTicketDraft();

  const hasRequiredTicketContent = (values: DeepPartial<TicketFormValues>) =>
    values.subject?.length || values.body?.length || values.subCategory;

  const hasTicketContent = (values: DeepPartial<TicketFormValues>) =>
    hasRequiredTicketContent(values) || values.attachment?.length;

  const toDraftPayload = (values: TicketFormValues): TicketFormValues => ({
    ...values,
    attachment: [],
  });

  const saveDraftNow = async () => {
    if (mode !== "create" || savingRef.current) return null;

    const values = form.getValues();

    if (!hasTicketContent(values)) return null;

    try {
      savingRef.current = true;

      if (!draftId) {
        const draft = await createDraft(toDraftPayload(values));
        if (draft.id) {
          setDraftId(draft.id);
        }
        return draft;
      }

      const { id: _discard, ...rest } = values;

      return updateDraft(
        toDraftPayload({
          id: draftId,
          ...(rest as Omit<TicketFormValues, "id">),
        }),
      );
    } finally {
      savingRef.current = false;
    }
  };

  useEffect(() => {
    if (ticketDraft?.id) {
      setDraftId(ticketDraft.id);
    }
  }, [ticketDraft]);

  const removeDraft = async () => {
    if (!ticketDraft && !draftId) return;
    await deleteDraft();
    setDraftId(null);
  };

  return {
    draftId,
    ticketDraft,
    removeDraft,
    saveDraftNow,
  };
};
