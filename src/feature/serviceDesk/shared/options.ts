import { Priority, RiskLevel } from "@/domain/common";
import { ValueLabel } from "@/shared/types";

/** Defines the supported priority choices presented by the feature. */
export const priorityOptions: ValueLabel<Priority>[] = [
  { label: "low", value: "low" },
  { label: "medium", value: "medium" },
  { label: "high", value: "high" },
  { label: "urgent", value: "urgent" },
] as const;

/** Defines the supported risk level choices presented by the feature. */
export const riskLevelOptions: ValueLabel<RiskLevel>[] = [
  { label: "low", value: "low" },
  { label: "medium", value: "medium" },
  { label: "high", value: "high" },
  { label: "critical", value: "critical" },
] as const;
