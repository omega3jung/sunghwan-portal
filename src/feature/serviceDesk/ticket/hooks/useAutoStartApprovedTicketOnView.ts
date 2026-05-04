"use client";

import { useEffect, useRef } from "react";

import { TicketDetail } from "@/domain/serviceDesk";

import { useStartTicketWorkMutation } from "../api/mutations";

type UseAutoStartApprovedTicketOnViewParams = {
  ticket: TicketDetail | null | undefined;
};

export function useAutoStartApprovedTicketOnView({
  ticket,
}: UseAutoStartApprovedTicketOnViewParams) {
  const executedRef = useRef(false);
  const { mutate, isPending } = useStartTicketWorkMutation();

  useEffect(() => {
    executedRef.current = false;
  }, [ticket?.id]);

  useEffect(() => {
    const shouldAutoStart =
      ticket?.active === true &&
      ticket.status === "Approved" &&
      ticket.assigned === true;

    if (!ticket?.id) {
      return;
    }

    if (!shouldAutoStart) {
      return;
    }

    if (executedRef.current || isPending) {
      return;
    }

    executedRef.current = true;

    mutate(
      { ticketId: ticket.id },
      {
        onError: () => {
          executedRef.current = false;
        },
      },
    );
  }, [
    isPending,
    mutate,
    ticket?.active,
    ticket?.assigned,
    ticket?.id,
    ticket?.status,
  ]);
}
