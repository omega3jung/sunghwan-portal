import { describe, expect, it, vi } from "vitest";

import { canReadAuthorizedTicketNote, getTicketParticipation } from "./ticketParticipationService";

describe("REMOTE Ticket participation boundary", () => {
  it("binds the trusted effective username, maps DB output and uses the caller transaction", async () => {
    const query = vi.fn().mockResolvedValue([{
      ticket_relation: "CurrentAssignee", is_approval_participant: true, is_assignment_participant: true,
    }]);
    await expect(getTicketParticipation("t", "effective", { query })).resolves.toEqual({
      ticketRelation: "CurrentAssignee", isApprovalParticipant: true, isAssignmentParticipant: true, isAdmin: false,
    });
    expect(query).toHaveBeenCalledWith(expect.stringContaining("service_desk.get_ticket_participation($1::text, $2::text)"), ["t", "effective"]);
  });

  it("composes Admin only from the canonical server role, ignoring extra DB flags", async () => {
    const query = vi.fn().mockResolvedValue([{ ticket_relation: null,
      is_approval_participant: false, is_assignment_participant: false, is_admin: true }]);
    expect((await getTicketParticipation("t", "effective", { query }))?.isAdmin).toBe(false);
    expect((await getTicketParticipation("t", "effective", { query, isAdmin: true }))?.isAdmin).toBe(true);
    query.mockResolvedValue([{ ticket_relation: "Requester",
      is_approval_participant: true, is_assignment_participant: true }]);
    await expect(canReadAuthorizedTicketNote("t", "effective", true, { query })).resolves.toBe(true);
    await expect(canReadAuthorizedTicketNote("t", "effective", false, { query })).resolves.toBe(false);
  });

  it("preserves zero rows as no projection without granting Admin access", async () => {
    const query = vi.fn().mockResolvedValue([]);
    await expect(getTicketParticipation("t", "effective", { query })).resolves.toBeNull();
    await expect(canReadAuthorizedTicketNote("t", "effective", true, { query })).resolves.toBe(false);
  });

  it.each([
    { ticket_relation: "unknown", is_approval_participant: false, is_assignment_participant: false },
    { ticket_relation: null, is_approval_participant: null, is_assignment_participant: false },
    { ticket_relation: null, is_approval_participant: "false", is_assignment_participant: false },
  ])("fails closed on invalid DB output: %j", async (row) => {
    const query = vi.fn().mockResolvedValue([row]);
    await expect(getTicketParticipation("t", "u", { query })).rejects.toThrow("Invalid Ticket participation");
  });

  it("does not swallow DB/helper failures", async () => {
    const query = vi.fn().mockRejectedValue(new Error("function unavailable"));
    await expect(getTicketParticipation("t", "u", { query })).rejects.toThrow("function unavailable");
  });
});
