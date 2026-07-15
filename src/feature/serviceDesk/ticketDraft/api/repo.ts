"use client";

import { DataScope } from "@/domain/auth";
import { useCurrentSession } from "@/feature/auth/session/client";

import { serviceDeskTicketDraftApi } from "./api";
import type { TicketDraftFormPayload } from "./mapper";

export type TicketDraftRepoContext = {
  userId: string | null;
  dataScope: DataScope;
  isReady?: boolean;
};

type LocalTicketDraft = {
  ownerUserId: string | null;
  form: TicketDraftFormPayload;
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
  }: TicketDraftRepoContext): Promise<TicketDraftFormPayload | null> {
    if (dataScope === "LOCAL") {
      return ticketDraftLocalStore.get(userId);
    }

    return serviceDeskTicketDraftApi.get();
  },

  async create({
    userId,
    dataScope,
    data,
  }: TicketDraftRepoContext & {
    data: TicketDraftFormPayload;
  }) {
    if (dataScope === "LOCAL") {
      return ticketDraftLocalStore.set(userId, data);
    }

    return serviceDeskTicketDraftApi.create(data);
  },

  async update({
    userId,
    dataScope,
    data,
  }: TicketDraftRepoContext & {
    data: TicketDraftFormPayload;
  }) {
    if (dataScope === "LOCAL") {
      return ticketDraftLocalStore.set(userId, data);
    }

    return serviceDeskTicketDraftApi.update(data);
  },

  async discard({
    dataScope,
    ticketId,
  }: {
    dataScope: DataScope;
    ticketId?: string | null;
  }) {
    if (dataScope === "LOCAL") {
      ticketDraftLocalStore.remove();
      return;
    }

    if (!ticketId) {
      return;
    }

    return serviceDeskTicketDraftApi.discard(ticketId);
  },
};

const ticketDraftLocalStore = {
  get(userId: string | null): TicketDraftFormPayload | null {
    const raw = localStorage.getItem(TICKET_DRAFT_STORAGE_KEY);
    const draft = raw ? (JSON.parse(raw) as LocalTicketDraft) : null;

    if (!draft) return null;

    if (draft.ownerUserId !== userId) {
      localStorage.removeItem(TICKET_DRAFT_STORAGE_KEY);
      return null;
    }

    return draft.form;
  },

  set(userId: string | null, data: TicketDraftFormPayload) {
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
