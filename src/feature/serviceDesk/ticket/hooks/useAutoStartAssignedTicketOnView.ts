"use client";

import { useEffect, useRef } from "react";

import { TicketDetail } from "@/domain/serviceDesk";

import { useStartTicketWorkMutation } from "../api/mutations";

type UseAutoStartAssignedTicketOnViewParams = {
  ticket: TicketDetail | null | undefined;
};

/** Starts an assigned ticket once when its current assignee opens the detail view. */
export function useAutoStartAssignedTicketOnView({
  ticket,
}: UseAutoStartAssignedTicketOnViewParams) {
  const executedRef = useRef(false);
  const { mutate, isPending } = useStartTicketWorkMutation();

  useEffect(() => {
    executedRef.current = false;
  }, [ticket?.id]);

  useEffect(() => {
    // Viewing is allowed to start work only when the server projection says the
    // effective user is a current WORK-phase assignee. The server repeats this
    // authorization and owns the actual state transition.
    const shouldAutoStart =
      ticket?.active === true &&
      ticket.status === "Assigned" &&
      ticket.assignmentPhase === "WORK" &&
      ticket.isCurrentWorker === true;

    if (!ticket?.id) {
      return;
    }

    if (!shouldAutoStart) {
      return;
    }

    if (executedRef.current || isPending) {
      return;
    }

    // Guard Strict Mode/effect reruns locally. The server command is also
    // idempotent once the ticket is no longer Assigned.
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
    ticket?.isCurrentWorker,
    ticket?.assignmentPhase,
    ticket?.id,
    ticket?.status,
  ]);
}
