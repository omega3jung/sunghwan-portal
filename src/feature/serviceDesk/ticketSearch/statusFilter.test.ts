import { describe, expect, it } from "vitest";

import {
  expandTicketStatusFilters,
  normalizeTicketStatusFilterValues,
  OPEN_TICKET_STATUS_FILTER_VALUES,
} from "./statusFilter";

describe("ticket status filters", () => {
  it("migrates legacy status labels and drops unknown values", () => {
    expect(
      normalizeTicketStatusFilterValues([
        "Approved",
        "Reopen",
        "Resolved",
        "Unknown",
      ]),
    ).toEqual(["Assigned", "Working", "Resolved"]);
  });

  it("expands the synthetic Open filter into every non-closed workflow state", () => {
    expect(expandTicketStatusFilters(["Open"])).toEqual(
      OPEN_TICKET_STATUS_FILTER_VALUES,
    );
  });

  it("deduplicates expanded and explicit statuses in first-seen order", () => {
    expect(
      expandTicketStatusFilters(["Assigned", "Open", "Approved", "Closed"]),
    ).toEqual([
      "Assigned",
      "Approval",
      "Declined",
      "Working",
      "Pending",
      "Rejected",
      "Closed",
    ]);
  });
});
