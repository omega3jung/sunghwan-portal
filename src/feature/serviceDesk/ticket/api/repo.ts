import { DataScope } from "@/domain/auth";
import { useCurrentSession } from "@/feature/auth/session/hooks/useCurrentSession";
import { serviceDeskTicketApi } from "@/feature/serviceDesk/ticket/api";

import type { TicketFormValues } from "../forms";

export type TicketDraftRepoContext = {
  userId: string | null;
  dataScope: DataScope;
  isReady?: boolean;
};

type LocalTicketDraft = {
  ownerUserId: string | null;
  form: TicketFormValues;
};

const TICKET_DRAFT_STORAGE_KEY = "sunghwan_portal_ticket_draft";

export function useTicketDraftRepoContext(): TicketDraftRepoContext {
  const { data: currentSession } = useCurrentSession();

  return {
    userId: currentSession?.user.id ?? null,
    dataScope: currentSession?.user.dataScope ?? "LOCAL",
    isReady: !!currentSession?.user,
  };
}

export const serviceDeskTicketDraftRepo = {
  async get({
    userId,
    dataScope,
  }: TicketDraftRepoContext): Promise<TicketFormValues | null> {
    // local demo.
    if (dataScope === "LOCAL") {
      return ticketDraftLocalStore.get(userId);
    }

    return serviceDeskTicketApi.draft.get(userId);
  },

  async create({
    userId,
    dataScope,
    data,
  }: TicketDraftRepoContext & {
    data: TicketFormValues;
  }) {
    // local demo.
    if (dataScope === "LOCAL") {
      return ticketDraftLocalStore.set(userId, data);
    }

    return serviceDeskTicketApi.draft.create(data);
  },

  async update({
    userId,
    dataScope,
    data,
  }: TicketDraftRepoContext & {
    data: TicketFormValues;
  }) {
    // local demo.
    if (dataScope === "LOCAL") {
      return ticketDraftLocalStore.set(userId, data);
    }

    return serviceDeskTicketApi.draft.update(data);
  },

  async remove({ dataScope }: { dataScope: DataScope }) {
    // local demo.
    if (dataScope === "LOCAL") {
      ticketDraftLocalStore.remove();
      return;
    }

    return serviceDeskTicketApi.draft.remove();
  },
};

const ticketDraftLocalStore = {
  get(userId: string | null): TicketFormValues | null {
    const raw = localStorage.getItem(TICKET_DRAFT_STORAGE_KEY);
    const draft = raw ? (JSON.parse(raw) as LocalTicketDraft) : null;

    if (!draft) return null;

    // remove other user's draft to keep 1 user - 1 draft policy
    // with single local draft storage.
    if (draft.ownerUserId !== userId) {
      localStorage.removeItem(TICKET_DRAFT_STORAGE_KEY);
      return null;
    }

    return draft.form;
  },

  set(userId: string | null, data: TicketFormValues) {
    const draft: LocalTicketDraft = {
      ownerUserId: userId,
      form: data,
    };

    localStorage.setItem(TICKET_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    return draft.form;
  },

  remove() {
    localStorage.removeItem(TICKET_DRAFT_STORAGE_KEY);
  },
};
