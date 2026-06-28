import { normalizePagination } from "@/server/shared/query";
import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { TicketSearchRequestDto } from "./ticketDto";
import {
  CreateTicketRowInput,
  ServiceDeskTicketViewRow,
  UpdateTicketRowInput,
} from "./ticketRow";

type TicketSortField = NonNullable<TicketSearchRequestDto["sort"]>["field"];

const TICKET_VIEW_COLUMNS = `
  tk_id,
  tk_ticket_no,
  tk_created_at,
  tk_updated_at,
  tk_requester_username,
  tk_status,
  tk_priority,
  tk_risk_level,
  tk_assignee_usernames,
  tk_work_minutes,
  tka_last_comment_at,
  tka_last_comment_email,
  tka_last_user_activity_at,
  tka_last_user_activity_email,
  tk_close_reason,
  tk_merged_into_ticket_id,
  tk_merged_into_ticket_no,
  tkh_closed_at,
  tk_due_at,
  cat_scope,
  cat_id,
  cat_name,
  cat_parent_id,
  tk_approval_step_id,
  tk_subject,
  tk_content,
  tk_email,
  tk_files,
  tk_images
`;

const FIND_ACTIVE_TICKET_VIEW_ROWS_QUERY = `
select
${TICKET_VIEW_COLUMNS}
from service_desk.vw_ticket
where tk_active = true
  and tk_status != 'Draft'
order by tk_ticket_no desc, tk_created_at desc;
`;

const FIND_ACTIVE_TICKET_VIEW_ROW_BY_ID_QUERY = `
select
${TICKET_VIEW_COLUMNS}
from service_desk.vw_ticket
where tk_active = true
  and tk_status != 'Draft'
  and tk_id = $1
limit 1;
`;

const CREATE_TICKET_ROW_QUERY = `
insert into service_desk.ticket (
  tk_ticket_no,
  tk_tenant_id,
  tk_category_id,
  tk_approval_step_id,
  tk_requester_username,
  tk_email,
  tk_subject,
  tk_content,
  tk_files,
  tk_images,
  tk_status,
  tk_priority,
  tk_risk_level,
  tk_due_at
)
values (
  $1,
  $2,
  $3,
  $4,
  $5,
  $6::jsonb,
  $7,
  $8,
  $9::jsonb,
  $10::jsonb,
  $11,
  $12,
  $13,
  $14
)
returning tk_id;
`;

const UPDATE_TICKET_ROW_BY_ID_QUERY = `
update service_desk.ticket
set
  tk_tenant_id = $2,
  tk_category_id = $3,
  tk_approval_step_id = $4,
  tk_email = $5::jsonb,
  tk_subject = $6,
  tk_content = $7,
  tk_files = $8::jsonb,
  tk_images = $9::jsonb,
  tk_priority = $10,
  tk_risk_level = $11,
  tk_due_at = $12,
  tk_updated_at = now()
where tk_id = $1
  and tk_active = true
  and tk_status != 'Draft'
returning tk_id;
`;

const FIND_ACTIVE_TICKET_VIEW_ROWS_BY_SEARCH_QUERY = `
select
${TICKET_VIEW_COLUMNS}
from service_desk.vw_ticket
where __WHERE_CLAUSE__
order by __ORDER_BY_CLAUSE__
limit __LIMIT_PARAM__ offset __OFFSET_PARAM__;
`;

const COUNT_ACTIVE_TICKET_VIEW_ROWS_BY_SEARCH_QUERY = `
select count(*)::int as count
from service_desk.vw_ticket
where __WHERE_CLAUSE__;
`;

export async function findActiveTicketViewRows() {
  return queryPortalApi<ServiceDeskTicketViewRow>(
    FIND_ACTIVE_TICKET_VIEW_ROWS_QUERY,
  );
}

export async function findActiveTicketViewRowById(
  ticketId: string,
): Promise<ServiceDeskTicketViewRow | null> {
  const rows = await queryPortalApi<ServiceDeskTicketViewRow>(
    FIND_ACTIVE_TICKET_VIEW_ROW_BY_ID_QUERY,
    [ticketId],
  );

  return rows[0] ?? null;
}

export async function createTicketRow(
  input: CreateTicketRowInput,
): Promise<ServiceDeskTicketViewRow | null> {
  const rows = await queryPortalApi<{ tk_id: string }>(CREATE_TICKET_ROW_QUERY, [
    input.tk_ticket_no,
    input.tk_tenant_id,
    input.tk_category_id,
    input.tk_approval_step_id,
    input.tk_requester_username,
    JSON.stringify(input.tk_email),
    input.tk_subject,
    input.tk_content,
    JSON.stringify(input.tk_files),
    JSON.stringify(input.tk_images),
    input.tk_status,
    input.tk_priority,
    input.tk_risk_level,
    input.tk_due_at,
  ]);
  const ticketId = rows[0]?.tk_id;

  return ticketId ? findActiveTicketViewRowById(ticketId) : null;
}

export async function updateTicketRowById(
  ticketId: string,
  input: UpdateTicketRowInput,
): Promise<ServiceDeskTicketViewRow | null> {
  const rows = await queryPortalApi<{ tk_id: string }>(
    UPDATE_TICKET_ROW_BY_ID_QUERY,
    [
      ticketId,
      input.tk_tenant_id,
      input.tk_category_id,
      input.tk_approval_step_id,
      JSON.stringify(input.tk_email),
      input.tk_subject,
      input.tk_content,
      JSON.stringify(input.tk_files),
      JSON.stringify(input.tk_images),
      input.tk_priority,
      input.tk_risk_level,
      input.tk_due_at,
    ],
  );
  const updatedTicketId = rows[0]?.tk_id;

  return updatedTicketId ? findActiveTicketViewRowById(updatedTicketId) : null;
}

export async function findActiveTicketViewRowsBySearch(
  request: TicketSearchRequestDto,
) {
  const pagination = normalizePagination(request);
  const where = buildTicketSearchWhereClause(request.filter);
  const orderByClause = resolveTicketOrderBy(request.sort);
  const limitParam = `$${where.values.length + 1}`;
  const offsetParam = `$${where.values.length + 2}`;
  const offset = (pagination.page - 1) * pagination.pageSize;

  const rows = await queryPortalApi<ServiceDeskTicketViewRow>(
    FIND_ACTIVE_TICKET_VIEW_ROWS_BY_SEARCH_QUERY.replace(
      "__WHERE_CLAUSE__",
      where.clause,
    )
      .replace("__ORDER_BY_CLAUSE__", orderByClause)
      .replace("__LIMIT_PARAM__", limitParam)
      .replace("__OFFSET_PARAM__", offsetParam),
    [...where.values, pagination.pageSize, offset],
  );

  const countRows = await queryPortalApi<{ count: number | string }>(
    COUNT_ACTIVE_TICKET_VIEW_ROWS_BY_SEARCH_QUERY.replace(
      "__WHERE_CLAUSE__",
      where.clause,
    ),
    where.values,
  );

  return {
    rows,
    totalCount: Number(countRows[0]?.count ?? 0),
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
}

type TicketFilterConnector = "and" | "or";

type TicketFilterOperator =
  | "="
  | "!="
  | "contains"
  | "in"
  | ">"
  | ">="
  | "<"
  | "<=";

type TicketFilterLeaf = {
  field?: string;
  operator?: TicketFilterOperator;
  value?: unknown;
};

type TicketFilterGroup = {
  rules?: Array<TicketFilterGroup | TicketFilterLeaf | TicketFilterConnector>;
};

type TicketFilterNode =
  | TicketFilterGroup
  | TicketFilterLeaf
  | TicketFilterConnector
  | null
  | undefined;

type TicketSearchField = {
  expression: string;
  array?: boolean;
};

const TICKET_SEARCH_FIELDS: Record<string, TicketSearchField> = {
  active: { expression: "tk_active" },
  ticketNumber: { expression: "tk_ticket_no" },
  subject: { expression: "tk_subject" },
  categoryId: { expression: "cat_id::text" },
  status: { expression: "tk_status" },
  riskLevel: { expression: "tk_risk_level" },
  priority: { expression: "tk_priority" },
  assigneeUsernames: { expression: "tk_assignee_usernames", array: true },
  requesterUsername: { expression: "tk_requester_username" },
  createdAt: { expression: "tk_created_at" },
  dueAt: { expression: "tk_due_at" },
};

const DEFAULT_TICKET_ORDER_BY = "tk_ticket_no desc, tk_created_at desc";

const TICKET_SORT_FIELD_MAP: Record<TicketSortField, string> = {
  ticketNumber: "tk_ticket_no",
  createdAt: "tk_created_at",
  updatedAt: "tk_updated_at",
  dueAt: "tk_due_at",
  priority:
    "case tk_priority when 'low' then 1 when 'medium' then 2 when 'high' then 3 when 'urgent' then 4 else 0 end",
  status: "tk_status",
};

function resolveTicketOrderBy(sort: TicketSearchRequestDto["sort"]) {
  if (!sort) {
    return DEFAULT_TICKET_ORDER_BY;
  }

  const expression = TICKET_SORT_FIELD_MAP[sort.field];
  const direction = sort.direction === "asc" ? "asc" : "desc";

  return `${expression} ${direction}, tk_ticket_no desc`;
}

function buildTicketSearchWhereClause(filter: unknown): {
  clause: string;
  values: unknown[];
} {
  const values: unknown[] = [];
  const filterClause = buildTicketFilterNode(
    filter as TicketFilterNode,
    values,
  );
  const clauses = ["tk_active = true", "tk_status not in ('Draft')"];

  if (filterClause) {
    clauses.push(filterClause);
  }

  return {
    clause: clauses.join("\n  and "),
    values,
  };
}

function buildTicketFilterNode(
  node: TicketFilterNode,
  values: unknown[],
): string | null {
  if (!node || typeof node === "string") {
    return null;
  }

  if (isTicketFilterGroup(node)) {
    return buildTicketFilterGroup(node, values);
  }

  return buildTicketFilterLeaf(node, values);
}

function buildTicketFilterGroup(
  group: TicketFilterGroup,
  values: unknown[],
): string | null {
  const rules = group.rules ?? [];
  const parts: string[] = [];
  let connector: TicketFilterConnector = "and";

  for (const rule of rules) {
    if (rule === "and" || rule === "or") {
      connector = rule;
      continue;
    }

    const clause = buildTicketFilterNode(rule, values);

    if (!clause) {
      continue;
    }

    if (parts.length === 0) {
      parts.push(clause);
      continue;
    }

    parts.push(`${connector} ${clause}`);
  }

  return parts.length > 0 ? `(${parts.join(" ")})` : null;
}

function buildTicketFilterLeaf(
  rule: TicketFilterLeaf,
  values: unknown[],
): string | null {
  if (!rule.field || !rule.operator) {
    return null;
  }

  const field = TICKET_SEARCH_FIELDS[rule.field];

  if (!field) {
    return null;
  }

  if (rule.operator === "in") {
    return buildInClause(field, rule.value, values);
  }

  const param = pushSqlValue(values, normalizeSqlValue(rule.value));

  switch (rule.operator) {
    case "=":
      return field.array
        ? `${param} = any(${field.expression})`
        : `${field.expression} = ${param}`;

    case "!=":
      return field.array
        ? `not (${param} = any(${field.expression}))`
        : `${field.expression} <> ${param}`;

    case "contains":
      return field.array
        ? `${param} = any(${field.expression})`
        : `${field.expression}::text ilike '%' || ${param} || '%'`;

    case ">":
    case ">=":
    case "<":
    case "<=":
      return field.array
        ? null
        : `${field.expression} ${rule.operator} ${param}`;

    default:
      return null;
  }
}

function buildInClause(
  field: TicketSearchField,
  value: unknown,
  values: unknown[],
): string | null {
  const arrayValue = normalizeArraySqlValue(value);

  if (arrayValue.length === 0) {
    return null;
  }

  const param = pushSqlValue(values, arrayValue);

  return field.array
    ? `${field.expression} && ${param}::text[]`
    : `${field.expression}::text = any(${param}::text[])`;
}

function isTicketFilterGroup(
  node: TicketFilterGroup | TicketFilterLeaf,
): node is TicketFilterGroup {
  return Array.isArray((node as TicketFilterGroup).rules);
}

function pushSqlValue(values: unknown[], value: unknown) {
  values.push(value);
  return `$${values.length}`;
}

function normalizeSqlValue(value: unknown) {
  return value instanceof Date ? value.toISOString() : value;
}

function normalizeArraySqlValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (value === null || value === undefined) {
    return [];
  }

  return [String(value)];
}
