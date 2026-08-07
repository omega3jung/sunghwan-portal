import type { LocalizedText } from "@/shared/types";

/**
 * Normalizes localized text into a deterministic, string-only record.
 *
 * Stable key ordering makes JSON-based equality checks independent of insertion
 * order, while malformed non-string entries are ignored without throwing.
 */
export function normalizeLocalizedText(value?: LocalizedText) {
  return Object.fromEntries(
    Object.entries(value ?? {})
      .filter(([, text]) => typeof text === "string")
      .sort(([left], [right]) => left.localeCompare(right)),
  ) as LocalizedText;
}

/** Returns `undefined` when normalization leaves no localized values. */
export function normalizeOptionalLocalizedText(value?: LocalizedText) {
  const normalizedValue = normalizeLocalizedText(value);

  return Object.keys(normalizedValue).length ? normalizedValue : undefined;
}
