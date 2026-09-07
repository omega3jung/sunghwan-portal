import { describe, expect, it } from "vitest";

import { mapTicketHistoryDisplayMetadata } from "./ticketHistoryMapper";

describe("ticket history display metadata", () => {
  it("keeps recognized display fields and normalizes legacy identifiers", () => {
    const input = {
      source: "ROUTING_RULE",
      event: "ROUTING_RESET",
      closeReason: "Escalated",
      resolvedGraceDays: 7,
      sourceScope: "INTERNAL",
      targetScope: "PORTAL",
      routingReset: true,
      previousApprovalStepId: 12,
      nextApprovalStepId: null,
      previousAssigneeUsernames: ["alice", "", 3],
      changedFields: ["categoryId", "   ", false],
      untrustedProperty: "discarded",
    };

    expect(mapTicketHistoryDisplayMetadata(input)).toEqual({
      source: "ROUTING_RULE",
      event: "ROUTING_RESET",
      closeReason: "Escalated",
      resolvedGraceDays: 7,
      sourceScope: "INTERNAL",
      targetScope: "PORTAL",
      changedFields: ["categoryId"],
      routingReset: true,
      previousApprovalStepId: "12",
      nextApprovalStepId: null,
      previousAssigneeUsernames: ["alice"],
    });
    expect(input).toHaveProperty("untrustedProperty", "discarded");
  });

  it.each([null, [], "metadata", 4])(
    "returns null for a non-record value: %j",
    (input) => {
      expect(mapTicketHistoryDisplayMetadata(input)).toBeNull();
    },
  );

  it("returns null when every supplied field is unsupported or malformed", () => {
    expect(
      mapTicketHistoryDisplayMetadata({
        source: "USER",
        event: "TICKET_ARCHIVED",
        closeReason: "Done",
        resolvedGraceDays: Number.NaN,
        sourceScope: "EXTERNAL",
        note: "   ",
        routingReset: "true",
        assigneeUsernames: [null, 1, ""],
      }),
    ).toBeNull();
  });
});
