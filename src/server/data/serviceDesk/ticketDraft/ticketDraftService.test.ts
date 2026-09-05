import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findDepartment: vi.fn(),
  createRow: vi.fn(),
  updateRow: vi.fn(),
  discardRow: vi.fn(),
  findRow: vi.fn(),
}));

vi.mock("../ticket/ticketRepository", () => ({
  findEmployeeDepartmentIdByUsername: mocks.findDepartment,
}));
vi.mock("./ticketDraftRepository", () => ({
  createTicketDraftRow: mocks.createRow,
  discardTicketDraftRowById: mocks.discardRow,
  findTicketDraftRowByRequesterUsername: mocks.findRow,
  updateTicketDraftRowById: mocks.updateRow,
}));

import {
  createTicketDraft,
  discardTicketDraft,
  updateTicketDraft,
} from "./ticketDraftService";

const input = {
  categoryId: "10",
  approvalStepId: null,
  priority: "medium" as const,
  riskLevel: "medium" as const,
  dueAt: "2026-09-10T00:00:00.000Z",
  subject: "Need help",
  content: "Details",
  email: { to: [], cc: [], bcc: [] },
  attachment: [],
};

describe("Ticket draft persistence boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findDepartment.mockResolvedValue(3);
  });

  it("rejects create before persistence when requester department is absent", async () => {
    mocks.findDepartment.mockResolvedValue(null);

    await expect(createTicketDraft("requester", input)).rejects.toMatchObject({
      status: 422,
    });
    expect(mocks.createRow).not.toHaveBeenCalled();
  });

  it("maps the unique requester-draft constraint to 409", async () => {
    mocks.createRow.mockRejectedValue(Object.assign(new Error("duplicate"), { code: "23505" }));

    await expect(createTicketDraft("requester", input)).rejects.toMatchObject({
      status: 409,
    });
  });

  it.each([
    ["update", () => updateTicketDraft("draft-1", "other", input), mocks.updateRow],
    ["discard", () => discardTicketDraft("draft-1", "other"), mocks.discardRow],
  ])("conceals another requester's draft on %s", async (_label, operation, repository) => {
    repository.mockResolvedValue(null);
    await expect(operation()).rejects.toMatchObject({ status: 404 });
  });

  it("never forwards a raw File object to the repository row", async () => {
    const rawFile = { name: "unsafe.txt", type: "text/plain", raw: new Uint8Array([1, 2]) };
    mocks.createRow.mockResolvedValue(createRow());

    await createTicketDraft("requester", {
      ...input,
      attachment: [
        {
          name: rawFile.name,
          type: rawFile.type,
          url: "/files/demo-txt.txt",
          ...({ file: rawFile } as object),
        },
      ],
    });

    const repositoryInput = mocks.createRow.mock.calls[0][1];
    expect(repositoryInput.tk_files).toEqual([
      {
        index: 0,
        type: "file",
        name: "unsafe.txt",
        url: "/files/demo-txt.txt",
        active: true,
      },
    ]);
    expect(JSON.stringify(repositoryInput)).not.toContain("raw");
  });
});

function createRow() {
  return {
    tk_id: "draft-1",
    tk_ticket_no: "DRAFT-1",
    tk_created_at: "2026-09-01T00:00:00.000Z",
    tk_updated_at: null,
    tk_requester_username: "requester",
    tk_requester_name: null,
    tk_requester_email: null,
    tk_requester_image: null,
    tk_requester_department_id: 3,
    tk_status: "Draft",
    tk_priority: "medium",
    tk_risk_level: "medium",
    tk_assignee_usernames: [],
    tk_due_at: input.dueAt,
    tk_category_id: 10,
    tk_approval_step_id: null,
    tk_subject: input.subject,
    tk_content: input.content,
    tk_email: input.email,
    tk_files: [],
    tk_images: [],
    tk_active: true,
  } as const;
}
