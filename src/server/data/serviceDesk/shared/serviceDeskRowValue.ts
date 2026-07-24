import type { ISODateString } from "@/shared/types";

export function normalizePostgresStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
  }

  if (typeof value !== "string") {
    return [];
  }

  const normalized = value.trim();

  if (!normalized) {
    return [];
  }

  if (normalized.startsWith("[") && normalized.endsWith("]")) {
    try {
      const parsedValue = JSON.parse(normalized) as unknown;
      return normalizePostgresStringArray(parsedValue);
    } catch {
      return [];
    }
  }

  const arrayBody =
    normalized.startsWith("{") && normalized.endsWith("}")
      ? normalized.slice(1, -1)
      : normalized;

  return arrayBody
    .split(",")
    .map((item) => item.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
}

export function toRowIsoDateString(
  value: ISODateString | Date,
): ISODateString {
  return (value instanceof Date ? value.toISOString() : value) as ISODateString;
}

export function toNullableRowIsoDateString(
  value: ISODateString | Date | null,
): ISODateString | null {
  return value === null ? null : toRowIsoDateString(value);
}
