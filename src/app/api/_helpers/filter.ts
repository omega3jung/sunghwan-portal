import { applyRuleGroupFilter } from "@/server/shared/query";

import { FilterRule } from "./types";

export function getFilterRules(searchParams: URLSearchParams): FilterRule[] {
  const rulesByIndex = new Map<string, FilterRule>();

  for (const [key, value] of searchParams.entries()) {
    const matched = key.match(
      /^filter\[rules\]\[(\d+)\]\[(field|operator|value)\]$/,
    );

    if (!matched) {
      continue;
    }

    const [, index, part] = matched;
    const rule = rulesByIndex.get(index) ?? {};

    rule[part as keyof FilterRule] = value;
    rulesByIndex.set(index, rule);
  }

  return Array.from(rulesByIndex.entries())
    .sort(([left], [right]) => Number(left) - Number(right))
    .map(([, rule]) => rule);
}

function getFieldValue(item: unknown, field?: string): unknown {
  if (!field || typeof item !== "object" || item === null) {
    return undefined;
  }

  return field.split(".").reduce<unknown>((current, key) => {
    if (typeof current !== "object" || current === null) {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, item);
}

function matchesFilterRule<T extends object>(
  item: T,
  rule: FilterRule,
): boolean {
  if (!rule.field || !rule.operator) {
    return true;
  }

  const fieldValue = getFieldValue(item, rule.field);
  const ruleValue = rule.value;

  switch (rule.operator) {
    case "=":
      return String(fieldValue) === String(ruleValue ?? "");

    case "!=":
      return String(fieldValue) !== String(ruleValue ?? "");

    case "contains":
      return String(fieldValue ?? "")
        .toLowerCase()
        .includes(String(ruleValue ?? "").toLowerCase());

    case "in": {
      const values = String(ruleValue ?? "")
        .split(",")
        .map((value) => value.trim());

      return values.includes(String(fieldValue));
    }

    default:
      return true;
  }
}

export function filterItemsByQuery<T extends object>(
  searchParams: URLSearchParams,
  items: T[],
): T[] {
  const ruleGroupFilter = searchParams.get("filter");

  if (ruleGroupFilter) {
    return applyRuleGroupFilter(items, ruleGroupFilter);
  }

  const rules = getFilterRules(searchParams);

  return items.filter((item) => {
    return rules.every((rule) => matchesFilterRule(item, rule));
  });
}
