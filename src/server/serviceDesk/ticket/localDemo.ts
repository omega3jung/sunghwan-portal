import { filterItemsByQuery } from "@/app/api/_helpers/filter";
import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import { Priority, RiskLevel } from "@/domain/common";
import {
  Attach,
  CategoryScope,
  TicketDetail,
  TicketStatus,
} from "@/domain/serviceDesk";
import { camelTicketDetailMapper } from "@/feature/serviceDesk/ticket/api";
import {
  DbTicketDetail,
  TicketSearchRequest,
  TicketSortField,
} from "@/feature/serviceDesk/ticket/api/types";
import {
  CreateTicketInput,
  TicketAttachmentInput,
  toTicketWritePayload,
  UpdateTicketInput,
} from "@/feature/serviceDesk/ticket/write";
import { getLocalDemoCategories } from "@/server/serviceDesk/settings/state";
import {
  applyRuleGroupFilter,
  normalizePagination,
  paginateItems,
} from "@/server/shared/query";
import { PaginatedSearchResponse } from "@/server/shared/types/api";
import { LocalizedText, SortDirection } from "@/shared/types";

import { getLocalDemoTickets } from "./state";

const EDITABLE_TICKET_STATUSES: TicketStatus[] = ["Draft", "Open", "Declined"];

type ResolvedCategorySnapshot = {
  id: string;
  name: LocalizedText;
  scope: CategoryScope;
  defaultPriority: Priority | null;
  defaultRiskLevel: RiskLevel | null;
};

export const localListTickets = ({
  isInternal,
  searchParams,
}: {
  isInternal: boolean;
  searchParams: URLSearchParams;
}) => {
  /* return only active tickets.
   *
   * TODO.
   * Admin/audit views may need access to inactive tickets.
   * Keep this as not-found for the current local demo user-facing flow.
   */
  const activeTickets = getLocalDemoTickets(isInternal).filter(
    (ticket) => ticket.active !== false,
  );
  const items = filterItemsByQuery(
    searchParams,
    camelTicketDetailMapper(activeTickets),
  );

  return {
    items,
    total: items.length,
  };
};

export const localGetTicket = ({
  isInternal,
  id,
}: {
  isInternal: boolean;
  id: string;
}) => {
  const ticket = getLocalDemoTickets(isInternal).find((item) => item.id === id);

  if (!ticket || ticket.active === false) {
    return null;
  }

  return camelTicketDetailMapper([ticket])[0];
};

export const localCreateTicket = ({
  isInternal,
  requesterId,
  input,
}: {
  isInternal: boolean;
  requesterId: string | null;
  input: CreateTicketInput;
}) => {
  const targetMock = getLocalDemoTickets(isInternal);
  const payload = toTicketWritePayload(input);

  if (!payload.category) {
    throw new ServiceDeskApiError("api.tickets.localDemo.invalidPayload", 400);
  }

  const resolvedRequesterId = normalizeRequesterId(
    requesterId ?? payload.requester.id,
  );

  if (!resolvedRequesterId) {
    throw new ServiceDeskApiError(
      "api.tickets.localDemo.requesterRequired",
      400,
    );
  }

  const category = resolveCategorySnapshot({
    isInternal,
    categoryId: payload.category,
  });
  const now = new Date().toISOString();
  const year = resolveTicketYear(targetMock, now);
  const nextSequence = resolveNextTicketSequence(targetMock, year);
  const attachments = splitAttachments(payload.attachment);
  const nextTicket: DbTicketDetail = {
    id: createTicketId(year, nextSequence),
    ticket_number: createTicketNumber(year, nextSequence),
    created_at: now,
    updated_at: now,
    requester_id: resolvedRequesterId,
    status: "Open",
    close_reason: null,
    priority: resolvePriorityValue(
      payload.priority,
      category.defaultPriority ?? "medium",
    ),
    risk_level: resolveRiskLevelValue(
      payload.riskLevel,
      category.defaultRiskLevel ?? "medium",
    ),
    assignee_id: [],
    merged_into_ticket_id: null,
    track_time_minutes: 0,
    last_comment_at: null,
    last_commenter_email: null,
    due_at: payload.dueAt,
    owner: false,
    assigned: false,
    active: true,
    scope: category.scope,
    category_id: category.id,
    category_name: category.name,
    approval_step_id: null,
    subject: payload.subject,
    content: payload.body,
    email: payload.email,
    files: attachments.files,
    images: attachments.images,
  };

  targetMock.unshift(nextTicket);

  return camelTicketDetailMapper([nextTicket])[0];
};

export const localUpdateTicket = ({
  isInternal,
  ticketId,
  input,
}: {
  isInternal: boolean;
  ticketId: string;
  input: UpdateTicketInput;
}) => {
  const targetMock = getLocalDemoTickets(isInternal);
  const ticketIndex = targetMock.findIndex((item) => item.id === ticketId);

  if (ticketIndex < 0) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  const ticket = targetMock[ticketIndex];

  if (!EDITABLE_TICKET_STATUSES.includes(ticket.status)) {
    throw new ServiceDeskApiError(
      "api.tickets.localDemo.updateNotAllowed",
      409,
      {
        status: ticket.status,
      },
    );
  }

  const payload = toTicketWritePayload(input);

  if (!payload.category) {
    throw new ServiceDeskApiError("api.tickets.localDemo.invalidPayload", 400);
  }

  const category = resolveCategorySnapshot({
    isInternal,
    categoryId: payload.category,
  });
  const attachments = splitAttachments(payload.attachment);
  const resetDeclinedFlow = ticket.status === "Declined";
  const updatedTicket: DbTicketDetail = {
    ...ticket,
    status: resetDeclinedFlow ? "Open" : ticket.status,
    close_reason: resetDeclinedFlow ? null : (ticket.close_reason ?? null),
    priority: resolvePriorityValue(payload.priority, ticket.priority),
    risk_level:
      payload.riskLevel === undefined
        ? ticket.risk_level
        : resolveRiskLevelValue(payload.riskLevel, ticket.risk_level),
    due_at: payload.dueAt,
    scope: category.scope,
    category_id: category.id,
    category_name: category.name,
    approval_step_id: resetDeclinedFlow ? null : ticket.approval_step_id,
    subject: payload.subject,
    content: payload.body,
    email: payload.email,
    files: attachments.files,
    images: attachments.images,
    updated_at: new Date().toISOString(),
  };

  // TODO: Add ticket history record generation for local update flow.
  targetMock.splice(ticketIndex, 1, updatedTicket);

  return camelTicketDetailMapper([updatedTicket])[0];
};

export const localDeleteTicket = ({
  isInternal,
  ticketId,
}: {
  isInternal: boolean;
  ticketId: string;
}) => {
  const targetMock = getLocalDemoTickets(isInternal);
  const ticketIndex = targetMock.findIndex((ticket) => ticket.id === ticketId);

  if (ticketIndex < 0) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  targetMock[ticketIndex] = {
    ...targetMock[ticketIndex],
    active: false,
    updated_at: new Date().toISOString(),
  };
};

export function localSearchTickets({
  isInternal,
  request,
}: {
  isInternal: boolean;
  request: TicketSearchRequest;
}): PaginatedSearchResponse<TicketDetail> {
  /* return only active tickets.
   *
   * TODO.
   * Admin/audit views may need access to inactive tickets.
   * Keep this as not-found for the current local demo user-facing flow.
   */
  const activeTickets = getLocalDemoTickets(isInternal).filter(
    (ticket) => ticket.active !== false,
  );
  const tickets = camelTicketDetailMapper(activeTickets);

  const filtered = applyRuleGroupFilter(tickets, request.filter);
  const sorted = sortTickets(filtered, request.sort);
  const pagination = normalizePagination(request);
  const items = paginateItems(sorted, pagination);

  return {
    items,
    totalCount: filtered.length,
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
}

const priorityRank: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};

function sortTickets(
  tickets: TicketDetail[],
  sort?: {
    field: TicketSortField;
    direction: SortDirection;
  },
): TicketDetail[] {
  if (!sort) {
    return tickets;
  }

  return [...tickets].sort((left, right) => {
    const result = compareTicket(left, right, sort.field);

    return sort.direction === "asc" ? result : -result;
  });
}

function compareTicket(
  left: TicketDetail,
  right: TicketDetail,
  field: TicketSortField,
): number {
  switch (field) {
    case "ticketNumber":
      return compareTicketNumber(left.ticketNumber, right.ticketNumber);

    case "createdAt":
      return compareDate(left.createdAt, right.createdAt);

    case "dueAt":
      return compareDate(left.dueAt, right.dueAt);

    case "priority":
      return comparePriority(left.priority, right.priority);

    default:
      return 0;
  }
}

function compareTicketNumber(left: string, right: string): number {
  return getTicketNumber(left) - getTicketNumber(right);
}

function getTicketNumber(ticketNumber: string): number {
  const matched = ticketNumber.match(/\d+$/);

  return matched ? Number(matched[0]) : 0;
}

function compareDate(left: string, right: string): number {
  return new Date(left).getTime() - new Date(right).getTime();
}

function comparePriority(left: string, right: string): number {
  return (
    (priorityRank[left.toLowerCase()] ?? 0) -
    (priorityRank[right.toLowerCase()] ?? 0)
  );
}

function normalizeRequesterId(value: string | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}

function resolveCategorySnapshot({
  isInternal,
  categoryId,
}: {
  isInternal: boolean;
  categoryId: string;
}): ResolvedCategorySnapshot {
  const normalizedId = categoryId.trim();

  for (const client of getLocalDemoCategories(isInternal)) {
    for (const category of client.category) {
      if (String(category.category_id) === normalizedId) {
        return {
          id: String(category.category_id),
          name: category.category_name,
          scope: category.category_scope,
          defaultPriority: category.default_priority ?? null,
          defaultRiskLevel: category.default_risk_level ?? null,
        };
      }

      const subCategory = category.sub_category.find(
        (item) => String(item.category_id) === normalizedId,
      );

      if (subCategory) {
        return {
          id: String(subCategory.category_id),
          name: subCategory.category_name,
          scope: category.category_scope,
          defaultPriority:
            subCategory.default_priority ?? category.default_priority ?? null,
          defaultRiskLevel:
            subCategory.default_risk_level ??
            category.default_risk_level ??
            null,
        };
      }
    }
  }

  throw new ServiceDeskApiError("api.tickets.localDemo.categoryNotFound", 404, {
    categoryId,
  });
}

function resolveTicketYear(tickets: DbTicketDetail[], nowIso: string): number {
  const years = tickets
    .map((ticket) => ticket.ticket_number.match(/^[A-Z]+-(\d{4})-\d+$/)?.[1])
    .filter((year): year is string => Boolean(year))
    .map((year) => Number(year))
    .filter((year) => Number.isFinite(year));

  if (years.length === 0) {
    return new Date(nowIso).getUTCFullYear();
  }

  return Math.max(...years);
}

function resolveNextTicketSequence(
  tickets: DbTicketDetail[],
  year: number,
): number {
  const yearToken = String(year);
  const numbers = tickets
    .map((ticket) => {
      const matched = ticket.ticket_number.match(/^[A-Z]+-(\d{4})-(\d+)$/);

      if (!matched || matched[1] !== yearToken) {
        return null;
      }

      return Number(matched[2]);
    })
    .filter((value): value is number => Number.isFinite(value));

  return (numbers.length ? Math.max(...numbers) : 0) + 1;
}

function createTicketId(year: number, sequence: number) {
  return `sunghwan-portal-${year}-${sequence}`;
}

function createTicketNumber(year: number, sequence: number) {
  return `SP-${year}-${String(sequence).padStart(4, "0")}`;
}

function splitAttachments(attachment: TicketAttachmentInput[]) {
  const normalized = attachment.map((item, index) => ({
    name: item.name?.trim() || `attachment-${index + 1}`,
    url: item.url ?? "",
    isImage: (item.type ?? "").toLowerCase().startsWith("image/"),
  }));

  const images: Attach[] = [];
  const files: Attach[] = [];

  normalized.forEach((item) => {
    if (item.isImage) {
      images.push({
        index: images.length,
        type: "image",
        name: item.name,
        url: item.url,
        active: true,
      });
      return;
    }

    files.push({
      index: files.length,
      type: "file",
      name: item.name,
      url: item.url,
      active: true,
    });
  });

  return { files, images };
}

function resolvePriorityValue(
  value: string | null,
  fallback: Priority,
): Priority {
  const normalized = value?.toLowerCase();

  if (
    normalized === "urgent" ||
    normalized === "high" ||
    normalized === "medium" ||
    normalized === "low"
  ) {
    return normalized;
  }

  return fallback;
}

function resolveRiskLevelValue(
  value: string | null | undefined,
  fallback: RiskLevel,
): RiskLevel {
  const normalized = value?.toLowerCase();

  if (
    normalized === "critical" ||
    normalized === "high" ||
    normalized === "medium" ||
    normalized === "low"
  ) {
    return normalized;
  }

  return fallback;
}
