import { beforeEach, describe, expect, it, vi } from "vitest";

const query = vi.hoisted(() => vi.fn());
vi.mock("@/server/shared/supabase/portalApiClient", () => ({ queryPortalApi: query }));

import {
  createTicketDraftRow,
  discardTicketDraftRowById,
  findTicketDraftRowByRequesterUsername,
} from "./ticketDraftRepository";
import type { TicketDraftRowInput } from "./ticketDraftRow";

describe("Draft discard persistence contract", () => {
  beforeEach(() => vi.clearAllMocks());

  it("physically deletes only the requested active requester-owned Draft and reports the deleted row", async () => {
    query.mockResolvedValue([{ tk_id: "draft-1" }]);
    await expect(discardTicketDraftRowById("draft-1", "requester")).resolves.toBe(true);
    const [sql, values] = query.mock.calls[0];
    // SQL is the authorization and lifecycle boundary here; a successful SELECT
    // must never be mistaken for a successful discard.
    expect(sql).toMatch(/^\s*delete\s+from\s+service_desk\.ticket\b/i);
    expect(sql).toMatch(/\btk_id\s*=\s*\$1\b/);
    expect(sql).toMatch(/\btk_requester_username\s*=\s*\$2\b/);
    expect(sql).toMatch(/\btk_status\s*=\s*'Draft'/);
    expect(sql).toMatch(/\btk_active\s*=\s*true\b/);
    expect(sql).toMatch(/\breturning\s+tk_id\b/i);
    expect(values).toEqual(["draft-1", "requester"]);
  });

  it("does not report success when the guarded deletion finds no owned Draft", async () => {
    query.mockResolvedValue([]);
    await expect(discardTicketDraftRowById("submitted-or-other-draft", "requester")).resolves.toBe(false);
  });

  it("removes a draft from subsequent reads, protects other owners/submitted tickets, and permits a replacement", async () => {
    // A stateful executor fixture exercises repository orchestration; PostgreSQL
    // constraints and multi-connection behavior remain a separate DB boundary.
    const rows = [
      { tk_id: "owned-draft", tk_requester_username: "requester", tk_status: "Draft", tk_active: true },
      { tk_id: "other-draft", tk_requester_username: "other", tk_status: "Draft", tk_active: true },
      { tk_id: "submitted", tk_requester_username: "requester", tk_status: "Assigned", tk_active: true },
    ];
    query.mockImplementation(async (sql: string, values: unknown[]) => {
      if (/^\s*delete\s+from/i.test(sql)) {
        const index = rows.findIndex((row) => row.tk_id === values[0] && row.tk_requester_username === values[1] && row.tk_status === "Draft" && row.tk_active);
        return index < 0 ? [] : rows.splice(index, 1);
      }
      if (/^\s*insert\s+into/i.test(sql)) {
        const username = String(values[1]);
        if (rows.some((row) => row.tk_requester_username === username && row.tk_status === "Draft")) throw new Error("Duplicate draft");
        const row = { tk_id: "replacement", tk_requester_username: username, tk_status: "Draft", tk_active: true };
        rows.push(row);
        return [row];
      }
      return rows.filter((row) => row.tk_requester_username === values[0] && row.tk_status === "Draft" && row.tk_active);
    });
    await expect(discardTicketDraftRowById("other-draft", "requester")).resolves.toBe(false);
    await expect(discardTicketDraftRowById("submitted", "requester")).resolves.toBe(false);
    await expect(discardTicketDraftRowById("owned-draft", "requester")).resolves.toBe(true);
    await expect(findTicketDraftRowByRequesterUsername("requester")).resolves.toBeNull();
    expect(rows.map((row) => row.tk_id)).toEqual(["other-draft", "submitted"]);
    const input: TicketDraftRowInput = {
      tk_requester_department_id: 1,
      tk_priority: "medium", tk_risk_level: "medium", tk_assignee_usernames: [],
      tk_due_at: "2099-01-01T00:00:00.000Z", tk_category_id: 10, tk_approval_step_id: null,
      tk_subject: "Replacement", tk_content: "New draft", tk_email: { to: [], cc: [], bcc: [] },
      tk_files: [], tk_images: [],
    };
    await expect(createTicketDraftRow("requester", input)).resolves.toMatchObject({ tk_id: "replacement" });
    await expect(findTicketDraftRowByRequesterUsername("requester")).resolves.toMatchObject({ tk_id: "replacement" });
  });
});
