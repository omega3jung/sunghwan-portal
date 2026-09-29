import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DbAssignmentRule, DbCategoryApprovalSettings } from "@/lib/application/contracts/serviceDesk";
import { canAccessTicketNote } from "@/lib/application/serviceDesk/ticketNoteAccess";

const mocks = vi.hoisted(() => ({ category: vi.fn(), employees: vi.fn(), steps: vi.fn(), rules: vi.fn(), auth: vi.fn() }));
vi.mock("../eligibility", async (importOriginal) => ({ ...await importOriginal<typeof import("../eligibility")>(), getServiceDeskCategoryContext: mocks.category, getActiveLocalEmployeesByCompanyId: mocks.employees }));
vi.mock("../settings/state", () => ({ getLocalDemoApprovalSteps: mocks.steps, getLocalDemoAssignmentRules: mocks.rules }));
vi.mock("@/mocks/domain/user", () => ({ resolveDemoAuth: mocks.auth }));

vi.mock("@/mocks/domain/organization/jobFields", () => ({
  allJobFieldsMock: [{ jf_id: 10, jf_parent_id: 1 }, { jf_id: 1, jf_parent_id: null }],
}));
import { mapTicketParticipationRow } from "@/server/data/serviceDesk/ticketParticipation/ticketParticipationMapper";

import { canAccessLocalTicketNote, getLocalTicketParticipation } from "./participation";
import { getLocalDemoHistories, getLocalDemoTickets, resetLocalDemoTicketState } from "./state";

const category = {
  categoryId: "101", mainCategoryId: "100", scope: "INTERNAL", active: false,
  tenant: { id: "1", companyId: 1, isOwnerTenant: true, active: true, operational: true },
};
const approval = (username: string): DbCategoryApprovalSettings[] => [{
  category_id: 100,
  approval_step: [{ approval_step_id: 1, approval_step_index: 0, approval_step_name: { en: "Step" }, approval_step_description: null,
    approval_step_assignee: { type: "EMPLOYEE", employee_username: [username] }, skip_access_level: 1 }],
}] as DbCategoryApprovalSettings[];
const rule = (categoryId: number, usernames: string[]): DbAssignmentRule => ({
  category_id: categoryId, assignee: { employee_username: usernames, job_field_id: [] },
}) as DbAssignmentRule;

describe("LOCAL participation and NOTE parity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetLocalDemoTicketState();
    const ticket = { ...getLocalDemoTickets()[0], id: "participation", tenant_id: "1", scope: "INTERNAL" as const,
      active: true, requester_username: "requester", assignee_usernames: ["current"], category_id: "101" };
    getLocalDemoTickets().splice(0, getLocalDemoTickets().length, ticket);
    getLocalDemoHistories().splice(0);
    mocks.category.mockResolvedValue(category);
    mocks.employees.mockReturnValue(["candidate", "requester", "parent"].map((username, index) => ({
      id: index + 1, username, companyId: 1, departmentId: 1, jobFieldId: 1, active: true,
    })));
    mocks.steps.mockReturnValue(approval("candidate"));
    mocks.rules.mockReturnValue([rule(101, ["candidate"])]);
    mocks.auth.mockReturnValue({ permission: 5, role: "USER" });
  });
  afterEach(resetLocalDemoTicketState);

  it("resolves MANAGER participation using the Ticket requester, never the candidate being tested", async () => {
    mocks.employees.mockReturnValue([
      { id: 1, username: "requester", companyId: 1, jobFieldId: 10, active: true },
      { id: 2, username: "candidate", companyId: 1, jobFieldId: 1, active: true },
    ]);
    const steps = approval("unused");
    steps[0].approval_step[0].approval_step_assignee = { type: "MANAGER", level: 1 };
    mocks.steps.mockReturnValue(steps);
    expect((await getLocalTicketParticipation("participation", "candidate"))?.isApprovalParticipant).toBe(true);
    expect((await getLocalTicketParticipation("participation", "requester"))?.isApprovalParticipant).toBe(false);
  });

  it.each([
    ["requester", "Requester", false, false, false],
    ["current", "CurrentAssignee", false, false, false],
    ["candidate", null, true, true, false],
    ["unrelated", null, false, false, false],
    ["admin", null, false, false, true],
  ] as const)("matches the mapped REMOTE participation contract for %s", async (username, relation, approval, assignment, isAdmin) => {
    mocks.auth.mockReturnValue({ role: isAdmin ? "ADMIN" : "USER" });
    const remote = mapTicketParticipationRow({ ticket_relation: relation,
      is_approval_participant: approval, is_assignment_participant: assignment }, isAdmin);
    expect(await getLocalTicketParticipation("participation", username)).toEqual(remote);
  });

  it("keeps skipped-step and assignment participation for an inactive Category, independently", async () => {
    await expect(getLocalTicketParticipation("participation", "candidate")).resolves.toEqual({
      ticketRelation: null, isApprovalParticipant: true, isAssignmentParticipant: true, isAdmin: false,
    });
    expect(await canAccessLocalTicketNote("participation", { username: "candidate", tenantId: "1", userScope: "INTERNAL" })).toBe(true);
  });

  it("reflects current configuration changes without erasing previous assignee history", async () => {
    getLocalDemoHistories().push({ ticket_id: "participation", history_no: 1, type: "ASSIGNMENT", event: "ASSIGNMENT_UPDATED",
      source: "USER_ACTION", actor_username: "unrelated", action_no: 1,
      from_value: { assigneeUsernames: ["candidate"] }, to_value: { assigneeUsernames: ["current"] }, created_at: new Date().toISOString() });
    mocks.steps.mockReturnValue(approval("requester"));
    mocks.rules.mockReturnValue([rule(101, ["requester"])]);
    await expect(getLocalTicketParticipation("participation", "candidate")).resolves.toEqual({
      ticketRelation: "PreviousAssignee", isApprovalParticipant: false, isAssignmentParticipant: false, isAdmin: false,
    });
    expect((await getLocalTicketParticipation("participation", "unrelated"))?.ticketRelation).toBeNull();
    expect((await getLocalTicketParticipation("participation", "current"))?.ticketRelation).toBe("CurrentAssignee");
  });

  it.each([false, true])("preserves Requester relation while applying effective Admin=%s to NOTE access", async (isAdmin) => {
    getLocalDemoTickets()[0].assignee_usernames = ["requester"];
    mocks.steps.mockReturnValue(approval("requester"));
    mocks.rules.mockReturnValue([rule(101, ["requester"])]);
    mocks.auth.mockReturnValue({ role: isAdmin ? "ADMIN" : "USER" });
    const participation = await getLocalTicketParticipation("participation", "requester");
    expect(participation).toEqual({ ticketRelation: "Requester", isApprovalParticipant: true, isAssignmentParticipant: true, isAdmin });
    expect(canAccessTicketNote({ canReadTicket: true, participation })).toBe(isAdmin);
    expect(await canAccessLocalTicketNote("participation", { username: "requester", tenantId: "1", userScope: "INTERNAL" })).toBe(isAdmin);
  });

  it("falls back only when an own rule is absent, never when it is empty", async () => {
    mocks.rules.mockReturnValue([rule(100, ["parent"])]);
    expect((await getLocalTicketParticipation("participation", "parent"))?.isAssignmentParticipant).toBe(true);
    mocks.rules.mockReturnValue([rule(101, []), rule(100, ["parent"])]);
    expect((await getLocalTicketParticipation("participation", "parent"))?.isAssignmentParticipant).toBe(false);
  });

  it("re-evaluates the persisted Category and keeps Tenant/Company gates", async () => {
    getLocalDemoTickets()[0].category_id = "202";
    mocks.category.mockResolvedValue({ ...category, categoryId: "202", mainCategoryId: "200" });
    const participation = await getLocalTicketParticipation("participation", "candidate");
    expect(mocks.category).toHaveBeenCalledWith("202");
    expect(participation).toEqual({ ticketRelation: null, isApprovalParticipant: false, isAssignmentParticipant: false, isAdmin: false });
    mocks.category.mockResolvedValue({ ...category, tenant: { ...category.tenant, operational: false } });
    expect((await getLocalTicketParticipation("participation", "current"))?.ticketRelation).toBe("CurrentAssignee");
    expect((await getLocalTicketParticipation("participation", "candidate"))?.isApprovalParticipant).toBe(false);
  });

  it("does not grant Ticket visibility to participants or original administrators", async () => {
    const access = { username: "candidate", tenantId: "other", userScope: "CLIENT" as const };
    mocks.auth.mockReturnValue({ role: "ADMIN" });
    expect(await canAccessLocalTicketNote("participation", access)).toBe(false);
    mocks.auth.mockReturnValue({ role: "USER" });
    expect(await canAccessLocalTicketNote("participation", { ...access, username: "unrelated", tenantId: "1" })).toBe(false);
  });

  it.each([
    ["APPROVAL_REQUESTED", "to_value", "assigneeUsernames"],
    ["ROUTING_RESET", "metadata", "previousAssigneeUsernames"],
    ["ROUTING_RESET", "from_value", "assigneeUsernames"],
    ["TICKET_REOPENED", "metadata", "nextAssigneeUsernames"],
  ] as const)("reads the persisted %s %s.%s snapshot", async (event, location, key) => {
    getLocalDemoHistories().push({ ticket_id: "participation", history_no: 1, type: "ASSIGNMENT", event,
      source: "USER_ACTION", actor_username: "actor", action_no: null,
      [location]: { [key]: ["previous", "current", "requester"] }, created_at: new Date().toISOString() });
    expect((await getLocalTicketParticipation("participation", "previous"))?.ticketRelation).toBe("PreviousAssignee");
    expect((await getLocalTicketParticipation("participation", "current"))?.ticketRelation).toBe("CurrentAssignee");
    expect((await getLocalTicketParticipation("participation", "requester"))?.ticketRelation).toBe("Requester");
    expect(await canAccessLocalTicketNote("participation", { username: "requester", tenantId: "1", userScope: "INTERNAL" })).toBe(false);
    expect((await getLocalTicketParticipation("participation", "actor"))?.ticketRelation).toBeNull();
  });
});
