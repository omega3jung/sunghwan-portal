import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const forward = vi.hoisted(() => vi.fn());
vi.mock("@/app/api/_adapters", () => ({
  getCurrentEmployeeUserName: async () => "requester",
  isRemoteRequest: async () => true,
  toApiErrorResponse: vi.fn(),
}));
vi.mock("@/app/api/_adapters/backend", () => ({ portalApiJson: forward }));

import { prepareTicketAttachments } from "@/app/api/_adapters/localDemo/serviceDesk/ticket/attachments/ticketAttachmentPrepareService";

import { PUT as updateTicket } from "./[ticketId]/route";
import { PUT as updateDraft } from "./draft/[ticketId]/route";
import { POST as createDraft } from "./draft/route";
import { POST as createTicket } from "./route";

const dueAt = "2099-01-01T00:00:00.000Z";
const email = { to: [], cc: [], bcc: [] };
const ticket = { categoryId: 10, subject: "Saved ticket", dueAt, email, priority: "medium", riskLevel: "medium", files: [], images: [] };
const draft = { id: null, category: "10", subject: "Saved draft", dueAt, email, priority: "medium", riskLevel: "medium", requester: { id: "requester", name: "Requester", email: "" }, attachment: [] };
const endpoints = [
  { name: "create ticket", method: "POST", handler: createTicket, payload: (content: string) => ({ ...ticket, body: content }) },
  { name: "requester update", method: "PUT", handler: updateTicket, payload: (content: string) => ({ categoryId: "10", subject: ticket.subject, dueAt, email, content, files: [], images: [] }) },
  { name: "create draft", method: "POST", handler: createDraft, payload: (content: string) => ({ ...draft, body: content }) },
  { name: "update draft", method: "PUT", handler: updateDraft, payload: (content: string) => ({ ...draft, body: content }) },
];

describe.each(endpoints)("$name HTTP persistence boundary", ({ name, method, handler, payload }) => {
  beforeEach(() => {
    vi.clearAllMocks();
    forward.mockResolvedValue(new Response(null, { status: 200 }));
  });

  it("allows incomplete draft content but rejects incomplete operational content", async () => {
    const body = payload("<p></p>");
    body.subject = "";
    const response = await handler(new NextRequest("http://localhost/api/service-desk/tickets", {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }), { params: Promise.resolve({ ticketId: "ticket-1" }) });
    expect(response.status).toBe(name.includes("draft") ? 200 : 400);
    expect(forward).toHaveBeenCalledTimes(name.includes("draft") ? 1 : 0);
  });

  it("rejects a missing category before persistence", async () => {
    const body = { ...payload("Details"), category: undefined, categoryId: undefined };
    const response = await handler(new NextRequest("http://localhost/api/service-desk/tickets", {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }), { params: Promise.resolve({ ticketId: "ticket-1" }) });
    expect(response.status).toBe(400);
    expect(forward).not.toHaveBeenCalled();
  });

  it.each(["data:image/png;base64,aGVsbG8=", "blob:https://portal.example/image"])("rejects direct %s without forwarding to persistence", async (src) => {
    const response = await handler(new NextRequest("http://localhost/api/service-desk/tickets", {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload(`<img src="${src}">`)),
    }), { params: Promise.resolve({ ticketId: "ticket-1" }) });
    expect(response.status).toBe(400);
    expect(forward).not.toHaveBeenCalled();
  });

  it("forwards prepared images intact", async () => {
    const prepared = prepareTicketAttachments({ body: '<p>Prepared</p><img src="data:image/png;base64,aGVsbG8=">', files: [] });
    const content = prepared.body;
    expect(content).toContain('/files/demo-');
    expect(content).not.toMatch(/data:|blob:/);
    const response = await handler(new NextRequest("http://localhost/api/service-desk/tickets", {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload(content)),
    }), { params: Promise.resolve({ ticketId: "ticket-1" }) });
    expect(response.status).toBe(200);
    const body = forward.mock.calls[0][1].body;
    expect(body.body ?? body.content).toBe(content);
  });
});
