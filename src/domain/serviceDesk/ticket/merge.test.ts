import { describe, expect, it, vi } from "vitest";

import {
  canMergeTicketInto,
  isEscalatedTicket,
  isMergedChildTicket,
  resolveTicketMergeCloseReason,
  shouldIncludeInTicketAggregates,
} from "./merge";

type MergeTestTicket = Parameters<typeof canMergeTicketInto>[0];

function createTicket(
  overrides: Partial<MergeTestTicket> = {},
): MergeTestTicket {
  return {
    id: "source",
    tenantId: "tenant-1",
    scope: "PORTAL",
    status: "Working",
    mergedIntoTicketId: null,
    ...overrides,
  };
}

describe("ticket merge relationship", () => {
  it.each([
    ["PORTAL", "PORTAL", "Merged"],
    ["INTERNAL", "INTERNAL", "Merged"],
    ["INTERNAL", "PORTAL", "Escalated"],
    ["PORTAL", "INTERNAL", null],
  ] as const)(
    "resolves %s -> %s to close reason %s",
    (sourceScope, targetScope, expected) => {
      expect(
        resolveTicketMergeCloseReason(
          { tenantId: "tenant-1", scope: sourceScope },
          { tenantId: "tenant-1", scope: targetScope },
        ),
      ).toBe(expected);
    },
  );

  it("rejects cross-tenant and missing-tenant merge relationships", () => {
    expect(
      resolveTicketMergeCloseReason(
        { tenantId: "tenant-1", scope: "PORTAL" },
        { tenantId: "tenant-2", scope: "PORTAL" },
      ),
    ).toBeNull();
    expect(
      resolveTicketMergeCloseReason(
        { tenantId: null, scope: "INTERNAL" },
        { tenantId: "tenant-1", scope: "PORTAL" },
      ),
    ).toBeNull();
  });

  it("allows a same-tenant work ticket to merge into a valid target", () => {
    expect(
      canMergeTicketInto(
        createTicket(),
        createTicket({ id: "target", status: "Resolved" }),
      ),
    ).toBe(true);
  });

  it.each([
    [
      "a draft source",
      createTicket({ status: "Draft" }),
      createTicket({ id: "target" }),
    ],
    [
      "a draft target",
      createTicket(),
      createTicket({ id: "target", status: "Draft" }),
    ],
    ["the source itself", createTicket(), createTicket()],
    [
      "a source ticket that has already been merged",
      createTicket({ mergedIntoTicketId: "previous-target" }),
      createTicket({ id: "target" }),
    ],
    [
      "a target ticket that has already been merged",
      createTicket(),
      createTicket({ id: "target", mergedIntoTicketId: "another-target" }),
    ],
  ] as const)("rejects %s", (_, source, target) => {
    expect(canMergeTicketInto(source, target)).toBe(false);
  });

  it("rejects an already-merged target before consulting relation history", () => {
    const source = createTicket();
    const target = createTicket({ id: "target", mergedIntoTicketId: "next" });
    const getTicketById = vi.fn<(id: string) => MergeTestTicket | undefined>();

    expect(canMergeTicketInto(source, target, getTicketById)).toBe(false);
    expect(getTicketById).not.toHaveBeenCalled();
  });
});

describe("merged ticket classification", () => {
  it.each([
    ["Merged", true, false],
    ["Escalated", true, true],
    ["Completed", false, false],
  ] as const)(
    "classifies a closed %s relation as merged=%s and escalated=%s",
    (closeReason, expectedMerged, expectedEscalated) => {
      const ticket = createTicket({
        status: "Closed",
        closeReason,
        mergedIntoTicketId: "target",
      });

      expect(isMergedChildTicket(ticket)).toBe(expectedMerged);
      expect(isEscalatedTicket(ticket)).toBe(expectedEscalated);
    },
  );

  it("requires closed status and a target relation to classify a merged child", () => {
    expect(
      isMergedChildTicket(
        createTicket({ closeReason: "Merged", mergedIntoTicketId: "target" }),
      ),
    ).toBe(false);
    expect(
      isMergedChildTicket(
        createTicket({ status: "Closed", closeReason: "Merged" }),
      ),
    ).toBe(false);
  });

  it("excludes merged children from aggregates only when requested", () => {
    const mergedChild = createTicket({
      status: "Closed",
      closeReason: "Merged",
      mergedIntoTicketId: "target",
    });

    expect(shouldIncludeInTicketAggregates(mergedChild)).toBe(true);
    expect(
      shouldIncludeInTicketAggregates(mergedChild, {
        excludeMergedChildren: true,
      }),
    ).toBe(false);
    expect(
      shouldIncludeInTicketAggregates(createTicket(), {
        excludeMergedChildren: true,
      }),
    ).toBe(true);
  });
});
