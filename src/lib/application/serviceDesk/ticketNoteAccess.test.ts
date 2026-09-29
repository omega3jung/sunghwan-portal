import { describe, expect, it } from "vitest";

import type { TicketParticipation } from "@/lib/application/contracts/serviceDesk/ticketParticipation";

import { canAccessTicketNote, isNoteRelatedHistory } from "./ticketNoteAccess";

const empty: TicketParticipation = {
  ticketRelation: null, isApprovalParticipant: false, isAssignmentParticipant: false, isAdmin: false,
};

describe("NOTE access composition", () => {
  it.each<TicketParticipation>([
    { ...empty, ticketRelation: "CurrentAssignee" },
    { ...empty, ticketRelation: "PreviousAssignee" },
    { ...empty, isApprovalParticipant: true },
    { ...empty, isAssignmentParticipant: true },
    { ...empty, isApprovalParticipant: true, isAssignmentParticipant: true },
  ])("allows operational participation only inside Ticket visibility: %j", (participation) => {
    expect(canAccessTicketNote({ canReadTicket: true, participation })).toBe(true);
    expect(canAccessTicketNote({ canReadTicket: false, participation: { ...participation, isAdmin: true } })).toBe(false);
    expect(canAccessTicketNote({ canReadTicket: true, participation: { ...participation, ticketRelation: "Requester" } })).toBe(false);
  });

  it.each(["Requester", "CurrentAssignee", "PreviousAssignee", null] as const)(
    "allows an effective Admin with relation %s only inside Ticket visibility",
    (ticketRelation) => {
      const participation = { ...empty, ticketRelation, isAdmin: true };
      expect(canAccessTicketNote({ canReadTicket: true, participation })).toBe(true);
      expect(canAccessTicketNote({ canReadTicket: false, participation })).toBe(false);
    },
  );

  it("denies a non-Admin requester without operational participation", () => {
    expect(canAccessTicketNote({ canReadTicket: true,
      participation: { ...empty, ticketRelation: "Requester" } })).toBe(false);
  });

  it("denies unrelated viewers and missing projections; allows a visible non-requester Admin", () => {
    expect(canAccessTicketNote({ canReadTicket: true, participation: empty })).toBe(false);
    expect(canAccessTicketNote({ canReadTicket: true, participation: { ...empty, isAdmin: true } })).toBe(true);
    expect(canAccessTicketNote({ canReadTicket: true, participation: null })).toBe(false);
  });

  it("recognizes NOTE events, type and links including soft-deleted actions, without hiding comments", () => {
    const links = new Set([9]);
    expect(isNoteRelatedHistory({ type: "COMMENT", event: "COMMENT_CREATED", action_no: 2 }, links)).toBe(false);
    expect(isNoteRelatedHistory({ type: "TICKET", event: "NOTE_UPDATED", action_no: null }, links)).toBe(true);
    expect(isNoteRelatedHistory({ type: "NOTE", event: "TICKET_UPDATED", action_no: null }, links)).toBe(true);
    expect(isNoteRelatedHistory({ type: "TICKET", event: "TICKET_UPDATED", action_no: 9 }, links)).toBe(true);
  });
});
