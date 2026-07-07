import type { RuleGroupTypeIC, RuleType } from "react-querybuilder";

import type { DbParams } from "@/shared/types/api";

type DateRangeValue = {
  from?: Date | string | null;
  to?: Date | string | null;
};

type Combinator = "and" | "or";

export const createRuleGroup = (
  rules: RuleGroupTypeIC["rules"],
): RuleGroupTypeIC | undefined => {
  if (rules.length === 0) {
    return undefined;
  }

  return { rules };
};

export function buildDbSearchParams<TSortField extends string>(
  params: DbParams<TSortField>,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params.filter) {
    searchParams.set("filter", JSON.stringify(params.filter));
  }

  if (params.sort) {
    searchParams.set("sortField", params.sort.field);
    searchParams.set("sortDirection", params.sort.direction);
  }

  if (params.page != null) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize != null) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  return searchParams;
}

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

export const combineRuleGroups = (
  ruleGroups: Array<RuleGroupTypeIC | undefined>,
  combinator: Combinator = "and",
): RuleGroupTypeIC | undefined => {
  const validRuleGroups = ruleGroups.filter(
    (ruleGroup): ruleGroup is RuleGroupTypeIC => Boolean(ruleGroup),
  );

  return joinRuleGroups(validRuleGroups, combinator);
};

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
