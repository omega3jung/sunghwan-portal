"use client";

import { useEffect, useRef, useState } from "react";
import { DeepPartial, UseFormReturn } from "react-hook-form";

import type { TicketDraftFormPayload } from "../api/mapper";
import {
  useCreateServiceDeskTicketDraft,
  useDiscardServiceDeskTicketDraft,
  useUpdateServiceDeskTicketDraft,
} from "../api/mutations";
import { useServiceDeskTicketDraftQuery } from "../api/queries";

type UseTicketDraftOptions = {
  mode: "create" | "update" | "view";
  form: UseFormReturn<TicketDraftFormPayload>;
};

export const useTicketDraft = ({ mode, form }: UseTicketDraftOptions) => {
  const [draftId, setDraftId] = useState<string | null>(null);

  const savingRef = useRef(false);

  const { data: ticketDraft } = useServiceDeskTicketDraftQuery();

  const { mutateAsync: createDraft } = useCreateServiceDeskTicketDraft();
  const { mutateAsync: updateDraft } = useUpdateServiceDeskTicketDraft();
  const { mutateAsync: discardDraft } = useDiscardServiceDeskTicketDraft();

  const hasRequiredTicketContent = (
    values: DeepPartial<TicketDraftFormPayload>,
  ) => values.subject?.length || values.body?.length || values.category;

  const hasTicketContent = (values: DeepPartial<TicketDraftFormPayload>) =>
    hasRequiredTicketContent(values) || values.attachment?.length;

  const toDraftPayload = (
    values: TicketDraftFormPayload,
  ): TicketDraftFormPayload => ({
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
          ...(rest as Omit<TicketDraftFormPayload, "id">),
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
    await discardDraft(ticketDraft?.id ?? draftId);
    setDraftId(null);
  };

  return {
    draftId,
    ticketDraft,
    removeDraft,
    saveDraftNow,
  };
};
