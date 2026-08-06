import { Priority, RiskLevel } from "@/domain/common";
import { ValueLabel } from "@/shared/types";

export const priorityOptions: ValueLabel<Priority>[] = [
  { label: "low", value: "low" },
  { label: "medium", value: "medium" },
  { label: "high", value: "high" },
  { label: "urgent", value: "urgent" },
] as const;

export const riskLevelOptions: ValueLabel<RiskLevel>[] = [
  { label: "low", value: "low" },
  { label: "medium", value: "medium" },
  { label: "high", value: "high" },
  { label: "critical", value: "critical" },
] as const;
