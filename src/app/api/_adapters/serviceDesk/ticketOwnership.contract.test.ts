import { describe, expect, it } from "vitest";

import * as appProjection from "@/app/api/_adapters/serviceDesk/ticketOwnership";
import * as serverProjection from "@/server/portalApi/serviceDesk/shared/ticketOwnership";

type OwnershipTicket = {
  requesterUsername: string;
  assignmentPhase: "APPROVAL" | "WORK";
  approvalAssigneeUsernames: string[];
  workAssigneeUsernames: string[];
  owner: boolean;
  isCurrentApprover: boolean;
  isCurrentWorker: boolean;
};

type ProjectionContract = {
  withDerivedTicketOwnership: (
    ticket: OwnershipTicket,
    currentUserName: string | null,
  ) => OwnershipTicket;
  withDerivedTicketOwnershipList: (
    tickets: readonly OwnershipTicket[],
    currentUserName: string | null,
  ) => OwnershipTicket[];
  toCurrentUsernameProxyHeaders: (
    currentUserName: string | null,
  ) => HeadersInit | undefined;
};

const ticket = (
  overrides: Partial<OwnershipTicket> = {},
): OwnershipTicket => ({
  requesterUsername: "requester",
  assignmentPhase: "WORK",
  approvalAssigneeUsernames: ["approver"],
  workAssigneeUsernames: ["worker"],
  owner: false,
  isCurrentApprover: false,
  isCurrentWorker: false,
  ...overrides,
});

/**
 * App and server runtimes currently live in one repository, but ticket
 * ownership projection is a shared runtime contract. Both implementations
 * must stay behaviorally equivalent if the runtime boundary is deployed
 * separately.
 */
function describeTicketOwnershipContract(
  runtime: string,
  projection: ProjectionContract,
) {
  describe(`${runtime} ticket ownership projection`, () => {
    it("derives requester ownership without trusting persisted capability flags", () => {
      expect(
        projection.withDerivedTicketOwnership(
          ticket({ owner: false, isCurrentWorker: true }),
          "requester",
        ),
      ).toEqual(
        expect.objectContaining({
          owner: true,
          isCurrentApprover: false,
          isCurrentWorker: false,
        }),
      );

      expect(
        projection.withDerivedTicketOwnership(ticket({ owner: true }), "other")
          .owner,
      ).toBe(false);
    });

    it("projects only the assignee capability for the active assignment phase", () => {
      expect(
        projection.withDerivedTicketOwnership(
          ticket({
            assignmentPhase: "APPROVAL",
            approvalAssigneeUsernames: ["same-user"],
            workAssigneeUsernames: ["same-user"],
          }),
          "same-user",
        ),
      ).toEqual(
        expect.objectContaining({
          isCurrentApprover: true,
          isCurrentWorker: false,
        }),
      );

      expect(
        projection.withDerivedTicketOwnership(
          ticket({
            assignmentPhase: "WORK",
            approvalAssigneeUsernames: ["same-user"],
            workAssigneeUsernames: ["same-user"],
          }),
          "same-user",
        ),
      ).toEqual(
        expect.objectContaining({
          isCurrentApprover: false,
          isCurrentWorker: true,
        }),
      );
    });

    it.each([null, "", "   "])(
      "clears all capabilities for a missing username (%j)",
      (currentUserName) => {
        expect(
          projection.withDerivedTicketOwnership(
            ticket({ owner: true, isCurrentApprover: true, isCurrentWorker: true }),
            currentUserName,
          ),
        ).toEqual(
          expect.objectContaining({
            owner: false,
            isCurrentApprover: false,
            isCurrentWorker: false,
          }),
        );
      },
    );

    it("uses the current exact-match contract after trimming surrounding whitespace", () => {
      expect(
        projection.withDerivedTicketOwnership(ticket(), "  worker  ")
          .isCurrentWorker,
      ).toBe(true);
      expect(
        projection.withDerivedTicketOwnership(ticket(), "WORKER")
          .isCurrentWorker,
      ).toBe(false);
    });

    it("projects every ticket in a list", () => {
      const result = projection.withDerivedTicketOwnershipList(
        [ticket(), ticket({ requesterUsername: "worker" })],
        "worker",
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({ owner: false, isCurrentWorker: true }),
      );
      expect(result[1]).toEqual(
        expect.objectContaining({ owner: true, isCurrentWorker: true }),
      );
    });

    it("forwards only a normalized authenticated username", () => {
      expect(projection.toCurrentUsernameProxyHeaders("  worker  ")).toEqual({
        "X-Current-Username": "worker",
      });
      expect(projection.toCurrentUsernameProxyHeaders(null)).toBeUndefined();
      expect(projection.toCurrentUsernameProxyHeaders("   ")).toBeUndefined();
    });
  });
}

describeTicketOwnershipContract("App runtime", appProjection);
describeTicketOwnershipContract("Server runtime", serverProjection);

describe("ticket ownership runtime parity", () => {
  it("keeps App and server observable results equivalent", () => {
    const input = ticket({
      requesterUsername: "same-user",
      assignmentPhase: "APPROVAL",
      approvalAssigneeUsernames: ["same-user"],
      workAssigneeUsernames: ["same-user"],
    });

    expect(
      appProjection.withDerivedTicketOwnership(input, "same-user"),
    ).toEqual(serverProjection.withDerivedTicketOwnership(input, "same-user"));
    expect(appProjection.toCurrentUsernameProxyHeaders(" same-user ")).toEqual(
      serverProjection.toCurrentUsernameProxyHeaders(" same-user "),
    );
  });
});
