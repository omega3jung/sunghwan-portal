// store/useTicketStore.ts
import { create } from "zustand";

interface TicketUIState {
  selectedTicketId?: number;
  selectTicket: (id: number) => void;
}

export const useTicketStore = create<TicketUIState>((set) => ({
  selectedTicketId: undefined,
  selectTicket: (id) => set({ selectedTicketId: id }),
}));
