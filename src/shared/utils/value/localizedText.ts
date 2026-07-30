import type { LocalizedText } from "@/shared/types";

export function normalizeLocalizedText(value?: LocalizedText) {
  return Object.fromEntries(
    Object.entries(value ?? {})
      .filter(([, text]) => typeof text === "string")
      .sort(([left], [right]) => left.localeCompare(right)),
  ) as LocalizedText;
}

export function normalizeOptionalLocalizedText(value?: LocalizedText) {
  const normalizedValue = normalizeLocalizedText(value);

  return Object.keys(normalizedValue).length ? normalizedValue : undefined;
}
