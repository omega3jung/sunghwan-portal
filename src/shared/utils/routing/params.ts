import type { RuleGroupTypeIC, RuleType } from "react-querybuilder";

import type { DbParams } from "@/shared/types/api";

type DateRangeValue = {
  from?: Date | string | null;
  to?: Date | string | null;
};

type Combinator = "and" | "or";

/**
 * Wraps interleaved query-builder rules only when at least one rule exists.
 *
 * Returning `undefined` for an empty rule list lets callers omit the filter
 * entirely instead of serializing a group that would match every record.
 */
export const createRuleGroup = (
  rules: RuleGroupTypeIC["rules"],
): RuleGroupTypeIC | undefined => {
  if (rules.length === 0) {
    return undefined;
  }

  return { rules };
};

/**
 * Serializes database query parameters for the feature HTTP boundary.
 *
 * Rule-group filters are JSON encoded because their nested, interleaved shape
 * cannot be represented as scalar search parameters. Dates become ISO strings;
 * nullish and unsupported object values are intentionally omitted.
 */
export function buildDbSearchParams<TParams extends DbParams>(
  params: TParams,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params.filter) {
    searchParams.set("filter", JSON.stringify(params.filter));
  }

  for (const [key, value] of Object.entries(params)) {
    if (key === "filter") {
      continue;
    }

    setSearchParamValue(searchParams, key, value);
  }

  return searchParams;
}

function setSearchParamValue(
  searchParams: URLSearchParams,
  key: string,
  value: unknown,
) {
  if (value === null || value === undefined) {
    return;
  }

  if (value instanceof Date) {
    searchParams.set(key, value.toISOString());
    return;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    searchParams.set(key, String(value));
  }
}

/**
 * Joins complete rule groups using the query-builder interleaved combinator
 * representation (`group, combinator, group`). Empty input remains absent.
 */
export const joinRuleGroups = (
  ruleGroups: RuleGroupTypeIC[],
  combinator: Combinator,
): RuleGroupTypeIC | undefined => {
  if (ruleGroups.length === 0) {
    return undefined;
  }

  const rules = ruleGroups.flatMap((ruleGroup, index) => {
    if (index === 0) {
      return [ruleGroup];
    }

    return [combinator, ruleGroup];
  }) as RuleGroupTypeIC["rules"];

  return createRuleGroup(rules);
};

/**
 * Removes absent filters before joining them, so optional search criteria do
 * not create empty nested groups with ambiguous matching behavior.
 */
export const combineRuleGroups = (
  ruleGroups: Array<RuleGroupTypeIC | undefined>,
  combinator: Combinator = "and",
): RuleGroupTypeIC | undefined => {
  const validRuleGroups = ruleGroups.filter(
    (ruleGroup): ruleGroup is RuleGroupTypeIC => Boolean(ruleGroup),
  );

  return joinRuleGroups(validRuleGroups, combinator);
};

/**
 * Converts a date-like value to an ISO timestamp without throwing.
 *
 * Empty or malformed values return `undefined`, allowing the caller to omit an
 * invalid optional boundary rather than emitting an unusable filter value.
 */
export const toIsoString = (value: Date | string | null | undefined) => {
  if (!value) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
};

const createSingleRuleGroup = (rule: RuleType): RuleGroupTypeIC => {
  return {
    rules: [rule] as RuleGroupTypeIC["rules"],
  };
};

/** Creates a scalar filter unless the supplied value is nullish or blank. */
export const createFieldFilter = ({
  field,
  operator = "=",
  value,
}: {
  field: string;
  operator?: RuleType["operator"];
  value: unknown;
}): RuleGroupTypeIC | undefined => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim().length === 0)
  ) {
    return undefined;
  }

  return createSingleRuleGroup({
    field,
    operator,
    value,
  });
};

/**
 * Builds a case-insensitive keyword intent across multiple fields by OR-joining
 * `contains` rules. Blank keywords and empty field lists produce no filter.
 */
export const createKeywordFilter = ({
  fields,
  keyword,
}: {
  fields: string[];
  keyword: string;
}): RuleGroupTypeIC | undefined => {
  const trimmed = keyword.trim();

  if (!trimmed || fields.length === 0) {
    return undefined;
  }

  const ruleGroups = fields.map((field) =>
    createSingleRuleGroup({
      field,
      operator: "contains",
      value: trimmed,
    }),
  );

  return joinRuleGroups(ruleGroups, "or");
};

/** Builds an OR group that matches a field against any non-empty scalar value. */
export const createEqualsAnyFilter = ({
  field,
  values,
}: {
  field: string;
  values: string[];
}): RuleGroupTypeIC | undefined => {
  const filteredValues = values.filter(Boolean);

  if (filteredValues.length === 0) {
    return undefined;
  }

  const ruleGroups = filteredValues.map((value) =>
    createSingleRuleGroup({
      field,
      operator: "=",
      value,
    }),
  );

  return joinRuleGroups(ruleGroups, "or");
};

/** Builds an OR group that checks an array-like field for any supplied value. */
export const createArrayContainsAnyFilter = ({
  field,
  values,
}: {
  field: string;
  values: string[];
}): RuleGroupTypeIC | undefined => {
  const filteredValues = values.filter(Boolean);

  if (filteredValues.length === 0) {
    return undefined;
  }

  const ruleGroups = filteredValues.map((value) =>
    createSingleRuleGroup({
      field,
      operator: "contains",
      value,
    }),
  );

  return joinRuleGroups(ruleGroups, "or");
};

/**
 * Builds an inclusive ISO date range. Either boundary may be omitted; malformed
 * boundaries are ignored through `toIsoString` rather than throwing.
 */
export const createDateRangeFilter = ({
  field,
  dateRange,
}: {
  field: string;
  dateRange?: DateRangeValue | null;
}): RuleGroupTypeIC | undefined => {
  const from = toIsoString(dateRange?.from);
  const to = toIsoString(dateRange?.to);

  const ruleGroups: RuleGroupTypeIC[] = [];

  if (from) {
    ruleGroups.push(
      createSingleRuleGroup({
        field,
        operator: ">=",
        value: from,
      }),
    );
  }

  if (to) {
    ruleGroups.push(
      createSingleRuleGroup({
        field,
        operator: "<=",
        value: to,
      }),
    );
  }

  return joinRuleGroups(ruleGroups, "and");
};
