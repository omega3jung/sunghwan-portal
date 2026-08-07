import { Priority, RiskLevel } from "@/domain/common";

/** Resolves priority value using the server-side LOCAL ticket adapter policy. */
export function resolvePriorityValue(
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

/** Resolves risk level value using the server-side LOCAL ticket adapter policy. */
export function resolveRiskLevelValue(
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
