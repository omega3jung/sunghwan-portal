import { Priority, RiskLevel } from "@/domain/common";

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
