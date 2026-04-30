"use client";

import { cn } from "@/shared/utils/presentation";

import { useStepperContext } from "./StepperContext";
import { connectorVariant } from "./variants";

type Props = {
  index: number;
  total: number;
  isLeading?: boolean;
};

export const StepperConnector = ({
  index,
  total,
  isLeading = false,
}: Props) => {
  const { currentStep, orientation, color, connectorStyle, disabled } =
    useStepperContext();

  if (!isLeading && index === total - 1) return null;

  const connectorIndex = isLeading ? index - 1 : index;
  const isCompleted = connectorIndex < currentStep;

  return (
    <div
      className={cn(
        connectorVariant({
          orientation,
          isCompleted,
          color,
          style: connectorStyle,
        }),
        disabled && "border-border",
      )}
    />
  );
};
