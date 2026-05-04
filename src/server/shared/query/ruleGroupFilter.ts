type FilterConnector = "and" | "or";

type FilterOperator = "=" | "!=" | "contains" | "in" | ">" | ">=" | "<" | "<=";

type FilterLeaf = {
  field?: string;
  operator?: FilterOperator;
  value?: unknown;
};

type FilterGroup = {
  rules?: Array<FilterGroup | FilterLeaf | FilterConnector>;
};

type FilterNode = FilterGroup | FilterLeaf | FilterConnector | null | undefined;

export function applyRuleGroupFilter<T extends object>(
  items: T[],
  filter: unknown,
): T[] {
  if (!filter || typeof filter !== "object") {
    return items;
  }

  return items.filter((item) => evaluateFilterNode(item, filter as FilterNode));
}

function evaluateFilterNode<T extends object>(
  item: T,
  node: FilterNode,
): boolean {
  if (!node) {
    return true;
  }

  if (typeof node === "string") {
    return true;
  }

  if (isFilterGroup(node)) {
    return evaluateFilterGroup(item, node);
  }

  return matchesFilterLeaf(item, node);
}

function evaluateFilterGroup<T extends object>(
  item: T,
  group: FilterGroup,
): boolean {
  const rules = group.rules ?? [];

  if (rules.length === 0) {
    return true;
  }

  let result: boolean | null = null;
  let connector: FilterConnector = "and";

  for (const rule of rules) {
    if (rule === "and" || rule === "or") {
      connector = rule;
      continue;
    }

    const current = evaluateFilterNode(item, rule);

    if (result === null) {
      result = current;
      continue;
    }

    result = connector === "and" ? result && current : result || current;
  }

  return result ?? true;
}

function isFilterGroup(node: FilterGroup | FilterLeaf): node is FilterGroup {
  return Array.isArray((node as FilterGroup).rules);
}

function matchesFilterLeaf<T extends object>(
  item: T,
  rule: FilterLeaf,
): boolean {
  if (!rule.field || !rule.operator) {
    return true;
  }

  const fieldValue = getFieldValue(item, rule.field);
  const ruleValue = rule.value;

  switch (rule.operator) {
    case "=":
      return matchesEqual(fieldValue, ruleValue);

    case "!=":
      return !matchesEqual(fieldValue, ruleValue);

    case "contains":
      return matchesContains(fieldValue, ruleValue);

    case "in":
      return matchesIn(fieldValue, ruleValue);

    case ">":
      return compareValues(fieldValue, ruleValue) > 0;

    case ">=":
      return compareValues(fieldValue, ruleValue) >= 0;

    case "<":
      return compareValues(fieldValue, ruleValue) < 0;

    case "<=":
      return compareValues(fieldValue, ruleValue) <= 0;

    default:
      return true;
  }
}

function getFieldValue(item: unknown, field: string): unknown {
  if (typeof item !== "object" || item === null) {
    return undefined;
  }

  return field.split(".").reduce<unknown>((current, key) => {
    if (typeof current !== "object" || current === null) {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, item);
}

function matchesEqual(fieldValue: unknown, ruleValue: unknown): boolean {
  if (Array.isArray(fieldValue)) {
    return fieldValue.some((value) => String(value) === String(ruleValue));
  }

  return String(fieldValue ?? "") === String(ruleValue ?? "");
}

function matchesContains(fieldValue: unknown, ruleValue: unknown): boolean {
  if (Array.isArray(fieldValue)) {
    return fieldValue.some((value) => String(value) === String(ruleValue));
  }

  return String(fieldValue ?? "")
    .toLowerCase()
    .includes(String(ruleValue ?? "").toLowerCase());
}

function matchesIn(fieldValue: unknown, ruleValue: unknown): boolean {
  const values = normalizeArrayValue(ruleValue).map(String);

  if (Array.isArray(fieldValue)) {
    return fieldValue.some((value) => values.includes(String(value)));
  }

  return values.includes(String(fieldValue));
}

function normalizeArrayValue(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
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

  return [value];
}

function compareValues(left: unknown, right: unknown): number {
  const leftDate = toTime(left);
  const rightDate = toTime(right);

  if (leftDate !== null && rightDate !== null) {
    return leftDate - rightDate;
  }

  const leftNumber = Number(left);
  const rightNumber = Number(right);

  if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
    return leftNumber - rightNumber;
  }

  return String(left ?? "").localeCompare(String(right ?? ""));
}

function toTime(value: unknown): number | null {
  if (typeof value !== "string" && !(value instanceof Date)) {
    return null;
  }

  const time = new Date(value).getTime();

  return Number.isNaN(time) ? null : time;
}
