"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";

import { serviceDeskTicketApi } from "@/feature/serviceDesk/ticket/api/api";
import { hasTicketDraftCategory } from "@/lib/application/serviceDesk/ticketDraft";

import type { TicketDraftFormPayload } from "../api/mapper";
import {
  useCreateServiceDeskTicketDraft,
  useDiscardServiceDeskTicketDraft,
  useUpdateServiceDeskTicketDraft,
} from "../api/mutations";
import { useServiceDeskTicketDraftQuery } from "../api/queries";
import { ticketDraftQueryKeys } from "../api/queryKeys";
import { useTicketDraftRepoContext } from "../api/repo";

type UseTicketDraftOptions = {
  mode: "create" | "update" | "view";
  form: UseFormReturn<TicketDraftFormPayload>;
};

export const useTicketDraft = ({ mode, form }: UseTicketDraftOptions) => {
  const [draftId, setDraftId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const context = useTicketDraftRepoContext();

  const savingRef = useRef(false);

  const { data: ticketDraft } = useServiceDeskTicketDraftQuery();

  const { mutateAsync: createDraft } = useCreateServiceDeskTicketDraft();
  const { mutateAsync: updateDraft } = useUpdateServiceDeskTicketDraft();
  const { mutateAsync: discardDraft } = useDiscardServiceDeskTicketDraft();

  /** Saves at most one create-mode draft operation at a time. */
  const saveDraftNow = async () => {
    if (mode !== "create" || savingRef.current) return null;

    const values = form.getValues();

    if (!hasTicketDraftCategory(values.category)) return null;

    try {
      savingRef.current = true;
      const prepared = await serviceDeskTicketApi.prepareAttachments({
        body: values.body,
        files: [],
      });
      const payload = {
        ...values,
        body: prepared.body,
        // Selected File objects cannot be recovered after reload. Inline images
        // survive through the controlled URLs returned by attachment preparation.
        attachment: [],
      };

      if (!draftId) {
        const draft = await createDraft({ ...payload, id: null });
        if (draft.id) {
          setDraftId(draft.id);
        }
        return draft;
      }

      return await updateDraft({ ...payload, id: draftId });
    } finally {
      savingRef.current = false;
    }
  };

  useEffect(() => {
    if (ticketDraft !== undefined) {
      setDraftId(ticketDraft?.id ?? null);
    }
  }, [ticketDraft]);

  const clearDraft = async () => {
    const queryKey = ticketDraftQueryKeys.draft(context);
    await queryClient.cancelQueries({ queryKey });
    queryClient.setQueryData(queryKey, null);
    setDraftId(null);
  };

  const removeDraft = async () => {
    if (!ticketDraft && !draftId && context.dataScope === "REMOTE") return;
    await discardDraft(ticketDraft?.id ?? draftId);
    await clearDraft();
  };

  return {
    draftId,
    ticketDraft,
    removeDraft,
    clearDraft,
    saveDraftNow,
  };
};
